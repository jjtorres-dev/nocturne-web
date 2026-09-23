import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaCombosList } from './venta-combos-list';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('VentaCombosList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicio: Servicio = {
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
  const combo: Combo = {
    id: 'combo-1',
    nombre: 'Combo Netflix + Disney',
    descripcion: null,
    servicios: [servicio],
    precioCombo: 20,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const ventaCombo: VentaCombo = {
    id: 'vc-1',
    clienteId: 'cli-1',
    comboId: 'combo-1',
    codigoVenta: 'C-00001',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    duracionMeses: 1,
    precio: 20,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 20,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const ventaComboInactiva: VentaCombo = { ...ventaCombo, id: 'vc-2', activo: false };

  let fixture: ComponentFixture<VentaCombosList>;
  let component: VentaCombosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
    renew: ReturnType<typeof vi.fn>;
  };
  let combosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let router: Router;
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([ventaCombo]),
      deactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaComboInactiva, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...ventaCombo, fechaFin: '2026-03-01' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [VentaCombosList],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaCombosList);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(async () => {
    await setup();
  });

  describe('estado mostrado (Vigente / Vencida / Finalizada)', () => {
    // Fecha fija: el estado depende de hoy. Solo se falsea Date.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 15, 12, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('vigente si vence hoy o después, vencida (en rojo) si ya pasó, finalizada si no está activa', async () => {
      api.list.mockResolvedValue([
        { ...ventaCombo, id: 'vc-vig', fechaFin: '2026-01-15' },
        { ...ventaCombo, id: 'vc-ven', fechaFin: '2026-01-14' },
        { ...ventaCombo, id: 'vc-fin', fechaFin: '2026-01-14', activo: false },
      ]);
      await fixture.whenStable();
      fixture.detectChanges();

      const chips = Array.from(
        fixture.nativeElement.querySelectorAll('app-estado-venta mat-chip') as NodeListOf<HTMLElement>,
      );
      expect(chips.map((c) => c.textContent!.trim())).toEqual(['Vigente', 'Vencida', 'Finalizada']);
      expect(chips[1].classList).toContain('chip-vencida');
      expect(chips[2].classList).toContain('chip-inactive');
    });
  });

  it('carga ventas de combo, combos y clientes al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({
      clienteId: undefined,
      comboId: undefined,
      activo: true,
    });
    expect(component.ventasCombo()).toEqual([ventaCombo]);
    expect(component.combos()).toEqual([combo]);
    expect(component.clientes()).toEqual([cliente]);
  });

  it('muestra código, cliente y combo en la tabla', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('C-00001');
    expect(text).toContain('Cliente Uno');
    expect(text).toContain('Combo Netflix + Disney');
  });

  it('navega a la página de creación al hacer click en Nueva venta de combo', async () => {
    await fixture.whenStable();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openCreate();

    expect(navigateSpy).toHaveBeenCalledWith(['/combo-sales/nueva']);
  });

  it('navega al detalle al abrir una venta de combo', async () => {
    await fixture.whenStable();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openDetail(ventaCombo);

    expect(navigateSpy).toHaveBeenCalledWith(['/combo-sales', 'vc-1']);
  });

  it('renueva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmRenew(ventaCombo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.renew).toHaveBeenCalledWith('vc-1');
  });

  it('desactiva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(ventaCombo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('vc-1');
  });

  it('reactiva una venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(ventaComboInactiva);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('vc-2');
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
