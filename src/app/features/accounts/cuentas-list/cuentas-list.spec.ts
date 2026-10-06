import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentasList } from './cuentas-list';
import { CuentasApi } from '../cuentas-api';
import { type CuentaListItem } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { Auth, UserRole } from '../../../core/auth/auth';

describe('CuentasList', () => {
  const owner = { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' };
  const servicio: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 5,
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
  const cuenta: CuentaListItem = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: 'prov-1',
    clienteId: null,
    correo: 'cuenta@correo.com',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    costo: 10,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    fechaCaida: null,
    perfilesCount: 2,
    owner,
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<CuentasList>;
  let component: CuentasList;
  let api: { list: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let router: Router;
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = { list: vi.fn().mockResolvedValue([cuenta]) };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([proveedor]) };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role }) };

    await TestBed.configureTestingModule({
      imports: [CuentasList],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: Auth, useValue: auth },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        // Enrutador real: cada fila lleva un enlace (routerLink) al detalle.
        provideRouter([{ path: '**', children: [] }]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(CuentasList);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    await setup();
  });

  it('carga cuentas, servicios y proveedores al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({
      servicioId: undefined,
      proveedorId: undefined,
      activo: true,
    });
    expect(component.cuentas()).toEqual([cuenta]);
    expect(component.servicios()).toEqual([servicio]);
    expect(component.proveedores()).toEqual([proveedor]);
  });

  it('filtra proveedores por tipo=PROVEEDOR', async () => {
    await fixture.whenStable();
    expect(contactosApi.list).toHaveBeenCalledWith({
      tipo: ContactType.PROVEEDOR,
    });
  });

  it('no muestra las credenciales en el listado', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('claveServicio');
    expect(fixture.nativeElement.textContent).not.toContain('claveCorreo');
  });

  it('muestra la cantidad de perfiles como "2/5"', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('2/5');
  });

  it('navega al detalle al hacer click en una fila', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tr.clickable-row');
    row.click();

    expect(router.navigate).toHaveBeenCalledWith(['/accounts', 'cta-1']);
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

  it('muestra el ícono del servicio al que pertenece la cuenta', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cell: HTMLElement = fixture.nativeElement.querySelector('td.mat-column-servicio');
    expect(cell.querySelector('app-service-icon')).not.toBeNull();
    expect(cell.textContent).toContain(servicio.nombre);
  });

  it('muestra el estado vacío cuando no hay resultados', async () => {
    api.list.mockResolvedValue([]);
    await fixture.whenStable();
    fixture.detectChanges();

    const empty: HTMLElement | null = fixture.nativeElement.querySelector('app-empty-state');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toContain('No hay cuentas con estos filtros.');
    expect(empty?.textContent).toContain('Prueba cambiando o quitando los filtros.');
  });

  it('no muestra el estado vacío cuando hay resultados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('una cuenta caída lleva su chip y la fila marcada', async () => {
    await setup();
    api.list.mockResolvedValue([{ ...cuenta, fechaCaida: '2026-10-01' }]);
    await fixture.whenStable();
    await component.refresh();
    fixture.detectChanges();

    const fila: HTMLElement = fixture.nativeElement.querySelector('tr.clickable-row');
    expect(fila.classList).toContain('fila-caida');
    expect(fila.querySelector('app-cuenta-caida-chip')?.textContent).toContain('Cuenta caída');
  });

  it('cada fila tiene un enlace real al detalle, además del clic', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    const enlace = fixture.nativeElement.querySelector('tr.clickable-row a[mat-icon-button]');
    expect(enlace.getAttribute('href')).toBe('/accounts/cta-1');
  });

  it('si la carga falla muestra el aviso con "Reintentar"', async () => {
    await setup();
    api.list.mockRejectedValue(new Error('sin red'));
    await fixture.whenStable();
    await component.refresh();
    fixture.detectChanges();

    const aviso: HTMLElement = fixture.nativeElement.querySelector('.nc-lista-error');
    expect(aviso.textContent).toContain('No se pudieron cargar las cuentas.');
    expect(aviso.querySelector('button')?.textContent).toContain('Reintentar');
  });
});
