import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Dashboard } from './dashboard';
import { VentasApi } from '../sales/ventas-api';
import { VencimientoFiltro, type SalesSummary } from '../sales/venta.model';
import { provideRouter } from '@angular/router';
import { DashboardApi } from './dashboard-api';
import type { InventarioItem } from './inventario.model';
import { CuentasApi } from '../accounts/cuentas-api';
import type { CuentaCaida, CuentaPorRenovar } from '../accounts/cuenta.model';
import { CuentaRenovarProveedorDialog } from '../accounts/cuenta-renovar-proveedor-dialog/cuenta-renovar-proveedor-dialog';
import { AccountingApi } from '../accounting/accounting-api';
import type { AccountingSummary } from '../accounting/accounting.model';

describe('Dashboard', () => {
  const summary: SalesSummary = { vencidas: 2, porVencer: 5, alDia: 30 };

  const ganancia: AccountingSummary = {
    ingresos: 500,
    inversion: 120,
    gastos: 30,
    ganancia: 350,
  };
  const inventario: InventarioItem[] = [
    { servicioId: 's1', nombre: 'Netflix', usaPerfiles: true, libres: 3, total: 5 },
    { servicioId: 's2', nombre: 'Crunchyroll', usaPerfiles: false, libres: 0, total: 2 },
  ];
  const porRenovar: CuentaPorRenovar[] = [
    {
      id: 'cta-vencida',
      correo: 'vencida@proveedor.com',
      servicioId: 's1',
      servicioNombre: 'Netflix',
      fechaFin: '2026-09-19',
      diasRestantes: -3,
      clientesActivos: 4,
    },
    {
      id: 'cta-pronto',
      correo: 'pronto@proveedor.com',
      servicioId: 's2',
      servicioNombre: 'Crunchyroll',
      fechaFin: '2026-09-24',
      diasRestantes: 2,
      clientesActivos: 1,
    },
  ];

  const caidas: CuentaCaida[] = [
    {
      id: 'cta-caida-1',
      correo: 'caida1@proveedor.com',
      servicioId: 's1',
      servicioNombre: 'Netflix',
      fechaCaida: '2026-09-17',
      diasCaida: 6,
      clientesAfectados: 3,
    },
    {
      id: 'cta-caida-2',
      correo: 'caida2@proveedor.com',
      servicioId: 's2',
      servicioNombre: 'Crunchyroll',
      fechaCaida: '2026-09-22',
      diasCaida: 1,
      clientesAfectados: 1,
    },
  ];

  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let ventasApi: { summary: ReturnType<typeof vi.fn> };
  let dashboardApi: { inventario: ReturnType<typeof vi.fn> };
  let cuentasApi: {
    porRenovar: ReturnType<typeof vi.fn>;
    caidas: ReturnType<typeof vi.fn>;
  };
  let accountingApi: { summary: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    ventasApi = { summary: vi.fn().mockResolvedValue(summary) };
    dashboardApi = { inventario: vi.fn().mockResolvedValue(inventario) };
    cuentasApi = {
      porRenovar: vi.fn().mockResolvedValue(porRenovar),
      caidas: vi.fn().mockResolvedValue(caidas),
    };
    accountingApi = { summary: vi.fn().mockResolvedValue(ganancia) };
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        // Router real (no mock): las tarjetas nuevas usan routerLink.
        provideRouter([]),
        { provide: VentasApi, useValue: ventasApi },
        { provide: DashboardApi, useValue: dashboardApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: AccountingApi, useValue: accountingApi },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  async function render(): Promise<HTMLElement> {
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('carga el resumen de ventas al iniciar', async () => {
    await fixture.whenStable();

    expect(ventasApi.summary).toHaveBeenCalled();
    expect(component.summary()).toEqual(summary);
  });

  it('las tarjetas de estado no llevan ancho proporcional a su conteo', async () => {
    const el = await render();

    const cards = Array.from(el.querySelectorAll<HTMLElement>('.senal-bloque'));
    expect(cards).toHaveLength(4);
    expect(cards.every((c) => c.style.flexGrow === '')).toBe(true);
  });

  it('muestra los tres conteos en las tarjetas', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2');
    expect(text).toContain('5');
    expect(text).toContain('30');
    expect(text).toContain('Ventas vencidas');
    expect(text).toContain('Ventas por vencer');
    expect(text).toContain('Ventas al día');
  });

  it('navega a /vencimientos con el estado correspondiente al hacer click', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cards: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.summary-card'),
    );
    cards[0].click();

    expect(router.navigate).toHaveBeenCalledWith(['/vencimientos'], {
      queryParams: { estado: VencimientoFiltro.VENCIDA },
    });
  });

  it('navega con el estado por_vencer desde la segunda tarjeta', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cards: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.summary-card'),
    );
    cards[1].click();

    expect(router.navigate).toHaveBeenCalledWith(['/vencimientos'], {
      queryParams: { estado: VencimientoFiltro.POR_VENCER },
    });
  });

  describe('Ganancia del mes', () => {
    it('pide /accounting/summary sin filtros (mes actual, "lo mío") y muestra la ganancia', async () => {
      const el = await render();

      expect(accountingApi.summary).toHaveBeenCalledWith();
      const card = el.querySelector('.ganancia-card')!;
      expect(card.textContent).toContain('S/ 350.00');
      expect(card.querySelector('.ganancia-value.negativa')).toBeNull();
    });

    it('la leyenda tiene un renglón por tramo de la franja: proveedores, otros gastos y ganancia', async () => {
      const card = (await render()).querySelector('.ganancia-card')!;

      const filas = Array.from(card.querySelectorAll('.ganancia-detalle div')).map((d) => [
        d.querySelector('dt')?.textContent?.trim(),
        d.querySelector('dd')?.textContent?.trim(),
      ]);
      expect(filas).toEqual([
        ['Cobrado', 'S/ 500.00'],
        ['Pagado a proveedores', 'S/ 120.00'],
        ['Otros gastos', 'S/ 30.00'],
        ['Ganancia', 'S/ 350.00'],
      ]);
      expect(card.querySelectorAll('.ganancia-detalle .muestra')).toHaveLength(3);
    });

    it('en negativo la marca como tal', async () => {
      accountingApi.summary.mockResolvedValue({ ...ganancia, ganancia: -20 });
      const el = await render();

      expect(el.querySelector('.ganancia-card .ganancia-value.negativa')).not.toBeNull();
    });
  });

  describe('Disponible para vender', () => {
    it('lista cada servicio con su ícono y libres, y atenúa los que tienen 0', async () => {
      const el = await render();

      const items = Array.from(el.querySelectorAll<HTMLElement>('.inventario-item'));
      expect(items).toHaveLength(2);
      expect(items[0].querySelector('app-service-icon')).not.toBeNull();
      expect(items[0].textContent).toContain('Netflix');
      expect(items[0].textContent).toContain('3');
      expect(items[0].textContent).toContain('perfiles');
      expect(items[0].classList).not.toContain('agotado');
      expect(items[1].textContent).toContain('cuentas');
      expect(items[1].classList).toContain('agotado');
    });

    it('dibuja una butaca por perfil o cuenta: ocupadas y libres', async () => {
      const el = await render();

      const items = Array.from(el.querySelectorAll<HTMLElement>('.inventario-item'));
      expect(items[0].textContent).toContain('Libres: 3 de 5 perfiles');
      expect(items[0].querySelectorAll('.butaca')).toHaveLength(5);
      expect(items[0].querySelectorAll('.butaca.ocupada')).toHaveLength(2);
      expect(items[1].textContent).toContain('Libres: 0 de 2 cuentas');
      expect(items[1].querySelectorAll('.butaca.ocupada')).toHaveLength(2);
    });

    it('separa lo que se vende por perfil de lo que se vende por cuenta completa', async () => {
      const el = await render();

      const titulos = Array.from(el.querySelectorAll('.inventario-card .salas-titulo')).map(
        (t) => t.textContent?.trim(),
      );
      expect(titulos).toEqual(['Se venden por perfil', 'Se venden por cuenta completa']);
    });

    it('sin `total` (backend anterior) solo dibuja las libres', async () => {
      dashboardApi.inventario.mockResolvedValue([
        { servicioId: 's1', nombre: 'Netflix', usaPerfiles: true, libres: 3 },
      ]);
      const item = (await render()).querySelector<HTMLElement>('.inventario-item')!;

      expect(item.textContent).toContain('Libres: 3 perfiles');
      expect(item.querySelectorAll('.butaca')).toHaveLength(3);
      expect(item.querySelectorAll('.butaca.ocupada')).toHaveLength(0);
    });

    it('si falla, muestra el error solo en esa tarjeta', async () => {
      dashboardApi.inventario.mockRejectedValue(new Error('boom'));
      const el = await render();

      expect(el.querySelector('.inventario-card')!.textContent).toContain(
        'No se pudo cargar el inventario.',
      );
      expect(el.querySelector('.ganancia-card')!.textContent).toContain('S/ 350.00');
      expect(el.querySelectorAll('.renovar-item')).toHaveLength(2);
    });
  });

  describe('Cuentas por renovar con el proveedor', () => {
    it('muestra servicio, correo, días restantes y clientes activos, con link al detalle de la cuenta', async () => {
      const el = await render();

      expect(cuentasApi.porRenovar).toHaveBeenCalledWith();
      const items = Array.from(el.querySelectorAll<HTMLAnchorElement>('.renovar-item'));
      expect(items).toHaveLength(2);

      expect(items[0].getAttribute('href')).toBe('/accounts/cta-vencida');
      expect(items[0].textContent).toContain('Netflix');
      expect(items[0].textContent).toContain('vencida@proveedor.com');
      expect(items[0].textContent).toContain('Venció hace 3 días');
      expect(items[0].textContent).toContain('4 clientes la usan');
      expect(items[0].classList).toContain('vencida');

      expect(items[1].getAttribute('href')).toBe('/accounts/cta-pronto');
      expect(items[1].textContent).toContain('Vence en 2 días');
      expect(items[1].textContent).toContain('1 cliente la usa');
      expect(items[1].classList).not.toContain('vencida');
    });

    it('sin cuentas por renovar muestra un estado vacío', async () => {
      cuentasApi.porRenovar.mockResolvedValue([]);
      const el = await render();

      expect(el.querySelector('.renovar-card')!.textContent).toContain(
        'Ninguna cuenta vence en los próximos 7 días.',
      );
    });

    function botonesRenovar(el: HTMLElement): HTMLButtonElement[] {
      return Array.from(el.querySelectorAll<HTMLButtonElement>('.renovar-accion'));
    }

    it('cada fila tiene "Renovar con el proveedor", fuera del link a la cuenta', async () => {
      const el = await render();

      const botones = botonesRenovar(el);
      expect(botones).toHaveLength(2);
      expect(botones[0].textContent).toContain('Renovar con el proveedor');
      expect(botones[0].closest('a')).toBeNull();
    });

    it('abre el diálogo con esa cuenta; al renovar, la saca de la lista y recarga la ganancia del mes', async () => {
      const el = await render();
      dialog.open.mockReturnValue({
        afterClosed: () => of({ id: 'cta-vencida', fechaFin: '2026-10-19' }),
      });
      cuentasApi.porRenovar.mockResolvedValue([porRenovar[1]]);

      botonesRenovar(el)[0].click();
      await render();

      expect(dialog.open).toHaveBeenCalledWith(CuentaRenovarProveedorDialog, {
        data: {
          cuentaId: 'cta-vencida',
          correo: 'vencida@proveedor.com',
          servicioNombre: 'Netflix',
          fechaFin: '2026-09-19',
        },
      });
      expect(snackBar.open).toHaveBeenCalledWith(
        'Cuenta renovada. Ahora vence con el proveedor el 19/10/2026.',
        'Cerrar',
        expect.anything(),
      );
      expect(cuentasApi.porRenovar).toHaveBeenCalledTimes(2);
      expect(accountingApi.summary).toHaveBeenCalledTimes(2);
      const items = Array.from(el.querySelectorAll('.renovar-item'));
      expect(items.map((a) => a.getAttribute('href'))).toEqual(['/accounts/cta-pronto']);
    });

    it('si se cancela el diálogo, no recarga nada', async () => {
      const el = await render();
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

      botonesRenovar(el)[1].click();

      expect(cuentasApi.porRenovar).toHaveBeenCalledTimes(1);
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('diasLabel cubre hoy, mañana, ayer y plurales', () => {
      expect(component.diasLabel(0)).toBe('Vence hoy');
      expect(component.diasLabel(1)).toBe('Vence mañana');
      expect(component.diasLabel(5)).toBe('Vence en 5 días');
      expect(component.diasLabel(-1)).toBe('Venció ayer');
      expect(component.diasLabel(-4)).toBe('Venció hace 4 días');
    });
  });


  describe('tarjeta "Cuentas caídas"', () => {
    // Los días se cuentan contra la fecha local de hoy (22/09 de noche: en
    // UTC ya es 23/09), no con el `diasCaida` del backend.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 8, 22, 21, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('cada fila dice cuántos clientes están sin servicio y lleva al detalle de su cuenta', async () => {
      const el = await render();
      const card = el.querySelector('.caidas-card')!;

      expect(cuentasApi.caidas).toHaveBeenCalled();
      expect(card.textContent).toContain('Cuentas caídas');
      // El conteo va una sola vez, en la fila de cada cuenta (no en el título).
      expect(card.querySelector('.nc-panel-title')?.textContent).not.toContain('sin servicio');

      const filas = Array.from(card.querySelectorAll<HTMLAnchorElement>('a.caida-item'));
      expect(filas.map((a) => a.getAttribute('href'))).toEqual([
        '/accounts/cta-caida-1',
        '/accounts/cta-caida-2',
      ]);
      expect(filas[0].textContent).toContain('caida1@proveedor.com');
      expect(filas[0].textContent).toContain('Caída hace 5 días');
      expect(filas[0].textContent).toContain('3 clientes sin servicio');
      expect(filas[1].textContent).toContain('Se cayó hoy');
      expect(filas[1].textContent).toContain('1 cliente sin servicio');
    });

    it('sin cuentas caídas lo dice', async () => {
      cuentasApi.caidas.mockResolvedValue([]);
      const card = (await render()).querySelector('.caidas-card')!;

      expect(card.textContent).toContain('No tienes cuentas caídas.');
    });

    it('si falla la carga muestra su propio error sin tapar las demás tarjetas', async () => {
      cuentasApi.caidas.mockRejectedValue(new Error('500'));
      const el = await render();

      expect(el.querySelector('.caidas-card')!.textContent).toContain(
        'No se pudieron cargar las cuentas caídas.',
      );
      expect(el.querySelector('.renovar-card')!.textContent).toContain('vencida@proveedor.com');
    });
  });
});
