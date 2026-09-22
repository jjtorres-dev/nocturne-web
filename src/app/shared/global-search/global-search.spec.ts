import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, of } from 'rxjs';
import { GlobalSearch } from './global-search';
import { SearchApi } from './search-api';
import type { SearchResponse } from './search-result.model';
import { Auth, UserRole } from '../../core/auth/auth';

describe('GlobalSearch', () => {
  const emptyResponse: SearchResponse = {
    contactos: [],
    cuentas: [],
    servicios: [],
    combos: [],
    ventas: [],
    ventasCombo: [],
    gastos: [],
  };

  let fixture: ComponentFixture<GlobalSearch>;
  let component: GlobalSearch;
  let api: { search: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN, mobile = false) {
    TestBed.resetTestingModule();
    api = { search: vi.fn().mockReturnValue(of(emptyResponse)) };
    router = { navigate: vi.fn() };
    const auth = {
      currentUser: vi.fn().mockReturnValue({ id: 'u1', name: 'Juan', role }),
    };

    await TestBed.configureTestingModule({
      imports: [GlobalSearch],
      providers: [
        { provide: SearchApi, useValue: api },
        { provide: Router, useValue: router },
        { provide: Auth, useValue: auth },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    await setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no llama al backend con menos de 2 caracteres, aunque pase el debounce', async () => {
    component.onQueryInput('a');
    await vi.advanceTimersByTimeAsync(400);

    expect(api.search).not.toHaveBeenCalled();
  });

  it('espera 300ms de inactividad antes de llamar al backend (debounce)', async () => {
    component.onQueryInput('ne');
    await vi.advanceTimersByTimeAsync(200);
    expect(api.search).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(150);
    expect(api.search).toHaveBeenCalledWith('ne');
  });

  it('cancela la búsqueda anterior si el usuario sigue escribiendo (switchMap)', async () => {
    const subject1 = new Subject<SearchResponse>();
    const subject2 = new Subject<SearchResponse>();
    api.search.mockReturnValueOnce(subject1).mockReturnValueOnce(subject2);

    component.onQueryInput('ne');
    await vi.advanceTimersByTimeAsync(300);
    expect(api.search).toHaveBeenNthCalledWith(1, 'ne');

    component.onQueryInput('net');
    await vi.advanceTimersByTimeAsync(300);
    expect(api.search).toHaveBeenNthCalledWith(2, 'net');
    expect(api.search).toHaveBeenCalledTimes(2);

    // Llega primero la respuesta del término actual, y DESPUÉS la del
    // término viejo (subject1): switchMap ya se desuscribió de subject1 al
    // pedir "net", así que esa emisión tardía se ignora.
    subject2.next({
      ...emptyResponse,
      servicios: [{ id: 's-net', label: 'Netflix' }],
    });
    subject1.next({
      ...emptyResponse,
      servicios: [{ id: 's-ne-stale', label: 'Viejo' }],
    });

    const ids = component.flatItems().map((item) => item.id);
    expect(ids).toContain('s-net');
    expect(ids).not.toContain('s-ne-stale');
  });

  it('agrupa los resultados por categoría y no muestra los grupos vacíos', async () => {
    api.search.mockReturnValue(
      of({
        ...emptyResponse,
        contactos: [{ id: 'c1', label: 'Juan' }],
        cuentas: [{ id: 'a1', label: 'a@b.com — Netflix' }],
      }),
    );

    component.onFocus();
    component.onQueryInput('ju');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(component.groups().map((g) => g.category.key)).toEqual([
      'contactos',
      'cuentas',
    ]);
    expect(component.groups().every((g) => g.items.length > 0)).toBe(true);
    expect(
      fixture.nativeElement.querySelectorAll('.result-group').length,
    ).toBe(2);
  });

  it('muestra el estado vacío cuando la búsqueda no encuentra nada', async () => {
    component.onFocus();
    component.onQueryInput('nada');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('Cuentas navega a /accounts/:id, limpia el buscador y cierra el panel', async () => {
    api.search.mockReturnValue(
      of({ ...emptyResponse, cuentas: [{ id: 'acc-1', label: 'a@b.com — Netflix' }] }),
    );
    component.onFocus();
    component.onQueryInput('netflix');
    await vi.advanceTimersByTimeAsync(300);

    component.select(component.flatItems()[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/accounts', 'acc-1']);
    expect(component.query()).toBe('');
    expect(component.open()).toBe(false);
  });

  it('Ventas Combo navega a /combo-sales/:id', async () => {
    api.search.mockReturnValue(
      of({ ...emptyResponse, ventasCombo: [{ id: 'vc-1', label: 'C-00001' }] }),
    );
    component.onFocus();
    component.onQueryInput('c-000');
    await vi.advanceTimersByTimeAsync(300);

    component.select(component.flatItems()[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/combo-sales', 'vc-1']);
  });

  it('el resto de categorías navega a su página de lista', async () => {
    api.search.mockReturnValue(
      of({ ...emptyResponse, contactos: [{ id: 'ct-1', label: 'Juan' }] }),
    );
    component.onFocus();
    component.onQueryInput('juan');
    await vi.advanceTimersByTimeAsync(300);

    component.select(component.flatItems()[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/contacts']);
  });

  it('muestra el nombre del dueño (campo ownerName aparte) para un ADMIN', async () => {
    api.search.mockReturnValue(
      of({ ...emptyResponse, contactos: [{ id: 'ct-1', label: 'Juan', ownerName: 'Revendedor A' }] }),
    );
    component.onFocus();
    component.onQueryInput('juan');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    const ownerEl: HTMLElement | null =
      fixture.nativeElement.querySelector('.result-owner');
    expect(ownerEl?.textContent?.trim()).toBe('Revendedor A');
    expect(fixture.nativeElement.querySelector('.result-main')?.textContent?.trim()).toBe(
      'Juan',
    );
  });

  it('NO muestra el nombre del dueño para un REVENDEDOR, aunque ownerName venga presente', async () => {
    await setup(UserRole.REVENDEDOR);
    api.search.mockReturnValue(
      of({ ...emptyResponse, contactos: [{ id: 'ct-1', label: 'Juan', ownerName: 'Revendedor A' }] }),
    );
    component.onFocus();
    component.onQueryInput('juan');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.result-owner')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Juan');
  });

  it('un salto de línea dentro de la descripción de un Gasto no se confunde con el dueño', async () => {
    api.search.mockReturnValue(
      of({
        ...emptyResponse,
        gastos: [
          {
            id: 'g1',
            label: 'Hosting mensual\nrenovación automática',
          },
        ],
      }),
    );
    component.onFocus();
    component.onQueryInput('hosting');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();

    // Sin ownerName, el label completo (con su '\n' original) va entero en
    // result-main — no hay parseo de label que pueda cortarlo a la mitad.
    expect(
      fixture.nativeElement.querySelector('.result-main')?.textContent,
    ).toBe('Hosting mensual\nrenovación automática');
    expect(fixture.nativeElement.querySelector('.result-owner')).toBeNull();
  });

  it('flechas mueven el ítem activo, Enter navega al activo y Escape cierra el panel', async () => {
    api.search.mockReturnValue(
      of({
        ...emptyResponse,
        contactos: [
          { id: 'c1', label: 'Uno' },
          { id: 'c2', label: 'Dos' },
        ],
      }),
    );
    component.onFocus();
    component.onQueryInput('term');
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(0);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(1);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.activeIndex()).toBe(0);

    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.open()).toBe(false);

    component.onFocus();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(router.navigate).toHaveBeenCalledWith(['/contacts']);
  });

  it('cierra el panel al hacer click afuera del componente', async () => {
    api.search.mockReturnValue(
      of({ ...emptyResponse, contactos: [{ id: 'c1', label: 'Uno' }] }),
    );
    component.onFocus();
    component.onQueryInput('uno');
    await vi.advanceTimersByTimeAsync(300);
    expect(component.open()).toBe(true);

    const outside = document.createElement('div');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: outside });
    component.onDocumentClick(event);

    expect(component.open()).toBe(false);
  });

  it('en móvil, expandir el buscador y luego cerrarlo limpia el término', async () => {
    await setup(UserRole.ADMIN, true);
    expect(component.mobileExpanded()).toBe(false);

    component.expandMobile();
    expect(component.mobileExpanded()).toBe(true);

    component.onQueryInput('algo');
    component.collapseMobile();

    expect(component.mobileExpanded()).toBe(false);
    expect(component.query()).toBe('');
  });
});
