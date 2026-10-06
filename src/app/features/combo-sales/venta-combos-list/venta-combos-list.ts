import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';
import { Auth, UserRole } from '../../../core/auth/auth';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { diasEntre, formatFechaCorta, hoyIso } from '../../../shared/fecha.util';
import { injectIsMobile } from '../../../shared/breakpoints';
import { ServiceIconStack } from '../../../shared/service-icon-stack/service-icon-stack';
import { type Servicio } from '../../services/servicio.model';
import { EstadoVentaChip } from '../../../shared/estado-venta/estado-venta';
import { CuentaCaidaChip } from '../../../shared/cuenta-caida-chip/cuenta-caida-chip';
import { extractErrorMessage } from '../../../shared/form-error';
import { FiltrosPlegables } from '../../../shared/filtros-plegables/filtros-plegables';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

// Los mismos días de aviso que Ventas y, por defecto, Vencimientos.
const DIAS_AVISO = 3;

@Component({
  imports: [
    FiltrosPlegables,
    CuentaCaidaChip,
    EstadoVentaChip,
    EmptyState,
    FormsModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    SolesPipe,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ServiceIconStack,
    MatTooltipModule,
  ],
  selector: 'app-venta-combos-list',
  styleUrl: './venta-combos-list.scss',
  templateUrl: './venta-combos-list.html',
})
export class VentaCombosList implements OnInit {
  private readonly api = inject(VentaCombosApi);
  private readonly combosApi = inject(CombosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly auth = inject(Auth);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly Moneda = Moneda;
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly isMobile = injectIsMobile();
  protected readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? [
          'cliente',
          'combo',
          'fechaFin',
          'precio',
          'dueno',
          'activo',
          'acciones',
        ]
      : [
          'cliente',
          'combo',
          'fechaFin',
          'precio',
          'activo',
          'acciones',
        ],
  );

  readonly ventasCombo = signal<VentaCombo[]>([]);
  readonly combos = signal<Combo[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  clienteFilter = 'todos';
  comboFilter = 'todos';
  activoFilter: ActivoFilter = 'activos';

  // Cuántos filtros están aplicando (distintos de "Todos"): lo dice el botón
  // "Filtros" en celular.
  protected filtrosActivos(): number {
    return [this.clienteFilter, this.comboFilter, this.activoFilter].filter((f) => f !== 'todos').length;
  }

  ngOnInit(): void {
    void this.loadOptions();
    void this.refresh();
  }

  private async loadOptions(): Promise<void> {
    const [combos, clientes] = await Promise.all([
      this.combosApi.list(),
      this.contactosApi.list(),
    ]);
    this.combos.set(combos);
    this.clientes.set(clientes);
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await this.api.list({
        clienteId: this.clienteFilter === 'todos' ? undefined : this.clienteFilter,
        comboId: this.comboFilter === 'todos' ? undefined : this.comboFilter,
        activo:
          this.activoFilter === 'todos'
            ? undefined
            : this.activoFilter === 'activos',
      });
      this.ventasCombo.set(data);
    } catch {
      // El aviso va en el lugar de la lista, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    void this.router.navigate(['/combo-sales/nueva']);
  }

  openDetail(ventaCombo: VentaCombo): void {
    void this.router.navigate(['/combo-sales', ventaCombo.id]);
  }

  confirmRenew(ventaCombo: VentaCombo): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Renovar venta de combo',
        message:
          '¿Renovar esta venta de combo? Todos los servicios del combo pasarán a vencer 1 periodo después.',
        confirmLabel: 'Renovar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.renew(ventaCombo);
      }
    });
  }

  confirmDeactivate(ventaCombo: VentaCombo): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Finalizar venta de combo',
        // Igual que en Ventas: los pagos del combo no se tocan.
        message: `¿Finalizar la venta de combo ${ventaCombo.codigoVenta}? Los perfiles y cuentas del combo quedan libres para otro cliente. Lo que ya cobraste sigue contando en Contabilidad.`,
        confirmLabel: 'Finalizar venta',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate(ventaCombo);
      }
    });
  }

  confirmReactivate(ventaCombo: VentaCombo): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar venta de combo',
        message: `¿Reactivar la venta de combo ${ventaCombo.codigoVenta}? Vuelve a estar vigente y ocupa otra vez los perfiles y cuentas del combo.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate(ventaCombo);
      }
    });
  }

  protected comboNombre(comboId: string): string {
    return this.combos().find((c) => c.id === comboId)?.nombre ?? '—';
  }

  // Los servicios del combo, para su pila de íconos.
  protected comboServicios(comboId: string): Servicio[] {
    return this.combos().find((c) => c.id === comboId)?.servicios ?? [];
  }

  // Igual que en Ventas: en una venta sin finalizar, bermellón si ya venció
  // y ámbar si vence dentro de los días de aviso.
  protected venceClase(ventaCombo: VentaCombo): string {
    if (!ventaCombo.activo) {
      return '';
    }
    const dias = diasEntre(hoyIso(), ventaCombo.fechaFin.slice(0, 10));
    if (dias < 0) {
      return 'nc-estado-vencida vence-urgente';
    }
    return dias <= DIAS_AVISO ? 'nc-estado-por-vencer vence-urgente' : '';
  }

  protected clienteNombre(clienteId: string): string {
    return this.clientes().find((c) => c.id === clienteId)?.nombre ?? '—';
  }

  private async renew(ventaCombo: VentaCombo): Promise<void> {
    try {
      const result = await this.api.renew(ventaCombo.id);
      this.snackBar.open(
        `Venta de combo renovada. Ahora vence el ${formatFechaCorta(result.fechaFin)}.`,
        'Cerrar',
        { duration: 4000 },
      );
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo renovar la venta de combo.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async deactivate(ventaCombo: VentaCombo): Promise<void> {
    try {
      await this.api.deactivate(ventaCombo.id);
      this.snackBar.open('Venta de combo finalizada.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(
          error,
          'No se pudo finalizar la venta de combo.',
        ),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private async reactivate(ventaCombo: VentaCombo): Promise<void> {
    try {
      await this.api.reactivate(ventaCombo.id);
      this.snackBar.open('Venta de combo reactivada.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch (error) {
      this.snackBar.open(
        extractErrorMessage(error, 'No se pudo reactivar la venta de combo.'),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }
}
