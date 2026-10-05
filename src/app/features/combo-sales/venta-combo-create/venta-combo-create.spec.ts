import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
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
import { Auth, UserRole } from '../../../core/auth/auth';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';

describe('VentaComboCreate', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicioConPerfiles: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
    owner,
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
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    owner,
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
    fechaCaida: null,
    perfilesCount: 1,
    owner,
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
  let dialog: { open: ReturnType<typeof vi.fn> };
  let router: Router;
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  async function setup(ultimoMetodoPagoGuardado: string | null = null) {
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
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = {
      get: vi.fn().mockReturnValue(ultimoMetodoPagoGuardado),
      set: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VentaComboCreate],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: MatDialog, useValue: dialog },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaComboCreate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  it('el método de pago usa el selector reusable: elegir una opción fija guarda su etiqueta', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-metodo-pago-select')).not.toBeNull();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(
      MatSelectHarness.with({ ancestor: 'app-metodo-pago-select' }),
    );
    await select.open();
    await select.clickOptions({ text: 'Zelle' });

    expect(component.form.controls.metodoPago.value).toBe('Zelle');
  });

  it('tasaCambio: oculta el campo en PEN, aparece con otra moneda, y vuelve a 1 al volver a PEN', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();

    component.form.controls.moneda.setValue(Moneda.USD);
    component.form.controls.tasaCambio.setValue(3.75);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).not.toBeNull();
    expect(component.form.controls.tasaCambio.value).toBe(3.75);

    component.form.controls.moneda.setValue(Moneda.PEN);
    fixture.detectChanges();

    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();
  });

  describe('autocompletado de "Vence"', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    function escribirEnInput(control: string, valor: string): void {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        `input[formcontrolname="${control}"], [formcontrolname="${control}"] input`,
      );
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    }

    it('arranca con fecha de inicio = hoy y vence = hoy + la duración (1 mes)', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 31, 10, 0));
      await setup();

      expect(component.form.controls.fechaInicio.value).toBe('2026-01-31');
      expect(component.form.controls.fechaFin.value).toBe('2026-02-28');
    });

    it('recalcula si cambia la fecha de inicio', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();

      escribirEnInput('fechaInicio', '31/03/2026');

      expect(component.form.controls.fechaFin.value).toBe('2026-04-30');
    });

    it('recalcula si cambia la duración, incluida la parte fraccionaria', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      escribirEnInput('fechaInicio', '31/01/2026');

      escribirEnInput('duracionMeses', '2.5');

      expect(component.form.controls.fechaFin.value).toBe('2026-04-15');
    });

    it('no pisa un vencimiento que el usuario ya editó a mano', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      escribirEnInput('fechaInicio', '15/01/2026');
      escribirEnInput('fechaFin', '01/03/2026');

      escribirEnInput('fechaInicio', '20/01/2026');
      escribirEnInput('duracionMeses', '3');

      expect(component.form.controls.fechaFin.value).toBe('2026-03-01');
    });

    it('no calcula nada mientras la duración esté vacía', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      escribirEnInput('fechaInicio', '15/01/2026');

      escribirEnInput('duracionMeses', '');

      expect(component.form.controls.fechaFin.value).toBe('2026-02-15');
    });
  });

  it('carga combos y solo clientes tipo CLIENTE_FINAL al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(combosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(contactosApi.list).toHaveBeenCalledWith({
      tipo: ContactType.CLIENTE_FINAL,
      activo: true,
    });
    expect(component.combos()).toEqual([combo]);
  });

  it('"+ Nuevo cliente" abre el modal chico y selecciona el contacto creado sin perder lo ya llenado', async () => {
    const nuevoCliente = {
      id: 'cli-nuevo',
      nombre: 'Cliente Nuevo',
      whatsapp: '+51988888888',
      tipo: ContactType.CLIENTE_FINAL,
      activo: true,
      owner,
      createdAt: '',
      updatedAt: '',
    };
    await setup();
    dialog.open.mockReturnValue({ afterClosed: () => of(nuevoCliente) });
    await fixture.whenStable();
    await component.onComboChange('combo-1');
    component.form.patchValue({ comboId: 'combo-1', precio: 30, metodoPago: 'Yape' });

    component.onClienteSelectionChange(component.NUEVO_CLIENTE);

    expect(dialog.open).toHaveBeenCalled();
    expect(component.clientes()).toEqual([cliente, nuevoCliente]);
    expect(component.form.controls.clienteId.value).toBe('cli-nuevo');
    // El resto del formulario (armado a partir del combo) sigue intacto.
    expect(component.form.controls.comboId.value).toBe('combo-1');
    expect(component.asignaciones().length).toBe(2);
    expect(component.form.controls.precio.value).toBe(30);
    expect(component.form.controls.metodoPago.value).toBe('Yape');
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

  it('arranca con el último método de pago guardado para este usuario', async () => {
    await setup('Plin');
    await fixture.whenStable();

    expect(ultimoMetodoPago.get).toHaveBeenCalledWith('admin-0');
    expect(component.form.controls.metodoPago.value).toBe('Plin');
  });

  it('al guardar con éxito, graba el método de pago usado', async () => {
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
      metodoPago: 'Plin',
    });
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await component.submit();

    expect(ultimoMetodoPago.set).toHaveBeenCalledWith('admin-0', 'Plin');
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

  it('si el backend rechaza la venta de combo, además del formulario abre un snackbar con el mismo mensaje', async () => {
    await setup();
    await fixture.whenStable();
    const openSpy = vi
      .spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open')
      .mockImplementation(() => ({}) as never);
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
    api.create.mockRejectedValue(new HttpErrorResponse({ status: 500 }));

    await component.submit();

    const mensaje = 'No se pudo crear la venta de combo.';
    expect(component.errorMessage()).toContain(mensaje);
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(mensaje),
      'Cerrar',
      expect.anything(),
    );
  });


  it('no ofrece las cuentas caídas en ningún servicio del combo', async () => {
    await setup();
    cuentasApi.list.mockImplementation(({ servicioId }: { servicioId: string }) =>
      Promise.resolve(
        servicioId === 'srv-1'
          ? [cuentaNetflix, { ...cuentaNetflix, id: 'cta-caida', fechaCaida: '2026-01-10' }]
          : [{ ...cuentaIptv, fechaCaida: '2026-01-10' }],
      ),
    );
    await fixture.whenStable();

    await component.onComboChange(combo.id);

    expect(component.asignaciones().map((s) => s.cuentas.map((c) => c.id))).toEqual([
      [cuentaNetflix.id],
      [],
    ]);
  });
});
