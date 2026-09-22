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
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CombosApi } from '../combos-api';
import type { Combo } from '../combo.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';

export interface ComboFormDialogData {
  combo?: Combo;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-combo-form-dialog',
  styleUrl: './combo-form-dialog.scss',
  templateUrl: './combo-form-dialog.html',
})
export class ComboFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CombosApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly dialogRef = inject(
    MatDialogRef<ComboFormDialog, Combo | undefined>,
  );
  protected readonly data = inject<ComboFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEdit = !!this.data.combo;

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;
  readonly servicios = signal<Servicio[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.combo?.nombre ?? '', [Validators.required, Validators.minLength(1)]],
    descripcion: [this.data.combo?.descripcion ?? ''],
    servicioIds: [
      this.data.combo?.servicios.map((s) => s.id) ?? [],
      [Validators.required, minArrayLength(2)],
    ],
    precioCombo: [
      this.data.combo?.precioCombo ?? 0,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  async ngOnInit(): Promise<void> {
    this.loadingOptions.set(true);
    try {
      // Al editar, el combo puede tener servicios que ya se desactivaron;
      // se incluyen igual en las opciones para no perderlos del formulario.
      const activos = await this.serviciosApi.list({ activo: true });
      const seleccionados = this.data.combo?.servicios ?? [];
      const faltantes = seleccionados.filter(
        (s) => !activos.some((a) => a.id === s.id),
      );
      this.servicios.set([...activos, ...faltantes]);
    } finally {
      this.loadingOptions.set(false);
    }
  }

  protected servicioNombre(id: string): string {
    return this.servicios().find((s) => s.id === id)?.nombre ?? '—';
  }

  removeServicio(id: string): void {
    const actuales = this.form.controls.servicioIds.value;
    this.form.controls.servicioIds.setValue(
      actuales.filter((s) => s !== id),
    );
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    const raw = this.form.getRawValue();
    const payload = {
      nombre: raw.nombre,
      descripcion: raw.descripcion || undefined,
      servicioIds: raw.servicioIds,
      precioCombo: raw.precioCombo,
    };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.combo!.id, payload)
        : await this.api.create(payload);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar el combo. Intenta de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}

function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    (control.value?.length ?? 0) >= min ? null : { minArrayLength: { min } };
}
