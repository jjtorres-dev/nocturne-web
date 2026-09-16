import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
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
import { VentaComboEditDialog } from '../venta-combo-edit-dialog/venta-combo-edit-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SolesPipe } from '../../../shared/soles.pipe';

@Component({
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    SolesPipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-venta-combo-detail',
  styleUrl: './venta-combo-detail.scss',
  templateUrl: './venta-combo-detail.html',
})
export class VentaComboDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(VentaCombosApi);
  private readonly combosApi = inject(CombosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly Moneda = Moneda;
  protected readonly displayedSaleColumns = [
    'servicio',
    'cuentaPerfil',
    'clienteAsignado',
    'fechaFin',
  ];

  readonly ventaCombo = signal<VentaCombo | null>(null);
  readonly combo = signal<Combo | null>(null);
  readonly cliente = signal<Contacto | null>(null);
  readonly loading = signal(false);

  private ventaComboId = '';

  ngOnInit(): void {
    this.ventaComboId = this.route.snapshot.paramMap.get('id') ?? '';
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [ventaCombo, combos, clientes] = await Promise.all([
        this.api.findOne(this.ventaComboId),
        this.combosApi.list(),
        this.contactosApi.list(),
      ]);
      this.ventaCombo.set(ventaCombo);
      this.combo.set(combos.find((c) => c.id === ventaCombo.comboId) ?? null);
      this.cliente.set(
        clientes.find((c) => c.id === ventaCombo.clienteId) ?? null,
      );
    } catch {
      this.snackBar.open('No se pudo cargar la venta de combo.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  openEdit(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(VentaComboEditDialog, { data: { ventaCombo } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Venta de combo actualizada.', 'Cerrar', {
          duration: 3000,
        });
        void this.refresh();
      }
    });
  }

  confirmRenew(): void {
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
        void this.renew();
      }
    });
  }

  confirmDeactivate(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Desactivar venta de combo',
        message: `¿Desactivar la venta de combo "${ventaCombo.codigoVenta}"? Libera las cuentas/perfiles de todos los servicios del combo.`,
        confirmLabel: 'Desactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deactivate();
      }
    });
  }

  confirmReactivate(): void {
    const ventaCombo = this.ventaCombo();
    if (!ventaCombo) {
      return;
    }
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Reactivar venta de combo',
        message: `¿Reactivar la venta de combo "${ventaCombo.codigoVenta}"? Vuelve a ocupar las cuentas/perfiles de todos los servicios del combo.`,
        confirmLabel: 'Reactivar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.reactivate();
      }
    });
  }

  protected cuentaPerfilLabel(cuenta?: { correo: string } | null, perfil?: { nombre: string } | null): string {
    const correo = cuenta?.correo ?? '—';
    return perfil ? `${correo} — ${perfil.nombre}` : correo;
  }

  private async renew(): Promise<void> {
    try {
      const result = await this.api.renew(this.ventaComboId);
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

  private async deactivate(): Promise<void> {
    try {
      await this.api.deactivate(this.ventaComboId);
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

  private async reactivate(): Promise<void> {
    try {
      await this.api.reactivate(this.ventaComboId);
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
