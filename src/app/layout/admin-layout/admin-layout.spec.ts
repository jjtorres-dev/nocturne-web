import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminLayout } from './admin-layout';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;

  async function setup(
    user: { id: string; email: string; name: string; role: string } | null,
  ) {
    localStorage.clear();
    if (user) {
      localStorage.setItem('nocturne_user', JSON.stringify(user));
    }

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
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
});
