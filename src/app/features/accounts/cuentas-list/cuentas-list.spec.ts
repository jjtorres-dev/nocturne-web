import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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
  let router: { navigate: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  async function setup(role: UserRole = UserRole.ADMIN) {
    TestBed.resetTestingModule();
    api = { list: vi.fn().mockResolvedValue([cuenta]) };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([proveedor]) };
    router = { navigate: vi.fn() };
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
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

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
});
