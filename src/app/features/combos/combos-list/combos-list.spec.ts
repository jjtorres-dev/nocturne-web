import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CombosList } from './combos-list';
import { CombosApi } from '../combos-api';
import { type Combo } from '../combo.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('CombosList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicioA: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const servicioB: Servicio = { ...servicioA, id: 'srv-2', nombre: 'Disney+' };
  const combo: Combo = {
    id: '1',
    nombre: 'Combo Netflix + Disney',
    descripcion: null,
    servicios: [servicioA, servicioB],
    precioCombo: 20,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const comboInactivo: Combo = { ...combo, id: '2', activo: false };

  let fixture: ComponentFixture<CombosList>;
  let component: CombosList;
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
      list: vi.fn().mockResolvedValue([combo]),
      deactivate: vi.fn().mockResolvedValue({ ...combo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...comboInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [CombosList],
      providers: [
        { provide: CombosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CombosList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga los combos activos al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ activo: true });
    expect(component.combos()).toEqual([combo]);
  });

  it('muestra los servicios del combo como chips', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Netflix');
    expect(fixture.nativeElement.textContent).toContain('Disney+');
  });

  it('formatea precioCombo en soles (S/)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('S/ 20.00');
  });

  it('desactiva un combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(combo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('1');
  });

  it('no desactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmDeactivate(combo);
    await Promise.resolve();

    expect(api.deactivate).not.toHaveBeenCalled();
  });

  it('reactiva un combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(comboInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('2');
  });

  it('abre el diálogo de crear y refresca al cerrar con resultado', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(combo) });

    component.openCreate();
    await Promise.resolve();
    await Promise.resolve();

    expect(api.list).toHaveBeenCalledTimes(2);
  });

  it('abre el diálogo de editar con el combo seleccionado', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openEdit(combo);

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { combo } }),
    );
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

  it('muestra los íconos de los servicios que componen el combo', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cell: HTMLElement = fixture.nativeElement.querySelector('td.mat-column-servicios');
    const items = Array.from(cell.querySelectorAll('app-service-icon-stack .item'));
    expect(items.map((i) => i.getAttribute('aria-label'))).toEqual(['Netflix', 'Disney+']);
  });

  it('muestra el estado vacío cuando no hay resultados', async () => {
    api.list.mockResolvedValue([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const empty: HTMLElement | null = fixture.nativeElement.querySelector('app-empty-state');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No hay combos con estos filtros.');
    expect(empty?.textContent).toContain('Prueba cambiando o quitando los filtros.');
  });

  it('no muestra el estado vacío cuando hay resultados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });
});
