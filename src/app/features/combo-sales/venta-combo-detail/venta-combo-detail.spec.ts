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

describe('VentaComboDetail', () => {
  const servicio: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
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
    createdAt: '',
    updatedAt: '',
  };
  const cliente: Contacto = {
    id: 'cli-1',
    nombre: 'Cliente Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
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

  beforeEach(async () => {
    api = {
      findOne: vi.fn().mockResolvedValue(ventaCombo),
      deactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...ventaCombo, fechaFin: '2026-03-01' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaComboDetail],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
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
});
