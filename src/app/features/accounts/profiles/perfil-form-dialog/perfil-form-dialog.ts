import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PerfilesApi } from '../perfiles-api';
import { type Perfil } from '../perfil.model';
import { extractErrorMessage, injectFormError } from '../../../../shared/form-error';

export interface PerfilFormDialogData {
  accountId: string;
  perfil?: Perfil;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-perfil-form-dialog',
  styleUrl: './perfil-form-dialog.scss',
  templateUrl: './perfil-form-dialog.html',
})
export class PerfilFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PerfilesApi);
  private readonly dialogRef = inject(
    MatDialogRef<PerfilFormDialog, Perfil | undefined>,
  );
  protected readonly data = inject<PerfilFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEdit = !!this.data.perfil;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;
  readonly showPin = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre: [
      this.data.perfil?.nombre ?? '',
      [Validators.required, Validators.minLength(1)],
    ],
    pin: [this.data.perfil?.pin ?? ''],
  });

  togglePin(): void {
    this.showPin.update((v) => !v);
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
    const payload = { ...raw, pin: raw.pin || undefined };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.accountId, this.data.perfil!.id, payload)
        : await this.api.create(this.data.accountId, payload);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el perfil. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
