import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaCombosList } from './venta-combos-list';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('VentaCombosList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicio: Servicio = {
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
  const combo: Combo = {
    id: 'combo-1',
    nombre: 'Combo Netflix + Disney',
    descripcion: null,
    servicios: [servicio],
    precioCombo: 20,
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
  const ventaCombo: VentaCombo = {
    id: 'vc-1',
    clienteId: 'cli-1',
    comboId: 'combo-1',
    codigoVenta: 'C-00001',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    duracionMeses: 1,
    precio: 20,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 20,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const ventaComboInactiva: VentaCombo = { ...ventaCombo, id: 'vc-2', activo: false };

  let fixture: ComponentFixture<VentaCombosList>;
  let component: VentaCombosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
    renew: ReturnType<typeof vi.fn>;
  };
  let combosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let router: Router;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN, mobile = false) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([ventaCombo]),
      deactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaComboInactiva, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...ventaCombo, fechaFin: '2026-03-01' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [VentaCombosList],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: (snackBar = { open: vi.fn() }) },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaCombosList);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(async () => {
    await setup();
  });

  describe('estado mostrado (Vigente / Vencida / Finalizada)', () => {
    // Fecha fija: el estado depende de hoy. Solo se falsea Date.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 15, 12, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('vigente si vence hoy o después, vencida (en rojo) si ya pasó, finalizada si no está activa', async () => {
      api.list.mockResolvedValue([
        { ...ventaCombo, id: 'vc-vig', fechaFin: '2026-01-15' },
        { ...ventaCombo, id: 'vc-ven', fechaFin: '2026-01-14' },
        { ...ventaCombo, id: 'vc-fin', fechaFin: '2026-01-14', activo: false },
      ]);
      await fixture.whenStable();
      fixture.detectChanges();

      const chips = Array.from(
        fixture.nativeElement.querySelectorAll('app-estado-venta mat-chip') as NodeListOf<HTMLElement>,
      );
      expect(chips.map((c) => c.textContent!.trim())).toEqual(['Vigente', 'Vencida', 'Finalizada']);
      expect(chips[1].classList).toContain('chip-vencida');
      expect(chips[2].classList).toContain('chip-inactive');
    });
  });

  it('carga ventas de combo, combos y clientes al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({
      clienteId: undefined,
      comboId: undefined,
      activo: true,
    });
    expect(component.ventasCombo()).toEqual([ventaCombo]);
    expect(component.combos()).toEqual([combo]);
    expect(component.clientes()).toEqual([cliente]);
  });

  it('muestra código, cliente y combo en la tabla', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('C-00001');
    expect(text).toContain('Cliente Uno');
    expect(text).toContain('Combo Netflix + Disney');
  });

  it('navega a la página de creación al hacer click en Nueva venta de combo', async () => {
    await fixture.whenStable();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openCreate();

    expect(navigateSpy).toHaveBeenCalledWith(['/combo-sales/nueva']);
  });

  it('navega al detalle al abrir una venta de combo', async () => {
    await fixture.whenStable();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openDetail(ventaCombo);

    expect(navigateSpy).toHaveBeenCalledWith(['/combo-sales', 'vc-1']);
  });

  it('renueva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmRenew(ventaCombo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.renew).toHaveBeenCalledWith('vc-1');
  });

  it('desactiva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(ventaCombo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('vc-1');
  });

  it('reactiva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(ventaComboInactiva);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('vc-2');
  });

  it('muestra tal cual el 400 de cuenta caída al reactivar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const message =
      'La cuenta está caída: no se puede reactivar la venta de combo hasta que el proveedor reponga todas sus cuentas.';
    api.reactivate.mockRejectedValue(new HttpErrorResponse({ status: 400, error: { message } }));

    component.confirmReactivate(ventaComboInactiva);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(snackBar.open).toHaveBeenCalledWith(message, 'Cerrar', expect.anything());
  });

  it('muestra la columna Dueño para un ADMIN', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-column-dueno')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Admin');
  });

  it('no muestra la columna Dueño para un REVENDEDOR', async () => {
    await setup(UserRole.REVENDEDOR);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-column-dueno')).toBeNull();
  });

  it('mientras carga lo dice con una línea visible, sin indicador giratorio', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.nc-lista-cargando')?.textContent).toContain(
      'Cargando ventas de combo…',
    );
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('si la carga falla muestra el aviso con "Reintentar" en el lugar de la lista, y reintenta', async () => {
    api.list.mockRejectedValueOnce(new Error('network down'));
    await fixture.whenStable();
    fixture.detectChanges();

    const aviso: HTMLElement | null = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso?.textContent).toContain('No se pudieron cargar las ventas de combo.');
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();

    aviso?.querySelector('button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.list).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.nc-lista-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('td.mat-column-cliente')).not.toBeNull();
  });

  it('el código lleva al detalle y el combo muestra la pila de íconos de sus servicios', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      'td.mat-column-cliente a.codigo-enlace',
    );
    expect(link.textContent?.trim()).toBe('C-00001');
    expect(link.getAttribute('href')).toBe('/combo-sales/vc-1');
    expect(
      fixture.nativeElement.querySelectorAll('td.mat-column-combo app-service-icon-stack .item'),
    ).toHaveLength(combo.servicios.length);
  });

  it('una venta finalizada lleva ver y reactivar, y deja vacía la tercera casilla', async () => {
    api.list.mockResolvedValue([ventaCombo, ventaComboInactiva]);
    await fixture.whenStable();
    fixture.detectChanges();

    const filas: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('td.mat-column-acciones .nc-acciones'),
    );
    const iconos = (fila: HTMLElement) =>
      Array.from(fila.querySelectorAll('mat-icon')).map((i) => i.textContent?.trim());
    expect(iconos(filas[0])).toEqual(['visibility', 'autorenew', 'block']);
    expect(iconos(filas[1])).toEqual(['visibility', 'restart_alt']);
    expect(filas[0].children).toHaveLength(3);
    expect(filas[1].children).toHaveLength(3);
  });

  describe('vence: la fecha toma la tinta de su urgencia, como en Ventas', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 15, 12, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('bermellón si ya pasó, ámbar si vence en 3 días o menos, tinta si falta más o está finalizada', async () => {
      api.list.mockResolvedValue([
        { ...ventaCombo, id: 'a', fechaFin: '2026-01-10' },
        { ...ventaCombo, id: 'b', fechaFin: '2026-01-17' },
        { ...ventaCombo, id: 'c', fechaFin: '2026-03-01' },
        { ...ventaCombo, id: 'd', fechaFin: '2026-01-10', activo: false },
      ]);
      await fixture.whenStable();
      fixture.detectChanges();

      const clases = Array.from(
        fixture.nativeElement.querySelectorAll('td.mat-column-fechaFin .nc-celda-principal'),
      ).map((el) => (el as HTMLElement).className);
      expect(clases[0]).toContain('nc-estado-vencida');
      expect(clases[1]).toContain('nc-estado-por-vencer');
      expect(clases[2]).not.toContain('nc-estado');
      expect(clases[3]).not.toContain('nc-estado');
    });
  });

  describe('en celular', () => {
    it('muestra una tarjeta por venta de combo, con la estructura de las de Ventas', async () => {
      await setup(UserRole.ADMIN, true);
      api.list.mockResolvedValue([ventaCombo, ventaComboInactiva]);
      await fixture.whenStable();
      fixture.detectChanges();

      const tarjetas: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('mat-card.nc-card'),
      );
      expect(tarjetas).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      expect(tarjetas[0].querySelector('.nc-card-title')?.textContent).toContain('Cliente Uno');
      expect(tarjetas[0].querySelector('.nc-card-subtitle')?.textContent).toContain('C-00001');
      expect(tarjetas[0].querySelector('.nc-card-subtitle')?.textContent).toContain('Dueño: Admin');
      expect(tarjetas[0].textContent).toContain('Combo Netflix + Disney');
      const pie = (t: HTMLElement) =>
        Array.from(t.querySelectorAll('.nc-card-footer button .mdc-button__label > span')).map((s) => s.textContent?.trim());
      expect(pie(tarjetas[0])).toEqual(['Ver detalle', 'Renovar', 'Finalizar']);
      expect(pie(tarjetas[1])).toEqual(['Ver detalle', 'Reactivar']);
    });

    it('no dice el dueño a un REVENDEDOR', async () => {
      await setup(UserRole.REVENDEDOR, true);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.nc-card-subtitle')?.textContent).not.toContain(
        'Dueño',
      );
    });
  });
});
