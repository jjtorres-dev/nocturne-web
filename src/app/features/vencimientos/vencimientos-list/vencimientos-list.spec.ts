import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VencimientosList } from './vencimientos-list';
import { VentasApi } from '../../sales/ventas-api';
import { Moneda, VencimientoFiltro, type Venta } from '../../sales/venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';

describe('VencimientosList', () => {
  const servicio: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.SIN_PERFILES,
    duracionMeses: 1,
    pantallasMax: null,
    precioBase: 10,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51 999-999-999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const cuenta: CuentaListItem = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: null,
    clienteId: 'cli-1',
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
  const venta: Venta = {
    id: 'v-1',
    clienteId: 'cli-1',
    cuentaId: 'cta-1',
    perfilId: null,
    servicioId: 'srv-1',
    codigoVenta: 'V-00001',
    duracionMeses: 1,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-09-09',
    precio: 15,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 15,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VencimientosList>;
  let component: VencimientosList;
  let api: { list: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };

  async function setup(queryParams: Record<string, string> = {}) {
    api = { list: vi.fn().mockResolvedValue([venta]) };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = { list: vi.fn().mockResolvedValue([cuenta]) };
    perfilesApi = { list: vi.fn().mockResolvedValue([]) };

    await TestBed.configureTestingModule({
      imports: [VencimientosList],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(queryParams) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VencimientosList);
    component = fixture.componentInstance;
  }

  it('usa "vencida" como estado por defecto y pide diasAlerta=3', async () => {
    await setup();
    await fixture.whenStable();

    expect(component.estado).toBe(VencimientoFiltro.VENCIDA);
    expect(api.list).toHaveBeenCalledWith({
      vencimiento: VencimientoFiltro.VENCIDA,
      diasAlerta: 3,
    });
  });

  it('formatea el precio en soles (S/), no como decimal crudo', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('S/ 15.00');
  });

  it('toma el estado inicial de los query params (viniendo del Dashboard)', async () => {
    await setup({ estado: 'por_vencer' });
    await fixture.whenStable();

    expect(component.estado).toBe(VencimientoFiltro.POR_VENCER);
    expect(api.list).toHaveBeenCalledWith({
      vencimiento: VencimientoFiltro.POR_VENCER,
      diasAlerta: 3,
    });
  });

  it('ignora un estado inválido en los query params', async () => {
    await setup({ estado: 'no-existe' });
    await fixture.whenStable();

    expect(component.estado).toBe(VencimientoFiltro.VENCIDA);
  });

  it('cambiar el toggle refresca con el nuevo estado', async () => {
    await setup();
    await fixture.whenStable();

    component.estado = VencimientoFiltro.AL_DIA;
    await component.refresh();

    expect(api.list).toHaveBeenLastCalledWith({
      vencimiento: VencimientoFiltro.AL_DIA,
      diasAlerta: 3,
    });
  });

  it('cambiar diasAlerta refresca con el nuevo valor', async () => {
    await setup();
    await fixture.whenStable();

    component.diasAlerta = 7;
    await component.refresh();

    expect(api.list).toHaveBeenLastCalledWith({
      vencimiento: VencimientoFiltro.VENCIDA,
      diasAlerta: 7,
    });
  });

  it('muestra el botón de WhatsApp en vencida y por_vencer, no en al_dia', async () => {
    await setup();
    await fixture.whenStable();

    component.estado = VencimientoFiltro.VENCIDA;
    expect(component.mostrarWhatsapp()).toBe(true);

    component.estado = VencimientoFiltro.POR_VENCER;
    expect(component.mostrarWhatsapp()).toBe(true);

    component.estado = VencimientoFiltro.AL_DIA;
    expect(component.mostrarWhatsapp()).toBe(false);
  });

  it('el botón de WhatsApp no aparece en el DOM cuando el estado es al_dia', async () => {
    await setup({ estado: 'al_dia' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('button[mattooltip]'),
    ).toBeNull();
  });

  it('el botón de WhatsApp sí aparece en el DOM en vencida', async () => {
    await setup({ estado: 'vencida' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('button[mattooltip]'),
    ).not.toBeNull();
  });

  it('abrirWhatsapp abre la URL de wa.me con los datos correctos', async () => {
    await setup();
    await fixture.whenStable();
    component.estado = VencimientoFiltro.VENCIDA;

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    component.abrirWhatsapp(venta);

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target] = openSpy.mock.calls[0];
    expect(target).toBe('_blank');
    expect(url).toContain('https://wa.me/51999999999?text=');
    expect(decodeURIComponent(url as string)).toContain('Cliente Uno');
    expect(decodeURIComponent(url as string)).toContain('Netflix');

    openSpy.mockRestore();
  });
});
