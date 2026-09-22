import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { VentaCombosApi } from '../../combo-sales/venta-combos-api';
import { VentaCreateDialog } from '../venta-create-dialog/venta-create-dialog';
import { VentaEditDialog } from '../venta-edit-dialog/venta-edit-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { injectIsMobile } from '../../../shared/breakpoints';
import { SolesPipe } from '../../../shared/soles.pipe';
import { exportToCsv, type CsvColumn } from '../../../shared/csv-export';
import { formatFechaCorta, hoyIso } from '../../../shared/fecha.util';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
    EmptyState,
    FormsModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    SolesPipe,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-ventas-list',
  styleUrl: './ventas-list.scss',
  templateUrl: './ventas-list.html',
})
export class VentasList implements OnInit {
  private readonly api = inject(VentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly ventaCombosApi = inject(VentaCombosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isMobile = injectIsMobile();
  protected readonly Moneda = Moneda;
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? [
          'codigoVenta',
          'cliente',
          'servicio',
          'cuentaPerfil',
          'fechaInicio',
          'fechaFin',
          'precio',
          'dueno',
          'activo',
          'acciones',
        ]
      : [
          'codigoVenta',
          'cliente',
          'servicio',
          'cuentaPerfil',
          'fechaInicio',
          'fechaFin',
          'precio',
          'activo',
          'acciones',
        ],
  );

  readonly ventas = signal<Venta[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly perfilNombres = signal<Map<string, string>>(new Map());
  readonly comboCodigos = signal<Map<string, string>>(new Map());
  readonly loading = signal(false);
  // Solo aplica en pantalla angosta: en desktop los filtros siempre se ven.
  protected readonly filtersOpen = signal(false);

  clienteFilter = 'todos';
  servicioFilter = 'todos';
  activoFilter: ActivoFilter = 'activos';

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  // Cuántos filtros están aplicando (distintos de "todos"), para mostrarlo
  // en el botón mientras el panel está colapsado.
  protected filtrosActivos(): number {
    return [this.clienteFilter, this.servicioFilter, this.activoFilter].filter(
      (f) => f !== 'todos',
    ).length;
  }

  ngOnInit(): void {
    void this.loadOptions();
    void this.refresh();
  }

  private async loadOptions(): Promise<void> {
    const [servicios, clientes, cuentas, ventasCombo] = await Promise.all([
      this.serviciosApi.list(),
      this.contactosApi.list(),
      this.cuentasApi.list(),
      this.ventaCombosApi.list(),
    ]);
    this.servicios.set(servicios);
    this.clientes.set(clientes);
    this.cuentas.set(cuentas);
    this.comboCodigos.set(
      new Map(ventasCombo.map((vc) => [vc.id, vc.codigoVenta])),
    );
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.list({
        clienteId: this.clienteFilter === 'todos' ? undefined : this.clienteFilter,
        servicioId:
          this.servicioFilter === 'todos' ? undefined : this.servicioFilter,
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.ventas.set(data);
      await this.loadPerfilNombres(data);
    } catch {
      this.snackBar.open('No se pudieron cargar las ventas.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPerfilNombres(ventas: Venta[]): Promise<void> {
    const cuentaIds = Array.from(
      new Set(ventas.filter((v) => v.perfilId).map((v) => v.cuentaId)),
    );
    if (cuentaIds.length === 0) {
      this.perfilNombres.set(new Map());
      return;
    }
    const listas = await Promise.all(
      cuentaIds.map((id) => this.perfilesApi.list(id)),
    );
    const map = new Map<string, string>();
    listas.flat().forEach((p) => map.set(p.id, p.nombre));
    this.perfilNombres.set(map);
  }

  openCreate(): void {
    const ref = this.dialog.open(VentaCreateDialog, {});
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(`Venta ${result.codigoVenta} creada.`, 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  openEdit(venta: Venta): void {
    const ref = this.dialog.open(VentaEditDialog, { data: { venta } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Venta actualizada.', 'Cerrar', { duration: 3000 });
        void this.refresh();
      }
    });
  }

  confirmRenew(venta: Venta): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Renovar venta',
        message:
          '¿Renovar esta venta? Se extenderá la fecha de fin según la duración del servicio.',
        confirmLabel: 'Renovar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.renew(venta);
      }
    });
  }

  confirmDeactivate(venta: Venta): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar venta',
        message: `¿Desactivar la venta "${venta.codigoVenta}"? Libera el perfil o la cuenta para una nueva venta.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(venta);
      }
    });
  }

  confirmReactivate(venta: Venta): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar venta',
        message: `¿Reactivar la venta "${venta.codigoVenta}"?`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(venta);
      }
    });
  }

  protected servicioNombre(servicioId: string): string {
    return this.servicios().find((s) => s.id === servicioId)?.nombre ?? '—';
  }

  protected clienteNombre(clienteId: string): string {
    return this.clientes().find((c) => c.id === clienteId)?.nombre ?? '—';
  }

  protected comboLabel(venta: Venta): string {
    if (!venta.ventaComboId) {
      return '';
    }
    const codigo = this.comboCodigos().get(venta.ventaComboId);
    return codigo ? `Parte de combo ${codigo}` : 'Parte de combo';
  }

  protected cuentaPerfilLabel(venta: Venta): string {
    const correo = this.cuentaCorreo(venta);
    const perfil = this.perfilLabel(venta);
    return perfil ? `${correo} — ${perfil}` : correo;
  }

  private cuentaCorreo(venta: Venta): string {
    return this.cuentas().find((c) => c.id === venta.cuentaId)?.correo ?? '—';
  }

  // Vacío (no '—') cuando la venta no tiene perfil: es un estado válido
  // (servicio sin perfiles), no un dato que debería existir y no se encontró.
  private perfilLabel(venta: Venta): string {
    if (!venta.perfilId) {
      return '';
    }
    return this.perfilNombres().get(venta.perfilId) ?? '—';
  }

  exportCsv(): void {
    const columns: CsvColumn<Venta>[] = [
      { header: 'Código', value: (v) => v.codigoVenta },
      { header: 'Cliente', value: (v) => this.clienteNombre(v.clienteId) },
      { header: 'Servicio', value: (v) => this.servicioNombre(v.servicioId) },
      { header: 'Cuenta (correo)', value: (v) => this.cuentaCorreo(v) },
      { header: 'Perfil', value: (v) => this.perfilLabel(v) },
      { header: 'Fecha Inicio', value: (v) => formatFechaCorta(v.fechaInicio) },
      { header: 'Fecha Fin', value: (v) => formatFechaCorta(v.fechaFin) },
      { header: 'Precio', value: (v) => v.precio.toFixed(2) },
      { header: 'Moneda', value: (v) => v.moneda },
      { header: 'Método de Pago', value: (v) => v.metodoPago },
      { header: 'Estado', value: (v) => (v.activo ? 'Activo' : 'Inactivo') },
    ];
    if (this.isAdmin()) {
      columns.push({ header: 'Dueño', value: (v) => v.owner.name });
    }
    // this.ventas() ya viene filtrada por los filtros de Cliente/Servicio/
    // Activo aplicados (ver refresh()): se exporta tal cual está en pantalla.
    exportToCsv(`ventas-${hoyIso()}.csv`, columns, this.ventas());
  }

  private async renew(venta: Venta): Promise<void> {
    try {
      const result = await this.api.renew(venta.id);
      this.snackBar.open(
        `Venta renovada. Nueva fecha de fin: ${result.fechaFin}.`,
        'Cerrar',
        { duration: 4000 },
      );
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo renovar la venta.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async deactivate(venta: Venta): Promise<void> {
    try {
      await this.api.deactivate(venta.id);
      this.snackBar.open('Venta desactivada.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar la venta.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async reactivate(venta: Venta): Promise<void> {
    try {
      await this.api.reactivate(venta.id);
      this.snackBar.open('Venta reactivada.', 'Cerrar', { duration: 3000 });
      void this.refresh();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.snackBar.open(
          (error.error?.message as string | undefined) ??
            'Ya no está disponible.',
          'Cerrar',
          { duration: 5000 },
        );
      } else {
        this.snackBar.open('No se pudo reactivar la venta.', 'Cerrar', {
          duration: 4000,
        });
      }
    }
  }
}
