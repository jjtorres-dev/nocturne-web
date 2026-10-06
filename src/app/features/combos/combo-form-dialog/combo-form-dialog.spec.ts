import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComboFormDialog } from './combo-form-dialog';
import { CombosApi } from '../combos-api';
import { type Combo } from '../combo.model';
import { ServiciosApi } from '../../services/servicios-api';
import { ServiceType, type Servicio } from '../../services/servicio.model';

describe('ComboFormDialog', () => {
  const servicioA: Servicio = {
    id: 'srv-1',
    nombre: 'Netflix',
    tipo: ServiceType.CON_PERFILES,
    duracionMeses: 1,
    pantallasMax: 4,
    precioBase: 10,
    activo: true,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };
  const servicioB: Servicio = { ...servicioA, id: 'srv-2', nombre: 'Disney+' };
  const servicioC: Servicio = { ...servicioA, id: 'srv-3', nombre: 'HBO Max' };

  let fixture: ComponentFixture<ComboFormDialog>;
  let component: ComboFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let serviciosApi: { list: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  async function setup(data: { combo?: Combo } = {}) {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'c-1', nombre: 'Combo' }),
      update: vi.fn().mockResolvedValue({ id: 'c-1', nombre: 'Combo' }),
    };
    serviciosApi = {
      list: vi.fn().mockResolvedValue([servicioA, servicioB, servicioC]),
    };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ComboFormDialog],
      providers: [
        { provide: CombosApi, useValue: api },
        { provide: ServiciosApi, useValue: serviciosApi },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboFormDialog);
    component = fixture.componentInstance;
  }

  it('carga los servicios activos al iniciar', async () => {
    await setup();
    await fixture.whenStable();

    expect(serviciosApi.list).toHaveBeenCalledWith({ activo: true });
    expect(component.servicios()).toEqual([servicioA, servicioB, servicioC]);
  });

  it('rechaza guardar con menos de 2 servicios seleccionados', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      nombre: 'Combo',
      servicioIds: ['srv-1'],
      precioCombo: 20,
    });

    expect(component.form.invalid).toBe(true);
    expect(
      component.form.controls.servicioIds.hasError('minArrayLength'),
    ).toBe(true);
  });

  it('crea el combo con los servicios elegidos', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      nombre: 'Combo Netflix + Disney',
      servicioIds: ['srv-1', 'srv-2'],
      precioCombo: 20,
    });

    await component.submit();

    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Combo Netflix + Disney',
        servicioIds: ['srv-1', 'srv-2'],
        precioCombo: 20,
      }),
    );
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'c-1', nombre: 'Combo' });
  });

  it('quitar un servicio elegido lo saca del formulario', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({ servicioIds: ['srv-1', 'srv-2', 'srv-3'] });
    component.removeServicio('srv-2');

    expect(component.form.controls.servicioIds.value).toEqual(['srv-1', 'srv-3']);
  });

  it('al editar, precarga nombre, descripción, servicios y precio del combo', async () => {
    const combo: Combo = {
      id: 'c-1',
      nombre: 'Combo existente',
      descripcion: 'Descripción existente',
      servicios: [servicioA, servicioB],
      precioCombo: 30,
      activo: true,
      owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
      createdAt: '',
      updatedAt: '',
    };
    await setup({ combo });
    await fixture.whenStable();

    expect(component.form.controls.nombre.value).toBe('Combo existente');
    expect(component.form.controls.descripcion.value).toBe('Descripción existente');
    expect(component.form.controls.servicioIds.value).toEqual(['srv-1', 'srv-2']);
    expect(component.form.controls.precioCombo.value).toBe(30);

    component.form.patchValue({ precioCombo: 35 });
    await component.submit();

    expect(api.update).toHaveBeenCalledWith(
      'c-1',
      expect.objectContaining({ precioCombo: 35 }),
    );
  });

  it('muestra el mensaje real del backend (ej. nombre duplicado), no el genérico', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Ya existe un combo con ese nombre.' },
      }),
    );

    component.form.patchValue({
      nombre: 'Combo Netflix + Disney',
      servicioIds: ['srv-1', 'srv-2'],
      precioCombo: 20,
    });
    await component.submit();

    expect(component.errorMessage()).toBe('Ya existe un combo con ese nombre.');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(new Error('network down'));

    component.form.patchValue({
      nombre: 'Combo Netflix + Disney',
      servicioIds: ['srv-1', 'srv-2'],
      precioCombo: 20,
    });
    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el combo. Inténtalo de nuevo.');
  });

  it('con datos faltantes no guarda: marca los campos para que cada uno diga qué le falta', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const guardar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(guardar.disabled).toBe(false);

    await component.submit();
    fixture.detectChanges();

    expect(api.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('Selecciona al menos 2 servicios.');
  });

  it('mientras cargan los servicios lo dice con una línea visible', async () => {
    await setup();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cargando')?.textContent).toContain(
      'Cargando servicios…',
    );
  });
});
