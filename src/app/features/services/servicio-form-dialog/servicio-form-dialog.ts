import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  usaPerfiles,
  type Servicio,
} from '../servicio.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';

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
    InfoHint,
    InfoToggle,
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
    // Validadores según el tipo: ver syncPantallasMax.
    pantallasMax: [this.data.servicio?.pantallasMax ?? null],
    precioBase: [
      this.data.servicio?.precioBase ?? 0,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  private readonly tipo = toSignal(this.form.controls.tipo.valueChanges, {
    initialValue: this.form.controls.tipo.value,
  });
  protected readonly usaPerfiles = computed(() => usaPerfiles(this.tipo()));
  protected readonly esFamiliar = computed(
    () => this.tipo() === ServiceType.FAMILIAR,
  );
  protected readonly precioLabel = computed(() => {
    switch (this.tipo()) {
      case ServiceType.CON_PERFILES:
        return 'Precio de venta por perfil';
      case ServiceType.FAMILIAR:
        return 'Precio de venta por cupo';
      default:
        return 'Precio de venta de la cuenta';
    }
  });

  constructor() {
    this.syncPantallasMax();
    this.form.controls.tipo.valueChanges.subscribe(() => this.syncPantallasMax());
  }

  // "Perfiles por cuenta" (o cupos del plan) solo existe en los tipos que
  // se venden por perfil, y ahí es obligatorio (sin él no se pueden crear
  // los perfiles de la cuenta). En cuenta completa/IPTV el campo se oculta
  // y se deshabilita para que no bloquee el form; submit manda null.
  private syncPantallasMax(): void {
    const control = this.form.controls.pantallasMax;
    if (usaPerfiles(this.form.controls.tipo.value)) {
      control.setValidators([Validators.required, Validators.min(1)]);
      control.enable({ emitEvent: false });
    } else {
      control.clearValidators();
      control.disable({ emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
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
    const payload = {
      ...raw,
      pantallasMax: usaPerfiles(raw.tipo) ? raw.pantallasMax || null : null,
    };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.servicio!.id, payload)
        : await this.api.create(payload);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el servicio. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
