import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { VentaCreateDialog } from './venta-create-dialog';
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

describe('VentaCreateDialog', () => {
  const servicioConPerfiles: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 2,
    precioBase: 10,
    activo: true,
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
    perfilesCount: 0,
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
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  async function setup(servicios: Servicio[] = [servicioConPerfiles]) {
    api = { create: vi.fn().mockResolvedValue({ id: 'v-1', codigoVenta: 'V-00001' }) };
    serviciosApi = { list: vi.fn().mockResolvedValue(servicios) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = { list: vi.fn().mockResolvedValue([cuenta]) };
    perfilesApi = {
      list: vi.fn().mockResolvedValue([perfilLibre, perfilOcupado]),
    };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaCreateDialog],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaCreateDialog);
    component = fixture.componentInstance;
  }

  it('carga servicios y clientes activos (cualquier tipo) al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(serviciosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(contactosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(component.servicios()).toEqual([servicioConPerfiles]);
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

    expect(component.errorMessage()).toContain('ya tiene un cliente asignado');
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

    expect(component.errorMessage()).toContain('Selecciona un perfil');
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
});
