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
import { GastosApi } from '../gastos-api';
import type { Gasto } from '../expense.model';
import { MONEDA_LABELS, Moneda } from '../../sales/venta.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../../core/auth/auth';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';

export interface GastoFormDialogData {
  gasto?: Gasto;
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
    MatButtonModule,
    MatProgressSpinnerModule,
    MetodoPagoSelect,
  ],
  selector: 'app-gasto-form-dialog',
  styleUrl: './gasto-form-dialog.scss',
  templateUrl: './gasto-form-dialog.html',
})
export class GastoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(GastosApi);
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<GastoFormDialog, Gasto | undefined>,
  );
  protected readonly data = inject<GastoFormDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;
  readonly isEdit = !!this.data.gasto;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    descripcion: [
      this.data.gasto?.descripcion ?? '',
      [Validators.required, Validators.minLength(1)],
    ],
    monto: [
      this.data.gasto?.monto ?? 0,
      [Validators.required, Validators.min(0.01)],
    ],
    moneda: [this.data.gasto?.moneda ?? Moneda.PEN, Validators.required],
    tasaCambio: [
      this.data.gasto?.tasaCambio ?? 1,
      [Validators.required, Validators.min(0.0001)],
    ],
    metodoPago: [
      this.metodoPagoInicial(),
      [Validators.required, Validators.minLength(1)],
    ],
    fecha: [this.data.gasto?.fecha ?? '', Validators.required],
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
      const result = this.isEdit
        ? await this.api.update(this.data.gasto!.id, payload)
        : await this.api.create(payload);
      this.recordarMetodoPago(payload.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el gasto. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  // Solo al CREAR: si el usuario ya guardó un gasto antes, arranca con ese
  // método en vez de vacío (editar siempre parte del valor real del gasto).
  private metodoPagoInicial(): string {
    if (this.data.gasto) {
      return this.data.gasto.metodoPago;
    }
    const userId = this.auth.currentUser()?.id;
    return (userId && this.ultimoMetodoPago.get(userId)) || '';
  }

  // Se graba al guardar con éxito, tanto en crear como en editar.
  private recordarMetodoPago(metodoPago: string): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.ultimoMetodoPago.set(userId, metodoPago);
    }
  }
}
