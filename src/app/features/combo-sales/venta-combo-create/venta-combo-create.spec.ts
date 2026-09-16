import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { VentaComboCreate } from './venta-combo-create';
import { VentaCombosApi } from '../venta-combos-api';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';

describe('VentaComboCreate', () => {
  const servicioConPerfiles: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const servicioSinPerfiles: Servicio = {
    ...servicioConPerfiles,
    id: 'srv-2',
    nombre: 'IPTV Básico',
    tipo: ServiceType.SIN_PERFILES,
  };
  const combo: Combo = {
    id: 'combo-1',
    nombre: 'Combo Netflix + IPTV',
    descripcion: null,
    servicios: [servicioConPerfiles, servicioSinPerfiles],
    precioCombo: 25,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const cuentaNetflix: CuentaListItem = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: null,
    clienteId: null,
    correo: 'netflix@correo.com',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-01',
    costo: 10,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    perfilesCount: 1,
    createdAt: '',
    updatedAt: '',
  };
  const cuentaIptv: CuentaListItem = {
    ...cuentaNetflix,
    id: 'cta-2',
    servicioId: 'srv-2',
    correo: 'iptv@correo.com',
  };
  const perfilLibre: Perfil = {
    id: 'per-1',
    cuentaId: 'cta-1',
    nombre: 'Perfil libre',
    pin: null,
    clienteId: null,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VentaComboCreate>;
  let component: VentaComboCreate;
  let api: { create: ReturnType<typeof vi.fn> };
  let combosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let router: Router;

  async function setup() {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'vc-1', codigoVenta: 'C-00001' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = {
      list: vi.fn().mockImplementation(({ servicioId }: { servicioId: string }) =>
        Promise.resolve(servicioId === 'srv-1' ? [cuentaNetflix] : [cuentaIptv]),
      ),
    };
    perfilesApi = { list: vi.fn().mockResolvedValue([perfilLibre]) };

    await TestBed.configureTestingModule({
      imports: [VentaComboCreate],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaComboCreate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  it('carga combos y clientes activos al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(combosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(contactosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(component.combos()).toEqual([combo]);
  });

  it('al elegir un combo, arma una sección de asignación por cada servicio y precarga el precio', async () => {
    await setup();
    await fixture.whenStable();

    await component.onComboChange('combo-1');

    expect(component.asignaciones().length).toBe(2);
    expect(component.asignaciones()[0].servicio.nombre).toBe('Netflix');
    expect(component.asignaciones()[0].requierePerfil).toBe(true);
    expect(component.asignaciones()[1].servicio.nombre).toBe('IPTV Básico');
    expect(component.asignaciones()[1].requierePerfil).toBe(false);
    expect(component.form.controls.precio.value).toBe(25);

    expect(cuentasApi.list).toHaveBeenCalledWith({ servicioId: 'srv-1', activo: true });
    expect(cuentasApi.list).toHaveBeenCalledWith({ servicioId: 'srv-2', activo: true });
    expect(component.asignaciones()[0].cuentas).toEqual([cuentaNetflix]);
    expect(component.asignaciones()[1].cuentas).toEqual([cuentaIptv]);
  });

  it('al elegir cuenta en una sección CON_PERFILES, carga solo los perfiles libres', async () => {
    await setup();
    await fixture.whenStable();
    await component.onComboChange('combo-1');

    await component.onAsignacionCuentaChange(0, 'cta-1');

    expect(perfilesApi.list).toHaveBeenCalledWith('cta-1', { activo: true });
    expect(component.asignaciones()[0].perfiles).toEqual([perfilLibre]);
  });

  it('al elegir cuenta en una sección SIN_PERFILES, no carga perfiles', async () => {
    await setup();
    await fixture.whenStable();
    await component.onComboChange('combo-1');

    await component.onAsignacionCuentaChange(1, 'cta-2');

    expect(perfilesApi.list).not.toHaveBeenCalled();
    expect(component.asignaciones()[1].cuentaId).toBe('cta-2');
  });

  it('rechaza guardar si falta elegir perfil en una sección que lo requiere', async () => {
    await setup();
    await fixture.whenStable();
    await component.onComboChange('combo-1');
    await component.onAsignacionCuentaChange(0, 'cta-1');
    await component.onAsignacionCuentaChange(1, 'cta-2');

    component.form.patchValue({
      clienteId: 'cli-1',
      comboId: 'combo-1',
      duracionMeses: 1,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 25,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(component.errorMessage()).toContain('Netflix');
    expect(component.errorMessage()).toContain('perfil');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('crea la venta de combo con las asignaciones armadas y navega al detalle', async () => {
    await setup();
    await fixture.whenStable();
    await component.onComboChange('combo-1');
    await component.onAsignacionCuentaChange(0, 'cta-1');
    component.onAsignacionPerfilChange(0, 'per-1');
    await component.onAsignacionCuentaChange(1, 'cta-2');

    component.form.patchValue({
      clienteId: 'cli-1',
      comboId: 'combo-1',
      duracionMeses: 1,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 25,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await component.submit();

    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clienteId: 'cli-1',
        comboId: 'combo-1',
        asignaciones: [
          { servicioId: 'srv-1', cuentaId: 'cta-1', perfilId: 'per-1' },
          { servicioId: 'srv-2', cuentaId: 'cta-2', perfilId: undefined },
        ],
      }),
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/combo-sales', 'vc-1']);
  });

  it('muestra cuál servicio/asignación falló cuando el backend responde 409 (rollback)', async () => {
    await setup();
    await fixture.whenStable();
    await component.onComboChange('combo-1');
    await component.onAsignacionCuentaChange(0, 'cta-1');
    component.onAsignacionPerfilChange(0, 'per-1');
    await component.onAsignacionCuentaChange(1, 'cta-2');

    component.form.patchValue({
      clienteId: 'cli-1',
      comboId: 'combo-1',
      duracionMeses: 1,
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 25,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: {
          message:
            'El servicio "IPTV Básico": esa cuenta ya tiene una venta activa (V-00042).',
        },
      }),
    );

    await component.submit();

    expect(component.errorMessage()).toBe(
      'El servicio "IPTV Básico": esa cuenta ya tiene una venta activa (V-00042).',
    );
  });
});
