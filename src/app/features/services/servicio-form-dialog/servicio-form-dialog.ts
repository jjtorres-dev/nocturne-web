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
import { ServiciosApi } from '../servicios-api';
import {
  SERVICE_TYPE_LABELS,
  ServiceType,
  type Servicio,
} from '../servicio.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';

export interface ServicioFormDialogData {
  servicio?: Servicio;
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
  selector: 'app-servicio-form-dialog',
  styleUrl: './servicio-form-dialog.scss',
  templateUrl: './servicio-form-dialog.html',
})
export class ServicioFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServiciosApi);
  private readonly dialogRef = inject(
    MatDialogRef<ServicioFormDialog, Servicio | undefined>,
  );
  protected readonly data = inject<ServicioFormDialogData>(MAT_DIALOG_DATA);

  protected readonly serviceTypes = Object.values(ServiceType);
  protected readonly typeLabels = SERVICE_TYPE_LABELS;
  protected readonly isEdit = !!this.data.servicio;

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.servicio?.nombre ?? '', [Validators.required, Validators.minLength(1)]],
    tipo: [this.data.servicio?.tipo ?? ServiceType.CON_PERFILES, Validators.required],
    duracionMeses: [
      this.data.servicio?.duracionMeses ?? 1,
      [Validators.required, Validators.min(0.1)],
    ],
    pantallasMax: [this.data.servicio?.pantallasMax ?? null],
    precioBase: [
      this.data.servicio?.precioBase ?? 0,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      pantallasMax: raw.pantallasMax || null,
    };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.servicio!.id, payload)
        : await this.api.create(payload);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el servicio. Intenta de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
