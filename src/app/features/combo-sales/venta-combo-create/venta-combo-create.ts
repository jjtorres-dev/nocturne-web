import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VentaCombosApi } from '../venta-combos-api';
import { type CreateVentaComboPayload } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';

interface AsignacionSection {
  servicio: Servicio;
  requierePerfil: boolean;
  cuentaId: string;
  perfilId: string;
  cuentas: CuentaListItem[];
  perfiles: Perfil[];
  loadingCuentas: boolean;
  loadingPerfiles: boolean;
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
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-venta-combo-create',
  styleUrl: './venta-combo-create.scss',
  templateUrl: './venta-combo-create.html',
})
export class VentaComboCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VentaCombosApi);
  private readonly combosApi = inject(CombosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly router = inject(Router);

  protected readonly monedas = Object.values(Moneda);
  protected readonly ServiceType = ServiceType;

  readonly saving = signal(false);
  readonly loadingOptions = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly combos = signal<Combo[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly selectedCombo = signal<Combo | null>(null);
  readonly asignaciones = signal<AsignacionSection[]>([]);
  readonly loadingAsignaciones = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      clienteId: ['', Validators.required],
      comboId: ['', Validators.required],
      duracionMeses: [1, [Validators.required, Validators.min(0.1)]],
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
      const [combos, clientes] = await Promise.all([
        this.combosApi.list({ activo: true }),
        this.contactosApi.list({ activo: true }),
      ]);
      this.combos.set(combos);
      this.clientes.set(clientes);
    } finally {
      this.loadingOptions.set(false);
    }
  }

  async onComboChange(comboId: string): Promise<void> {
    const combo = this.combos().find((c) => c.id === comboId) ?? null;
    this.selectedCombo.set(combo);
    this.asignaciones.set([]);

    if (!combo) {
      return;
    }

    this.form.patchValue({ precio: combo.precioCombo });

    const sections: AsignacionSection[] = combo.servicios.map((servicio) => ({
      servicio,
      requierePerfil:
        servicio.tipo === ServiceType.CON_PERFILES ||
        servicio.tipo === ServiceType.FAMILIAR,
      cuentaId: '',
      perfilId: '',
      cuentas: [],
      perfiles: [],
      loadingCuentas: true,
      loadingPerfiles: false,
    }));
    this.asignaciones.set(sections);

    this.loadingAsignaciones.set(true);
    try {
      await Promise.all(
        sections.map(async (section, index) => {
          const cuentas = await this.cuentasApi.list({
            servicioId: section.servicio.id,
            activo: true,
          });
          this.updateSection(index, { cuentas, loadingCuentas: false });
        }),
      );
    } finally {
      this.loadingAsignaciones.set(false);
    }
  }

  async onAsignacionCuentaChange(
    index: number,
    cuentaId: string,
  ): Promise<void> {
    this.updateSection(index, { cuentaId, perfilId: '', perfiles: [] });
    const section = this.asignaciones()[index];
    if (!cuentaId || !section.requierePerfil) {
      return;
    }

    this.updateSection(index, { loadingPerfiles: true });
    try {
      const perfiles = await this.perfilesApi.list(cuentaId, {
        activo: true,
      });
      // Solo perfiles libres (sin clienteId asignado), igual que en la
      // venta individual.
      this.updateSection(index, {
        perfiles: perfiles.filter((p) => !p.clienteId),
        loadingPerfiles: false,
      });
    } catch {
      this.updateSection(index, { loadingPerfiles: false });
    }
  }

  onAsignacionPerfilChange(index: number, perfilId: string): void {
    this.updateSection(index, { perfilId });
  }

  private updateSection(index: number, partial: Partial<AsignacionSection>): void {
    this.asignaciones.update((sections) =>
      sections.map((s, i) => (i === index ? { ...s, ...partial } : s)),
    );
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving() || !this.selectedCombo()) {
      return;
    }

    const validationError = this.validateAsignaciones();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: CreateVentaComboPayload = {
      clienteId: raw.clienteId,
      comboId: raw.comboId,
      fechaInicio: raw.fechaInicio,
      fechaFin: raw.fechaFin,
      duracionMeses: raw.duracionMeses,
      precio: raw.precio,
      moneda: raw.moneda,
      tasaCambio: raw.tasaCambio,
      metodoPago: raw.metodoPago,
      renovacionAutomatica: raw.renovacionAutomatica,
      asignaciones: this.asignaciones().map((section) => ({
        servicioId: section.servicio.id,
        cuentaId: section.cuentaId,
        perfilId: section.requierePerfil ? section.perfilId : undefined,
      })),
    };

    try {
      const result = await this.api.create(payload);
      void this.router.navigate(['/combo-sales', result.id]);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        // El backend identifica en el mensaje CUÁL servicio/asignación
        // falló (ver ComboSalesService.validarAsignacion): se muestra tal
        // cual, no un error genérico.
        this.errorMessage.set(
          (error.error?.message as string | undefined) ??
            'No se pudo crear la venta de combo.',
        );
      } else {
        this.errorMessage.set(
          'No se pudo crear la venta de combo. Intenta de nuevo.',
        );
      }
    } finally {
      this.saving.set(false);
    }
  }

  private validateAsignaciones(): string | null {
    for (const section of this.asignaciones()) {
      if (!section.cuentaId) {
        return `Selecciona una cuenta para el servicio "${section.servicio.nombre}".`;
      }
      if (section.requierePerfil && !section.perfilId) {
        return `El servicio "${section.servicio.nombre}" requiere seleccionar un perfil.`;
      }
      if (!section.requierePerfil) {
        const cuenta = section.cuentas.find((c) => c.id === section.cuentaId);
        if (cuenta?.clienteId) {
          return `El servicio "${section.servicio.nombre}": esa cuenta ya tiene un cliente asignado.`;
        }
      }
    }
    return null;
  }
}
