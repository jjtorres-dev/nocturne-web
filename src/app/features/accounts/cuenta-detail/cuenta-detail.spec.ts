import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentaDetail } from './cuenta-detail';
import { CuentasApi } from '../cuentas-api';
import { type Cuenta } from '../cuenta.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';
import { PerfilesApi } from '../profiles/perfiles-api';
import { type Perfil } from '../profiles/perfil.model';

describe('CuentaDetail', () => {
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
    createdAt: '',
    updatedAt: '',
  };
  const proveedor: Contacto = {
    id: 'prov-1',
    nombre: 'Proveedor Uno',
    whatsapp: '+51999999999',
    tipo: ContactType.PROVEEDOR,
    activo: true,
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

  let fixture: ComponentFixture<CuentaDetail>;
  let component: CuentaDetail;
  let api: { findOne: ReturnType<typeof vi.fn>; deactivate: ReturnType<typeof vi.fn>; reactivate: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let perfilesApi: { list: ReturnType<typeof vi.fn> };

  async function setup(perfiles: Perfil[] = [perfilActivo]) {
    api = {
      findOne: vi.fn().mockResolvedValue(cuenta),
      deactivate: vi.fn().mockResolvedValue({ ...cuenta, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...cuenta, activo: true }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([proveedor]) };
    perfilesApi = { list: vi.fn().mockResolvedValue(perfiles) };

    await TestBed.configureTestingModule({
      imports: [CuentaDetail],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: PerfilesApi, useValue: perfilesApi },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
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
    expect(fixture.nativeElement.textContent).toContain('máximo de pantallas');
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
});
