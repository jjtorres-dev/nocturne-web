import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasApi } from '../cuentas-api';
import type {
  Cuenta,
  CuentaRepuesta,
  ReponerCuentaPayload,
} from '../cuenta.model';
import type { Perfil } from '../profiles/perfil.model';
import { formatearDatosReposicion } from '../../sales/copiar-datos.util';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';
import {
  clientesTexto,
  diasEntre,
  diasTexto,
  formatFechaCorta,
  hoyIso,
} from '../../../shared/fecha.util';
import { FechaField } from '../../../shared/fecha-field/fecha-field';

export interface CuentaReponerDialogData {
  // La cuenta caída (fechaCaida no es null).
  cuenta: Cuenta;
  servicioNombre: string;
  // Perfiles activos de la cuenta, con su nombre y PIN actuales.
  perfiles: Perfil[];
  // Clientes con una venta vigente en la cuenta; null si no se pudo saber.
  clientesAfectados: number | null;
}

// El backend también valida el rango (400); acá se avisa antes de mandar.
function entre(desde: string, hasta: string): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    if (control.value < desde) {
      return { antesDeCaida: true };
    }
    return control.value > hasta ? { futura: true } : null;
  };
}

// "Reponer cuenta" (Bloque — Cuentas caídas): el proveedor repuso la cuenta
// caída con otra. Se guardan los datos nuevos en la MISMA cuenta y a cada
// cliente se le suman los días sin servicio (POST /accounts/:id/restore, todo
// o nada). No se registra ningún pago: la reposición es gratis. Al terminar,
// el diálogo ofrece copiar los datos nuevos para avisar a los clientes.
@Component({
  imports: [
    FechaField,
    InfoHint,
    InfoToggle,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cuenta-reponer-dialog',
  styleUrl: './cuenta-reponer-dialog.scss',
  templateUrl: './cuenta-reponer-dialog.html',
})
export class CuentaReponerDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CuentasApi);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(
    MatDialogRef<CuentaReponerDialog, CuentaRepuesta | undefined>,
  );
  protected readonly data = inject<CuentaReponerDialogData>(MAT_DIALOG_DATA);

  // fechaCaida nunca es null acá: el diálogo solo se abre con la cuenta caída.
  protected readonly fechaCaida = this.data.cuenta.fechaCaida ?? hoyIso();
  protected readonly hoy = hoyIso();
  protected readonly fechaCaidaCorta = formatFechaCorta(this.fechaCaida);

  readonly saving = signal(false);
  // La cuenta ya repuesta: el diálogo pasa a la pantalla de "listo".
  readonly repuesta = signal<CuentaRepuesta | null>(null);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.group({
    // Vacío a propósito: la cuenta de reposición casi siempre trae otro
    // correo, y dejar el anterior escrito invita a guardarlo sin mirar.
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    claveServicio: this.fb.nonNullable.control(''),
    claveCorreo: this.fb.nonNullable.control(''),
    perfiles: this.fb.array(
      this.data.perfiles.map((perfil) =>
        this.fb.nonNullable.group({
          id: perfil.id,
          nombre: [perfil.nombre, [Validators.required, Validators.minLength(1)]],
          pin: perfil.pin ?? '',
        }),
      ),
    ),
    fechaReposicion: this.fb.nonNullable.control(this.hoy, [
      Validators.required,
      entre(this.fechaCaida, this.hoy),
    ]),
    diasCompensacion: this.fb.control<number | null>(
      Math.max(0, diasEntre(this.fechaCaida, this.hoy)),
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
    ),
  });

  private readonly dias = toSignal(this.form.controls.diasCompensacion.valueChanges, {
    initialValue: this.form.controls.diasCompensacion.value,
  });

  // Dice exactamente qué va a pasar al guardar.
  protected readonly resumen = computed(() => {
    const dias = this.dias();
    const clientes = this.data.clientesAfectados;
    if (clientes === 0) {
      return 'Esta cuenta no tiene clientes con ventas vigentes: no se sumarán días a nadie.';
    }
    if (dias === null || dias < 0 || !Number.isInteger(dias)) {
      return 'Escribe cuántos días les vas a compensar a tus clientes.';
    }
    if (dias === 0) {
      return 'No se sumarán días a ningún cliente.';
    }
    const sumar = dias === 1 ? 'Se sumará 1 día' : `Se sumarán ${dias} días`;
    return clientes === null
      ? `${sumar} a cada cliente con una venta vigente en esta cuenta.`
      : `${sumar} a ${clientesTexto(clientes)}.`;
  });

  // Lo que se hizo, para la pantalla de "listo".
  protected readonly resultado = computed(() => {
    const compensacion = this.repuesta()?.compensacion;
    if (!compensacion) {
      return '';
    }
    if (compensacion.dias === 0 || compensacion.clientes === 0) {
      return 'No se sumaron días a ningún cliente.';
    }
    const sumar =
      compensacion.dias === 1
        ? 'Se sumó 1 día'
        : `Se sumaron ${compensacion.dias} días`;
    return `${sumar} a ${clientesTexto(compensacion.clientes)}.`;
  });

  constructor() {
    // "Días a compensar" sigue a la fecha de reposición mientras no se haya
    // escrito a mano.
    this.form.controls.fechaReposicion.valueChanges.subscribe((fecha) => {
      const control = this.form.controls.diasCompensacion;
      if (fecha && control.pristine) {
        control.setValue(Math.max(0, diasEntre(this.fechaCaida, fecha)));
      }
    });
  }

  protected diasCaidaTexto(): string {
    return diasTexto(Math.max(0, diasEntre(this.fechaCaida, this.hoy)));
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
    // Solo los perfiles que cambiaron. Un PIN borrado se manda en null (el
    // perfil nuevo no tiene PIN).
    const perfiles: NonNullable<ReponerCuentaPayload['perfiles']> = [];
    raw.perfiles.forEach((perfil, i) => {
      const actual = this.data.perfiles[i];
      const nombre = perfil.nombre.trim();
      const pin = perfil.pin.trim();
      const cambios: (typeof perfiles)[number] = { id: perfil.id };
      if (nombre !== actual.nombre) {
        cambios.nombre = nombre;
      }
      if (pin !== (actual.pin ?? '')) {
        cambios.pin = pin === '' ? null : pin;
      }
      if (Object.keys(cambios).length > 1) {
        perfiles.push(cambios);
      }
    });

    const payload: ReponerCuentaPayload = {
      correo: raw.correo.trim(),
      fechaReposicion: raw.fechaReposicion,
      diasCompensacion: raw.diasCompensacion ?? 0,
    };
    // Vacías = quedan las de antes.
    if (raw.claveServicio) {
      payload.claveServicio = raw.claveServicio;
    }
    if (raw.claveCorreo) {
      payload.claveCorreo = raw.claveCorreo;
    }
    if (perfiles.length > 0) {
      payload.perfiles = perfiles;
    }

    try {
      this.repuesta.set(await this.api.reponer(this.data.cuenta.id, payload));
      // Ya se repuso: que solo se cierre con "Listo" (Escape o un click
      // afuera devolverían undefined y el detalle no se recargaría).
      this.dialogRef.disableClose = true;
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo reponer la cuenta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  // Texto plano al portapapeles, nunca por URL (ver copiar-datos.util).
  async copiarDatos(): Promise<void> {
    const repuesta = this.repuesta();
    if (!repuesta) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        formatearDatosReposicion({
          servicioNombre: this.data.servicioNombre,
          correo: repuesta.correo,
          claveServicio: repuesta.claveServicio,
          diasCompensados: repuesta.compensacion.clientes > 0 ? repuesta.compensacion.dias : 0,
        }),
      );
      this.snackBar.open('Datos copiados. Ya puedes pegarlos en WhatsApp.', 'Cerrar', {
        duration: 3000,
      });
    } catch {
      this.snackBar.open('No se pudieron copiar los datos.', 'Cerrar', {
        duration: 4000,
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  // Cierra la pantalla de "listo": la cuenta ya se repuso, así que siempre
  // devuelve el resultado (quien abrió el diálogo recarga).
  cerrar(): void {
    this.dialogRef.close(this.repuesta() ?? undefined);
  }
}
