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
import { ContactosApi } from '../contactos-api';
import {
  CONTACT_TYPE_LABELS,
  ContactType,
  type Contacto,
} from '../contacto.model';
import { ContactoFormDialog } from '../contacto-form-dialog/contacto-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { AvatarInicial } from '../../../shared/avatar-inicial/avatar-inicial';
import { extractErrorMessage } from '../../../shared/form-error';
import { FiltrosPlegables } from '../../../shared/filtros-plegables/filtros-plegables';
import { injectIsMobile } from '../../../shared/breakpoints';
import { whatsappChatUrl } from '../../sales/whatsapp.util';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    FiltrosPlegables,
    AvatarInicial,
    EmptyState,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
  ],
  selector: 'app-contactos-list',
  styleUrl: './contactos-list.scss',
  templateUrl: './contactos-list.html',
})
export class ContactosList implements OnInit {
  private readonly api = inject(ContactosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly contactTypes = Object.values(ContactType);
  protected readonly typeLabels = CONTACT_TYPE_LABELS;
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['nombre', 'whatsapp', 'tipo', 'dueno', 'activo', 'acciones']
      : ['nombre', 'whatsapp', 'tipo', 'activo', 'acciones'],
  );

  readonly contactos = signal<Contacto[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  tipoFilter: ContactType | 'todos' = 'todos';
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
      this.contactos.set(data);
    } catch {
      // El aviso va en el lugar de la lista, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(ContactoFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Contacto creado.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  openEdit(contacto: Contacto): void {
    const ref = this.dialog.open(ContactoFormDialog, { data: { contacto } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Contacto actualizado.', 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  confirmDeactivate(contacto: Contacto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar contacto',
        message: `¿Desactivar a ${contacto.nombre}? Ya no aparecerá en las listas. Sus ventas anteriores no se borran.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(contacto);
      }
    });
  }

  confirmReactivate(contacto: Contacto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar contacto',
        message: `¿Reactivar a ${contacto.nombre}? Volverá a aparecer en las listas.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(contacto);
      }
    });
  }

  protected typeLabel(tipo: ContactType): string {
    return this.typeLabels[tipo];
  }

  protected whatsappUrl(contacto: Contacto): string {
    return whatsappChatUrl(contacto.whatsapp);
  }

  // Copia el número tal como está guardado, para pegarlo donde haga falta.
  async copiarNumero(contacto: Contacto): Promise<void> {
    try {
      await navigator.clipboard.writeText(contacto.whatsapp);
      this.snackBar.open('Número copiado.', 'Cerrar', { duration: 3000 });
    } catch {
      this.snackBar.open('No se pudo copiar el número.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async deactivate(contacto: Contacto): Promise<void> {
    try {
      await this.api.deactivate(contacto.id);
      this.snackBar.open('Contacto desactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo desactivar el contacto.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async reactivate(contacto: Contacto): Promise<void> {
    try {
      await this.api.reactivate(contacto.id);
      this.snackBar.open('Contacto reactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo reactivar el contacto.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
