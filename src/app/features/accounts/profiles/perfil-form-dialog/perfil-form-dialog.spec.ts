import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PerfilFormDialog } from './perfil-form-dialog';
import { PerfilesApi } from '../perfiles-api';

describe('PerfilFormDialog', () => {
  let fixture: ComponentFixture<PerfilFormDialog>;
  let component: PerfilFormDialog;
  let api: { create: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { create: vi.fn() };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PerfilFormDialog],
      providers: [
        { provide: PerfilesApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { accountId: 'cta-1' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilFormDialog);
    component = fixture.componentInstance;
  });

  it('muestra el mensaje real del backend (ej. cupo de perfiles superado), no el genérico', async () => {
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Esta cuenta ya tiene el máximo de perfiles permitidos.' },
      }),
    );
    component.form.setValue({ nombre: 'Perfil 5', pin: '' });

    await component.submit();

    expect(component.errorMessage()).toBe(
      'Esta cuenta ya tiene el máximo de perfiles permitidos.',
    );
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    api.create.mockRejectedValue(new Error('network down'));
    component.form.setValue({ nombre: 'Perfil 5', pin: '' });

    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el perfil. Intenta de nuevo.');
  });
});
