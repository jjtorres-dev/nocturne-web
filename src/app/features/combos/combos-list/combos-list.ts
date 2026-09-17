import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { CombosApi } from '../combos-api';
import { type Combo } from '../combo.model';
import { ComboFormDialog } from '../combo-form-dialog/combo-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';
import { Auth, UserRole } from '../../../core/auth/auth';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    FormsModule,
    SolesPipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-combos-list',
  styleUrl: './combos-list.scss',
  templateUrl: './combos-list.html',
})
export class CombosList implements OnInit {
  private readonly api = inject(CombosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['nombre', 'descripcion', 'servicios', 'precioCombo', 'dueno', 'activo', 'acciones']
      : ['nombre', 'descripcion', 'servicios', 'precioCombo', 'activo', 'acciones'],
  );

  readonly combos = signal<Combo[]>([]);
  readonly loading = signal(false);

  activoFilter: ActivoFilter = 'activos';

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.list({
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.combos.set(data);
    } catch {
      this.snackBar.open('No se pudieron cargar los combos.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(ComboFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Combo creado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  openEdit(combo: Combo): void {
    const ref = this.dialog.open(ComboFormDialog, { data: { combo } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Combo actualizado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  confirmDeactivate(combo: Combo): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar combo',
        message: `¿Desactivar "${combo.nombre}"? No se borra el historial, solo deja de estar disponible para nuevas ventas de combo.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(combo);
      }
    });
  }

  confirmReactivate(combo: Combo): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar combo',
        message: `¿Reactivar "${combo.nombre}"? Vuelve a estar disponible para nuevas ventas de combo.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(combo);
      }
    });
  }

  private async deactivate(combo: Combo): Promise<void> {
    try {
      await this.api.deactivate(combo.id);
      this.snackBar.open('Combo desactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar el combo.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivate(combo: Combo): Promise<void> {
    try {
      await this.api.reactivate(combo.id);
      this.snackBar.open('Combo reactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo reactivar el combo.', 'Cerrar', {
        duration: 4000,
      });
    }
  }
}
