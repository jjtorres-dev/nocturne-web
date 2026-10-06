import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactosList } from './contactos-list';
import { ContactosApi } from '../contactos-api';
import { ContactType, type Contacto } from '../contacto.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('ContactosList', () => {
  const contacto: Contacto = {
    id: '1',
    nombre: 'Juan',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };
  const contactoInactivo: Contacto = { ...contacto, id: '2', activo: false };

  let fixture: ComponentFixture<ContactosList>;
  let component: ContactosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
  };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  async function setup(
    role: UserRole = UserRole.ADMIN,
    { mobile = false }: { mobile?: boolean } = {},
  ) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([contacto]),
      deactivate: vi.fn().mockResolvedValue({ ...contacto, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...contactoInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactosList],
      providers: [
        { provide: ContactosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactosList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga los contactos al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ tipo: undefined, activo: true });
    expect(component.contactos()).toEqual([contacto]);
  });

  it('desactiva un contacto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(contacto);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('1');
  });

  it('reactiva un contacto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(contactoInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('2');
  });

  it('no reactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmReactivate(contactoInactivo);
    await Promise.resolve();

    expect(api.reactivate).not.toHaveBeenCalled();
  });

  it('muestra el botón Reactivar en filas inactivas y Desactivar en las activas', async () => {
    api.list.mockResolvedValue([contacto, contactoInactivo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const iconNames: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('td.mat-column-acciones mat-icon'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(iconNames).toEqual([
      'chat', 'content_copy', 'edit', 'block',
      'chat', 'content_copy', 'edit', 'restart_alt',
    ]);
  });

  it('muestra la columna Dueño para un ADMIN', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-column-dueno')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Admin');
  });

  it('no muestra la columna Dueño para un REVENDEDOR', async () => {
    await setup(UserRole.REVENDEDOR);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.mat-column-dueno')).toBeNull();
  });

  it('muestra el avatar con la inicial del contacto junto al nombre', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cell: HTMLElement = fixture.nativeElement.querySelector('td.mat-column-nombre');
    expect(cell.querySelector('app-avatar-inicial')?.textContent?.trim()).toBe('J');
    expect(cell.textContent).toContain('Juan');
  });

  it('muestra el estado vacío cuando no hay resultados', async () => {
    api.list.mockResolvedValue([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const empty: HTMLElement | null = fixture.nativeElement.querySelector('app-empty-state');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No hay contactos con estos filtros.');
    expect(empty?.textContent).toContain('Prueba cambiando o quitando los filtros.');
  });

  it('no muestra el estado vacío cuando hay resultados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('mientras carga lo dice con una línea visible, sin indicador giratorio', () => {
    fixture.detectChanges();

    const carga: HTMLElement | null = fixture.nativeElement.querySelector('.nc-lista-cargando');
    expect(carga?.textContent).toContain('Cargando contactos…');
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('si la carga falla muestra el aviso con "Reintentar" en el lugar de la lista, y reintenta', async () => {
    api.list.mockRejectedValueOnce(new Error('network down'));
    await fixture.whenStable();
    fixture.detectChanges();

    const aviso: HTMLElement | null = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso?.textContent).toContain('No se pudieron cargar los contactos.');
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();

    aviso?.querySelector('button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.list).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.nc-lista-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('td.mat-column-nombre')?.textContent).toContain('Juan');
  });

  it('el enlace "WhatsApp" de la fila abre el chat del contacto en otra pestaña', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.whatsapp-accion');
    expect(link.getAttribute('href')).toBe('https://wa.me/51999999999');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('copiarNumero: copia el número tal como está guardado y lo avisa', async () => {
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarNumero(contacto);

    expect(writeText).toHaveBeenCalledWith('+51999999999');
    expect(snackBar.open).toHaveBeenCalledWith('Número copiado.', 'Cerrar', { duration: 3000 });
  });

  it('copiarNumero: avisa si el navegador no deja copiar', async () => {
    await fixture.whenStable();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    await component.copiarNumero(contacto);

    expect(snackBar.open).toHaveBeenCalledWith('No se pudo copiar el número.', 'Cerrar', {
      duration: 4000,
    });
  });

  describe('en celular', () => {
    it('muestra una tarjeta por contacto con el número como botón de copiar y el chat en el pie', async () => {
      await setup(UserRole.ADMIN, { mobile: true });
      api.list.mockResolvedValue([contacto, contactoInactivo]);
      await fixture.whenStable();
      fixture.detectChanges();

      const tarjetas: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('mat-card.nc-card'),
      );
      expect(tarjetas).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();

      const [activa, inactiva] = tarjetas;
      expect(activa.querySelector('.nc-card-title')?.textContent).toContain('Juan');
      expect(activa.querySelector('.nc-card-subtitle')?.textContent).toContain('Dueño: Admin');
      expect(activa.querySelector('.numero-copiar')?.textContent).toContain('+51999999999');
      expect(activa.querySelector('a.whatsapp-button')?.getAttribute('href')).toBe(
        'https://wa.me/51999999999',
      );
      expect(activa.querySelector('.nc-card-footer')?.textContent).toContain('Desactivar');
      expect(inactiva.querySelector('.nc-card-footer')?.textContent).toContain('Reactivar');
    });

    it('tocar el número lo copia', async () => {
      await setup(UserRole.ADMIN, { mobile: true });
      await fixture.whenStable();
      fixture.detectChanges();
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      fixture.nativeElement.querySelector('.numero-copiar').click();

      expect(writeText).toHaveBeenCalledWith('+51999999999');
    });

    it('no dice el dueño a un REVENDEDOR', async () => {
      await setup(UserRole.REVENDEDOR, { mobile: true });
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.nc-card-subtitle')?.textContent).not.toContain(
        'Dueño',
      );
    });
  });
});
