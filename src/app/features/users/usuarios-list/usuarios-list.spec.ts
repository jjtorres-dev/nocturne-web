import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosList } from './usuarios-list';
import { UsuariosApi } from '../usuarios-api';
import { Auth } from '../../../core/auth/auth';
import { UserRole, type Usuario } from '../usuario.model';

describe('UsuariosList', () => {
  const admin: Usuario = {
    id: 'admin-0',
    email: 'admin@nocturne.dev',
    name: 'Admin',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
  const revendedor: Usuario = {
    id: 'user-1',
    email: 'revendedor@nocturne.dev',
    name: 'Revendedor',
    role: UserRole.REVENDEDOR,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };
  const revendedorInactivo: Usuario = {
    ...revendedor,
    id: 'user-2',
    isActive: false,
  };

  let fixture: ComponentFixture<UsuariosList>;
  let component: UsuariosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
  };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(loggedInUserId = 'admin-0', mobile = false) {
    api = {
      list: vi.fn().mockResolvedValue([admin, revendedor]),
      deactivate: vi.fn().mockResolvedValue({ ...revendedor, isActive: false }),
      reactivate: vi.fn().mockResolvedValue({ ...revendedorInactivo, isActive: true }),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: loggedInUserId }) };

    await TestBed.configureTestingModule({
      imports: [UsuariosList],
      providers: [
        { provide: UsuariosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosList);
    component = fixture.componentInstance;
  }

  it('carga los usuarios al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalled();
    expect(component.usuariosFiltrados()).toEqual([admin, revendedor]);
  });

  it('filtra por estado del lado del cliente (GET /users no acepta query)', async () => {
    api = {
      list: vi.fn().mockResolvedValue([revendedor, revendedorInactivo]),
      deactivate: vi.fn(),
      reactivate: vi.fn(),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0' }) };
    await TestBed.configureTestingModule({
      imports: [UsuariosList],
      providers: [
        { provide: UsuariosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UsuariosList);
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledTimes(1);
    expect(component.usuariosFiltrados()).toEqual([revendedor]);

    component.activoFilter.set('inactivos');
    expect(component.usuariosFiltrados()).toEqual([revendedorInactivo]);

    component.activoFilter.set('todos');
    expect(component.usuariosFiltrados()).toEqual([revendedor, revendedorInactivo]);
  });

  it('un 403 al cargar muestra el panel de acceso restringido, no un error genérico', async () => {
    await setup();
    await fixture.whenStable();

    api.list.mockRejectedValue(
      new HttpErrorResponse({ status: 403, error: { message: 'Forbidden' } }),
    );
    await component.refresh();
    fixture.detectChanges();

    expect(component.forbidden()).toBe(true);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.forbidden-state');
    expect(panel.textContent).toContain('Acceso restringido');
    expect(panel.textContent).toContain('Solo un administrador puede gestionar usuarios.');
    expect(fixture.nativeElement.querySelector('.page-header')).toBeNull();
  });

  it('un error que no es 403 muestra el mensaje genérico, no el panel de acceso restringido', async () => {
    await setup();
    await fixture.whenStable();

    api.list.mockRejectedValue(new Error('network error'));
    await component.refresh();
    fixture.detectChanges();

    expect(component.forbidden()).toBe(false);
    const aviso: HTMLElement = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso.textContent).toContain('No se pudieron cargar los usuarios.');
    expect(aviso.querySelector('button')?.textContent).toContain('Reintentar');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('desactiva un usuario ajeno tras confirmar', async () => {
    await setup();
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(revendedor);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('user-1');
  });

  it('reactiva un usuario tras confirmar', async () => {
    await setup();
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(revendedorInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('user-2');
  });

  it('isSelf identifica la fila del usuario logueado', async () => {
    await setup('admin-0');
    await fixture.whenStable();

    expect(component.isSelf(admin)).toBe(true);
    expect(component.isSelf(revendedor)).toBe(false);
  });

  it('la fila del propio usuario logueado muestra el botón de desactivar deshabilitado, no el activo', async () => {
    await setup('admin-0');
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    // admin es la primera fila (orden de la respuesta mockeada).
    const adminRow = rows[0] as HTMLElement;
    const botones = Array.from(
      adminRow.querySelectorAll('td.mat-column-acciones button'),
    ) as HTMLButtonElement[];

    expect(botones).toHaveLength(2);
    expect(botones[0].disabled).toBe(false);
    expect(botones[1].disabled).toBe(true);
    expect(botones[1].textContent).toContain('block');
  });

  it('mientras carga lo dice con una línea visible, sin indicador giratorio', async () => {
    await setup();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.nc-lista-cargando')?.textContent).toContain(
      'Cargando usuarios…',
    );
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('muestra el estado vacío cuando el filtro no deja a nadie', async () => {
    await setup();
    await fixture.whenStable();
    component.activoFilter.set('inactivos');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')?.textContent).toContain(
      'No hay usuarios con estos filtros.',
    );
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  describe('en celular', () => {
    it('muestra una tarjeta por usuario con su correo, su rol y sus acciones escritas', async () => {
      await setup('admin-0', true);
      await fixture.whenStable();
      fixture.detectChanges();

      const tarjetas: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('mat-card.nc-card'),
      );
      expect(tarjetas).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      const ajena = tarjetas[1];
      expect(ajena.querySelector('.nc-card-title')?.textContent).toContain('Revendedor');
      expect(ajena.querySelector('.usuario-correo')?.textContent).toContain('revendedor@nocturne.dev');
      expect(ajena.querySelector('.nc-card-footer')?.textContent).toContain('Editar');
      expect(ajena.querySelector('.nc-card-footer')?.textContent).toContain('Desactivar');
    });

    it('la tarjeta del propio administrador no ofrece desactivarse y dice por qué', async () => {
      await setup('admin-0', true);
      await fixture.whenStable();
      fixture.detectChanges();

      const propia: HTMLElement = fixture.nativeElement.querySelector('mat-card.nc-card');
      expect(propia.querySelector('.nc-card-footer')?.textContent).toContain('Editar');
      expect(propia.querySelector('.nc-card-footer')?.textContent).not.toContain('Desactivar');
      expect(propia.textContent).toContain('No puedes desactivarte a ti mismo.');
    });
  });
});
