import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiciosApi } from '../servicios-api';
import {
  SERVICE_TYPE_LABELS,
  ServiceType,
  type Servicio,
} from '../servicio.model';
import { ServicioFormDialog } from '../servicio-form-dialog/servicio-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    FormsModule,
    DecimalPipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-servicios-list',
  styleUrl: './servicios-list.scss',
  templateUrl: './servicios-list.html',
})
export class ServiciosList implements OnInit {
  private readonly api = inject(ServiciosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly serviceTypes = Object.values(ServiceType);
  protected readonly typeLabels = SERVICE_TYPE_LABELS;
  protected readonly displayedColumns = [
    'nombre',
    'tipo',
    'duracionMeses',
    'pantallasMax',
    'precioBase',
    'activo',
    'acciones',
  ];

  readonly servicios = signal<Servicio[]>([]);
  readonly loading = signal(false);

  tipoFilter: ServiceType | 'todos' = 'todos';
  activoFilter: ActivoFilter = 'activos';

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
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
      this.snackBar.open('No se pudieron cargar los servicios.', 'Cerrar', {
        duration: 4000,
      });
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
        message: `¿Desactivar "${servicio.nombre}"? No se borra el historial, solo deja de estar disponible para nuevas ventas.`,
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
        message: `¿Reactivar "${servicio.nombre}"? Vuelve a estar disponible para nuevas ventas.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(servicio);
      }
    });
  }

  protected typeLabel(tipo: ServiceType): string {
    return this.typeLabels[tipo];
  }

  private async deactivate(servicio: Servicio): Promise<void> {
    try {
      await this.api.deactivate(servicio.id);
      this.snackBar.open('Servicio desactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar el servicio.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivate(servicio: Servicio): Promise<void> {
    try {
      await this.api.reactivate(servicio.id);
      this.snackBar.open('Servicio reactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo reactivar el servicio.', 'Cerrar', {
        duration: 4000,
      });
    }
  }
}
