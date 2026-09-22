import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServicioFormDialog } from './servicio-form-dialog';
import { ServiciosApi } from '../servicios-api';
import { ServiceType } from '../servicio.model';

describe('ServicioFormDialog', () => {
  let fixture: ComponentFixture<ServicioFormDialog>;
  let component: ServicioFormDialog;
  let api: { create: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { create: vi.fn() };
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
      pantallasMax: null,
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
      pantallasMax: null,
      precioBase: 10,
    });

    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el servicio. Intenta de nuevo.');
  });
});
