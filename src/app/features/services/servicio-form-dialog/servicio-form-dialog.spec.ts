import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServicioFormDialog } from './servicio-form-dialog';
import { ServiciosApi } from '../servicios-api';
import { ServiceType } from '../servicio.model';

describe('ServicioFormDialog', () => {
  let fixture: ComponentFixture<ServicioFormDialog>;
  let component: ServicioFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { create: vi.fn(), update: vi.fn() };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ServicioFormDialog],
      providers: [
        { provide: ServiciosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioFormDialog);
    component = fixture.componentInstance;
  });

  it('muestra el mensaje real del backend (ej. nombre duplicado), no el genérico', async () => {
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Ya existe un servicio con ese nombre.' },
      }),
    );
    component.form.setValue({
      nombre: 'Netflix',
      tipo: ServiceType.CON_PERFILES,
      duracionMeses: 1,
      pantallasMax: 4,
      precioBase: 10,
    });

    await component.submit();

    expect(component.errorMessage()).toBe('Ya existe un servicio con ese nombre.');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    api.create.mockRejectedValue(new Error('network down'));
    component.form.setValue({
      nombre: 'Netflix',
      tipo: ServiceType.CON_PERFILES,
      duracionMeses: 1,
      pantallasMax: 4,
      precioBase: 10,
    });

    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el servicio. Inténtalo de nuevo.');
  });

  function label(): string {
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('mat-label'))
      .map((el) => (el as HTMLElement).textContent?.trim())
      .join('|');
  }

  it('"Por perfiles": muestra "Perfiles por cuenta" y lo exige', () => {
    component.form.patchValue({ tipo: ServiceType.CON_PERFILES, pantallasMax: null });

    expect(label()).toContain('Perfiles por cuenta');
    expect(label()).toContain('Precio de venta por perfil');
    expect(component.form.controls.pantallasMax.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('"Plan familiar": el campo pasa a ser "Cupos del plan" y también es obligatorio', () => {
    component.form.patchValue({ tipo: ServiceType.FAMILIAR, pantallasMax: null });

    expect(label()).toContain('Cupos del plan');
    expect(label()).not.toContain('Perfiles por cuenta');
    expect(label()).toContain('Precio de venta por cupo');
    expect(component.form.controls.pantallasMax.hasError('required')).toBe(true);
  });

  it.each([ServiceType.SIN_PERFILES, ServiceType.IPTV])(
    '%s: oculta el campo, no lo exige y manda pantallasMax vacío',
    async (tipo) => {
      api.create.mockResolvedValue({});
      component.form.patchValue({
        nombre: 'Servicio',
        tipo,
        duracionMeses: 1,
        pantallasMax: 4,
        precioBase: 10,
      });

      expect(label()).not.toContain('Perfiles por cuenta');
      expect(label()).not.toContain('Cupos del plan');
      expect(label()).toContain('Precio de venta de la cuenta');
      expect(component.form.valid).toBe(true);

      await component.submit();

      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo, pantallasMax: null }),
      );
    },
  );

  it('el ícono ⓘ muestra y oculta la explicación del precio con un click', () => {
    fixture.detectChanges();
    const precioToggle = (): HTMLButtonElement =>
      Array.from(
        fixture.nativeElement.querySelectorAll('app-info-toggle button'),
      ).at(-1) as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).not.toContain('No es lo que pagas al proveedor');

    precioToggle().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No es lo que pagas al proveedor');
    expect(precioToggle().getAttribute('aria-expanded')).toBe('true');

    precioToggle().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('No es lo que pagas al proveedor');
  });

  it('con datos faltantes no guarda: marca los campos para que cada uno diga qué le falta', async () => {
    fixture.detectChanges();
    const guardar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(guardar.disabled).toBe(false);

    await component.submit();
    fixture.detectChanges();

    expect(api.create).not.toHaveBeenCalled();
    expect(component.form.controls.nombre.touched).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
  });
});
