import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { VentasApi } from '../../features/sales/ventas-api';
import { MONEDA_LABELS, Moneda, type Venta } from '../../features/sales/venta.model';
import { extractErrorMessage, injectFormError } from '../form-error';
import { MetodoPagoSelect } from '../metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../core/auth/auth';
import { InfoHint } from '../info-hint/info-hint';
import { InfoToggle } from '../info-hint/info-toggle';

export interface VentaRenewDialogData {
  venta: Venta;
}

// Diálogo de renovación compartido entre Ventas y Vencimientos (ver
// PROGRESS.md — Bloque B). A propósito NO calcula la nueva fechaFin: eso lo
// hace el backend (addMonthsToDate sobre duracionMeses) y el snackbar de
// éxito del caller la muestra con el resultado de POST /sales/:id/renew —
// acá solo se informa cuánto se va a extender.
@Component({
  imports: [
    InfoHint,
    InfoToggle,
    ReactiveFormsModule,
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MetodoPagoSelect,
  ],
  selector: 'app-venta-renew-dialog',
  styleUrl: './venta-renew-dialog.scss',
  templateUrl: './venta-renew-dialog.html',
})
export class VentaRenewDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentasApi);
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<VentaRenewDialog, Venta | undefined>,
  );
  protected readonly data = inject<VentaRenewDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    precio: [
      this.data.venta.precio,
      [Validators.required, Validators.min(0.01)],
    ],
    moneda: [this.data.venta.moneda, Validators.required],
    tasaCambio: [
      this.data.venta.tasaCambio,
      [Validators.required, Validators.min(0.0001)],
    ],
    // A diferencia de precio/moneda/tasaCambio (que arrancan con el valor
    // ACTUAL de la venta), acá arranca con el último método de pago
    // recordado: renovar es un cobro nuevo, lo más probable es que se pague
    // igual que la última operación, no necesariamente igual que como se
    // pagó la venta original.
    metodoPago: [
      this.metodoPagoInicial(),
      [Validators.required, Validators.minLength(1)],
    ],
  });

  constructor() {
    // En PEN no tiene sentido pedir una tasa de cambio contra sí misma: el
    // campo se fuerza a 1 y se oculta en el template. Con cualquier otra
    // moneda se muestra y queda editable a mano.
    this.form.controls.moneda.valueChanges.subscribe((moneda) => {
      if (moneda === Moneda.PEN) {
        this.form.controls.tasaCambio.setValue(1);
      }
    });
  }

  private metodoPagoInicial(): string {
    const userId = this.auth.currentUser()?.id;
    return (userId && this.ultimoMetodoPago.get(userId)) || '';
  }

  async submit(): Promise<void> {
    if (this.saving()) {
      return;
    }
    // El botón siempre se puede presionar: si falta algo, se marcan los
    // campos para que cada uno diga qué le falta.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const raw = this.form.getRawValue();

    try {
      const result = await this.api.renew(this.data.venta.id, raw);
      this.recordarMetodoPago(raw.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo renovar la venta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  private recordarMetodoPago(metodoPago: string): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.ultimoMetodoPago.set(userId, metodoPago);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
