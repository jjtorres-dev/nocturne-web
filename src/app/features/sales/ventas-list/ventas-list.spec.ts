import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasList } from './ventas-list';
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { type Perfil } from '../../accounts/profiles/perfil.model';
import { VentaCombosApi } from '../../combo-sales/venta-combos-api';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('VentasList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicio: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 2,
    precioBase: 10,
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
  const cuenta: CuentaListItem = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: null,
    clienteId: null,
    correo: 'cuenta@correo.com',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-01',
    costo: 10,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    perfilesCount: 1,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const perfil: Perfil = {
    id: 'per-1',
    cuentaId: 'cta-1',
    nombre: 'Perfil 1',
    pin: null,
    clienteId: 'cli-1',
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const venta: Venta = {
    id: 'v-1',
    clienteId: 'cli-1',
    cuentaId: 'cta-1',
    perfilId: 'per-1',
    servicioId: 'srv-1',
    codigoVenta: 'V-00001',
    duracionMeses: 1,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    precio: 15,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 15,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    ventaComboId: null,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const ventaInactiva: Venta = { ...venta, id: 'v-2', activo: false };
  const ventaDeCombo: Venta = {
    ...venta,
    id: 'v-3',
    ventaComboId: 'vc-1',
  };

  let fixture: ComponentFixture<VentasList>;
  let component: VentasList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
    renew: ReturnType<typeof vi.fn>;
  };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let ventaCombosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([venta]),
      deactivate: vi.fn().mockResolvedValue({ ...venta, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaInactiva, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...venta, fechaFin: '2026-03-01' }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = { list: vi.fn().mockResolvedValue([cuenta]) };
    perfilesApi = { list: vi.fn().mockResolvedValue([perfil]) };
    ventaCombosApi = {
      list: vi.fn().mockResolvedValue([{ id: 'vc-1', codigoVenta: 'C-00001' }]),
    };
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [VentasList],
      providers: [
        provideRouter([]),
        { provide: VentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: VentaCombosApi, useValue: ventaCombosApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga ventas, servicios, clientes y cuentas al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({
      clienteId: undefined,
      servicioId: undefined,
      activo: true,
    });
    expect(component.ventas()).toEqual([venta]);
    expect(component.servicios()).toEqual([servicio]);
    expect(component.clientes()).toEqual([cliente]);
    expect(component.cuentas()).toEqual([cuenta]);
  });

  it('muestra cuenta y perfil combinados en la tabla', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('cuenta@correo.com');
    expect(text).toContain('Perfil 1');
    expect(text).toContain('V-00001');
  });

  it('formatea el precio en soles (S/), no como decimal crudo', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('S/ 15.00');
    expect(text).not.toContain('15.00 PEN');
  });

  it('muestra el precio original entre paréntesis cuando la moneda no es PEN', async () => {
    api.list.mockResolvedValue([
      { ...venta, precio: 20, moneda: Moneda.USD, tasaCambio: 3.8, precioPEN: 76 },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('S/ 76.00');
    expect(text).toContain('(20.00 USD)');
  });

  it('renueva una venta y muestra la nueva fecha de fin en el snackbar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmRenew(venta);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.renew).toHaveBeenCalledWith('v-1');
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('2026-03-01'),
      'Cerrar',
      expect.anything(),
    );
  });

  it('desactiva una venta tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(venta);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('v-1');
  });

  it('reactiva una venta tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(ventaInactiva);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('v-2');
  });

  it('muestra el mensaje del backend si reactivar da 409', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    api.reactivate.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Ese perfil ya tiene una venta activa (V-00003).' },
      }),
    );

    component.confirmReactivate(ventaInactiva);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Ese perfil ya tiene una venta activa (V-00003).',
      'Cerrar',
      expect.anything(),
    );
  });

  it('abre el modal de editar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    component.openEdit(venta);

    expect(dialog.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { venta } }),
    );
  });

  it('oculta editar/renovar/desactivar y muestra el badge de combo en filas con ventaComboId', async () => {
    api.list.mockResolvedValue([venta, ventaDeCombo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll(
      'tr.mat-mdc-row',
    ) as NodeListOf<HTMLElement>;
    expect(rows.length).toBe(2);

    const filaNormal = rows[0];
    expect(filaNormal.querySelector('.combo-badge')).toBeNull();
    expect(filaNormal.querySelectorAll('button[mat-icon-button]').length).toBe(3);

    const filaCombo = rows[1];
    expect(filaCombo.querySelectorAll('button[mat-icon-button]').length).toBe(0);
    const badge = filaCombo.querySelector('.combo-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain('Parte de combo C-00001');
  });

  it('el badge de combo enlaza a /combo-sales/:id', async () => {
    api.list.mockResolvedValue([ventaDeCombo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.combo-badge');
    expect(badge.getAttribute('href')).toBe('/combo-sales/vc-1');
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
