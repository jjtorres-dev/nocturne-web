import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiciosList } from './servicios-list';
import { ServiciosApi } from '../servicios-api';
import { ServiceType, type Servicio } from '../servicio.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('ServiciosList', () => {
  const servicio: Servicio = {
    id: '1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };
  const servicioInactivo: Servicio = { ...servicio, id: '2', activo: false };

  let fixture: ComponentFixture<ServiciosList>;
  let component: ServiciosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
  };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([servicio]),
      deactivate: vi.fn().mockResolvedValue({ ...servicio, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...servicioInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [ServiciosList],
      providers: [
        { provide: ServiciosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga los servicios al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ tipo: undefined, activo: true });
    expect(component.servicios()).toEqual([servicio]);
  });

  it('formatea precioBase en soles (S/), no como decimal crudo', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('S/ 10.00');
  });

  it('desactiva un servicio tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(servicio);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('1');
  });

  it('no desactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmDeactivate(servicio);
    await Promise.resolve();

    expect(api.deactivate).not.toHaveBeenCalled();
  });

  it('reactiva un servicio tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(servicioInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('2');
  });

  it('no reactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmReactivate(servicioInactivo);
    await Promise.resolve();

    expect(api.reactivate).not.toHaveBeenCalled();
  });

  it('muestra el botón Reactivar en filas inactivas y Desactivar en las activas', async () => {
    api.list.mockResolvedValue([servicio, servicioInactivo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const iconNames: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('td.mat-column-acciones mat-icon'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

    // fila activa: editar + desactivar (block); fila inactiva: editar + reactivar (restart_alt)
    expect(iconNames).toEqual(['edit', 'block', 'edit', 'restart_alt']);
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

  it('muestra el ícono de marca junto al nombre del servicio', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cell: HTMLElement = fixture.nativeElement.querySelector('td.mat-column-nombre');
    expect(cell.querySelector('app-service-icon svg')).not.toBeNull();
    expect(cell.textContent).toContain('Netflix');
  });

  it('cae al avatar de iniciales si el servicio no tiene ícono de marca', async () => {
    api.list.mockResolvedValue([{ ...servicio, nombre: 'Servicio Inventado' }]);
    await fixture.whenStable();
    fixture.detectChanges();

    const cell: HTMLElement = fixture.nativeElement.querySelector('td.mat-column-nombre');
    expect(cell.querySelector('svg')).toBeNull();
    expect(cell.querySelector('app-avatar-inicial')?.textContent?.trim()).toBe('SI');
  });

  it('muestra el estado vacío cuando no hay resultados', async () => {
    api.list.mockResolvedValue([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const empty: HTMLElement | null = fixture.nativeElement.querySelector('app-empty-state');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No hay servicios con estos filtros.');
    expect(empty?.textContent).toContain('Prueba cambiando o quitando los filtros.');
  });

  it('no muestra el estado vacío cuando hay resultados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });
});
