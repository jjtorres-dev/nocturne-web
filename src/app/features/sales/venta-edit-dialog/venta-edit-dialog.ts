import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MONEDA_LABELS, Moneda, type AjusteVenta, type Venta } from '../venta.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../../core/auth/auth';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';
import { AjustesVenta } from '../../../shared/ajustes-venta/ajustes-venta';
import { FechaField } from '../../../shared/fecha-field/fecha-field';

export interface VentaEditDialogData {
  venta: Venta;
}

@Component({
  imports: [
    FechaField,
    AjustesVenta,
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
  selector: 'app-venta-edit-dialog',
  styleUrl: './venta-edit-dialog.scss',
  templateUrl: './venta-edit-dialog.html',
})
export class VentaEditDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentasApi);
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<VentaEditDialog, Venta | undefined>,
  );
  protected readonly data = inject<VentaEditDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;

  readonly saving = signal(false);
  // Días sumados al vencimiento por cuentas caídas: explican por qué
  // "Vence" no coincide con lo que pagó el cliente. Si falla la carga, no se
  // muestran (no bloquea editar).
  readonly ajustes = signal<AjusteVenta[]>([]);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

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

  ngOnInit(): void {
    void this.cargarAjustes();
  }

  private async cargarAjustes(): Promise<void> {
    try {
      this.ajustes.set(await this.api.ajustes(this.data.venta.id));
    } catch {
      this.ajustes.set([]);
    }
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

    const payload = this.form.getRawValue();

    try {
      const result = await this.api.update(this.data.venta.id, payload);
      this.recordarMetodoPago(payload.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar la venta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  // Editar también graba el método de pago usado (ver UltimoMetodoPago):
  // solo el valor INICIAL de un formulario de crear viene de acá, nunca el
  // de uno de editar.
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
