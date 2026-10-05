import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VentasApi } from '../ventas-api';
import { MONEDA_LABELS, Moneda, type Venta } from '../venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { cuentasVendibles, type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';
import { ClienteQuickCreateDialog } from '../../../shared/cliente-quick-create-dialog/cliente-quick-create-dialog';
import { hoyIso, sumarMeses } from '../../../shared/fecha.util';
import { extractErrorMessage, injectFormError } from '../../../shared/form-error';
import { MetodoPagoSelect } from '../../../shared/metodo-pago/metodo-pago-select/metodo-pago-select';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';
import { Auth } from '../../../core/auth/auth';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';
import { FechaField } from '../../../shared/fecha-field/fecha-field';

// Sentinel para la opción "+ Nuevo cliente" del selector — nunca un id real.
const NUEVO_CLIENTE = '__nuevo_cliente__';

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
    FechaField,
    InfoHint,
    InfoToggle,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MetodoPagoSelect,
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
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(Auth);
  private readonly ultimoMetodoPago = inject(UltimoMetodoPago);
  private readonly dialogRef = inject(
    MatDialogRef<VentaCreateDialog, Venta | undefined>,
  );

  protected readonly monedas = Object.values(Moneda);
  protected readonly monedaLabels = MONEDA_LABELS;
  protected readonly Moneda = Moneda;
  readonly NUEVO_CLIENTE = NUEVO_CLIENTE;
  private clienteIdPrevio = '';

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

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
      fechaInicio: [hoyIso(), Validators.required],
      fechaFin: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      moneda: [Moneda.PEN, Validators.required],
      tasaCambio: [1, [Validators.required, Validators.min(0.0001)]],
      metodoPago: [
        this.metodoPagoInicial(),
        [Validators.required, Validators.minLength(1)],
      ],
      renovacionAutomatica: [false],
    },
    { validators: fechaFinPosteriorValidator },
  );

  constructor() {
    // fechaFin se recalcula con la duración del servicio de la cuenta
    // elegida (ver onCuentaChange) cada vez que cambia fechaInicio; se
    // queda editable, esto solo sugiere un valor de partida.
    this.form.controls.fechaInicio.valueChanges.subscribe(() => {
      this.recalcularFechaFin();
    });
    // En PEN no tiene sentido pedir una tasa de cambio contra sí misma:
    // el campo se fuerza a 1 y se oculta en el template (ver
    // venta-create-dialog.html). Con cualquier otra moneda se muestra y
    // queda editable a mano.
    this.form.controls.moneda.valueChanges.subscribe((moneda) => {
      if (moneda === Moneda.PEN) {
        this.form.controls.tasaCambio.setValue(1);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadingOptions.set(true);
    try {
      const [servicios, clientes] = await Promise.all([
        this.serviciosApi.list({ activo: true }),
        this.contactosApi.list({
          tipo: ContactType.CLIENTE_FINAL,
          activo: true,
        }),
      ]);
      this.servicios.set(servicios);
      this.clientes.set(clientes);
    } finally {
      this.loadingOptions.set(false);
    }
  }

  private servicioDeCuentaActual(): Servicio | undefined {
    const cuentaId = this.cuentaSeleccionadaId();
    const cuenta = this.cuentas().find((c) => c.id === cuentaId);
    return cuenta && this.servicios().find((s) => s.id === cuenta.servicioId);
  }

  // Mismo criterio que el precio sugerido (ver aplicarSugerenciaDePrecio):
  // si el usuario ya editó el vencimiento a mano (`dirty`), cambiar la
  // cuenta o la fecha de inicio no lo pisa.
  private recalcularFechaFin(): void {
    if (this.form.controls.fechaFin.dirty) {
      return;
    }
    const fechaInicio = this.form.controls.fechaInicio.value;
    const servicio = this.servicioDeCuentaActual();
    if (!servicio || !fechaInicio) {
      return;
    }
    this.form.controls.fechaFin.setValue(
      sumarMeses(fechaInicio, servicio.duracionMeses),
    );
  }

  // Precio de venta sugerido = precioBase del Servicio de la cuenta elegida
  // (el costo de la Cuenta es lo que se pagó al proveedor por la cuenta
  // completa; esto es lo que se le cobra al cliente por un perfil — no
  // tienen por qué coincidir). Se queda editable: `dirty` (no un flag
  // propio) detecta si el usuario ya lo tocó a mano — `setValue()`
  // programático no marca dirty, solo la interacción real con el input.
  private aplicarSugerenciaDePrecio(): void {
    if (this.form.controls.precio.dirty) {
      return;
    }
    const servicio = this.servicioDeCuentaActual();
    if (!servicio) {
      return;
    }
    this.form.controls.precio.setValue(servicio.precioBase);
  }

  // Si el usuario ya creó una venta antes, arranca con ese método en vez
  // de vacío.
  private metodoPagoInicial(): string {
    const userId = this.auth.currentUser()?.id;
    return (userId && this.ultimoMetodoPago.get(userId)) || '';
  }

  onClienteSelectionChange(clienteId: string): void {
    if (clienteId !== NUEVO_CLIENTE) {
      this.clienteIdPrevio = clienteId;
      return;
    }

    // Mientras se decide en el modal chico, el selector vuelve al cliente
    // que estaba antes (no se puede dejar el sentinel "seleccionado").
    this.form.patchValue({ clienteId: this.clienteIdPrevio });

    const ref = this.dialog.open(ClienteQuickCreateDialog, {
      width: '360px',
    });
    ref.afterClosed().subscribe((creado?: Contacto) => {
      if (!creado) {
        return;
      }
      this.clientes.update((lista) => [...lista, creado]);
      this.clienteIdPrevio = creado.id;
      this.form.patchValue({ clienteId: creado.id });
    });
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
      // Sin las cuentas caídas: no se venden hasta que se repongan.
      this.cuentas.set(
        cuentasVendibles(await this.cuentasApi.list({ servicioId, activo: true })),
      );
    } finally {
      this.loadingCuentas.set(false);
    }
  }

  async onCuentaChange(cuentaId: string): Promise<void> {
    this.cuentaSeleccionadaId.set(cuentaId);
    this.perfiles.set([]);
    this.form.patchValue({ perfilId: '' });
    this.recalcularFechaFin();
    this.aplicarSugerenciaDePrecio();

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
    this.formError.clear();

    const raw = this.form.getRawValue();

    if (this.requierePerfil()) {
      if (!raw.perfilId) {
        this.formError.show('Elige qué perfil le vendes.');
        return;
      }
    } else {
      const cuenta = this.cuentas().find((c) => c.id === raw.cuentaId);
      if (cuenta?.clienteId) {
        this.formError.show('Esta cuenta ya se vendió completa a otro cliente.');
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
      this.recordarMetodoPago(raw.metodoPago);
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo crear la venta. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  private recordarMetodoPago(metodoPago: string): void {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.ultimoMetodoPago.set(userId, metodoPago);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
