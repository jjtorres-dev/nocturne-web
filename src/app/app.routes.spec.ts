import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from './app.routes';

describe('rutas: /configuracion', () => {
  async function setup(user: { name: string; role: string } | null) {
    localStorage.clear();
    if (user) {
      localStorage.setItem(
        'nocturne_user',
        JSON.stringify({ id: 'u-1', email: 'u@nocturne.dev', ...user }),
      );
    }
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: false, breakpoints: {} }),
            isMatched: () => false,
          },
        },
      ],
    }).compileComponents();
    return RouterTestingHarness.create();
  }

  afterEach(() => localStorage.clear());

  it.each([
    ['admin', 'Administrador'],
    ['revendedor', 'Revendedor'],
  ])('carga para un usuario logueado con rol %s', async (role, label) => {
    const harness = await setup({ name: 'Usuario Demo', role });

    await harness.navigateByUrl('/configuracion');

    expect(TestBed.inject(Router).url).toBe('/configuracion');
    // Se renderiza dentro del layout, con el pie mostrando el rol correcto.
    const layout: HTMLElement = harness.fixture.nativeElement;
    expect(
      layout.querySelector('mat-sidenav-content app-configuracion h1')?.textContent?.trim(),
    ).toBe('Configuración');
    expect(layout.querySelector('.sidenav-footer .user-role')?.textContent?.trim()).toBe(label);
  });

  it('está bajo el layout protegido por authGuard: sin sesión redirige a /login', async () => {
    await setup(null);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/configuracion');

    expect(router.url).toBe('/login');
  });

  it('cuelga del padre protegido por authGuard y no tiene restricción de rol propia', () => {
    const layoutRoute = routes.find((r) => r.path === '' && r.children);
    const configRoute = layoutRoute?.children?.find((r) => r.path === 'configuracion');

    expect(layoutRoute?.canActivate?.length).toBe(1);
    expect(configRoute).toBeDefined();
    expect(configRoute?.canActivate).toBeUndefined();
    expect(configRoute?.data).toBeUndefined();
  });
});
