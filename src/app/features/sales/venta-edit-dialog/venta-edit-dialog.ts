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
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';

export interface VentaEditDialogData {
  venta: Venta;
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
  selector: 'app-venta-edit-dialog',
  styleUrl: './venta-edit-dialog.scss',
  templateUrl: './venta-edit-dialog.html',
})
export class VentaEditDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentasApi);
  private readonly dialogRef = inject(
    MatDialogRef<VentaEditDialog, Venta | undefined>,
  );
  protected readonly data = inject<VentaEditDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fechaFin: [this.data.venta.fechaFin, Validators.required],
    precio: [
      this.data.venta.precio,
      [Validators.required, Validators.min(0.01)],
    ],
    moneda: [this.data.venta.moneda, Validators.required],
    tasaCambio: [
      this.data.venta.tasaCambio,
      [Validators.required, Validators.min(0.0001)],
    ],
    metodoPago: [
      this.data.venta.metodoPago,
      [Validators.required, Validators.minLength(1)],
    ],
    renovacionAutomatica: [this.data.venta.renovacionAutomatica],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();

    try {
      const result = await this.api.update(this.data.venta.id, payload);
      this.dialogRef.close(result);
    } catch {
      this.errorMessage.set('No se pudo guardar la venta. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
