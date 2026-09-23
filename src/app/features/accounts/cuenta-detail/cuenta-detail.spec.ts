import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentaDetail } from './cuenta-detail';
import { CuentasApi } from '../cuentas-api';
import {
  PagoProveedorTipo,
  type Cuenta,
  type CuentaRentabilidad,
  type PagoProveedor,
} from '../cuenta.model';
import { Moneda } from '../../sales/venta.model';
import { CuentaRenovarProveedorDialog } from '../cuenta-renovar-proveedor-dialog/cuenta-renovar-proveedor-dialog';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { PerfilesApi } from '../profiles/perfiles-api';
import { type Perfil } from '../profiles/perfil.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('CuentaDetail', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const cuenta: Cuenta = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: 'prov-1',
    clienteId: null,
    correo: 'cuenta@correo.com',
    claveServicio: 'clave-servicio-secreta',
    claveCorreo: 'clave-correo-secreta',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    costo: 10,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
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
  const proveedor: Contacto = {
    id: 'prov-1',
    nombre: 'Proveedor Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.PROVEEDOR,
    activo: true,
    owner,
    createdAt: '',
    updatedAt: '',
  };
  const perfilActivo: Perfil = {
    id: 'p1',
    cuentaId: 'cta-1',
    nombre: 'Perfil 1',
    pin: '1234',
    clienteId: null,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };

  const rentabilidadBase: CuentaRentabilidad = {
    costo: 10,
    desgloseCosto: { compraInicial: 10, renovaciones: 0, cantidadRenovaciones: 0 },
    perfilesTotal: 2,
    perfilesVendidos: 1,
    usaPerfiles: true,
    ingresos: 6,
    ganancia: -4,
    potencial: 20,
    ventasCombo: 0,
  };

  const pagos: PagoProveedor[] = [
    {
      id: 'pp-2',
      cuentaId: 'cta-1',
      fecha: '2026-02-01',
      monto: 5,
      moneda: Moneda.USD,
      tasaCambio: 3.8,
      montoPEN: 19,
      metodoPago: 'Binance',
      tipo: PagoProveedorTipo.RENOVACION,
      createdAt: '',
    },
    {
      id: 'pp-1',
      cuentaId: 'cta-1',
      fecha: '2026-01-01',
      monto: 10,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      montoPEN: 10,
      metodoPago: 'Yape',
      tipo: PagoProveedorTipo.COMPRA_INICIAL,
      createdAt: '',
    },
  ];

  let fixture: ComponentFixture<CuentaDetail>;
  let component: CuentaDetail;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let api: {
    findOne: ReturnType<typeof vi.fn>;
    rentabilidad: ReturnType<typeof vi.fn>;
    pagosProveedor: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
  };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(
    perfiles: Perfil[] = [perfilActivo],
    role: UserRole = UserRole.ADMIN,
    rentabilidad: CuentaRentabilidad | Error = rentabilidadBase,
    cuentaActual: Cuenta = cuenta,
  ) {
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };
    api = {
      findOne: vi.fn().mockResolvedValue(cuentaActual),
      pagosProveedor: vi.fn().mockResolvedValue(pagos),
      rentabilidad:
        rentabilidad instanceof Error
          ? vi.fn().mockRejectedValue(rentabilidad)
          : vi.fn().mockResolvedValue(rentabilidad),
      deactivate: vi.fn().mockResolvedValue({ ...cuenta, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...cuenta, activo: true }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([proveedor]) };
    perfilesApi = { list: vi.fn().mockResolvedValue(perfiles) };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [CuentaDetail],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'cta-1' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaDetail);
    component = fixture.componentInstance;
  }

  it('carga la cuenta, el servicio, el proveedor y los perfiles', async () => {
    await setup();
    await fixture.whenStable();

    expect(api.findOne).toHaveBeenCalledWith('cta-1');
    expect(perfilesApi.list).toHaveBeenCalledWith('cta-1');
    expect(component.cuenta()).toEqual(cuenta);
    expect(component.servicio()).toEqual(servicio);
    expect(component.proveedor()).toEqual(proveedor);
    expect(component.perfiles()).toEqual([perfilActivo]);
  });

  it('formatea el costo en soles (S/), no como decimal crudo', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('S/ 10.00');
  });

  it('no muestra claveServicio, claveCorreo ni pin en el DOM hasta presionar Mostrar', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('clave-servicio-secreta');
    expect(text).not.toContain('clave-correo-secreta');
    expect(text).not.toContain('1234');

    const showButtons = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).filter((b) => b.textContent?.includes('Mostrar'));
    expect(showButtons.length).toBeGreaterThan(0);

    showButtons.forEach((b) => b.click());
    fixture.detectChanges();

    const revealedText = fixture.nativeElement.textContent;
    expect(revealedText).toContain('clave-servicio-secreta');
    expect(revealedText).toContain('clave-correo-secreta');
    expect(revealedText).toContain('1234');
  });

  // Regresión: la columna tenía "—" fijo en el template; el backend sí
  // manda Perfil.clienteId (lo llena al vender, lo limpia al finalizar).
  it('muestra el nombre del cliente de cada perfil vendido y "—" en los libres', async () => {
    const cliente: Contacto = {
      ...proveedor,
      id: 'cli-1',
      nombre: 'Cliente Uno',
      tipo: ContactType.CLIENTE_FINAL,
    };
    await setup([
      { ...perfilActivo, clienteId: 'cli-1' },
      { ...perfilActivo, id: 'p2', nombre: 'Perfil 2', clienteId: null },
    ]);
    contactosApi.list.mockResolvedValue([proveedor, cliente]);
    await fixture.whenStable();
    fixture.detectChanges();

    const celdas: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('.profiles-table td.mat-column-cliente'),
    ).map((el) => (el as HTMLElement).textContent!.trim());
    expect(celdas).toEqual(['Cliente Uno', '—']);
  });

  it('deshabilita "Agregar perfil" cuando se alcanza pantallasMax', async () => {
    const perfilActivo2: Perfil = { ...perfilActivo, id: 'p2' };
    await setup([perfilActivo, perfilActivo2]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.canAddPerfil()).toBe(false);

    const addButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Agregar perfil'))!;

    expect(addButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('ya tiene sus');
  });

  it('permite agregar perfil cuando hay cupo disponible', async () => {
    await setup([perfilActivo]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.canAddPerfil()).toBe(true);

    const addButton = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Agregar perfil'))!;

    expect(addButton.disabled).toBe(false);
  });

  it('muestra el dueño en la cabecera para un ADMIN', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dueño');
    expect(fixture.nativeElement.textContent).toContain('Admin');
  });

  it('no muestra el dueño en la cabecera para un REVENDEDOR', async () => {
    await setup([perfilActivo], UserRole.REVENDEDOR);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Dueño');
  });

  describe('tarjeta de rentabilidad', () => {
    async function render(r: CuentaRentabilidad | Error) {
      await setup([perfilActivo], UserRole.ADMIN, r);
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture.nativeElement.querySelector('.rentabilidad-card') as HTMLElement | null;
    }

    it('pide la rentabilidad de la cuenta y muestra recuperado, perfiles vendidos y lo que falta', async () => {
      const card = await render(rentabilidadBase);

      expect(api.rentabilidad).toHaveBeenCalledWith('cta-1');
      const text = card!.textContent!.replace(/\s+/g, ' ');
      expect(text).toContain('Cobraste S/ 6.00 de los S/ 10.00 que pagaste');
      expect(text).toContain('Perfiles vendidos: 1 de 2');
      expect(text).toContain('Te faltan S/ 4.00 para recuperar lo que pagaste');
      expect(card!.querySelector('.ganancia.positiva')).toBeNull();
      expect(component['porcentajeRecuperado']()).toBe(60);
    });

    it('con ganancia positiva la muestra en verde y la barra topa en 100%', async () => {
      const card = await render({ ...rentabilidadBase, ingresos: 25, ganancia: 15 });

      const ganancia = card!.querySelector('.ganancia.positiva');
      expect(ganancia?.textContent).toContain('Ya ganaste S/ 15.00');
      expect(card!.textContent).not.toContain('Te faltan');
      expect(component['porcentajeRecuperado']()).toBe(100);
    });

    it('avisa que las ventas por combo no se reparten solo si la cuenta tiene alguna', async () => {
      let card = await render(rentabilidadBase);
      expect(card!.textContent).not.toContain('Aquí no se cuentan las ventas de combos');

      TestBed.resetTestingModule();
      card = await render({ ...rentabilidadBase, ventasCombo: 2 });
      expect(card!.textContent).toContain('Aquí no se cuentan las ventas de combos');
    });

    it('en un servicio sin perfiles muestra el estado de la cuenta completa en vez de N/M perfiles', async () => {
      const card = await render({
        ...rentabilidadBase,
        usaPerfiles: false,
        perfilesTotal: 0,
        perfilesVendidos: 0,
      });

      expect(card!.textContent).not.toContain('Perfiles vendidos');
      expect(card!.textContent).toContain('Cuenta completa');
      expect(card!.textContent).toContain('sin vender');
    });

    it('si la rentabilidad falla, no muestra la tarjeta pero el resto del detalle carga', async () => {
      const card = await render(new Error('boom'));

      expect(card).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('cuenta@correo.com');
    });
  });

  describe('pagos al proveedor', () => {
    async function render() {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('lista compra y renovaciones con fecha, tipo, lo pagado en soles (y en su moneda) y método', async () => {
      await render();

      expect(api.pagosProveedor).toHaveBeenCalledWith('cta-1');
      const filas = Array.from(
        fixture.nativeElement.querySelectorAll('.pagos-table tr.mat-mdc-row') as NodeListOf<HTMLElement>,
      ).map((tr) =>
        Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.replace(/\s+/g, ' ').trim()),
      );
      expect(filas).toEqual([
        ['01/02/2026', 'Renovación', 'S/ 19.00 (5.00 USD)', 'Binance'],
        ['01/01/2026', 'Compra', 'S/ 10.00', 'Yape'],
      ]);
    });

    it('si no se pueden cargar, lo avisa en la sección sin tapar el resto del detalle', async () => {
      await setup();
      api.pagosProveedor.mockRejectedValue(new Error('500'));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los pagos al proveedor.');
      expect(fixture.nativeElement.textContent).toContain('cuenta@correo.com');
    });

    it('la rentabilidad muestra el desglose: compra + renovaciones', async () => {
      await setup([perfilActivo], UserRole.ADMIN, {
        ...rentabilidadBase,
        costo: 84,
        desgloseCosto: { compraInicial: 40, renovaciones: 44, cantidadRenovaciones: 2 },
      });
      await fixture.whenStable();
      fixture.detectChanges();

      const card: HTMLElement = fixture.nativeElement.querySelector('.rentabilidad-card');
      expect(card.textContent!.replace(/\s+/g, ' ')).toContain('Compra: S/ 40.00 · 2 renovaciones: S/ 44.00');
    });

    it('sin renovaciones, el desglose lo dice', async () => {
      await render();

      const card: HTMLElement = fixture.nativeElement.querySelector('.rentabilidad-card');
      expect(card.textContent!.replace(/\s+/g, ' ')).toContain('Compra: S/ 10.00 · Sin renovaciones todavía');
    });
  });

  describe('renovar con el proveedor', () => {
    function botonRenovar(): HTMLButtonElement | undefined {
      return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Renovar con el proveedor'),
      );
    }

    it('abre el diálogo con la cuenta y, al renovar, avisa la nueva fecha y recarga el detalle', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      dialog.open.mockReturnValue({ afterClosed: () => of({ ...cuenta, fechaFin: '2026-03-01' }) });

      botonRenovar()!.click();

      expect(dialog.open).toHaveBeenCalledWith(CuentaRenovarProveedorDialog, {
        data: {
          cuentaId: 'cta-1',
          correo: 'cuenta@correo.com',
          servicioNombre: 'Netflix',
          fechaFin: '2026-02-01',
        },
      });
      expect(snackBar.open).toHaveBeenCalledWith(
        'Cuenta renovada. Ahora vence con el proveedor el 01/03/2026.',
        'Cerrar',
        expect.anything(),
      );
      await fixture.whenStable();
      expect(api.findOne).toHaveBeenCalledTimes(2);
      expect(api.pagosProveedor).toHaveBeenCalledTimes(2);
      expect(api.rentabilidad).toHaveBeenCalledTimes(2);
    });

    it('si se cancela, no recarga nada', async () => {
      await setup();
      await fixture.whenStable();
      fixture.detectChanges();
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

      botonRenovar()!.click();

      expect(snackBar.open).not.toHaveBeenCalled();
      expect(api.findOne).toHaveBeenCalledTimes(1);
    });

    it('una cuenta desactivada no ofrece renovar', async () => {
      await setup([perfilActivo], UserRole.ADMIN, rentabilidadBase, { ...cuenta, activo: false });
      await fixture.whenStable();
      fixture.detectChanges();

      expect(botonRenovar()).toBeUndefined();
    });
  });
});
