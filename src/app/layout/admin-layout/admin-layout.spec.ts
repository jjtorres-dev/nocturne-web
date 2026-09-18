import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
});
