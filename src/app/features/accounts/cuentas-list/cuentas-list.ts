import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasApi } from '../cuentas-api';
import { type CuentaListItem } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio, usaPerfiles } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentaFormDialog } from '../cuenta-form-dialog/cuenta-form-dialog';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { ServiceIcon } from '../../../shared/service-icon/service-icon';
import { CuentaCaidaChip } from '../../../shared/cuenta-caida-chip/cuenta-caida-chip';
import { injectIsMobile } from '../../../shared/breakpoints';
import { diasEntre, hoyIso } from '../../../shared/fecha.util';
import { FiltrosPlegables } from '../../../shared/filtros-plegables/filtros-plegables';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

// Ventana de "Cuentas que debes pagar al proveedor" de Inicio.
const DIAS_AVISO_PROVEEDOR = 7;

@Component({
  imports: [
    FiltrosPlegables,
    ServiceIcon,
    EmptyState,
    FormsModule,
    DatePipe,
    CuentaCaidaChip,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  selector: 'app-cuentas-list',
  styleUrl: './cuentas-list.scss',
  templateUrl: './cuentas-list.html',
})
export class CuentasList implements OnInit {
  private readonly api = inject(CuentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['servicio', 'proveedor', 'fechaFin', 'perfiles', 'dueno', 'activo', 'ir']
      : ['servicio', 'proveedor', 'fechaFin', 'perfiles', 'activo', 'ir'],
  );

  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly proveedores = signal<Contacto[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  servicioFilter = 'todos';
  proveedorFilter = 'todos';
  activoFilter: ActivoFilter = 'activos';

  // Cuántos filtros están aplicando (distintos de "Todos"): lo dice el botón
  // "Filtros" en celular.
  protected filtrosActivos(): number {
    return [this.servicioFilter, this.proveedorFilter, this.activoFilter].filter((f) => f !== 'todos').length;
  }

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
    this.error.set(false);
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
      // El aviso va en el lugar de la lista, con "Reintentar".
      this.error.set(true);
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

  // Color de la fecha en que vence con el proveedor (solo cuentas activas):
  // bermellón si ya pasó, ámbar si vence en los próximos 7 días, la misma
  // ventana que "Cuentas que debes pagar al proveedor" de Inicio.
  protected venceClase(cuenta: CuentaListItem): string {
    if (!cuenta.activo) {
      return '';
    }
    const dias = diasEntre(hoyIso(), cuenta.fechaFin.slice(0, 10));
    if (dias < 0) {
      return 'nc-estado-vencida vence-urgente';
    }
    return dias <= DIAS_AVISO_PROVEEDOR ? 'nc-estado-por-vencer vence-urgente' : '';
  }

  // "2/5" para lo que se vende por perfil. Una cuenta que se vende completa
  // no tiene perfiles que crear: se dice así, en vez de "0/—".
  protected perfilesLabel(cuenta: CuentaListItem): string {
    const servicio = this.servicios().find((s) => s.id === cuenta.servicioId);
    if (servicio && !usaPerfiles(servicio.tipo)) {
      return 'Cuenta completa';
    }
    const max = servicio?.pantallasMax;
    return max ? `${cuenta.perfilesCount}/${max}` : `${cuenta.perfilesCount}`;
  }
}
