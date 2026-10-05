import { Component, inject, signal } from '@angular/core';
import {
  type AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuentasApi } from '../cuentas-api';
import type { Cuenta } from '../cuenta.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { hoyIso } from '../../../shared/fecha.util';

export interface CuentaMarcarCaidaDialogData {
  cuentaId: string;
  correo: string;
  servicioNombre: string;
}

// El backend también rechaza una fecha futura (400); acá se avisa antes.
function noFutura(control: AbstractControl<string>): ValidationErrors | null {
  return control.value && control.value > hoyIso() ? { futura: true } : null;
}

// "Marcar como caída" (Bloque — Cuentas caídas): pregunta desde qué día la
// cuenta dejó de funcionar. Desde ese día se cuentan los días que se les
// suman a los clientes cuando el proveedor la repone.
@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cuenta-marcar-caida-dialog',
  styleUrl: './cuenta-marcar-caida-dialog.scss',
  templateUrl: './cuenta-marcar-caida-dialog.html',
})
export class CuentaMarcarCaidaDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CuentasApi);
  private readonly dialogRef = inject(
    MatDialogRef<CuentaMarcarCaidaDialog, Cuenta | undefined>,
  );
  protected readonly data = inject<CuentaMarcarCaidaDialogData>(MAT_DIALOG_DATA);

  protected readonly hoy = hoyIso();
  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    fechaCaida: [this.hoy, [Validators.required, noFutura]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();
    try {
      const cuenta = await this.api.marcarCaida(
        this.data.cuentaId,
        this.form.getRawValue().fechaCaida,
      );
      this.dialogRef.close(cuenta);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(
          error,
          'No se pudo marcar la cuenta como caída. Inténtalo de nuevo.',
        ),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
