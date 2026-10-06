import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
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
import { GastosApi } from '../gastos-api';
import type { Gasto } from '../expense.model';
import { Moneda } from '../../sales/venta.model';
import { GastoFormDialog } from '../gasto-form-dialog/gasto-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { extractErrorMessage } from '../../../shared/form-error';
import { injectIsMobile } from '../../../shared/breakpoints';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    EmptyState,
    FormsModule,
    DatePipe,
    DecimalPipe,
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
  selector: 'app-gastos-list',
  styleUrl: './gastos-list.scss',
  templateUrl: './gastos-list.html',
})
export class GastosList implements OnInit {
  private readonly api = inject(GastosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly Moneda = Moneda;
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['descripcion', 'fecha', 'metodoPago', 'monto', 'dueno', 'activo', 'acciones']
      : ['descripcion', 'fecha', 'metodoPago', 'monto', 'activo', 'acciones'],
  );

  readonly gastos = signal<Gasto[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  activoFilter: ActivoFilter = 'activos';

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await this.api.list({
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.gastos.set(data);
    } catch {
      // El aviso va en el lugar de la lista, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(GastoFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Gasto creado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  openEdit(gasto: Gasto): void {
    const ref = this.dialog.open(GastoFormDialog, { data: { gasto } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Gasto actualizado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  confirmDeactivate(gasto: Gasto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar gasto',
        message: `¿Desactivar "${gasto.descripcion}"? No se borra el historial, solo deja de contar en los reportes de Contabilidad.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(gasto);
      }
    });
  }

  confirmReactivate(gasto: Gasto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar gasto',
        message: `¿Reactivar "${gasto.descripcion}"? Vuelve a contar en los reportes de Contabilidad.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(gasto);
      }
    });
  }

  private async deactivate(gasto: Gasto): Promise<void> {
    try {
      await this.api.deactivate(gasto.id);
      this.snackBar.open('Gasto desactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(extractErrorMessage(error, 'No se pudo desactivar el gasto.'), 'Cerrar', {
        duration: 5000,
      });
    }
  }

  private async reactivate(gasto: Gasto): Promise<void> {
    try {
      await this.api.reactivate(gasto.id);
      this.snackBar.open('Gasto reactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(extractErrorMessage(error, 'No se pudo reactivar el gasto.'), 'Cerrar', {
        duration: 5000,
      });
    }
  }
}
