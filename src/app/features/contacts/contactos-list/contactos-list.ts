import { Component, OnInit, inject, signal } from '@angular/core';
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
import { ContactosApi } from '../contactos-api';
import {
  CONTACT_TYPE_LABELS,
  ContactType,
  type Contacto,
} from '../contacto.model';
import { ContactoFormDialog } from '../contacto-form-dialog/contacto-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
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
  selector: 'app-contactos-list',
  styleUrl: './contactos-list.scss',
  templateUrl: './contactos-list.html',
})
export class ContactosList implements OnInit {
  private readonly api = inject(ContactosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly contactTypes = Object.values(ContactType);
  protected readonly typeLabels = CONTACT_TYPE_LABELS;
  protected readonly displayedColumns = [
    'nombre',
    'whatsapp',
    'tipo',
    'activo',
    'acciones',
  ];

  readonly contactos = signal<Contacto[]>([]);
  readonly loading = signal(false);

  tipoFilter: ContactType | 'todos' = 'todos';
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
      this.contactos.set(data);
    } catch {
      this.snackBar.open('No se pudieron cargar los contactos.', 'Cerrar', {
        duration: 4000,
      });
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
        message: `¿Desactivar a "${contacto.nombre}"? No se borra el historial, solo deja de estar disponible para nuevas ventas.`,
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
        message: `¿Reactivar a "${contacto.nombre}"? Vuelve a estar disponible para nuevas ventas.`,
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

  private async deactivate(contacto: Contacto): Promise<void> {
    try {
      await this.api.deactivate(contacto.id);
      this.snackBar.open('Contacto desactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar el contacto.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivate(contacto: Contacto): Promise<void> {
    try {
      await this.api.reactivate(contacto.id);
      this.snackBar.open('Contacto reactivado.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo reactivar el contacto.', 'Cerrar', {
        duration: 4000,
      });
    }
  }
}
