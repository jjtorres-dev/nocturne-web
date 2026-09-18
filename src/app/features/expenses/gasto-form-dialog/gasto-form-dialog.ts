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
import { Moneda } from '../../sales/venta.model';
import { injectFormError } from '../../../shared/form-error';

export interface GastoFormDialogData {
  gasto?: Gasto;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-gasto-form-dialog',
  styleUrl: './gasto-form-dialog.scss',
  templateUrl: './gasto-form-dialog.html',
})
export class GastoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(GastosApi);
  private readonly dialogRef = inject(
    MatDialogRef<GastoFormDialog, Gasto | undefined>,
  );
  protected readonly data = inject<GastoFormDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
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
      this.data.gasto?.metodoPago ?? '',
      [Validators.required, Validators.minLength(1)],
    ],
    fecha: [this.data.gasto?.fecha ?? '', Validators.required],
  });

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
      this.dialogRef.close(result);
    } catch {
      this.formError.show('No se pudo guardar el gasto. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
