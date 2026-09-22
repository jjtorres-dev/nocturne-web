import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactoFormDialog } from './contacto-form-dialog';
import { ContactosApi } from '../contactos-api';
import { ContactType } from '../contacto.model';

describe('ContactoFormDialog', () => {
  let fixture: ComponentFixture<ContactoFormDialog>;
  let component: ContactoFormDialog;
  let api: { create: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { create: vi.fn() };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactoFormDialog],
      providers: [
        { provide: ContactosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactoFormDialog);
    component = fixture.componentInstance;
  });

  it('muestra el mensaje real del backend (ej. una validación de whatsapp), no el genérico', async () => {
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: ['whatsapp must be a valid phone number'] },
      }),
    );
    component.form.setValue({
      nombre: 'Juan Pérez',
      whatsapp: '123',
      tipo: ContactType.CLIENTE_FINAL,
    });

    await component.submit();

    expect(component.errorMessage()).toBe('whatsapp must be a valid phone number');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    api.create.mockRejectedValue(new Error('network down'));
    component.form.setValue({
      nombre: 'Juan Pérez',
      whatsapp: '+51999999999',
      tipo: ContactType.CLIENTE_FINAL,
    });

    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el contacto. Intenta de nuevo.');
  });
});
