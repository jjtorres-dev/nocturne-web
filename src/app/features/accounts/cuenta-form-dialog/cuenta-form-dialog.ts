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
import { sumarMeses } from '../../../shared/fecha.util';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../../core/auth/auth';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';

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
    MetodoPagoSelect,
    InfoHint,
    InfoToggle,
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
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<CuentaFormDialog, Cuenta | undefined>,
  );
  protected readonly data = inject<CuentaFormDialogData>(MAT_DIALOG_DATA);

  readonly isEdit = !!this.data.cuenta;

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;
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
      // Opcional al crear y al editar: hay proveedores que solo dan un
      // código, sin contraseña (caso real reportado por un revendedor), y
      // al editar tampoco siempre se reenvía la clave — backend ya la
      // acepta vacía en el PATCH.
      claveServicio: [this.data.cuenta?.claveServicio ?? ''],
      claveCorreo: [this.data.cuenta?.claveCorreo ?? ''],
      fechaInicio: [this.data.cuenta?.fechaInicio ?? '', Validators.required],
      fechaFin: [this.data.cuenta?.fechaFin ?? '', Validators.required],
      costo: [
        this.data.cuenta?.costo ?? 0,
        [Validators.required, Validators.min(0.01)],
      ],
      metodoPago: [
        this.metodoPagoInicial(),
        [Validators.required, Validators.minLength(1)],
      ],
      url: [this.data.cuenta?.url ?? ''],
      renovacionAutomatica: [
        this.data.cuenta?.renovacionAutomatica ?? false,
      ],
      // Solo tiene efecto al crear (ver submit): marcado por defecto,
      // el checkbox mismo solo se muestra si el servicio elegido tiene
      // pantallasMax (ver crearPerfilesVisible).
      crearPerfiles: [true],
    },
    { validators: fechaFinPosteriorValidator },
  );

  constructor() {
    // Autocompletado de fechaFin a partir del servicio elegido (ver
    // PROGRESS.md, feedback de revendedor): se queda editable, esto solo
    // sugiere un valor de partida. No dispara en modo edición mientras no
    // se toque nada, porque `valueChanges` no emite por el valor inicial
    // del form, solo por cambios reales del usuario.
    //
    // `costo` NO se autocompleta (a diferencia de fechaFin): es lo que se
    // pagó al proveedor por la cuenta completa, no tiene relación con
    // `precioBase` del servicio (que es el precio de venta de un perfil) —
    // se escribe siempre a mano.
    this.form.controls.servicioId.valueChanges.subscribe(() => {
      this.recalcularFechaFin();
    });
    this.form.controls.fechaInicio.valueChanges.subscribe(() => {
      this.recalcularFechaFin();
    });
  }

  // Solo al CREAR: si el usuario ya guardó una cuenta antes, arranca con
  // ese método en vez de vacío (editar siempre parte del valor real de la
  // cuenta, nunca de esto).
  private metodoPagoInicial(): string {
    if (this.data.cuenta) {
      return this.data.cuenta.metodoPago;
    }
    const userId = this.auth.currentUser()?.id;
    return (userId && this.ultimoMetodoPago.get(userId)) || '';
  }

  // Mismo criterio que Ventas y Ventas de combos: si el usuario ya editó el
  // vencimiento a mano (`dirty`), cambiar el servicio o la fecha de inicio
  // no lo pisa — `setValue()` programático no marca dirty, solo la
  // interacción real con el input.
  private recalcularFechaFin(): void {
    if (this.form.controls.fechaFin.dirty) {
      return;
    }
    const { servicioId, fechaInicio } = this.form.getRawValue();
    const servicio = this.servicios().find((s) => s.id === servicioId);
    if (!servicio || !fechaInicio) {
      return;
    }
    this.form.controls.fechaFin.setValue(
      sumarMeses(fechaInicio, servicio.duracionMeses),
    );
  }

  // El checkbox de perfiles automáticos solo tiene sentido al crear (ver
  // submit, que descarta el valor al editar) y solo si el servicio elegido
  // tiene pantallasMax (SIN_PERFILES no tiene nada que generar).
  protected crearPerfilesVisible(): boolean {
    return !this.isEdit && !!this.servicioSeleccionado()?.pantallasMax;
  }

  protected pantallasMaxDeServicioElegido(): number {
    return this.servicioSeleccionado()?.pantallasMax ?? 0;
  }

  private servicioSeleccionado(): Servicio | undefined {
    return this.servicios().find(
      (s) => s.id === this.form.controls.servicioId.value,
    );
  }

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
    this.formError.clear();

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      proveedorId: raw.proveedorId || undefined,
      claveServicio: raw.claveServicio || undefined,
      claveCorreo: raw.claveCorreo || undefined,
      url: raw.url || undefined,
      // Solo tiene efecto al crear — ver crearPerfilesVisible.
      crearPerfiles: this.isEdit ? undefined : raw.crearPerfiles,
    };

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.cuenta!.id, payload)
        : await this.api.create(payload);
      this.recordarMetodoPago(raw.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo guardar la cuenta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  // Se graba al guardar con éxito, tanto en crear como en editar: ambos
  // representan un método de pago realmente usado (ver metodoPagoInicial).
  private recordarMetodoPago(metodoPago: string): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.ultimoMetodoPago.set(userId, metodoPago);
    }
  }
}
