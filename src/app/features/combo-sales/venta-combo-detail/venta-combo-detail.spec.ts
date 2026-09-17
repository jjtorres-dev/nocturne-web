import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentaComboDetail } from './venta-combo-detail';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { CombosApi } from '../../combos/combos-api';
import { type Combo } from '../../combos/combo.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('VentaComboDetail', () => {
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
    nombre: 'Combo Netflix + IPTV',
    descripcion: null,
    servicios: [servicio],
    precioCombo: 25,
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
    precio: 25,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 25,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    owner,
    ventas: [
      {
        id: 'v-1',
        servicioId: 'srv-1',
        servicio,
        cuentaId: 'cta-1',
        cuenta: { id: 'cta-1', correo: 'netflix@correo.com' } as never,
        perfilId: 'per-1',
        perfil: { id: 'per-1', nombre: 'Perfil 1' } as never,
        clienteId: 'cli-1',
        fechaFin: '2026-02-01',
        activo: true,
      },
    ],
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VentaComboDetail>;
  let component: VentaComboDetail;
  let api: {
    findOne: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
    renew: ReturnType<typeof vi.fn>;
  };
  let combosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = {
      findOne: vi.fn().mockResolvedValue(ventaCombo),
      deactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...ventaCombo, fechaFin: '2026-03-01' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    dialog = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [VentaComboDetail],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'vc-1' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaComboDetail);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga la venta de combo, el combo y el cliente al iniciar', async () => {
    await fixture.whenStable();

    expect(api.findOne).toHaveBeenCalledWith('vc-1');
    expect(component.ventaCombo()).toEqual(ventaCombo);
    expect(component.combo()).toEqual(combo);
    expect(component.cliente()).toEqual(cliente);
  });

  it('muestra la tabla de ventas hijas en solo lectura, sin botones de acción por fila', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Netflix');
    expect(text).toContain('netflix@correo.com — Perfil 1');

    const salesTable = fixture.nativeElement.querySelector('.sales-table');
    expect(salesTable.querySelectorAll('button').length).toBe(0);
  });

  it('renueva la venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmRenew();
    await Promise.resolve();
    await Promise.resolve();

    expect(api.renew).toHaveBeenCalledWith('vc-1');
  });

  it('desactiva la venta de combo tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate();
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('vc-1');
  });

  it('abre el diálogo de editar con la venta de combo actual', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openEdit();

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { ventaCombo } }),
    );
  });

  it('muestra el dueño en la cabecera para un ADMIN', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dueño');
    expect(fixture.nativeElement.textContent).toContain('Admin');
  });

  it('no muestra el dueño en la cabecera para un REVENDEDOR', async () => {
    await setup(UserRole.REVENDEDOR);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Dueño');
  });
});
