import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AdminLayout } from './admin-layout';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;

  async function setup(
    user: { id: string; email: string; name: string; role: string } | null,
    { mobile = false }: { mobile?: boolean } = {},
  ) {
    localStorage.clear();
    if (user) {
      localStorage.setItem('nocturne_user', JSON.stringify(user));
    }

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        // Comodín: los tests de click en el menú navegan a rutas reales.
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', async () => {
    await setup(null);
    expect(component).toBeTruthy();
  });

  it('un ADMIN ve el link "Usuarios" en el sidebar', async () => {
    await setup({
      id: 'admin-0',
      email: 'admin@nocturne.dev',
      name: 'Admin',
      role: 'admin',
    });
    fixture.detectChanges();

    const labels = component.navItems().map((item) => item.label);
    expect(labels).toContain('Usuarios');

    const links: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('a[mat-list-item]'),
    ).map((el) => (el as HTMLElement).textContent?.trim() ?? '');
    expect(links.some((text) => text.includes('Usuarios'))).toBe(true);
  });

  it('un REVENDEDOR NO ve el link "Usuarios" en el sidebar', async () => {
    await setup({
      id: 'user-1',
      email: 'revendedor@nocturne.dev',
      name: 'Revendedor',
      role: 'revendedor',
    });
    fixture.detectChanges();

    const labels = component.navItems().map((item) => item.label);
    expect(labels).not.toContain('Usuarios');

    const links: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('a[mat-list-item]'),
    ).map((el) => (el as HTMLElement).textContent?.trim() ?? '');
    expect(links.some((text) => text.includes('Usuarios'))).toBe(false);
  });

  describe('responsive', () => {
    const admin = {
      id: 'admin-0',
      email: 'admin@nocturne.dev',
      name: 'Admin',
      role: 'admin',
    };

    function sidenav(): HTMLElement {
      return fixture.nativeElement.querySelector('mat-sidenav');
    }

    function menuButton(): HTMLElement | null {
      return fixture.nativeElement.querySelector('.menu-button');
    }

    it('en desktop el sidebar es fijo (modo side, abierto) y no hay hamburguesa', async () => {
      await setup(admin);
      fixture.detectChanges();

      expect(sidenav().classList).toContain('mat-drawer-side');
      expect(sidenav().classList).toContain('mat-drawer-opened');
      expect(menuButton()).toBeNull();
    });

    it('en pantalla angosta el sidebar es "over", arranca cerrado y hay hamburguesa', async () => {
      await setup(admin, { mobile: true });
      fixture.detectChanges();

      expect(sidenav().classList).toContain('mat-drawer-over');
      expect(sidenav().classList).not.toContain('mat-drawer-opened');
      expect(menuButton()).not.toBeNull();
    });

    it('la hamburguesa abre el sidebar y elegir una opción lo cierra', async () => {
      await setup(admin, { mobile: true });
      fixture.detectChanges();

      menuButton()!.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(sidenav().classList).toContain('mat-drawer-opened');

      (
        fixture.nativeElement.querySelector('a[mat-list-item]') as HTMLElement
      ).click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(sidenav().classList).not.toContain('mat-drawer-opened');
    });

    it('el buscador global vive en el header, y expandirlo en móvil oculta la marca', async () => {
      await setup(admin, { mobile: true });
      fixture.detectChanges();

      const header: HTMLElement = fixture.nativeElement.querySelector('.header');
      expect(header.querySelector('app-global-search')).not.toBeNull();
      expect(header.querySelector('.header-brand')?.textContent).toContain('Nocturne');

      component.searchExpanded.set(true);
      fixture.detectChanges();

      expect(header.querySelector('.header-brand')).toBeNull();
    });

    it('en pantalla angosta hay barra inferior con los accesos de todos los días y "Menú"', async () => {
      await setup(admin, { mobile: true });
      fixture.detectChanges();

      const bar: HTMLElement = fixture.nativeElement.querySelector('.bottom-bar');
      const links = Array.from(bar.querySelectorAll<HTMLAnchorElement>('a.bottom-item'));
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        '/dashboard',
        '/sales',
        '/vencimientos',
        '/accounts',
      ]);
      expect(bar.querySelector('.menu-button')?.textContent).toContain('Menú');
    });

    it('en desktop no hay barra inferior y el header muestra la fecha de hoy', async () => {
      await setup(admin);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.bottom-bar')).toBeNull();
      expect(el.querySelector('.header-date')?.textContent?.trim()).not.toBe('');
    });

    it('el menú agrupa las secciones bajo sus títulos, con Inicio suelto arriba', async () => {
      await setup(admin);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const groups = Array.from(el.querySelectorAll('.nav-group')).map((g) =>
        g.textContent?.trim(),
      );
      expect(groups).toEqual(['Vender', 'Inventario', 'Dinero', 'Administración']);
      expect(el.querySelector('a[mat-list-item]')?.textContent).toContain('Inicio');
    });

    it('en desktop elegir una opción no cierra el sidebar', async () => {
      await setup(admin);
      fixture.detectChanges();

      (
        fixture.nativeElement.querySelector('a[mat-list-item]') as HTMLElement
      ).click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(sidenav().classList).toContain('mat-drawer-opened');
    });
  });

  describe('pie del sidebar (usuario y sesión)', () => {
    const admin = {
      id: 'admin-0',
      email: 'admin@nocturne.dev',
      name: 'Juan Torres',
      role: 'admin',
    };
    const revendedor = {
      id: 'user-1',
      email: 'rev@nocturne.dev',
      name: 'Rosa Quispe',
      role: 'revendedor',
    };

    function userCard(): HTMLButtonElement {
      return fixture.nativeElement.querySelector('.sidenav-footer .user-card');
    }

    function menuPanel(): HTMLElement | null {
      return TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('.mat-mdc-menu-panel');
    }

    async function settle() {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    async function openMenu() {
      userCard().click();
      await settle();
    }

    function menuItem(label: string): HTMLElement {
      const items = Array.from(
        menuPanel()!.querySelectorAll<HTMLElement>('[mat-menu-item]'),
      );
      const item = items.find((el) => el.textContent?.includes(label));
      expect(item, `opción "${label}"`).toBeDefined();
      return item!;
    }

    it('el usuario está en el pie del sidebar, debajo de los links, y no en el header', async () => {
      await setup(admin);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const nav = el.querySelector('mat-sidenav mat-nav-list')!;
      const footer = el.querySelector('mat-sidenav .sidenav-footer')!;

      expect(footer).not.toBeNull();
      // DOCUMENT_POSITION_FOLLOWING: el pie viene después de la navegación.
      expect(nav.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(el.querySelector('.header')!.textContent).not.toContain('Juan Torres');
      expect(el.querySelector('.header button[aria-label="Cerrar sesión"]')).toBeNull();
    });

    it('la tarjeta muestra avatar con iniciales, nombre y rol (Administrador)', async () => {
      await setup(admin);
      fixture.detectChanges();

      const card = userCard();
      expect(card.querySelector('app-avatar-inicial')?.textContent?.trim()).toBe('JT');
      expect(card.querySelector('.user-name')?.textContent?.trim()).toBe('Juan Torres');
      expect(card.querySelector('.user-role')?.textContent?.trim()).toBe('Administrador');
    });

    it('la tarjeta muestra el rol "Revendedor" para un REVENDEDOR', async () => {
      await setup(revendedor);
      fixture.detectChanges();

      expect(userCard().querySelector('.user-role')?.textContent?.trim()).toBe('Revendedor');
    });

    it('los links de navegación no incluyen Configuración', async () => {
      await setup(admin);
      fixture.detectChanges();

      expect(component.navItems().map((item) => item.label)).not.toContain('Configuración');
      expect(
        fixture.nativeElement.querySelector('a[mat-list-item][href="/configuracion"]'),
      ).toBeNull();
    });

    it('el menú está cerrado al inicio, abre al hacer click y muestra Configuración y Cerrar sesión', async () => {
      await setup(admin);
      fixture.detectChanges();
      expect(menuPanel()).toBeNull();
      expect(userCard().getAttribute('aria-expanded')).toBe('false');

      await openMenu();

      expect(menuPanel()).not.toBeNull();
      expect(userCard().getAttribute('aria-expanded')).toBe('true');
      const items = Array.from(
        menuPanel()!.querySelectorAll('[mat-menu-item] .mat-mdc-menu-item-text'),
      ).map((el) => el.textContent?.trim());
      expect(items).toEqual([
        'Configuración',
        'Claro',
        'Oscuro',
        'Según el dispositivo',
        'Cerrar sesión',
      ]);
    });

    it('el tema arranca en "Claro" y elegir "Oscuro" lo aplica, lo guarda y deja el menú abierto', async () => {
      await setup(admin);
      fixture.detectChanges();
      await openMenu();
      expect(menuItem('Claro').getAttribute('role')).toBe('menuitemradio');
      expect(menuItem('Claro').getAttribute('aria-checked')).toBe('true');
      expect(menuItem('Oscuro').getAttribute('aria-checked')).toBe('false');

      menuItem('Oscuro').click();
      await settle();

      expect(menuItem('Oscuro').getAttribute('aria-checked')).toBe('true');
      expect(menuItem('Claro').getAttribute('aria-checked')).toBe('false');
      expect(document.documentElement.dataset['theme']).toBe('dark');
      expect(localStorage.getItem('nocturne_theme')).toBe('dark');
      expect(userCard().getAttribute('aria-expanded')).toBe('true');

      menuItem('Claro').click();
      await settle();
      expect(document.documentElement.dataset['theme']).toBe('light');
    });

    it('el menú se cierra con Escape', async () => {
      await setup(admin);
      fixture.detectChanges();
      await openMenu();

      // El CDK detecta Escape por `keyCode`, no por `key`.
      menuPanel()!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
      );
      await settle();

      expect(userCard().getAttribute('aria-expanded')).toBe('false');
    });

    it('el menú se cierra al hacer click fuera (backdrop)', async () => {
      await setup(admin);
      fixture.detectChanges();
      await openMenu();

      TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector<HTMLElement>('.cdk-overlay-backdrop')!
        .click();
      await settle();

      expect(userCard().getAttribute('aria-expanded')).toBe('false');
    });

    it('"Configuración" navega a /configuracion y cierra el menú', async () => {
      await setup(admin);
      fixture.detectChanges();
      await openMenu();

      menuItem('Configuración').click();
      await settle();

      expect(TestBed.inject(Router).url).toBe('/configuracion');
      expect(userCard().getAttribute('aria-expanded')).toBe('false');
    });

    it('"Cerrar sesión" revoca el refresh token, limpia la sesión y manda a /login', async () => {
      await setup(admin);
      localStorage.setItem('nocturne_refresh_token', 'refresh-1');
      localStorage.setItem('nocturne_access_token', 'access-1');
      fixture.detectChanges();
      await openMenu();
      const http = TestBed.inject(HttpTestingController);

      menuItem('Cerrar sesión').click();
      const req = http.expectOne(`${environment.apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-1' });
      req.flush(null);
      await settle();

      expect(localStorage.getItem('nocturne_refresh_token')).toBeNull();
      expect(localStorage.getItem('nocturne_access_token')).toBeNull();
      expect(localStorage.getItem('nocturne_user')).toBeNull();
      // Auth.logout() navega sin await: se espera a que el router termine.
      await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/login'));
      http.verify();
    });

    it('en pantalla angosta el pie vive dentro del drawer y elegir Configuración lo cierra', async () => {
      await setup(admin, { mobile: true });
      fixture.detectChanges();
      const sidenav: HTMLElement = fixture.nativeElement.querySelector('mat-sidenav');

      (fixture.nativeElement.querySelector('.menu-button') as HTMLElement).click();
      await settle();
      expect(sidenav.classList).toContain('mat-drawer-opened');
      expect(sidenav.querySelector('.sidenav-footer .user-card')).not.toBeNull();

      await openMenu();
      menuItem('Configuración').click();
      await settle();

      expect(sidenav.classList).not.toContain('mat-drawer-opened');
    });
  });
});
