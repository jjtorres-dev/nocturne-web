import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SolesPipe } from '../../../shared/soles.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasApi } from '../cuentas-api';
import { type Cuenta } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentaFormDialog } from '../cuenta-form-dialog/cuenta-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SecretValue } from '../../../shared/secret-value/secret-value';
import { PerfilesApi } from '../profiles/perfiles-api';
import { type Perfil } from '../profiles/perfil.model';
import { PerfilFormDialog } from '../profiles/perfil-form-dialog/perfil-form-dialog';

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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

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
  readonly perfiles = signal<Perfil[]>([]);
  readonly loading = signal(false);
  readonly loadingPerfiles = signal(false);

  private accountId = '';

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') ?? '';
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [cuenta, servicios, proveedores] = await Promise.all([
        this.api.findOne(this.accountId),
        this.serviciosApi.list(),
        this.contactosApi.list(),
      ]);
      this.cuenta.set(cuenta);
      this.servicio.set(
        servicios.find((s) => s.id === cuenta.servicioId) ?? null,
      );
      this.proveedor.set(
        cuenta.proveedorId
          ? (proveedores.find((p) => p.id === cuenta.proveedorId) ?? null)
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

  confirmDeactivate(): void {
    const cuenta = this.cuenta();
    if (!cuenta) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar cuenta',
        message: `¿Desactivar la cuenta de "${cuenta.correo}"? No se borra el historial, solo deja de estar disponible.`,
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
        message: `¿Reactivar la cuenta de "${cuenta.correo}"?`,
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

  addPerfilDisabledReason(): string | null {
    if (this.canAddPerfil()) {
      return null;
    }
    const servicio = this.servicio();
    return `Se alcanzó el máximo de pantallas (${servicio?.pantallasMax}) para "${servicio?.nombre}".`;
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
        'No se pudo reactivar el perfil (¿se alcanzó el máximo de pantallas?).',
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
