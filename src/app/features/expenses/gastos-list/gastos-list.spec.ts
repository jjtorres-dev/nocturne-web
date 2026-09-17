import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GastosList } from './gastos-list';
import { GastosApi } from '../gastos-api';
import { Moneda } from '../../sales/venta.model';
import type { Gasto } from '../expense.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('GastosList', () => {
  const gasto: Gasto = {
    id: '1',
    descripcion: 'Hosting',
    monto: 50,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    montoPEN: 50,
    metodoPago: 'Yape',
    fecha: '2026-01-05',
    activo: true,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };
  const gastoInactivo: Gasto = { ...gasto, id: '2', activo: false };

  let fixture: ComponentFixture<GastosList>;
  let component: GastosList;
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
      list: vi.fn().mockResolvedValue([gasto]),
      deactivate: vi.fn().mockResolvedValue({ ...gasto, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...gastoInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [GastosList],
      providers: [
        { provide: GastosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GastosList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga los gastos activos al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ activo: true });
    expect(component.gastos()).toEqual([gasto]);
  });

  it('formatea el monto en soles (S/), no como decimal crudo', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('S/ 50.00');
    expect(text).not.toContain('50.00 PEN');
  });

  it('muestra el monto original entre paréntesis cuando la moneda no es PEN', async () => {
    const gastoUsd: Gasto = {
      ...gasto,
      id: '3',
      monto: 15,
      moneda: Moneda.USD,
      tasaCambio: 3.8,
      montoPEN: 57,
    };
    api.list.mockResolvedValue([gastoUsd]);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('S/ 57.00');
    expect(text).toContain('(15.00 USD)');
  });

  it('desactiva un gasto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(gasto);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('1');
  });

  it('no desactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmDeactivate(gasto);
    await Promise.resolve();

    expect(api.deactivate).not.toHaveBeenCalled();
  });

  it('reactiva un gasto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(gastoInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('2');
  });

  it('muestra el botón Reactivar en filas inactivas y Desactivar en las activas', async () => {
    api.list.mockResolvedValue([gasto, gastoInactivo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const iconNames: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('td.mat-column-acciones mat-icon'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

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
});
