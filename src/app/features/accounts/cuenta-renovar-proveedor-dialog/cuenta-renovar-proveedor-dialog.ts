import { Component, OnInit, inject, signal } from '@angular/core';
import {
  type AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
  Validators,
} from '@angular/forms';
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
import { CuentasApi } from '../cuentas-api';
import type { Cuenta, PagoProveedor } from '../cuenta.model';
import { MONEDA_LABELS, Moneda } from '../../sales/venta.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';
import { formatFechaCorta, hoyIso, sumarMeses } from '../../../shared/fecha.util';

export interface CuentaRenovarProveedorDialogData {
  cuentaId: string;
  correo: string;
  servicioNombre: string;
  // Vencimiento actual con el proveedor ('YYYY-MM-DD').
  fechaFin: string;
}

// La nueva fecha tiene que ser posterior a la actual: el backend también lo
// valida (400), acá se avisa antes de mandar.
function posteriorA(fechaActual: string): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null =>
    control.value && control.value <= fechaActual ? { noPosterior: true } : null;
}

// "Renovar con el proveedor" (Bloque — Renovación con el proveedor): se usa
// desde el detalle de la cuenta y desde "Cuentas que debes pagar al
// proveedor" del Inicio. Registra el pago de la renovación y la nueva fecha
// de vencimiento en una sola llamada (POST /accounts/:id/renew-provider).
// Lo más probable es que la renovación cueste lo mismo que la última vez:
// monto, moneda, tipo de cambio y método de pago arrancan con los del
// último pago al proveedor de esta cuenta.
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
  selector: 'app-cuenta-renovar-proveedor-dialog',
  styleUrl: './cuenta-renovar-proveedor-dialog.scss',
  templateUrl: './cuenta-renovar-proveedor-dialog.html',
})
export class CuentaRenovarProveedorDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CuentasApi);
  private readonly dialogRef = inject(
    MatDialogRef<CuentaRenovarProveedorDialog, Cuenta | undefined>,
  );
  protected readonly data = inject<CuentaRenovarProveedorDialogData>(MAT_DIALOG_DATA);

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;
  protected readonly fechaFinActual = formatFechaCorta(this.data.fechaFin);

  readonly ultimoPago = signal<PagoProveedor | null>(null);
  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.group({
    monto: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
    ]),
    moneda: this.fb.nonNullable.control(Moneda.PEN, Validators.required),
    tasaCambio: this.fb.nonNullable.control(1, [
      Validators.required,
      Validators.min(0.0001),
    ]),
    metodoPago: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    fechaPago: this.fb.nonNullable.control(hoyIso(), Validators.required),
    // + 1 mes, sin desbordar: 31/01 → 28/02 (no 03/03).
    nuevaFechaFin: this.fb.nonNullable.control(sumarMeses(this.data.fechaFin, 1), [
      Validators.required,
      posteriorA(this.data.fechaFin),
    ]),
  });

  constructor() {
    // En PEN no se pide tipo de cambio (se fuerza a 1 y se oculta), igual
    // que en el resto de los formularios con moneda.
    this.form.controls.moneda.valueChanges.subscribe((moneda) => {
      if (moneda === Moneda.PEN) {
        this.form.controls.tasaCambio.setValue(1);
      }
    });
  }

  ngOnInit(): void {
    void this.cargarUltimoPago();
  }

  // Si falla o la cuenta no tiene pagos, el formulario queda vacío para
  // escribirlo a mano: no amerita un error.
  private async cargarUltimoPago(): Promise<void> {
    try {
      const [ultimo] = await this.api.pagosProveedor(this.data.cuentaId);
      if (!ultimo) {
        return;
      }
      this.ultimoPago.set(ultimo);
      const c = this.form.controls;
      // Solo si todavía no se empezó a escribir.
      if (c.monto.pristine && c.moneda.pristine && c.metodoPago.pristine) {
        this.form.patchValue({
          monto: ultimo.monto,
          moneda: ultimo.moneda,
          tasaCambio: ultimo.tasaCambio,
          metodoPago: ultimo.metodoPago,
        });
      }
    } catch {
      // Ver comentario de arriba.
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const raw = this.form.getRawValue();
    try {
      const cuenta = await this.api.renovarProveedor(this.data.cuentaId, {
        monto: raw.monto ?? 0,
        moneda: raw.moneda,
        tasaCambio: raw.moneda === Moneda.PEN ? 1 : raw.tasaCambio,
        metodoPago: raw.metodoPago,
        fechaPago: raw.fechaPago,
        nuevaFechaFin: raw.nuevaFechaFin,
      });
      this.dialogRef.close(cuenta);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo renovar la cuenta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
