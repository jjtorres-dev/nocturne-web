import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CuentaFormDialog } from './cuenta-form-dialog';
import { CuentasApi } from '../cuentas-api';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { ContactType, type Contacto } from '../../contacts/contacto.model';

describe('CuentaFormDialog', () => {
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

  let fixture: ComponentFixture<CuentaFormDialog>;
  let component: CuentaFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let contactosApi: { list: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  async function setup(data: { cuenta?: unknown } = {}) {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'cta-1' }),
      update: vi.fn().mockResolvedValue({ id: 'cta-1' }),
    };
    serviciosApi = { list: vi.fn().mockResolvedValue([servicio]) };
    contactosApi = { list: vi.fn().mockResolvedValue([proveedor]) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CuentaFormDialog],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: ContactosApi, useValue: contactosApi },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaFormDialog);
    component = fixture.componentInstance;
  }

  it('carga solo servicios y proveedores activos', async () => {
    await setup();
    await fixture.whenStable();

    expect(serviciosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(contactosApi.list).toHaveBeenCalledWith({
      tipo: ContactType.PROVEEDOR,
      activo: true,
    });
    expect(component.servicios()).toEqual([servicio]);
    expect(component.proveedores()).toEqual([proveedor]);
  });

  it('la clave del servicio está oculta hasta presionar el botón de mostrar', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input[formcontrolname="claveServicio"]',
    );
    expect(input.type).toBe('password');

    component.toggleClaveServicio();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  it('marca inválido el form si fechaFin no es posterior a fechaInicio', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      servicioId: 'srv-1',
      correo: 'a@b.com',
      claveServicio: 'secreta',
      fechaInicio: '2026-02-01',
      fechaFin: '2026-01-01',
      costo: 10,
      metodoPago: 'Yape',
    });

    expect(component.form.hasError('fechaFinInvalida')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('crea una cuenta con el payload del formulario', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      servicioId: 'srv-1',
      correo: 'a@b.com',
      claveServicio: 'secreta',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      costo: 10,
      metodoPago: 'Yape',
    });

    await component.submit();

    expect(api.create).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'cta-1' });
  });

  it('al elegir el servicio, autocompleta costo con precioBase y fechaFin si ya hay fechaInicio', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({ fechaInicio: '2026-01-01' });
    component.form.patchValue({ servicioId: 'srv-1' });

    expect(component.form.controls.costo.value).toBe(10);
    expect(component.form.controls.fechaFin.value).toBe('2026-02-01');
  });

  it('recalcula fechaFin si cambia fechaInicio con el servicio ya elegido', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({ servicioId: 'srv-1' });
    component.form.patchValue({ fechaInicio: '2026-03-10' });

    expect(component.form.controls.fechaFin.value).toBe('2026-04-10');
  });

  it('el autocompletado no impide editar fechaFin ni costo a mano', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({ fechaInicio: '2026-01-01' });
    component.form.patchValue({ servicioId: 'srv-1' });
    component.form.patchValue({ fechaFin: '2026-06-01', costo: 99 });

    expect(component.form.controls.fechaFin.value).toBe('2026-06-01');
    expect(component.form.controls.costo.value).toBe(99);
  });

  it('precarga los datos de la cuenta en modo edición', async () => {
    const cuenta = {
      id: 'cta-1',
      servicioId: 'srv-1',
      proveedorId: 'prov-1',
      correo: 'a@b.com',
      claveServicio: 'secreta',
      claveCorreo: null,
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
    await setup({ cuenta });
    await fixture.whenStable();

    expect(component.isEdit).toBe(true);
    expect(component.form.controls.correo.value).toBe('a@b.com');
    expect(component.form.controls.claveServicio.value).toBe('secreta');
  });
});
