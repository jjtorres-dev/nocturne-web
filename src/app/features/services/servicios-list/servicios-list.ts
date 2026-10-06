import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiciosApi } from '../servicios-api';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_SHORT_LABELS,
  ServiceType,
  type Servicio,
  usaPerfiles,
} from '../servicio.model';
import { ServicioFormDialog } from '../servicio-form-dialog/servicio-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { ServiceIcon } from '../../../shared/service-icon/service-icon';
import { extractErrorMessage } from '../../../shared/form-error';
import { FiltrosPlegables } from '../../../shared/filtros-plegables/filtros-plegables';
import { injectIsMobile } from '../../../shared/breakpoints';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    FiltrosPlegables,
    ServiceIcon,
    EmptyState,
    FormsModule,
    SolesPipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
  ],
  selector: 'app-servicios-list',
  styleUrl: './servicios-list.scss',
  templateUrl: './servicios-list.html',
})
export class ServiciosList implements OnInit {
  private readonly api = inject(ServiciosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly serviceTypes = Object.values(ServiceType);
  protected readonly typeLabels = SERVICE_TYPE_LABELS;
  // "Dueño" solo se ve para ADMIN: un REVENDEDOR nunca ve nada ajeno, así
  // que la columna sería ruido sin sentido para él (mismo criterio que el
  // link de Usuarios en el sidebar).
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? [
          'nombre',
          'tipo',
          'duracionMeses',
          'pantallasMax',
          'precioBase',
          'dueno',
          'activo',
          'acciones',
        ]
      : [
          'nombre',
          'tipo',
          'duracionMeses',
          'pantallasMax',
          'precioBase',
          'activo',
          'acciones',
        ],
  );

  readonly servicios = signal<Servicio[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  tipoFilter: ServiceType | 'todos' = 'todos';
  activoFilter: ActivoFilter = 'activos';

  // Cuántos filtros están aplicando (distintos de "Todos"): lo dice el botón
  // "Filtros" en celular.
  protected filtrosActivos(): number {
    return [this.tipoFilter, this.activoFilter].filter((f) => f !== 'todos').length;
  }

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await this.api.list({
        tipo: this.tipoFilter === 'todos' ? undefined : this.tipoFilter,
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.servicios.set(data);
    } catch {
      // El aviso va en el lugar de la lista, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(ServicioFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Servicio creado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  openEdit(servicio: Servicio): void {
    const ref = this.dialog.open(ServicioFormDialog, { data: { servicio } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Servicio actualizado.', 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  confirmDeactivate(servicio: Servicio): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar servicio',
        message: `¿Desactivar "${servicio.nombre}"? Ya no aparecerá al registrar ventas. Tus ventas y cuentas anteriores no se borran.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(servicio);
      }
    });
  }

  confirmReactivate(servicio: Servicio): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar servicio',
        message: `¿Reactivar "${servicio.nombre}"? Volverá a aparecer al registrar ventas.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(servicio);
      }
    });
  }

  // En corto ("Por perfiles"): la explicación completa queda en el filtro
  // y en el formulario.
  protected typeLabel(tipo: ServiceType): string {
    return SERVICE_TYPE_SHORT_LABELS[tipo];
  }

  protected duracionLabel(servicio: Servicio): string {
    return `${servicio.duracionMeses} ${servicio.duracionMeses === 1 ? 'mes' : 'meses'}`;
  }

  // En la tarjeta del celular, "Perfiles por cuenta" solo aparece en lo que
  // se vende por perfil; en el plan familiar son los cupos del plan, igual
  // que en el formulario.
  protected vendePorPerfil(servicio: Servicio): boolean {
    return usaPerfiles(servicio.tipo);
  }

  protected perfilesEtiqueta(servicio: Servicio): string {
    return servicio.tipo === ServiceType.FAMILIAR ? 'Cupos del plan' : 'Perfiles por cuenta';
  }

  private async deactivate(servicio: Servicio): Promise<void> {
    try {
      await this.api.deactivate(servicio.id);
      this.snackBar.open('Servicio desactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo desactivar el servicio.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async reactivate(servicio: Servicio): Promise<void> {
    try {
      await this.api.reactivate(servicio.id);
      this.snackBar.open('Servicio reactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo reactivar el servicio.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
