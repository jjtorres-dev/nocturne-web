import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiciosList } from './servicios-list';
import { ServiciosApi } from '../servicios-api';
import { ServiceType, type Servicio } from '../servicio.model';

describe('ServiciosList', () => {
  const servicio: Servicio = {
    id: '1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
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

  beforeEach(async () => {
    api = {
      list: vi.fn().mockResolvedValue([servicio]),
      deactivate: vi.fn().mockResolvedValue({ ...servicio, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...servicioInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ServiciosList],
      providers: [
        { provide: ServiciosApi, useValue: api },
        { provide: MatDialog, useValue: dialog },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosList);
    component = fixture.componentInstance;
  });

  it('carga los servicios al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ tipo: undefined, activo: true });
    expect(component.servicios()).toEqual([servicio]);
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
});
