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
import { Moneda } from '../../sales/venta.model';

export interface VentaComboEditDialogData {
  ventaCombo: VentaCombo;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-venta-combo-edit-dialog',
  styleUrl: './venta-combo-edit-dialog.scss',
  templateUrl: './venta-combo-edit-dialog.html',
})
export class VentaComboEditDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentaCombosApi);
  private readonly dialogRef = inject(
    MatDialogRef<VentaComboEditDialog, VentaCombo | undefined>,
  );
  protected readonly data = inject<VentaComboEditDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

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

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();

    try {
      const result = await this.api.update(this.data.ventaCombo.id, payload);
      this.dialogRef.close(result);
    } catch {
      this.errorMessage.set(
        'No se pudo guardar la venta de combo. Intenta de nuevo.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
