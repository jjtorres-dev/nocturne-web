import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SolesPipe } from '../../../shared/soles.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasApi } from '../cuentas-api';
import {
  PAGO_PROVEEDOR_TIPO_LABELS,
  type Cuenta,
  type CuentaRentabilidad,
  type PagoProveedor,
} from '../cuenta.model';
import { Moneda } from '../../sales/venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentaFormDialog } from '../cuenta-form-dialog/cuenta-form-dialog';
import { CuentaRenovarProveedorDialog } from '../cuenta-renovar-proveedor-dialog/cuenta-renovar-proveedor-dialog';
import { formatFechaCorta } from '../../../shared/fecha.util';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SecretValue } from '../../../shared/secret-value/secret-value';
import { PerfilesApi } from '../profiles/perfiles-api';
import { type Perfil } from '../profiles/perfil.model';
import { PerfilFormDialog } from '../profiles/perfil-form-dialog/perfil-form-dialog';
import { Auth, UserRole } from '../../../core/auth/auth';

@Component({
  imports: [
    DatePipe,
    SolesPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    SecretValue,
  ],
  selector: 'app-cuenta-detail',
  styleUrl: './cuenta-detail.scss',
  templateUrl: './cuenta-detail.html',
})
export class CuentaDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CuentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly displayedProfileColumns = [
    'nombre',
    'pin',
    'cliente',
    'activo',
    'acciones',
  ];

  readonly cuenta = signal<Cuenta | null>(null);
  readonly servicio = signal<Servicio | null>(null);
  readonly proveedor = signal<Contacto | null>(null);
  // Todos los contactos del usuario, para resolver el cliente de cada
  // perfil vendido (Perfil.clienteId, que el backend llena al vender y
  // limpia al finalizar la venta).
  readonly contactos = signal<Contacto[]>([]);
  readonly perfiles = signal<Perfil[]>([]);
  readonly rentabilidad = signal<CuentaRentabilidad | null>(null);
  // Compra inicial + renovaciones con el proveedor, del más reciente al más
  // antiguo. null = no se pudo cargar (la sección muestra su propio error).
  readonly pagosProveedor = signal<PagoProveedor[] | null>([]);
  protected readonly Moneda = Moneda;
  protected readonly displayedPagoColumns = ['fecha', 'tipo', 'monto', 'metodoPago'];
  readonly loading = signal(false);
  readonly loadingPerfiles = signal(false);

  // % del costo ya recuperado con ventas, tope 100 (la barra no pasa del
  // total). Costo 0: no hay nada que recuperar, la barra va llena.
  protected readonly porcentajeRecuperado = computed(() => {
    const r = this.rentabilidad();
    if (!r) {
      return 0;
    }
    if (r.costo <= 0) {
      return 100;
    }
    return Math.min(100, (r.ingresos / r.costo) * 100);
  });

  private accountId = '';

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') ?? '';
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [cuenta, servicios, contactos] = await Promise.all([
        this.api.findOne(this.accountId),
        this.serviciosApi.list(),
        this.contactosApi.list(),
      ]);
      this.cuenta.set(cuenta);
      this.contactos.set(contactos);
      this.servicio.set(
        servicios.find((s) => s.id === cuenta.servicioId) ?? null,
      );
      this.proveedor.set(
        cuenta.proveedorId
          ? (contactos.find((p) => p.id === cuenta.proveedorId) ?? null)
          : null,
      );
    } catch {
      this.snackBar.open('No se pudo cargar la cuenta.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
    void this.refreshPerfiles();
    void this.refreshPagosProveedor();
  }

  protected pagoTipoLabel(pago: PagoProveedor): string {
    return PAGO_PROVEEDOR_TIPO_LABELS[pago.tipo];
  }

  async refreshPagosProveedor(): Promise<void> {
    try {
      this.pagosProveedor.set(await this.api.pagosProveedor(this.accountId));
    } catch {
      this.pagosProveedor.set(null);
    }
  }

  async refreshPerfiles(): Promise<void> {
    this.loadingPerfiles.set(true);
    try {
      const perfiles = await this.perfilesApi.list(this.accountId);
      this.perfiles.set(perfiles);
    } catch {
      this.snackBar.open('No se pudieron cargar los perfiles.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loadingPerfiles.set(false);
    }
    // Perfiles activos/vendidos cambian la rentabilidad: se recarga junto
    // con la lista (también al crear/desactivar/reactivar un perfil).
    void this.refreshRentabilidad();
  }

  // Si falla, la tarjeta simplemente no se muestra: no bloquea el resto
  // del detalle ni amerita un snackbar propio.
  async refreshRentabilidad(): Promise<void> {
    try {
      this.rentabilidad.set(await this.api.rentabilidad(this.accountId));
    } catch {
      this.rentabilidad.set(null);
    }
  }

  openEdit(): void {
    const cuenta = this.cuenta();
    if (!cuenta) {
      return;
    }
    const ref = this.dialog.open(CuentaFormDialog, { data: { cuenta } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Cuenta actualizada.', 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  // Al renovar cambian la fecha de vencimiento, el historial de pagos y el
  // costo de la rentabilidad: se recarga todo el detalle.
  openRenovarProveedor(): void {
    const cuenta = this.cuenta();
    if (!cuenta) {
      return;
    }
    const ref = this.dialog.open(CuentaRenovarProveedorDialog, {
      data: {
        cuentaId: cuenta.id,
        correo: cuenta.correo,
        servicioNombre: this.servicio()?.nombre ?? 'Cuenta',
        fechaFin: cuenta.fechaFin,
      },
    });
    ref.afterClosed().subscribe((result?: Cuenta) => {
      if (result) {
        this.snackBar.open(
          `Cuenta renovada. Ahora vence con el proveedor el ${formatFechaCorta(result.fechaFin)}.`,
          'Cerrar',
          { duration: 4000 },
        );
        void this.refresh();
      }
    });
  }

  confirmDeactivate(): void {
    const cuenta = this.cuenta();
    if (!cuenta) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar cuenta',
        message: `¿Desactivar la cuenta "${cuenta.correo}"? Ya no aparecerá para vender. Sus ventas anteriores no se borran.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate();
      }
    });
  }

  confirmReactivate(): void {
    const cuenta = this.cuenta();
    if (!cuenta) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar cuenta',
        message: `¿Reactivar la cuenta "${cuenta.correo}"? Volverá a aparecer para vender.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate();
      }
    });
  }

  canAddPerfil(): boolean {
    const servicio = this.servicio();
    if (!servicio || servicio.pantallasMax === null) {
      return true;
    }
    const activeCount = this.perfiles().filter((p) => p.activo).length;
    return activeCount < servicio.pantallasMax;
  }

  protected clienteNombre(clienteId: string | null): string {
    if (!clienteId) {
      return '—';
    }
    return this.contactos().find((c) => c.id === clienteId)?.nombre ?? '—';
  }

  addPerfilDisabledReason(): string | null {
    if (this.canAddPerfil()) {
      return null;
    }
    const servicio = this.servicio();
    return `Esta cuenta ya tiene sus ${servicio?.pantallasMax} perfiles (el máximo de ${servicio?.nombre}).`;
  }

  openCreatePerfil(): void {
    if (!this.canAddPerfil()) {
      return;
    }
    const ref = this.dialog.open(PerfilFormDialog, {
      data: { accountId: this.accountId },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Perfil creado.', 'Cerrar', { duration: 3000 });
        void this.refreshPerfiles();
      }
    });
  }

  openEditPerfil(perfil: Perfil): void {
    const ref = this.dialog.open(PerfilFormDialog, {
      data: { accountId: this.accountId, perfil },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Perfil actualizado.', 'Cerrar', {
          duration: 3000,
        });
        void this.refreshPerfiles();
      }
    });
  }

  confirmDeactivatePerfil(perfil: Perfil): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar perfil',
        message: `¿Desactivar el perfil "${perfil.nombre}"?`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivatePerfil(perfil);
      }
    });
  }

  confirmReactivatePerfil(perfil: Perfil): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar perfil',
        message: `¿Reactivar el perfil "${perfil.nombre}"?`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivatePerfil(perfil);
      }
    });
  }

  private async deactivate(): Promise<void> {
    try {
      await this.api.deactivate(this.accountId);
      this.snackBar.open('Cuenta desactivada.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar la cuenta.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivate(): Promise<void> {
    try {
      await this.api.reactivate(this.accountId);
      this.snackBar.open('Cuenta reactivada.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo reactivar la cuenta.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async deactivatePerfil(perfil: Perfil): Promise<void> {
    try {
      await this.perfilesApi.deactivate(this.accountId, perfil.id);
      this.snackBar.open('Perfil desactivado.', 'Cerrar', { duration: 3000 });
      void this.refreshPerfiles();
    } catch {
      this.snackBar.open('No se pudo desactivar el perfil.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivatePerfil(perfil: Perfil): Promise<void> {
    try {
      await this.perfilesApi.reactivate(this.accountId, perfil.id);
      this.snackBar.open('Perfil reactivado.', 'Cerrar', { duration: 3000 });
      void this.refreshPerfiles();
    } catch {
      this.snackBar.open(
        'No se pudo reactivar el perfil. Puede que la cuenta ya tenga todos sus perfiles.',
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
