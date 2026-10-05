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
import { CuentasApi } from '../../accounts/cuentas-api';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';

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
    ajustes: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
    renew: ReturnType<typeof vi.fn>;
  };
  let combosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let cuentasApi: { findOne: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = {
      findOne: vi.fn().mockResolvedValue(ventaCombo),
      ajustes: vi.fn().mockResolvedValue([]),
      deactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaCombo, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...ventaCombo, fechaFin: '2026-03-01' }),
    };
    combosApi = { list: vi.fn().mockResolvedValue([combo]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = {
      findOne: vi.fn().mockResolvedValue({
        id: 'cta-1',
        correo: 'netflix@correo.com',
        claveServicio: 'clave-netflix',
        claveCorreo: null,
      }),
    };
    perfilesApi = {
      list: vi.fn().mockResolvedValue([{ id: 'per-1', nombre: 'Perfil 1', pin: '1234' }]),
    };
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [VentaComboDetail],
      providers: [
        provideRouter([]),
        { provide: VentaCombosApi, useValue: api },
        { provide: CombosApi, useValue: combosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: CuentasApi, useValue: cuentasApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
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

  describe('estado mostrado (Vigente / Vencida / Finalizada)', () => {
    // Fecha fija: el estado depende de hoy. Solo se falsea Date.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 15, 12, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it.each([
      ['2026-01-15', true, 'Vigente'],
      ['2026-01-14', true, 'Vencida'],
      ['2026-01-14', false, 'Finalizada'],
    ])('vence %s, activo=%s → %s', async (fechaFin, activo, esperado) => {
      api.findOne.mockResolvedValue({ ...ventaCombo, fechaFin, activo });
      await fixture.whenStable();
      fixture.detectChanges();

      const chip: HTMLElement = fixture.nativeElement.querySelector('app-estado-venta mat-chip');
      expect(chip.textContent!.trim()).toBe(esperado);
      expect(chip.classList.contains('chip-vencida')).toBe(esperado === 'Vencida');
    });
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

  it('copiarDatos: pide el detalle de CADA cuenta del combo (GET /accounts/:id) y junta todo en un solo mensaje', async () => {
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarDatos();

    expect(cuentasApi.findOne).toHaveBeenCalledWith('cta-1');
    expect(writeText).toHaveBeenCalledWith(
      [
        'Servicio: Netflix',
        'Correo: netflix@correo.com',
        'Contraseña: clave-netflix',
        'Perfil: Perfil 1',
        'PIN: 1234',
        'Vence: 01/02/2026',
      ].join('\n'),
    );
  });

  it('copiarDatos: nunca usa la cuenta anidada de la propia respuesta de combo-sales para la contraseña', async () => {
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarDatos();

    // El fixture `ventaCombo.ventas[0].cuenta` no tiene claveServicio (ni
    // siquiera está tipado ahí) — si el código usara ese objeto en vez de
    // cuentasApi.findOne, la contraseña real nunca aparecería en absoluto.
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('clave-netflix'));
  });

  it('copiarDatos: nunca usa una URL ni console.log', async () => {
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await component.copiarDatos();

    expect(openSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('copiarDatos: si falla, muestra un snackbar de error', async () => {
    await fixture.whenStable();
    cuentasApi.findOne.mockRejectedValue(new Error('network down'));

    await component.copiarDatos();

    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudieron copiar los datos.',
      'Cerrar',
      expect.anything(),
    );
  });

  describe('cuenta caída e historial de ajustes', () => {
    async function render(): Promise<HTMLElement> {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it('sin cuenta caída ni ajustes no muestra el chip ni el historial', async () => {
      const el = await render();

      expect(api.ajustes).toHaveBeenCalledWith(ventaCombo.id);
      expect(el.querySelector('app-cuenta-caida-chip')).toBeNull();
      expect(el.querySelector('app-ajustes-venta section')).toBeNull();
    });

    it('con una cuenta caída muestra el chip, y el historial "+N días por cuenta caída del DD/MM"', async () => {
      await setup();
      api.findOne.mockResolvedValue({ ...ventaCombo, cuentaCaida: true });
      api.ajustes.mockResolvedValue([{ id: 'a-1', dias: 4, fechaCaida: '2026-02-10' }]);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('.details-card app-cuenta-caida-chip')?.textContent).toContain(
        'Cuenta caída',
      );
      expect(el.querySelector('app-ajustes-venta li')?.textContent?.trim()).toBe(
        '+4 días por cuenta caída del 10/02',
      );
    });
  });
});
