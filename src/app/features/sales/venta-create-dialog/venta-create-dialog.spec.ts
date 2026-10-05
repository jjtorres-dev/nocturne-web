import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { VentaCreateDialog } from './venta-create-dialog';
import { hoyIso } from '../../../shared/fecha.util';
import { VentasApi } from '../ventas-api';
import { Moneda } from '../venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';
import { Auth, UserRole } from '../../../core/auth/auth';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';

describe('VentaCreateDialog', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicioConPerfiles: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 2,
    precioBase: 10,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const servicioSinPerfiles: Servicio = {
    ...servicioConPerfiles,
    id: 'srv-2',
    tipo: ServiceType.SIN_PERFILES,
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
  const cuenta: CuentaListItem = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: null,
    clienteId: null,
    correo: 'cuenta@correo.com',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-01',
    costo: 10,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    fechaCaida: null,
    perfilesCount: 0,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const cuentaOcupada: CuentaListItem = {
    ...cuenta,
    id: 'cta-2',
    servicioId: 'srv-2',
    clienteId: 'cli-9',
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
  const perfilOcupado: Perfil = {
    ...perfilLibre,
    id: 'per-2',
    nombre: 'Perfil ocupado',
    clienteId: 'cli-9',
  };

  let fixture: ComponentFixture<VentaCreateDialog>;
  let component: VentaCreateDialog;
  let api: { create: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let dialog: MatDialog;
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  async function setup(
    servicios: Servicio[] = [servicioConPerfiles],
    ultimoMetodoPagoGuardado: string | null = null,
  ) {
    api = { create: vi.fn().mockResolvedValue({ id: 'v-1', codigoVenta: 'V-00001' }) };
    serviciosApi = { list: vi.fn().mockResolvedValue(servicios) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = { list: vi.fn().mockResolvedValue([cuenta]) };
    perfilesApi = {
      list: vi.fn().mockResolvedValue([perfilLibre, perfilOcupado]),
    };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = {
      get: vi.fn().mockReturnValue(ultimoMetodoPagoGuardado),
      set: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VentaCreateDialog],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaCreateDialog);
    component = fixture.componentInstance;
    // MatDialogModule reprovee MatDialog a nivel del propio componente
    // (VentaCreateDialog se abre a sí mismo como diálogo), así que un
    // `{ provide: MatDialog, useValue: ... }` en el TestBed no lo alcanza
    // a pisar — se espía la instancia real que efectivamente usa el
    // componente, obtenida del injector de la propia fixture.
    dialog = fixture.debugElement.injector.get(MatDialog);
  }

  // Timeout propio (15 s en vez de 5 s): es el primer test del archivo, así
  // que paga el arranque en frío (TestBed + primer render del diálogo, ~300
  // ms) y además abre un overlay real con MatSelectHarness (~200 ms en
  // caliente). Solo tarda ~450 ms, pero con la suite completa corriendo en
  // paralelo la contención de CPU llegó a pasar los 5 s una vez. Medido: con
  // y sin animaciones de Material da lo mismo, y en main tardaba igual — no
  // hay timers reales ni render de más que optimizar.
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
  }, 15_000);

  it('carga servicios y solo clientes tipo CLIENTE_FINAL al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(serviciosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(contactosApi.list).toHaveBeenCalledWith({
      tipo: ContactType.CLIENTE_FINAL,
      activo: true,
    });
    expect(component.servicios()).toEqual([servicioConPerfiles]);
    expect(component.clientes()).toEqual([cliente]);
  });

  it('al elegir cuenta, autocompleta fechaFin con la duración del servicio de esa cuenta', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');

    component.form.patchValue({ fechaInicio: '2026-01-15' });
    await component.onCuentaChange('cta-1');

    expect(component.form.controls.fechaFin.value).toBe('2026-02-15');
  });

  it('recalcula fechaFin si cambia fechaInicio con la cuenta ya elegida', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');

    component.form.patchValue({ fechaInicio: '2026-03-01' });

    expect(component.form.controls.fechaFin.value).toBe('2026-04-01');
  });

  it('el autocompletado de fechaFin no impide editarla a mano', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    component.form.patchValue({ fechaInicio: '2026-01-15' });
    await component.onCuentaChange('cta-1');

    component.form.patchValue({ fechaFin: '2026-05-01' });

    expect(component.form.controls.fechaFin.value).toBe('2026-05-01');
  });

  it('no pisa un fechaFin editado a mano al cambiar la cuenta o la fecha de inicio', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    component.form.patchValue({ fechaInicio: '2026-01-15' });
    await component.onCuentaChange('cta-1');
    fixture.detectChanges();

    const escribirEnInput = (control: string, valor: string): void => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        `input[formcontrolname="${control}"]`,
      );
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    };
    escribirEnInput('fechaFin', '2026-05-01');

    escribirEnInput('fechaInicio', '2026-03-01');
    await component.onCuentaChange('cta-1');

    expect(component.form.controls.fechaFin.value).toBe('2026-05-01');
  });

  it('fechaInicio arranca en el día de hoy por defecto', async () => {
    await setup();
    await fixture.whenStable();

    expect(component.form.controls.fechaInicio.value).toBe(hoyIso());
  });

  it('arranca con el último método de pago guardado para este usuario', async () => {
    await setup([servicioConPerfiles], 'Plin');
    await fixture.whenStable();

    expect(ultimoMetodoPago.get).toHaveBeenCalledWith('admin-0');
    expect(component.form.controls.metodoPago.value).toBe('Plin');
  });

  it('al guardar con éxito, graba el método de pago usado', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');
    component.form.patchValue({
      servicioId: 'srv-1',
      cuentaId: 'cta-1',
      perfilId: 'per-1',
      clienteId: 'cli-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 10,
      moneda: Moneda.PEN,
      metodoPago: 'Plin',
    });

    await component.submit();

    expect(ultimoMetodoPago.set).toHaveBeenCalledWith('admin-0', 'Plin');
  });

  it('al elegir cuenta, autocompleta precio con el precioBase del servicio de esa cuenta', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');

    await component.onCuentaChange('cta-1');

    expect(component.form.controls.precio.value).toBe(servicioConPerfiles.precioBase);
  });

  it('el autocompletado de precio no pisa un valor que el usuario ya editó a mano', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');

    // Simula edición real del usuario: `dirty` es lo que dispara el guard,
    // y setValue() por sí solo (sin markAsDirty) no lo marca — por eso el
    // guard puede confiar en `dirty` para distinguir "lo tocó el usuario"
    // de "lo puso el autocompletado".
    component.form.controls.precio.setValue(999);
    component.form.controls.precio.markAsDirty();

    await component.onCuentaChange('cta-1');

    expect(component.form.controls.precio.value).toBe(999);
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
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(nuevoCliente) } as never);
    await fixture.whenStable();

    component.form.patchValue({
      servicioId: 'srv-1',
      fechaInicio: '2026-01-01',
      precio: 25,
      metodoPago: 'Yape',
    });

    component.onClienteSelectionChange(component.NUEVO_CLIENTE);

    expect(openSpy).toHaveBeenCalled();
    expect(component.clientes()).toEqual([cliente, nuevoCliente]);
    expect(component.form.controls.clienteId.value).toBe('cli-nuevo');
    // El resto del formulario sigue intacto.
    expect(component.form.controls.servicioId.value).toBe('srv-1');
    expect(component.form.controls.fechaInicio.value).toBe('2026-01-01');
    expect(component.form.controls.precio.value).toBe(25);
    expect(component.form.controls.metodoPago.value).toBe('Yape');
  });

  it('si se cancela "+ Nuevo cliente", vuelve al cliente que estaba antes', async () => {
    await setup();
    vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as never);
    await fixture.whenStable();

    component.onClienteSelectionChange('cli-1');
    component.onClienteSelectionChange(component.NUEVO_CLIENTE);

    expect(component.form.controls.clienteId.value).toBe('cli-1');
    expect(component.clientes()).toEqual([cliente]);
  });

  it('al elegir un servicio, carga las cuentas activas de ese servicio', async () => {
    await setup();
    await fixture.whenStable();

    await component.onServicioChange('srv-1');

    expect(cuentasApi.list).toHaveBeenCalledWith({
      servicioId: 'srv-1',
      activo: true,
    });
    expect(component.cuentas()).toEqual([cuenta]);
    expect(component.requierePerfil()).toBe(true);
  });

  it('si el servicio es CON_PERFILES, al elegir cuenta carga solo los perfiles libres', async () => {
    await setup();
    await fixture.whenStable();

    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');

    expect(perfilesApi.list).toHaveBeenCalledWith('cta-1', { activo: true });
    expect(component.perfiles()).toEqual([perfilLibre]);
  });

  it('si el servicio es SIN_PERFILES, no requiere perfil ni carga perfiles', async () => {
    await setup([servicioSinPerfiles]);
    await fixture.whenStable();

    await component.onServicioChange('srv-2');
    await component.onCuentaChange('cta-2');

    expect(component.requierePerfil()).toBe(false);
    expect(perfilesApi.list).not.toHaveBeenCalled();
  });

  it('rechaza crear si la cuenta SIN_PERFILES ya tiene cliente asignado', async () => {
    await setup([servicioSinPerfiles]);
    cuentasApi.list.mockResolvedValue([cuentaOcupada]);
    await fixture.whenStable();

    await component.onServicioChange('srv-2');
    await component.onCuentaChange('cta-2');

    component.form.patchValue({
      servicioId: 'srv-2',
      cuentaId: 'cta-2',
      clienteId: 'cli-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 10,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(component.errorMessage()).toContain('ya se vendió completa');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('rechaza crear si el servicio requiere perfil y no se eligió ninguno', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');

    component.form.patchValue({
      servicioId: 'srv-1',
      cuentaId: 'cta-1',
      clienteId: 'cli-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 10,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(component.errorMessage()).toContain('Elige qué perfil');
    expect(api.create).not.toHaveBeenCalled();
  });

  it('crea la venta con el perfil elegido', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');

    component.form.patchValue({
      servicioId: 'srv-1',
      cuentaId: 'cta-1',
      perfilId: 'per-1',
      clienteId: 'cli-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 10,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({ perfilId: 'per-1', cuentaId: 'cta-1' }),
    );
    expect(dialogRef.close).toHaveBeenCalledWith({
      id: 'v-1',
      codigoVenta: 'V-00001',
    });
  });

  it('muestra el mensaje del backend si el backend responde 409', async () => {
    await setup();
    await fixture.whenStable();
    await component.onServicioChange('srv-1');
    await component.onCuentaChange('cta-1');

    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Ese perfil ya tiene una venta activa (V-00001).' },
      }),
    );

    component.form.patchValue({
      servicioId: 'srv-1',
      cuentaId: 'cta-1',
      perfilId: 'per-1',
      clienteId: 'cli-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 10,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(component.errorMessage()).toBe(
      'Ese perfil ya tiene una venta activa (V-00001).',
    );
  });

  describe('snackbar de error al fallar el submit', () => {
    let openSpy: ReturnType<typeof vi.spyOn>;

    async function prepararFormulario() {
      await setup();
      await fixture.whenStable();
      await component.onServicioChange('srv-1');
      await component.onCuentaChange('cta-1');
      openSpy = vi
        .spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open')
        .mockImplementation(() => ({}) as never);
      component.form.patchValue({
        servicioId: 'srv-1',
        cuentaId: 'cta-1',
        perfilId: 'per-1',
        clienteId: 'cli-1',
        fechaInicio: '2026-01-01',
        fechaFin: '2026-02-01',
        precio: 10,
        moneda: Moneda.PEN,
        metodoPago: 'Yape',
      });
    }

    it('con el 409 de exclusividad: mismo mensaje en el formulario y en el snackbar', async () => {
      await prepararFormulario();
      api.create.mockRejectedValue(
        new HttpErrorResponse({
          status: 409,
          error: { message: 'Ese perfil ya tiene una venta activa (V-00001).' },
        }),
      );

      await component.submit();

      expect(component.errorMessage()).toBe('Ese perfil ya tiene una venta activa (V-00001).');
      expect(openSpy).toHaveBeenCalledWith(
        'Ese perfil ya tiene una venta activa (V-00001).',
        'Cerrar',
        expect.anything(),
      );
    });

    it('con cualquier otro error del backend (no solo 409) también abre el snackbar', async () => {
      await prepararFormulario();
      api.create.mockRejectedValue(new HttpErrorResponse({ status: 500 }));

      await component.submit();

      expect(component.errorMessage()).toBe('No se pudo crear la venta. Inténtalo de nuevo.');
      expect(openSpy).toHaveBeenCalledWith(
        'No se pudo crear la venta. Inténtalo de nuevo.',
        'Cerrar',
        expect.anything(),
      );
    });

    it('con una validación del cliente (sin llamar al backend) también abre el snackbar', async () => {
      await prepararFormulario();
      component.form.patchValue({ perfilId: '' });

      await component.submit();

      expect(api.create).not.toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('Elige qué perfil'),
        'Cerrar',
        expect.anything(),
      );
    });

    it('un submit exitoso no abre ningún snackbar de error', async () => {
      await prepararFormulario();

      await component.submit();

      expect(dialogRef.close).toHaveBeenCalled();
      expect(openSpy).not.toHaveBeenCalled();
    });
  });


  it('no ofrece las cuentas caídas del servicio', async () => {
    await setup();
    cuentasApi.list.mockResolvedValue([
      cuenta,
      { ...cuenta, id: 'cta-caida', correo: 'caida@correo.com', fechaCaida: '2026-01-10' },
    ]);
    await fixture.whenStable();

    await component.onServicioChange('srv-1');

    expect(component.cuentas().map((c) => c.id)).toEqual(['cta-1']);
  });
});
