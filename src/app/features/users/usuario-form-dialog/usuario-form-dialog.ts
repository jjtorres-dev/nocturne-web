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
import { Auth } from '../../../core/auth/auth';
import { UsuariosApi } from '../usuarios-api';
import {
  USER_ROLE_LABELS,
  UserRole,
  type CreateUsuarioPayload,
  type UpdateUsuarioPayload,
  type Usuario,
} from '../usuario.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';

export interface UsuarioFormDialogData {
  usuario?: Usuario;
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
  selector: 'app-usuario-form-dialog',
  styleUrl: './usuario-form-dialog.scss',
  templateUrl: './usuario-form-dialog.html',
})
export class UsuarioFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(UsuariosApi);
  private readonly auth = inject(Auth);
  private readonly dialogRef = inject(
    MatDialogRef<UsuarioFormDialog, Usuario | undefined>,
  );
  protected readonly data = inject<UsuarioFormDialogData>(MAT_DIALOG_DATA);

  protected readonly roles = Object.values(UserRole);
  protected readonly roleLabels = USER_ROLE_LABELS;
  readonly isEdit = !!this.data.usuario;
  // El propio usuario editándose a sí mismo no puede tocar su rol (el
  // backend da 403 si `role` viene en el body, sin importar el valor) —
  // se bloquea el select acá para que ni se le muestre como una opción.
  readonly isSelf =
    this.isEdit && this.data.usuario!.id === this.auth.currentUser()?.id;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    email: [
      { value: this.data.usuario?.email ?? '', disabled: this.isEdit },
      [Validators.required, Validators.email],
    ],
    name: [
      this.data.usuario?.name ?? '',
      [Validators.required, Validators.minLength(1)],
    ],
    role: [
      { value: this.data.usuario?.role ?? UserRole.REVENDEDOR, disabled: this.isSelf },
      Validators.required,
    ],
    // Al crear, obligatoria (mín. 8). Al editar, opcional — vacío significa
    // "no cambiar la clave" (minLength no falla sobre un valor vacío).
    password: ['', this.isEdit ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const raw = this.form.getRawValue();

    try {
      let result: Usuario;
      if (this.isEdit) {
        const payload: UpdateUsuarioPayload = { name: raw.name };
        // Nunca se manda `role` cuando el usuario se edita a sí mismo, ni
        // siquiera con el mismo valor que ya tenía (ver comentario en
        // usuario.model.ts).
        if (!this.isSelf) {
          payload.role = raw.role;
        }
        if (raw.password) {
          payload.password = raw.password;
        }
        result = await this.api.update(this.data.usuario!.id, payload);
      } else {
        const payload: CreateUsuarioPayload = {
          email: raw.email,
          password: raw.password,
          name: raw.name,
          role: raw.role,
        };
        result = await this.api.create(payload);
      }
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el usuario. Intenta de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
