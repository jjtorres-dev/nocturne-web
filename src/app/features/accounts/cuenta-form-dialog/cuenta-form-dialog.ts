import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CuentasApi } from '../cuentas-api';
import { type Cuenta } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';

export interface CuentaFormDialogData {
  cuenta?: Cuenta;
}

function fechaFinPosteriorValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const inicio = group.get('fechaInicio')?.value;
  const fin = group.get('fechaFin')?.value;
  if (inicio && fin && fin <= inicio) {
    return { fechaFinInvalida: true };
  }
  return null;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cuenta-form-dialog',
  styleUrl: './cuenta-form-dialog.scss',
  templateUrl: './cuenta-form-dialog.html',
})
export class CuentaFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CuentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly dialogRef = inject(
    MatDialogRef<CuentaFormDialog, Cuenta | undefined>,
  );
  protected readonly data = inject<CuentaFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.cuenta;

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly servicios = signal<Servicio[]>([]);
  readonly proveedores = signal<Contacto[]>([]);
  readonly showClaveServicio = signal(false);
  readonly showClaveCorreo = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      servicioId: [this.data.cuenta?.servicioId ?? '', Validators.required],
      proveedorId: [this.data.cuenta?.proveedorId ?? ''],
      correo: [
        this.data.cuenta?.correo ?? '',
        [Validators.required, Validators.email],
      ],
      claveServicio: [
        this.data.cuenta?.claveServicio ?? '',
        [Validators.required, Validators.minLength(1)],
      ],
      claveCorreo: [this.data.cuenta?.claveCorreo ?? ''],
      fechaInicio: [this.data.cuenta?.fechaInicio ?? '', Validators.required],
      fechaFin: [this.data.cuenta?.fechaFin ?? '', Validators.required],
      costo: [
        this.data.cuenta?.costo ?? 0,
        [Validators.required, Validators.min(0.01)],
      ],
      metodoPago: [
        this.data.cuenta?.metodoPago ?? '',
        [Validators.required, Validators.minLength(1)],
      ],
      url: [this.data.cuenta?.url ?? ''],
      renovacionAutomatica: [
        this.data.cuenta?.renovacionAutomatica ?? false,
      ],
    },
    { validators: fechaFinPosteriorValidator },
  );

  async ngOnInit(): Promise<void> {
    this.loadingOptions.set(true);
    try {
      const [servicios, proveedores] = await Promise.all([
        this.serviciosApi.list({ activo: true }),
        this.contactosApi.list({ tipo: ContactType.PROVEEDOR, activo: true }),
      ]);
      this.servicios.set(servicios);
      this.proveedores.set(proveedores);
    } finally {
      this.loadingOptions.set(false);
    }
  }

  toggleClaveServicio(): void {
    this.showClaveServicio.update((v) => !v);
  }

  toggleClaveCorreo(): void {
    this.showClaveCorreo.update((v) => !v);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      proveedorId: raw.proveedorId || undefined,
      claveCorreo: raw.claveCorreo || undefined,
      url: raw.url || undefined,
    };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.cuenta!.id, payload)
        : await this.api.create(payload);
      this.dialogRef.close(result);
    } catch {
      this.errorMessage.set('No se pudo guardar la cuenta. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
