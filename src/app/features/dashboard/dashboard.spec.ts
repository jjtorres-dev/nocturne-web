import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Dashboard } from './dashboard';
import { VentasApi } from '../sales/ventas-api';
import { VencimientoFiltro, type SalesSummary } from '../sales/venta.model';

describe('Dashboard', () => {
  const summary: SalesSummary = { vencidas: 2, porVencer: 5, alDia: 30 };

  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let ventasApi: { summary: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    ventasApi = { summary: vi.fn().mockResolvedValue(summary) };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: VentasApi, useValue: ventasApi },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

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
    expect(text).toContain('Vencidas');
    expect(text).toContain('Por vencer');
    expect(text).toContain('Al día');
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
});
