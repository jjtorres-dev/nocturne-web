import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '../../../core/auth/auth';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';

const GENERIC_ERROR = 'No se pudo cambiar la contraseña. Inténtalo de nuevo.';

// Error `mismatch` en el campo de confirmación si no coincide con la nueva.
function matchesNewPassword(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.parent?.get('newPassword')?.value;
  return control.value === newPassword ? null : { mismatch: true };
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cambiar-password',
  styleUrl: './cambiar-password.scss',
  templateUrl: './cambiar-password.html',
})
export class CambiarPassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly email = this.auth.currentUser()?.email ?? '';

  readonly saving = signal(false);
  // El último error fue por demasiados intentos (429): el aviso lleva un
  // reloj en vez del ícono de error.
  readonly demasiadosIntentos = signal(false);
  // Cada contraseña se escribe oculta; su ojo la deja ver, como en el login.
  protected readonly ver = signal({ actual: false, nueva: false, confirmacion: false });
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, matchesNewPassword]],
  });

  constructor() {
    // El validador de la confirmación depende de otro campo: hay que
    // revalidarla cuando cambia la nueva contraseña.
    this.form.controls.newPassword.valueChanges.subscribe(() =>
      this.form.controls.confirmPassword.updateValueAndValidity(),
    );
  }

  protected alternarVer(campo: 'actual' | 'nueva' | 'confirmacion'): void {
    this.ver.update((v) => ({ ...v, [campo]: !v[campo] }));
  }

  async submit(): Promise<void> {
    if (this.saving()) {
      return;
    }
    // Sin llamar al backend si el formulario es inválido (incluye que la
    // confirmación no coincida con la nueva contraseña).
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.clear();
    this.demasiadosIntentos.set(false);
    // El snackbar de un intento fallido anterior sigue en pantalla unos
    // segundos: si este reintento sale bien, no debe quedar sobre /login.
    this.snackBar.dismiss();

    const { currentPassword, newPassword } = this.form.getRawValue();

    try {
      await this.auth.changePassword(currentPassword, newPassword);
    } catch (error) {
      this.demasiadosIntentos.set(error instanceof HttpErrorResponse && error.status === 429);
      this.formError.show(extractErrorMessage(error, GENERIC_ERROR));
      this.saving.set(false);
      return;
    }

    // El backend revocó todos los refresh tokens, incluido el de esta
    // sesión: se cierra con el mismo flujo de logout, con aviso propio.
    await this.auth.logout('passwordChanged');
    this.saving.set(false);
  }
}
