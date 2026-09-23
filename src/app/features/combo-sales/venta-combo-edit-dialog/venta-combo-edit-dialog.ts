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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { MONEDA_LABELS, Moneda } from '../../sales/venta.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../../core/auth/auth';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';

export interface VentaComboEditDialogData {
  ventaCombo: VentaCombo;
}

@Component({
  imports: [
    InfoHint,
    InfoToggle,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MetodoPagoSelect,
  ],
  selector: 'app-venta-combo-edit-dialog',
  styleUrl: './venta-combo-edit-dialog.scss',
  templateUrl: './venta-combo-edit-dialog.html',
})
export class VentaComboEditDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentaCombosApi);
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<VentaComboEditDialog, VentaCombo | undefined>,
  );
  protected readonly data = inject<VentaComboEditDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    fechaFin: [this.data.ventaCombo.fechaFin, Validators.required],
    precio: [
      this.data.ventaCombo.precio,
      [Validators.required, Validators.min(0.01)],
    ],
    moneda: [this.data.ventaCombo.moneda, Validators.required],
    tasaCambio: [
      this.data.ventaCombo.tasaCambio,
      [Validators.required, Validators.min(0.0001)],
    ],
    metodoPago: [
      this.data.ventaCombo.metodoPago,
      [Validators.required, Validators.minLength(1)],
    ],
    renovacionAutomatica: [this.data.ventaCombo.renovacionAutomatica],
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

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const payload = this.form.getRawValue();

    try {
      const result = await this.api.update(this.data.ventaCombo.id, payload);
      this.recordarMetodoPago(payload.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar la venta de combo. Inténtalo de nuevo.'),
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
