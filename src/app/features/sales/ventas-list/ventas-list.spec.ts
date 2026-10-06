import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VentaEditDialog } from '../venta-edit-dialog/venta-edit-dialog';
import { VentaRenewDialog } from '../../../shared/venta-renew-dialog/venta-renew-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
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
    fechaCaida: null,
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
  let cuentasApi: { list: ReturnType<typeof vi.fn>; findOne: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let ventaCombosApi: { list: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(
    role: UserRole = UserRole.ADMIN,
    { mobile = false }: { mobile?: boolean } = {},
  ) {
    TestBed.resetTestingModule();
    api = {
      list: vi.fn().mockResolvedValue([venta]),
      deactivate: vi.fn().mockResolvedValue({ ...venta, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...ventaInactiva, activo: true }),
      renew: vi.fn().mockResolvedValue({ ...venta, fechaFin: '2026-03-01' }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([cliente]) };
    cuentasApi = {
      list: vi.fn().mockResolvedValue([cuenta]),
      findOne: vi.fn().mockResolvedValue({
        ...cuenta,
        claveServicio: 'super-secreta',
        claveCorreo: null,
      }),
    };
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
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasList);
    component = fixture.componentInstance;
  }

  // El estado mostrado (Vigente/Vencida) depende de la fecha de hoy: se fija
  // en 2026-01-15, así `venta` (vence 2026-02-01) queda vigente sin importar
  // cuándo se corran los tests. Solo se falsea Date; los timers siguen siendo
  // reales para whenStable() y los harnesses.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await setup();
  });

  describe('estado mostrado (Vigente / Vencida / Finalizada)', () => {
    const vigente: Venta = { ...venta, id: 'v-vig', codigoVenta: 'V-VIG', fechaFin: '2026-01-15' };
    const vencida: Venta = { ...venta, id: 'v-ven', codigoVenta: 'V-VEN', fechaFin: '2026-01-14' };
    const finalizada: Venta = {
      ...venta,
      id: 'v-fin',
      codigoVenta: 'V-FIN',
      fechaFin: '2026-01-14',
      activo: false,
    };

    function chips(): { texto: string; vencida: boolean; inactiva: boolean }[] {
      return Array.from(
        fixture.nativeElement.querySelectorAll('app-estado-venta mat-chip') as NodeListOf<HTMLElement>,
      ).map((el) => ({
        texto: el.textContent!.trim(),
        vencida: el.classList.contains('chip-vencida'),
        inactiva: el.classList.contains('chip-inactive'),
      }));
    }

    // Timeout propio (15 s en vez de 5 s): es el primer test del archivo y
    // paga el arranque en frío de la lista más pesada de la app (TestBed +
    // primer render de la tabla con sus chips, casillas e íconos). En reposo
    // llegó a tardar 2 s, menos de la mitad del límite por defecto: con la
    // máquina cargada no deja margen. No falló todavía; se sube por lo mismo
    // que venta-create-dialog.spec.ts y venta-combo-create.spec.ts.
    it('en la tabla: vigente si vence hoy o después, vencida (en rojo) si ya pasó, finalizada si no está activa', async () => {
      api.list.mockResolvedValue([vigente, vencida, finalizada]);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(chips()).toEqual([
        { texto: 'Vigente', vencida: false, inactiva: false },
        { texto: 'Vencida', vencida: true, inactiva: false },
        { texto: 'Finalizada', vencida: false, inactiva: true },
      ]);
    }, 15_000);

    it('en las tarjetas de celular muestra lo mismo', async () => {
      await setup(UserRole.ADMIN, { mobile: true });
      api.list.mockResolvedValue([vigente, vencida, finalizada]);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(chips().map((c) => c.texto)).toEqual(['Vigente', 'Vencida', 'Finalizada']);
    });

    it('el filtro de Estado sigue siendo por activo: "Sin finalizar" pide activo=true (incluye las vencidas)', async () => {
      await fixture.whenStable();

      expect(component.activoFilter).toBe('activos');
      expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ activo: true }));
    });
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

  it('abre el diálogo de renovación y, si cierra con la venta renovada, muestra la nueva fecha de fin y refresca', async () => {
    await fixture.whenStable();
    const renovada = { ...venta, fechaFin: '2026-03-01' };
    dialog.open.mockReturnValue({ afterClosed: () => of(renovada) });

    component.openRenew(venta);
    await Promise.resolve();
    await Promise.resolve();

    expect(dialog.open).toHaveBeenCalledWith(
      VentaRenewDialog,
      expect.objectContaining({ data: { venta } }),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('01/03/2026'),
      'Cerrar',
      expect.anything(),
    );
  });

  it('si el diálogo de renovación se cancela (cierra sin resultado), no muestra snackbar ni refresca', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
    snackBar.open.mockClear();

    component.openRenew(venta);
    await Promise.resolve();

    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('copiarDatos: pide el detalle de la cuenta (GET /accounts/:id, único lugar con credenciales) y copia servicio/correo/contraseña/perfil/PIN/vencimiento', async () => {
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarDatos(venta);

    expect(cuentasApi.findOne).toHaveBeenCalledWith('cta-1');
    expect(writeText).toHaveBeenCalledWith(
      [
        'Servicio: Netflix',
        'Correo: cuenta@correo.com',
        'Contraseña: super-secreta',
        'Perfil: Perfil 1',
        'Vence: 01/02/2026',
      ].join('\n'),
    );
  });

  it('copiarDatos: omite la línea de Contraseña si la cuenta no tiene (proveedor que solo da código)', async () => {
    await fixture.whenStable();
    cuentasApi.findOne.mockResolvedValue({ ...cuenta, claveServicio: null, claveCorreo: null });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarDatos(venta);

    const mensaje = writeText.mock.calls[0][0] as string;
    expect(mensaje).not.toContain('Contraseña');
  });

  it('copiarDatos: omite Perfil y PIN cuando la venta no tiene perfilId (servicio sin perfiles)', async () => {
    await fixture.whenStable();
    // loadPerfilNombres ya la llamó una vez al refrescar (la venta del
    // fixture sí tiene perfilId): solo interesan las llamadas de ACÁ en
    // adelante.
    perfilesApi.list.mockClear();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copiarDatos({ ...venta, perfilId: null });

    expect(perfilesApi.list).not.toHaveBeenCalled();
    const mensaje = writeText.mock.calls[0][0] as string;
    expect(mensaje).not.toContain('Perfil');
    expect(mensaje).not.toContain('PIN');
  });

  it('copiarDatos: nunca usa una URL ni console.log — solo navigator.clipboard.writeText', async () => {
    await fixture.whenStable();
    perfilesApi.list.mockResolvedValue([{ ...perfil, pin: '1234' }]);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await component.copiarDatos(venta);

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('PIN: 1234'));
    expect(openSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('el snackbar de "Venta creada" ofrece la acción "Copiar datos para el cliente"', async () => {
    await fixture.whenStable();
    const onAction = vi.fn().mockReturnValue({ subscribe: vi.fn() });
    snackBar.open.mockReturnValue({ onAction });
    dialog.open.mockReturnValue({
      afterClosed: () => of({ ...venta, codigoVenta: 'V-00009' }),
    });

    component.openCreate();
    await Promise.resolve();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Venta V-00009 creada.',
      'Copiar datos para el cliente',
      expect.anything(),
    );
    expect(onAction).toHaveBeenCalled();
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

  it('muestra tal cual el 400 de cuenta caída al reactivar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    const message = 'La cuenta está caída: no se puede reactivar la venta hasta que el proveedor la reponga.';
    api.reactivate.mockRejectedValue(new HttpErrorResponse({ status: 400, error: { message } }));

    component.confirmReactivate(ventaInactiva);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(snackBar.open).toHaveBeenCalledWith(message, 'Cerrar', expect.anything());
  });

  it('si el backend no manda mensaje (sin conexión), muestra el texto genérico', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });
    api.reactivate.mockRejectedValue(new HttpErrorResponse({ status: 0 }));
    api.deactivate.mockRejectedValue(new HttpErrorResponse({ status: 0 }));

    component.confirmReactivate(ventaInactiva);
    component.confirmDeactivate(venta);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudo reactivar la venta.',
      'Cerrar',
      expect.anything(),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se pudo finalizar la venta.',
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
    // Copiar datos + Editar + Renovar + Desactivar.
    expect(filaNormal.querySelectorAll('button[mat-icon-button]').length).toBe(4);

    const filaCombo = rows[1];
    // Solo Copiar datos: el resto lo reemplaza el badge de combo.
    expect(filaCombo.querySelectorAll('button[mat-icon-button]').length).toBe(1);
    const badge = filaCombo.querySelector('.combo-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain('Parte de combo C-00001');
  });

  it('una fila de combo conserva las cuatro casillas de acciones y lleva el enlace junto al código', async () => {
    api.list.mockResolvedValue([venta, ventaDeCombo]);
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row') as NodeListOf<HTMLElement>;
    const casillas = (row: HTMLElement) => row.querySelector('.nc-acciones')!.children.length;
    expect(casillas(rows[0])).toBe(4);
    expect(casillas(rows[1])).toBe(4);
    // El enlace al combo ya no vive en la celda de acciones.
    expect(rows[1].querySelector('.nc-acciones .combo-badge')).toBeNull();
    expect(rows[1].querySelector('.mat-column-cliente .combo-badge')).not.toBeNull();
  });

  it('si la carga falla muestra el aviso con "Reintentar", que vuelve a cargar', async () => {
    api.list.mockRejectedValue(new Error('sin red'));
    await fixture.whenStable();
    await component.refresh();
    fixture.detectChanges();

    const aviso: HTMLElement = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso.textContent).toContain('No se pudieron cargar las ventas.');
    expect(fixture.nativeElement.querySelector('table')).toBeNull();

    api.list.mockResolvedValue([venta]);
    aviso.querySelector('button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.nc-lista-error')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(1);
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

  describe('exportar CSV', () => {
    async function exportar(): Promise<string> {
      const createObjectURL = vi.fn().mockReturnValue('blob:mock');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => ({}) as never);

      component.exportCsv();

      const blob = createObjectURL.mock.calls[0][0] as Blob;
      const text = await blob.text();

      clickSpy.mockRestore();
      vi.unstubAllGlobals();
      return text;
    }

    it('exporta el mismo estado que se ve (Vigente / Vencida / Finalizada)', async () => {
      api.list.mockResolvedValue([
        { ...venta, id: 'v-vig', fechaFin: '2026-01-15' },
        { ...venta, id: 'v-ven', fechaFin: '2026-01-14' },
        { ...venta, id: 'v-fin', fechaFin: '2026-01-14', activo: false },
      ]);
      await fixture.whenStable();
      fixture.detectChanges();

      const csv = await exportar();

      expect(csv).toContain(';Vigente;');
      expect(csv).toContain(';Vencida;');
      expect(csv).toContain(';Finalizada;');
    });

    it('exporta código, cliente, servicio, cuenta, perfil, fechas, precio, moneda, método de pago, estado y dueño (admin)', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const csv = await exportar();

      expect(csv).toContain(
        'Código;Cliente;Servicio;Correo de la cuenta;Perfil;Desde;Vence;' +
          'Cobrado;Moneda;Método de pago;Estado;Dueño',
      );
      expect(csv).toContain(
        'V-00001;Cliente Uno;Netflix;cuenta@correo.com;Perfil 1;01/01/2026;01/02/2026;' +
          '15.00;PEN;Yape;Vigente;Admin',
      );
    });

    it('no incluye la columna Dueño para un REVENDEDOR', async () => {
      await setup(UserRole.REVENDEDOR);
      await fixture.whenStable();
      fixture.detectChanges();

      const csv = await exportar();

      // blob.text() decodifica con TextDecoder, que por defecto descarta el
      // BOM inicial (eso ya se verifica en csv-export.spec.ts sobre el
      // string crudo de buildCsv, antes de pasar por el Blob).
      expect(csv.split('\r\n')[0]).toBe(
        'Código;Cliente;Servicio;Correo de la cuenta;Perfil;Desde;Vence;' +
          'Cobrado;Moneda;Método de pago;Estado',
      );
      expect(csv).not.toContain('Admin');
    });

    it('exporta solo lo filtrado en pantalla, no todas las ventas', async () => {
      // Simula el filtro "Servicio" ya aplicado: el backend solo devolvió
      // la venta que matchea, la otra ni siquiera llegó a component.ventas().
      api.list.mockResolvedValue([venta]);
      await fixture.whenStable();
      fixture.detectChanges();

      const csv = await exportar();

      expect(csv).toContain('V-00001');
      expect((csv.match(/\r\n/g) ?? []).length).toBe(1);
    });

    it('nombra el archivo ventas-YYYY-MM-DD.csv con la fecha de hoy', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 8, 22, 12, 0));

      const createObjectURL = vi.fn().mockReturnValue('blob:mock');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
      const clicked: HTMLAnchorElement[] = [];
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(function (this: HTMLAnchorElement) {
          clicked.push(this);
        });

      await fixture.whenStable();
      fixture.detectChanges();
      component.exportCsv();

      expect(clicked[0].download).toBe('ventas-2026-09-22.csv');

      clickSpy.mockRestore();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    });
  });

  describe('en pantalla angosta (tarjetas)', () => {
    function cards(): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('mat-card.nc-card'));
    }

    function button(card: HTMLElement, label: string): HTMLButtonElement | undefined {
      return (Array.from(card.querySelectorAll('button')) as HTMLButtonElement[]).find(
        (b) => b.textContent?.includes(label),
      );
    }

    async function render(
      mobile: boolean,
      { role = UserRole.ADMIN, ventas = [venta] }: { role?: UserRole; ventas?: Venta[] } = {},
    ) {
      await setup(role, { mobile });
      api.list.mockResolvedValue(ventas);
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('renderiza tarjetas y no la tabla', async () => {
      await render(true);

      expect(cards().length).toBe(1);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('la fecha de vencimiento de la tarjeta lleva el color de urgencia: vencida, por vencer o ninguno', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 6, 12, 0));
      try {
        await render(true, {
          ventas: [
            { ...venta, id: 'pasada', fechaFin: '2026-10-01' },
            { ...venta, id: 'pronto', fechaFin: '2026-10-08' },
            { ...venta, id: 'lejos', fechaFin: '2026-11-20' },
          ],
        });

        const clases = cards().map((c) => c.querySelector('.tarjeta-vence')!.className);
        expect(clases[0]).toContain('nc-estado-vencida');
        expect(clases[1]).toContain('nc-estado-por-vencer');
        expect(clases[2]).not.toContain('vence-urgente');
      } finally {
        vi.useRealTimers();
      }
    });

    it('en desktop sigue saliendo la tabla y no las tarjetas', async () => {
      await render(false);

      expect(fixture.nativeElement.querySelector('table[mat-table]')).not.toBeNull();
      expect(cards().length).toBe(0);
    });

    it('la tabla de desktop va dentro del contenedor con scroll horizontal', async () => {
      await render(false);

      expect(
        fixture.nativeElement.querySelector('.table-scroll table[mat-table]'),
      ).not.toBeNull();
    });

    it('muestra cliente, estado, servicio, cuenta/perfil, periodo y precio', async () => {
      await render(true);

      const card = cards()[0];
      expect(card.querySelector('.nc-card-title')!.textContent).toContain('Cliente Uno');
      expect(card.querySelector('mat-chip')!.textContent).toContain('Vigente');
      const text = card.textContent!;
      expect(text).toContain('V-00001');
      expect(text).toContain('Netflix');
      expect(text).toContain('cuenta@correo.com — Perfil 1');
      expect(text).toContain('01/01/2026 → 01/02/2026');
      expect(text).toContain('S/ 15.00');
    });

    it('muestra el precio original si la moneda no es PEN', async () => {
      await render(true, {
        ventas: [
          { ...venta, precio: 20, moneda: Moneda.USD, tasaCambio: 3.8, precioPEN: 76 },
        ],
      });

      expect(cards()[0].textContent).toContain('S/ 76.00');
      expect(cards()[0].textContent).toContain('(20.00 USD)');
    });

    it('un ADMIN ve el Dueño en la tarjeta', async () => {
      await render(true);

      expect(cards()[0].querySelector('.nc-card-subtitle')!.textContent).toContain(
        'Dueño: Admin',
      );
    });

    it('un REVENDEDOR no ve el Dueño en la tarjeta', async () => {
      await render(true, { role: UserRole.REVENDEDOR });

      expect(cards()[0].textContent).not.toContain('Dueño');
    });

    it('una venta vigente ofrece Editar, Renovar y Finalizar (no Reactivar)', async () => {
      await render(true);

      const card = cards()[0];
      expect(button(card, 'Editar')).toBeDefined();
      expect(button(card, 'Renovar')).toBeDefined();
      expect(button(card, 'Finalizar')).toBeDefined();
      expect(button(card, 'Reactivar')).toBeUndefined();
    });

    it('una venta finalizada ofrece Editar y Reactivar (no Renovar ni Finalizar)', async () => {
      await render(true, { ventas: [ventaInactiva] });

      const card = cards()[0];
      expect(card.querySelector('mat-chip')!.textContent).toContain('Finalizada');
      expect(button(card, 'Editar')).toBeDefined();
      expect(button(card, 'Reactivar')).toBeDefined();
      expect(button(card, 'Renovar')).toBeUndefined();
      expect(button(card, 'Finalizar')).toBeUndefined();
    });

    it('Editar abre el modal de edición con la venta', async () => {
      await render(true);
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

      button(cards()[0], 'Editar')!.click();

      expect(dialog.open).toHaveBeenCalledWith(
        VentaEditDialog,
        expect.objectContaining({ data: { venta } }),
      );
    });

    it('Renovar abre el diálogo de renovación con la venta', async () => {
      await render(true);
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

      button(cards()[0], 'Renovar')!.click();

      expect(dialog.open).toHaveBeenCalledWith(
        VentaRenewDialog,
        expect.objectContaining({ data: { venta } }),
      );
    });

    it('Finalizar pide confirmación y finaliza la venta', async () => {
      await render(true);
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      button(cards()[0], 'Finalizar')!.click();
      await Promise.resolve();
      await Promise.resolve();

      expect(dialog.open).toHaveBeenCalledWith(
        ConfirmDialog,
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Finalizar venta',
            confirmLabel: 'Finalizar venta',
            message: expect.stringContaining(
              'El perfil queda libre para otro cliente. Lo que ya cobraste sigue contando en Contabilidad.',
            ),
          }),
        }),
      );
      expect(api.deactivate).toHaveBeenCalledWith('v-1');
    });

    it('Finalizar una venta de cuenta completa avisa que queda libre la cuenta, no un perfil', async () => {
      await render(true);
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.confirmDeactivate({ ...venta, perfilId: null });

      const data = dialog.open.mock.calls[0][1].data;
      expect(data.message).toContain('La cuenta queda libre para otro cliente.');
      expect(data.message).not.toContain('El perfil');
    });

    it('Finalizar no hace nada si se cancela la confirmación', async () => {
      await render(true);
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      button(cards()[0], 'Finalizar')!.click();
      await Promise.resolve();

      expect(api.deactivate).not.toHaveBeenCalled();
    });

    it('Reactivar pide confirmación y reactiva la venta', async () => {
      await render(true, { ventas: [ventaInactiva] });
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      button(cards()[0], 'Reactivar')!.click();
      await Promise.resolve();
      await Promise.resolve();

      expect(api.reactivate).toHaveBeenCalledWith('v-2');
    });

    it('una venta hija de combo muestra el badge en vez de las acciones', async () => {
      await render(true, { ventas: [ventaDeCombo] });

      const card = cards()[0];
      // Solo Copiar datos: el resto lo reemplaza el badge de combo.
      expect(card.querySelectorAll('button').length).toBe(1);
      expect(button(card, 'Copiar datos')).toBeDefined();
      const badge = card.querySelector('.combo-badge')!;
      expect(badge.textContent).toContain('Parte de combo C-00001');
      expect(badge.getAttribute('href')).toBe('/combo-sales/vc-1');
    });
  });

  describe('panel de filtros', () => {
    async function render(mobile: boolean) {
      await setup(UserRole.ADMIN, { mobile });
      await fixture.whenStable();
      fixture.detectChanges();
    }

    const toggle = (): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector('.filters-toggle');
    const filters = (): HTMLElement | null => fixture.nativeElement.querySelector('.filters');

    async function click(el: HTMLElement) {
      el.click();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('en desktop los filtros están siempre visibles y no hay botón "Filtros"', async () => {
      await render(false);

      expect(filters()).not.toBeNull();
      expect(toggle()).toBeNull();
    });

    it('en móvil arrancan colapsados: hay botón "Filtros" pero no los selectores', async () => {
      await render(true);

      expect(toggle()).not.toBeNull();
      expect(toggle()!.getAttribute('aria-expanded')).toBe('false');
      expect(filters()).toBeNull();
    });

    it('en móvil el botón expande y vuelve a colapsar los filtros', async () => {
      await render(true);

      await click(toggle()!);
      expect(filters()).not.toBeNull();
      expect(filters()!.querySelectorAll('mat-form-field').length).toBe(3);
      expect(toggle()!.getAttribute('aria-expanded')).toBe('true');

      await click(toggle()!);
      expect(filters()).toBeNull();
      expect(toggle()!.getAttribute('aria-expanded')).toBe('false');
    });

    it('el botón indica cuántos filtros están aplicando (Estado=Activos por defecto)', async () => {
      await render(true);
      // Los filtros son campos planos (ngModel los cambia y marca la vista);
      // acá se cambian a mano, así que hay que marcarla como sucia.
      const redibujar = () => {
        fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
        fixture.detectChanges();
      };

      expect(toggle()!.textContent).toContain('(1)');

      component.clienteFilter = 'cli-1';
      component.activoFilter = 'todos';
      redibujar();
      expect(toggle()!.textContent).toContain('(1)');

      component.servicioFilter = 'srv-1';
      redibujar();
      expect(toggle()!.textContent).toContain('(2)');

      component.clienteFilter = 'todos';
      component.servicioFilter = 'todos';
      redibujar();
      expect(toggle()!.textContent).not.toContain('(');
    });

    it('colapsar el panel conserva los filtros aplicados', async () => {
      await render(true);
      await click(toggle()!);
      component.servicioFilter = 'srv-1';

      await click(toggle()!);

      expect(filters()).toBeNull();
      expect(component.servicioFilter).toBe('srv-1');
    });
  });


  describe('chip "Cuenta caída"', () => {
    const caida: Venta = { ...venta, id: 'v-caida', cuentaCaida: true };
    const sana: Venta = { ...venta, id: 'v-sana', cuentaCaida: false };
    // Finalizada: el cliente ya no usa la cuenta, el chip no aplica.
    const finalizada: Venta = { ...venta, id: 'v-fin', cuentaCaida: true, activo: false };

    async function chipsPorFila(mobile: boolean): Promise<boolean[]> {
      await setup(UserRole.ADMIN, { mobile });
      api.list.mockResolvedValue([caida, sana, finalizada]);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const filas = fixture.nativeElement.querySelectorAll(
        mobile ? 'mat-card.nc-card' : 'tr[mat-row]',
      );
      return Array.from<HTMLElement>(filas).map(
        (fila) => fila.querySelector('app-cuenta-caida-chip') !== null,
      );
    }

    it('en la tabla, solo en las ventas vigentes con la cuenta caída', async () => {
      expect(await chipsPorFila(false)).toEqual([true, false, false]);
      expect(fixture.nativeElement.querySelector('app-cuenta-caida-chip').textContent).toContain(
        'Cuenta caída',
      );
    });

    it('en las tarjetas de celular también', async () => {
      expect(await chipsPorFila(true)).toEqual([true, false, false]);
    });
  });
});
