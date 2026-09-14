import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Accounting } from './accounting';
import { AccountingApi } from './accounting-api';
import {
  TimelineGroupBy,
  type AccountingSummary,
  type PaymentMethodBreakdown,
  type ServiceBreakdown,
  type TimelinePoint,
} from './accounting.model';

describe('Accounting', () => {
  const summary: AccountingSummary = {
    ingresos: 500,
    inversion: 200,
    gastos: 50,
    ganancia: 250,
  };
  const byService: ServiceBreakdown[] = [
    { servicioId: 's1', nombre: 'Netflix', inversion: 100, ingresos: 300, ganancia: 200 },
  ];
  const byPaymentMethod: PaymentMethodBreakdown[] = [
    { metodoPago: 'Yape', ingresos: 300, gastos: 20, neto: 280 },
  ];
  const timeline: TimelinePoint[] = [
    { periodo: '2026-01-01', ingresos: 100, gastos: 10, ganancia: 90 },
  ];

  let fixture: ComponentFixture<Accounting>;
  let component: Accounting;
  let api: {
    summary: ReturnType<typeof vi.fn>;
    byService: ReturnType<typeof vi.fn>;
    byPaymentMethod: ReturnType<typeof vi.fn>;
    timeline: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    api = {
      summary: vi.fn().mockResolvedValue(summary),
      byService: vi.fn().mockResolvedValue(byService),
      byPaymentMethod: vi.fn().mockResolvedValue(byPaymentMethod),
      timeline: vi.fn().mockResolvedValue(timeline),
    };

    await TestBed.configureTestingModule({
      imports: [Accounting],
      providers: [
        { provide: AccountingApi, useValue: api },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Accounting);
    component = fixture.componentInstance;
  });

  it('carga los 4 reportes al iniciar sin desde/hasta', async () => {
    await fixture.whenStable();

    expect(api.summary).toHaveBeenCalledWith({
      desde: undefined,
      hasta: undefined,
    });
    expect(api.byService).toHaveBeenCalledWith({
      desde: undefined,
      hasta: undefined,
    });
    expect(api.byPaymentMethod).toHaveBeenCalledWith({
      desde: undefined,
      hasta: undefined,
    });
    expect(api.timeline).toHaveBeenCalledWith({
      desde: undefined,
      hasta: undefined,
      groupBy: TimelineGroupBy.DAY,
    });
  });

  it('manda desde/hasta cuando se completan los date pickers y se aplica', async () => {
    await fixture.whenStable();
    component.desde = '2026-01-01';
    component.hasta = '2026-01-31';

    await component.refresh();

    expect(api.summary).toHaveBeenCalledWith({
      desde: '2026-01-01',
      hasta: '2026-01-31',
    });
  });

  it('muestra los valores del resumen en las tarjetas', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Ingresos');
    expect(text).toContain('Inversión');
    expect(text).toContain('Gastos');
    expect(text).toContain('Ganancia');
    expect(text).toContain('500.00');
    expect(text).toContain('200.00');
    expect(text).toContain('50.00');
    expect(text).toContain('250.00');
    // Formateado como moneda (soles), no como decimales crudos.
    expect(text).toContain('S/ 500.00');
  });

  it('muestra la fila de by-service con sus valores', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Netflix');
    expect(text).toContain('300.00');
    expect(text).toContain('100.00');
  });

  it('muestra la fila de by-payment-method con sus valores', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Yape');
    expect(text).toContain('280.00');
  });

  it('carga el timeline con groupBy=day por defecto y lo actualiza al cambiarlo', async () => {
    await fixture.whenStable();
    expect(api.timeline).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: TimelineGroupBy.DAY }),
    );

    component.groupBy = TimelineGroupBy.MONTH;
    await component.refresh();

    expect(api.timeline).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: TimelineGroupBy.MONTH }),
    );
  });

  it('no revienta al destruirse sin haber creado el gráfico (sin contexto 2D en jsdom)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
