import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasApi } from '../cuentas-api';
import { type CuentaListItem } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentaFormDialog } from '../cuenta-form-dialog/cuenta-form-dialog';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cuentas-list',
  styleUrl: './cuentas-list.scss',
  templateUrl: './cuentas-list.html',
})
export class CuentasList implements OnInit {
  private readonly api = inject(CuentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly displayedColumns = [
    'servicio',
    'correo',
    'proveedor',
    'fechaInicio',
    'fechaFin',
    'perfiles',
    'activo',
  ];

  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly proveedores = signal<Contacto[]>([]);
  readonly loading = signal(false);

  servicioFilter = 'todos';
  proveedorFilter = 'todos';
  activoFilter: ActivoFilter = 'activos';

  ngOnInit(): void {
    void this.loadOptions();
    void this.refresh();
  }

  private async loadOptions(): Promise<void> {
    const [servicios, proveedores] = await Promise.all([
      this.serviciosApi.list(),
      this.contactosApi.list({ tipo: ContactType.PROVEEDOR }),
    ]);
    this.servicios.set(servicios);
    this.proveedores.set(proveedores);
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.list({
        servicioId:
          this.servicioFilter === 'todos' ? undefined : this.servicioFilter,
        proveedorId:
          this.proveedorFilter === 'todos' ? undefined : this.proveedorFilter,
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.cuentas.set(data);
    } catch {
      this.snackBar.open('No se pudieron cargar las cuentas.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(CuentaFormDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Cuenta creada.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  goToDetail(cuenta: CuentaListItem): void {
    void this.router.navigate(['/accounts', cuenta.id]);
  }

  protected servicioNombre(servicioId: string): string {
    return this.servicios().find((s) => s.id === servicioId)?.nombre ?? '—';
  }

  protected proveedorNombre(proveedorId: string | null): string {
    if (!proveedorId) {
      return '—';
    }
    return this.proveedores().find((p) => p.id === proveedorId)?.nombre ?? '—';
  }

  protected perfilesLabel(cuenta: CuentaListItem): string {
    const servicio = this.servicios().find((s) => s.id === cuenta.servicioId);
    const max = servicio?.pantallasMax;
    return `${cuenta.perfilesCount}/${max ?? '—'}`;
  }
}
