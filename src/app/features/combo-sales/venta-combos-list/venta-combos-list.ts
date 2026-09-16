import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';

type ActivoFilter = 'todos' | 'activos' | 'inactivos';

@Component({
  imports: [
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
    MatChipsModule,
    MatProgressSpinnerModule,
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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly Moneda = Moneda;
  protected readonly displayedColumns = [
    'codigoVenta',
    'cliente',
    'combo',
    'fechaInicio',
    'fechaFin',
    'precio',
    'activo',
    'acciones',
  ];

  readonly ventasCombo = signal<VentaCombo[]>([]);
  readonly combos = signal<Combo[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly loading = signal(false);

  clienteFilter = 'todos';
  comboFilter = 'todos';
  activoFilter: ActivoFilter = 'activos';

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
      this.snackBar.open('No se pudieron cargar las ventas de combo.', 'Cerrar', {
        duration: 4000,
      });
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
          '¿Renovar esta venta de combo? Se extenderá la fecha de fin de todas las cuentas/perfiles del combo.',
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
        title: 'Desactivar venta de combo',
        message: `¿Desactivar la venta de combo "${ventaCombo.codigoVenta}"? Libera las cuentas/perfiles de todos los servicios del combo.`,
        confirmLabel: 'Desactivar',
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
        message: `¿Reactivar la venta de combo "${ventaCombo.codigoVenta}"? Vuelve a ocupar las cuentas/perfiles de todos los servicios del combo.`,
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

  protected clienteNombre(clienteId: string): string {
    return this.clientes().find((c) => c.id === clienteId)?.nombre ?? '—';
  }

  private async renew(ventaCombo: VentaCombo): Promise<void> {
    try {
      const result = await this.api.renew(ventaCombo.id);
      this.snackBar.open(
        `Venta de combo renovada. Nueva fecha de fin: ${result.fechaFin}.`,
        'Cerrar',
        { duration: 4000 },
      );
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo renovar la venta de combo.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  private async deactivate(ventaCombo: VentaCombo): Promise<void> {
    try {
      await this.api.deactivate(ventaCombo.id);
      this.snackBar.open('Venta de combo desactivada.', 'Cerrar', {
        duration: 3000,
      });
      void this.refresh();
    } catch {
      this.snackBar.open('No se pudo desactivar la venta de combo.', 'Cerrar', {
        duration: 4000,
      });
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
        this.errorMessage(error, 'No se pudo reactivar la venta de combo.'),
        'Cerrar',
        { duration: 5000 },
      );
    }
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }
    return fallback;
  }
}
