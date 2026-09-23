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
import type { CuentaPorRenovar } from '../accounts/cuenta.model';
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
    { servicioId: 's1', nombre: 'Netflix', usaPerfiles: true, libres: 3 },
    { servicioId: 's2', nombre: 'Crunchyroll', usaPerfiles: false, libres: 0 },
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

  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let ventasApi: { summary: ReturnType<typeof vi.fn> };
  let dashboardApi: { inventario: ReturnType<typeof vi.fn> };
  let cuentasApi: { porRenovar: ReturnType<typeof vi.fn> };
  let accountingApi: { summary: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    ventasApi = { summary: vi.fn().mockResolvedValue(summary) };
    dashboardApi = { inventario: vi.fn().mockResolvedValue(inventario) };
    cuentasApi = { porRenovar: vi.fn().mockResolvedValue(porRenovar) };
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
});
