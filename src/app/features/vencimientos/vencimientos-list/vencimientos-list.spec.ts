import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VencimientosList } from './vencimientos-list';
import { VentasApi } from '../../sales/ventas-api';
import { Moneda, VencimientoFiltro, type Venta } from '../../sales/venta.model';
import { VentaRenewDialog } from '../../../shared/venta-renew-dialog/venta-renew-dialog';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { VentaCombosApi } from '../../combo-sales/venta-combos-api';

describe('VencimientosList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicio: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.SIN_PERFILES,
    duracionMeses: 1,
    pantallasMax: null,
    precioBase: 10,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51 999-999-999',
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
    clienteId: 'cli-1',
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
    ventaComboId: null,
    owner,
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VencimientosList>;
  let component: VencimientosList;
  let api: { list: ReturnType<typeof vi.fn>; summary: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let ventaCombosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  async function setup(
    queryParams: Record<string, string> = {},
    { mobile = false }: { mobile?: boolean } = {},
  ) {
    api = {
      list: vi.fn().mockResolvedValue([venta]),
      summary: vi.fn().mockResolvedValue({ vencidas: 4, porVencer: 2, alDia: 9 }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = { list: vi.fn().mockResolvedValue([cuenta]) };
    perfilesApi = { list: vi.fn().mockResolvedValue([]) };
    ventaCombosApi = {
      list: vi.fn().mockResolvedValue([{ id: 'vc-1', codigoVenta: 'C-00001' }]),
    };
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VencimientosList],
      providers: [
        provideRouter([]),
        { provide: VentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: VentaCombosApi, useValue: ventaCombosApi },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
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

  it('las pestañas de estado son el resumen: cada una muestra su conteo, con los días de aviso', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.summary).toHaveBeenCalledWith(3);
    const pestanas = Array.from(
      fixture.nativeElement.querySelectorAll('mat-button-toggle') as NodeListOf<HTMLElement>,
    ).map((p) => [
      p.querySelector('.venc-resumen-label')?.textContent?.trim(),
      p.querySelector('.venc-resumen-conteo')?.textContent?.trim(),
    ]);
    expect(pestanas).toEqual([
      ['Vencidas', '4'],
      ['Por vencer', '2'],
      ['Al día', '9'],
    ]);
  });

  it('si el resumen falla, las pestañas siguen funcionando sin número', async () => {
    await setup();
    api.summary.mockRejectedValue(new Error('sin red'));
    await component.refresh();
    fixture.detectChanges();

    const pestanas = Array.from(
      fixture.nativeElement.querySelectorAll('mat-button-toggle') as NodeListOf<HTMLElement>,
    ).map((p) => p.textContent?.replace(/\s+/g, ' ').trim());
    expect(pestanas).toEqual(['Vencidas', 'Por vencer', 'Al día']);
  });

  it('el recordatorio por WhatsApp va con su nombre escrito y cada fila abre con su cuándo', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    const fila: HTMLElement = fixture.nativeElement.querySelector('tr[mat-row]');
    expect(fila.querySelector('.whatsapp-accion')?.textContent).toContain('WhatsApp');
    expect(fila.querySelector('td')?.querySelector('.nc-cuando')).not.toBeNull();
  });

  it('si la carga falla muestra el aviso con "Reintentar"', async () => {
    await setup();
    api.list.mockRejectedValue(new Error('sin red'));
    await fixture.whenStable();
    await component.refresh();
    fixture.detectChanges();

    const aviso: HTMLElement = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso.textContent).toContain('No se pudieron cargar los vencimientos.');
    expect(aviso.querySelector('button')?.textContent).toContain('Reintentar');
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

  it('openRenew abre VentaRenewDialog con la venta y, al cerrar con resultado, muestra snackbar y refresca', async () => {
    await setup();
    await fixture.whenStable();
    const renovada = { ...venta, fechaFin: '2026-10-01' };
    dialog.open.mockReturnValue({ afterClosed: () => of(renovada) });
    api.list.mockClear();

    component.openRenew(venta);
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).toHaveBeenCalledWith(
      VentaRenewDialog,
      expect.objectContaining({ data: { venta } }),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('01/10/2026'),
      'Cerrar',
      expect.anything(),
    );
    expect(api.list).toHaveBeenCalled();
  });

  it('openRenew: si el diálogo se cancela, no muestra snackbar', async () => {
    await setup();
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openRenew(venta);
    await Promise.resolve();

    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('una venta hija de combo NO tiene botón de Renovar: muestra el badge "Parte de combo" en su lugar', async () => {
    const ventaDeCombo = { ...venta, ventaComboId: 'vc-1' };
    await setup();
    api.list.mockResolvedValue([ventaDeCombo]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('button[mattooltip="Renovar"]'),
    ).toBeNull();
    const badge = fixture.nativeElement.querySelector('.combo-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toContain('Parte de combo C-00001');
    expect(badge.getAttribute('href')).toBe('/combo-sales/vc-1');
  });

  it('una venta que NO es de combo sí tiene botón de Renovar (en vencida/por_vencer)', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('button[mattooltip="Renovar"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.combo-badge')).toBeNull();
  });

  describe('en pantalla angosta (tarjetas)', () => {
    // Fecha fija: los badges de días dependen de "hoy".
    const HOY = new Date('2026-09-18T12:00:00');

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(HOY);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function cards(): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('mat-card.nc-card'));
    }

    async function render(
      queryParams: Record<string, string>,
      mobile: boolean,
      ventas: Venta[] = [venta],
    ) {
      await setup(queryParams, { mobile });
      api.list.mockResolvedValue(ventas);
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('renderiza tarjetas y no la tabla', async () => {
      await render({}, true);

      expect(cards().length).toBe(1);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('en desktop sigue saliendo la tabla y no las tarjetas', async () => {
      await render({}, false);

      expect(fixture.nativeElement.querySelector('.table-scroll table[mat-table]')).not.toBeNull();
      expect(cards().length).toBe(0);
    });

    it('muestra cliente, servicio, cuenta, fecha de fin y precio', async () => {
      await render({}, true);

      const card = cards()[0];
      expect(card.querySelector('.nc-card-title')!.textContent).toContain('Cliente Uno');
      const text = card.textContent!;
      expect(text).toContain('Netflix');
      expect(text).toContain('cuenta@correo.com');
      expect(text).toContain('09/09/2026');
      expect(text).toContain('S/ 15.00');
    });

    it('vencida: badge en rojo con los días vencidos', async () => {
      await render({ estado: 'vencida' }, true);

      const badge = cards()[0].querySelector('.dias-badge')!;
      expect(badge.textContent).toContain('Venció hace 9 días');
      expect(badge.classList).toContain('dias-vencida');
      expect(badge.classList).not.toContain('dias-por-vencer');
    });

    it('por vencer: badge en ámbar', async () => {
      await render({ estado: 'por_vencer' }, true, [{ ...venta, fechaFin: '2026-09-20' }]);

      const badge = cards()[0].querySelector('.dias-badge')!;
      expect(badge.textContent).toContain('Vence en 2 días');
      expect(badge.classList).toContain('dias-por-vencer');
      expect(badge.classList).not.toContain('dias-vencida');
    });

    it('al día: badge sin color de alerta', async () => {
      await render({ estado: 'al_dia' }, true, [{ ...venta, fechaFin: '2026-10-18' }]);

      const badge = cards()[0].querySelector('.dias-badge')!;
      expect(badge.classList).not.toContain('dias-vencida');
      expect(badge.classList).not.toContain('dias-por-vencer');
    });

    it.each(['vencida', 'por_vencer'])(
      'el botón de WhatsApp aparece en %s',
      async (estado) => {
        await render({ estado }, true);

        expect(cards()[0].querySelector('.whatsapp-button')).not.toBeNull();
      },
    );

    it('el botón de WhatsApp no aparece en al_dia (ni siquiera el pie)', async () => {
      await render({ estado: 'al_dia' }, true);

      expect(cards()[0].querySelector('.whatsapp-button')).toBeNull();
      expect(cards()[0].querySelector('.nc-card-footer')).toBeNull();
    });

    it('el botón de WhatsApp de la tarjeta abre wa.me con los datos de esa venta', async () => {
      await render({ estado: 'vencida' }, true);
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      (cards()[0].querySelector('.whatsapp-button') as HTMLButtonElement).click();

      expect(openSpy).toHaveBeenCalledTimes(1);
      const [url, target] = openSpy.mock.calls[0];
      expect(target).toBe('_blank');
      expect(url).toContain('https://wa.me/51999999999?text=');
      expect(decodeURIComponent(url as string)).toContain('Cliente Uno');
      expect(decodeURIComponent(url as string)).toContain('Netflix');

      openSpy.mockRestore();
    });

    it('una tarjeta por venta', async () => {
      await render({}, true, [venta, { ...venta, id: 'v-2' }, { ...venta, id: 'v-3' }]);

      expect(cards().length).toBe(3);
    });
  });


  describe('ventas con la cuenta caída', () => {
    const ventaCaida: Venta = { ...venta, id: 'v-caida', cuentaCaida: true };
    const ventaSana: Venta = { ...venta, id: 'v-sana', cuentaCaida: false };

    async function render(mobile: boolean): Promise<HTMLElement> {
      await setup({}, { mobile });
      api.list.mockResolvedValue([ventaCaida, ventaSana]);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('en la tabla: muestra el chip "Cuenta caída" y oculta WhatsApp y Renovar solo en esas ventas', async () => {
      const el = await render(false);
      const [filaCaida, filaSana] = Array.from(el.querySelectorAll('tr[mat-row]'));

      expect(filaCaida.querySelector('app-cuenta-caida-chip')?.textContent).toContain('Cuenta caída');
      expect(filaCaida.querySelector('button[mattooltip="Renovar"]')).toBeNull();
      expect(
        filaCaida.querySelector('button[mattooltip="Enviar recordatorio por WhatsApp"]'),
      ).toBeNull();

      expect(filaSana.querySelector('app-cuenta-caida-chip')).toBeNull();
      expect(filaSana.querySelector('button[mattooltip="Renovar"]')).not.toBeNull();
      expect(
        filaSana.querySelector('button[mattooltip="Enviar recordatorio por WhatsApp"]'),
      ).not.toBeNull();
    });

    it('en las tarjetas de celular: chip en vez de los botones de WhatsApp y Renovar', async () => {
      const el = await render(true);
      const [cardCaida, cardSana] = Array.from(el.querySelectorAll('mat-card.nc-card'));

      expect(cardCaida.querySelector('app-cuenta-caida-chip')?.textContent).toContain('Cuenta caída');
      expect(cardCaida.querySelector('.whatsapp-button')).toBeNull();
      expect(cardCaida.textContent).not.toContain('Renovar');

      expect(cardSana.querySelector('app-cuenta-caida-chip')).toBeNull();
      expect(cardSana.querySelector('.whatsapp-button')).not.toBeNull();
      expect(cardSana.textContent).toContain('Renovar');
    });

    it('abrirWhatsapp no abre nada para una venta con la cuenta caída', async () => {
      await render(false);
      const open = vi.spyOn(window, 'open').mockReturnValue(null);

      component.abrirWhatsapp(ventaCaida);
      expect(open).not.toHaveBeenCalled();

      component.abrirWhatsapp(ventaSana);
      expect(open).toHaveBeenCalledTimes(1);
      open.mockRestore();
    });
  });
});
