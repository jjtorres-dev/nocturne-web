import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
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
import { Auth, UserRole } from '../../core/auth/auth';
import { UsuariosApi } from '../users/usuarios-api';
import type { Usuario } from '../users/usuario.model';

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
  const otroUsuario: Usuario = {
    id: 'user-2',
    email: 'otro@nocturne.dev',
    name: 'Otro Revendedor',
    role: UserRole.REVENDEDOR,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<Accounting>;
  let component: Accounting;
  let api: {
    summary: ReturnType<typeof vi.fn>;
    byService: ReturnType<typeof vi.fn>;
    byPaymentMethod: ReturnType<typeof vi.fn>;
    timeline: ReturnType<typeof vi.fn>;
  };
  let usuariosApi: { list: ReturnType<typeof vi.fn> };
  let router: Router;

  async function setup(
    role: UserRole = UserRole.REVENDEDOR,
    queryParams: Record<string, string> = {},
  ) {
    TestBed.resetTestingModule();
    api = {
      summary: vi.fn().mockResolvedValue(summary),
      byService: vi.fn().mockResolvedValue(byService),
      byPaymentMethod: vi.fn().mockResolvedValue(byPaymentMethod),
      timeline: vi.fn().mockResolvedValue(timeline),
    };
    usuariosApi = { list: vi.fn().mockResolvedValue([otroUsuario]) };

    await TestBed.configureTestingModule({
      imports: [Accounting],
      providers: [
        provideRouter([]),
        { provide: AccountingApi, useValue: api },
        { provide: UsuariosApi, useValue: usuariosApi },
        {
          provide: Auth,
          useValue: { currentUser: () => ({ id: 'admin-0', role }) },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(queryParams) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Accounting);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(async () => {
    await setup();
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

  it('un REVENDEDOR no ve el selector "Viendo"', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Viendo');
    expect(usuariosApi.list).not.toHaveBeenCalled();
  });

  it('un ADMIN ve el selector "Viendo" con "Mi negocio" por defecto y carga los usuarios de GET /api/users', async () => {
    await setup(UserRole.ADMIN);
    await fixture.whenStable();
    fixture.detectChanges();

    // Las opciones "Todo el negocio" y por usuario viven en el overlay de
    // mat-select (fuera del DOM del componente hasta que se abre el
    // panel) — se verifican a nivel de datos, no de texto renderizado.
    expect(usuariosApi.list).toHaveBeenCalled();
    expect(component.usuarios()).toEqual([otroUsuario]);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Viendo');
    expect(text).toContain('Mi negocio');
    expect(fixture.nativeElement.querySelector('mat-select')).not.toBeNull();
  });

  it('por defecto (mine) un ADMIN no manda viewOwnerId', async () => {
    await setup(UserRole.ADMIN);
    await fixture.whenStable();

    expect(api.summary).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: undefined }),
    );
  });

  it('cambiar la selección a "Todo el negocio" dispara los 4 reportes con viewOwnerId=all', async () => {
    await setup(UserRole.ADMIN);
    await fixture.whenStable();
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.viewOwnerId = 'all';
    component.onViewOwnerChange();
    await Promise.resolve();
    await Promise.resolve();

    expect(api.summary).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'all' }),
    );
    expect(api.byService).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'all' }),
    );
    expect(api.byPaymentMethod).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'all' }),
    );
    expect(api.timeline).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'all' }),
    );
  });

  it('cambiar la selección a un usuario específico dispara los 4 reportes con ese id', async () => {
    await setup(UserRole.ADMIN);
    await fixture.whenStable();
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.viewOwnerId = 'user-2';
    component.onViewOwnerChange();
    await Promise.resolve();
    await Promise.resolve();

    expect(api.summary).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'user-2' }),
    );
    expect(api.timeline).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'user-2' }),
    );
  });

  it('lee viewOwnerId inicial desde el query param de la URL (sobrevive un refresh)', async () => {
    await setup(UserRole.ADMIN, { viewOwnerId: 'user-2' });
    await fixture.whenStable();

    expect(component.viewOwnerId).toBe('user-2');
    expect(api.summary).toHaveBeenCalledWith(
      expect.objectContaining({ viewOwnerId: 'user-2' }),
    );
  });
});
