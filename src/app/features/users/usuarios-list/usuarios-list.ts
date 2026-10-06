import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import { Auth } from '../../../core/auth/auth';
import { UsuariosApi } from '../usuarios-api';
import { USER_ROLE_LABELS, type Usuario, type UserRole } from '../usuario.model';
import { UsuarioFormDialog } from '../usuario-form-dialog/usuario-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { extractErrorMessage } from '../../../shared/form-error';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    EmptyState,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-usuarios-list',
  styleUrl: './usuarios-list.scss',
  templateUrl: './usuarios-list.html',
})
export class UsuariosList implements OnInit {
  private readonly api = inject(UsuariosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly roleLabels = USER_ROLE_LABELS;
  protected readonly displayedColumns = ['email', 'name', 'role', 'activo', 'acciones'];

  private readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  // GET /api/users no admite RolesGuard más allá de admin-only: si un
  // REVENDEDOR llega acá manualmente (el link ya está oculto en el
  // sidebar), el backend da 403 — se muestra un panel dedicado en vez de
  // dejar la tabla vacía en silencio o romper la pantalla.
  readonly forbidden = signal(false);

  // Signal (no un campo plano): tiene que ser señal para que el
  // `computed` de abajo reaccione cuando cambia — un campo plano leído
  // dentro de un `computed` no establece dependencia reactiva alguna.
  readonly activoFilter = signal<ActivoFilter>('activos');

  // GET /api/users no soporta filtro por query (a diferencia de otros
  // módulos): se trae la lista completa una vez y el filtro
  // activo/inactivo se aplica acá, en el cliente.
  readonly usuariosFiltrados = computed(() => {
    const filtro = this.activoFilter();
    if (filtro === 'todos') {
      return this.usuarios();
    }
    const activo = filtro === 'activos';
    return this.usuarios().filter((u) => u.isActive === activo);
  });

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.list();
      this.usuarios.set(data);
      this.forbidden.set(false);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        this.forbidden.set(true);
      } else {
        this.snackBar.open('No se pudieron cargar los usuarios.', 'Cerrar', {
          duration: 4000,
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  isSelf(usuario: Usuario): boolean {
    return usuario.id === this.auth.currentUser()?.id;
  }

  protected roleLabel(role: UserRole): string {
    return this.roleLabels[role];
  }

  openCreate(): void {
    const ref = this.dialog.open(UsuarioFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Usuario creado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  openEdit(usuario: Usuario): void {
    const ref = this.dialog.open(UsuarioFormDialog, { data: { usuario } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Usuario actualizado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  confirmDeactivate(usuario: Usuario): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar usuario',
        message: `¿Desactivar a "${usuario.name}"? No podrá ingresar hasta que lo reactives.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(usuario);
      }
    });
  }

  confirmReactivate(usuario: Usuario): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar usuario',
        message: `¿Reactivar a "${usuario.name}"? Podrá ingresar de nuevo.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(usuario);
      }
    });
  }

  private async deactivate(usuario: Usuario): Promise<void> {
    try {
      await this.api.deactivate(usuario.id);
      this.snackBar.open('Usuario desactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo desactivar el usuario.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async reactivate(usuario: Usuario): Promise<void> {
    try {
      await this.api.reactivate(usuario.id);
      this.snackBar.open('Usuario reactivado.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(extractErrorMessage(error, 'No se pudo reactivar el usuario.'), 'Cerrar', {
        duration: 5000,
      });
    }
  }
}
