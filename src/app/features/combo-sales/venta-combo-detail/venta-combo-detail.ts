import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceIcon } from '../../../shared/service-icon/service-icon';
import { injectIsMobile } from '../../../shared/breakpoints';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda, type AjusteVenta } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { VentaComboEditDialog } from '../venta-combo-edit-dialog/venta-combo-edit-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';
import { Auth, UserRole } from '../../../core/auth/auth';
import { ServiceIconStack } from '../../../shared/service-icon-stack/service-icon-stack';
import { CuentasApi } from '../../accounts/cuentas-api';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import {
  formatearDatosParaClienteCombo,
  type DatosParaCliente,
} from '../../sales/copiar-datos.util';
import { diasEntre, formatFechaCorta, hoyIso } from '../../../shared/fecha.util';
import { EstadoVentaChip } from '../../../shared/estado-venta/estado-venta';
import { CuentaCaidaChip } from '../../../shared/cuenta-caida-chip/cuenta-caida-chip';
import { AjustesVenta } from '../../../shared/ajustes-venta/ajustes-venta';
import { extractErrorMessage } from '../../../shared/form-error';

// Los mismos días de aviso que Ventas y la lista de Ventas de combos.
const DIAS_AVISO = 3;

@Component({
  imports: [
    AjustesVenta,
    CuentaCaidaChip,
    EstadoVentaChip,
    ServiceIconStack,
    DatePipe,
    DecimalPipe,
    RouterLink,
    SolesPipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    ServiceIcon,
    MatTooltipModule,
  ],
  selector: 'app-venta-combo-detail',
  styleUrl: './venta-combo-detail.scss',
  templateUrl: './venta-combo-detail.html',
})
export class VentaComboDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(VentaCombosApi);
  private readonly combosApi = inject(CombosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly Moneda = Moneda;
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedSaleColumns = [
    'servicio',
    'cuentaPerfil',
    'clienteAsignado',
    'fechaFin',
  ];

  readonly ventaCombo = signal<VentaCombo | null>(null);
  readonly combo = signal<Combo | null>(null);
  readonly cliente = signal<Contacto | null>(null);
  readonly loading = signal(false);
  // La última carga falló: en vez del detalle se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);
  // Días sumados al vencimiento por cuentas caídas. Si falla la carga, la
  // sección simplemente no se muestra.
  readonly ajustes = signal<AjusteVenta[]>([]);

  private ventaComboId = '';

  ngOnInit(): void {
    this.ventaComboId = this.route.snapshot.paramMap.get('id') ?? '';
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const [ventaCombo, combos, clientes] = await Promise.all([
        this.api.findOne(this.ventaComboId),
        this.combosApi.list(),
        this.contactosApi.list(),
      ]);
      this.ventaCombo.set(ventaCombo);
      this.combo.set(combos.find((c) => c.id === ventaCombo.comboId) ?? null);
      this.cliente.set(
        clientes.find((c) => c.id === ventaCombo.clienteId) ?? null,
      );
    } catch {
      // El aviso va en el lugar del detalle, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
    void this.refreshAjustes();
  }

  async refreshAjustes(): Promise<void> {
    try {
      this.ajustes.set(await this.api.ajustes(this.ventaComboId));
    } catch {
      this.ajustes.set([]);
    }
  }

  openEdit(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(VentaComboEditDialog, { data: { ventaCombo } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Venta de combo actualizada.', 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  confirmRenew(): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Renovar venta de combo',
        message:
          '¿Renovar esta venta de combo? Todos los servicios del combo pasarán a vencer 1 periodo después.',
        confirmLabel: 'Renovar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.renew();
      }
    });
  }

  confirmDeactivate(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Finalizar venta de combo',
        // Igual que en Ventas: los pagos del combo no se tocan.
        message: `¿Finalizar la venta de combo ${ventaCombo.codigoVenta}? Los perfiles y cuentas del combo quedan libres para otro cliente. Lo que ya cobraste sigue contando en Contabilidad.`,
        confirmLabel: 'Finalizar venta',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate();
      }
    });
  }

  confirmReactivate(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar venta de combo',
        message: `¿Reactivar la venta de combo ${ventaCombo.codigoVenta}? Vuelve a estar vigente y ocupa otra vez los perfiles y cuentas del combo.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate();
      }
    });
  }

  // Igual que en la lista: en una venta sin finalizar, bermellón si ya
  // venció y ámbar si vence dentro de los días de aviso.
  protected venceClase(ventaCombo: VentaCombo): string {
    if (!ventaCombo.activo) {
      return '';
    }
    const dias = diasEntre(hoyIso(), ventaCombo.fechaFin.slice(0, 10));
    if (dias < 0) {
      return 'nc-estado-vencida vence-urgente';
    }
    return dias <= DIAS_AVISO ? 'nc-estado-por-vencer vence-urgente' : '';
  }

  protected cuentaPerfilLabel(cuenta?: { correo: string } | null, perfil?: { nombre: string } | null): string {
    const correo = cuenta?.correo ?? '—';
    return perfil ? `${correo} — ${perfil.nombre}` : correo;
  }

  // Junta los datos de TODAS las cuentas del combo en un solo mensaje. Las
  // credenciales siempre se piden a GET /accounts/:id (único lugar donde
  // vienen, ver copiar-datos.util) — nunca se confía en `s.cuenta` de este
  // mismo detalle, aunque venga poblado.
  async copiarDatos(): Promise<void> {
    const ventas = this.ventaCombo()?.ventas;
    if (!ventas || ventas.length === 0) {
      return;
    }
    try {
      const items: DatosParaCliente[] = await Promise.all(
        ventas.map(async (v) => {
          const cuenta = await this.cuentasApi.findOne(v.cuentaId);
          let perfilPin: string | null = null;
          if (v.perfilId) {
            const perfiles = await this.perfilesApi.list(v.cuentaId);
            perfilPin = perfiles.find((p) => p.id === v.perfilId)?.pin ?? null;
          }
          return {
            servicioNombre: v.servicio?.nombre ?? '—',
            correo: cuenta.correo,
            claveServicio: cuenta.claveServicio,
            perfilNombre: v.perfil?.nombre ?? null,
            perfilPin,
            fechaFin: v.fechaFin,
          };
        }),
      );
      const mensaje = formatearDatosParaClienteCombo(items);
      await navigator.clipboard.writeText(mensaje);
      this.snackBar.open('Datos copiados. Ya puedes pegarlos en WhatsApp.', 'Cerrar', {
        duration: 3000,
      });
    } catch {
      this.snackBar.open('No se pudieron copiar los datos.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async renew(): Promise<void> {
    try {
      const result = await this.api.renew(this.ventaComboId);
      this.snackBar.open(
        `Venta de combo renovada. Ahora vence el ${formatFechaCorta(result.fechaFin)}.`,
        'Cerrar',
        { duration: 4000 },
      );
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo renovar la venta de combo.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async deactivate(): Promise<void> {
    try {
      await this.api.deactivate(this.ventaComboId);
      this.snackBar.open('Venta de combo finalizada.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo finalizar la venta de combo.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async reactivate(): Promise<void> {
    try {
      await this.api.reactivate(this.ventaComboId);
      this.snackBar.open('Venta de combo reactivada.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(error, 'No se pudo reactivar la venta de combo.'),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
