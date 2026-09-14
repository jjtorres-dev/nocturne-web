import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';

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
    MatProgressSpinnerModule,
  ],
  selector: 'app-venta-create-dialog',
  styleUrl: './venta-create-dialog.scss',
  templateUrl: './venta-create-dialog.html',
})
export class VentaCreateDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly dialogRef = inject(
    MatDialogRef<VentaCreateDialog, Venta | undefined>,
  );

  protected readonly monedas = Object.values(Moneda);

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly servicios = signal<Servicio[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly perfiles = signal<Perfil[]>([]);

  readonly loadingCuentas = signal(false);
  readonly loadingPerfiles = signal(false);
  readonly requierePerfil = signal(false);

  readonly servicioSeleccionadoId = signal('');
  readonly cuentaSeleccionadaId = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      servicioId: ['', Validators.required],
      cuentaId: ['', Validators.required],
      perfilId: [''],
      clienteId: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      moneda: [Moneda.PEN, Validators.required],
      tasaCambio: [1, [Validators.required, Validators.min(0.0001)]],
      metodoPago: ['', [Validators.required, Validators.minLength(1)]],
      renovacionAutomatica: [false],
    },
    { validators: fechaFinPosteriorValidator },
  );

  async ngOnInit(): Promise<void> {
    this.loadingOptions.set(true);
    try {
      const [servicios, clientes] = await Promise.all([
        this.serviciosApi.list({ activo: true }),
        this.contactosApi.list({ activo: true }),
      ]);
      this.servicios.set(servicios);
      this.clientes.set(clientes);
    } finally {
      this.loadingOptions.set(false);
    }
  }

  async onServicioChange(servicioId: string): Promise<void> {
    this.servicioSeleccionadoId.set(servicioId);
    const servicio = this.servicios().find((s) => s.id === servicioId) ?? null;
    this.requierePerfil.set(
      servicio?.tipo === ServiceType.CON_PERFILES ||
        servicio?.tipo === ServiceType.FAMILIAR,
    );

    this.cuentas.set([]);
    this.perfiles.set([]);
    this.cuentaSeleccionadaId.set('');
    this.form.patchValue({ cuentaId: '', perfilId: '' });

    if (!servicioId) {
      return;
    }

    this.loadingCuentas.set(true);
    try {
      this.cuentas.set(
        await this.cuentasApi.list({ servicioId, activo: true }),
      );
    } finally {
      this.loadingCuentas.set(false);
    }
  }

  async onCuentaChange(cuentaId: string): Promise<void> {
    this.cuentaSeleccionadaId.set(cuentaId);
    this.perfiles.set([]);
    this.form.patchValue({ perfilId: '' });

    if (!cuentaId || !this.requierePerfil()) {
      return;
    }

    this.loadingPerfiles.set(true);
    try {
      const perfiles = await this.perfilesApi.list(cuentaId, {
        activo: true,
      });
      // Solo perfiles libres (sin clienteId asignado): los ocupados no se
      // ofrecen para una venta nueva.
      this.perfiles.set(perfiles.filter((p) => !p.clienteId));
    } finally {
      this.loadingPerfiles.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();

    if (this.requierePerfil()) {
      if (!raw.perfilId) {
        this.errorMessage.set('Selecciona un perfil para esta cuenta.');
        return;
      }
    } else {
      const cuenta = this.cuentas().find((c) => c.id === raw.cuentaId);
      if (cuenta?.clienteId) {
        this.errorMessage.set('Esta cuenta ya tiene un cliente asignado.');
        return;
      }
    }

    this.saving.set(true);
    const payload = {
      clienteId: raw.clienteId,
      cuentaId: raw.cuentaId,
      perfilId: this.requierePerfil() ? raw.perfilId : undefined,
      fechaInicio: raw.fechaInicio,
      fechaFin: raw.fechaFin,
      precio: raw.precio,
      moneda: raw.moneda,
      tasaCambio: raw.tasaCambio,
      metodoPago: raw.metodoPago,
      renovacionAutomatica: raw.renovacionAutomatica,
    };

    try {
      const result = await this.api.create(payload);
      this.dialogRef.close(result);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        // Carrera: alguien más vendió el perfil/cuenta justo antes.
        this.errorMessage.set(
          (error.error?.message as string | undefined) ??
            'El perfil o la cuenta ya no están disponibles.',
        );
      } else {
        this.errorMessage.set('No se pudo crear la venta. Intenta de nuevo.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
