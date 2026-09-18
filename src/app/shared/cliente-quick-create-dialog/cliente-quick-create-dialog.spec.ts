import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ClienteQuickCreateDialog } from './cliente-quick-create-dialog';
import { ContactosApi } from '../../features/contacts/contactos-api';
import { ContactType } from '../../features/contacts/contacto.model';

describe('ClienteQuickCreateDialog', () => {
  let fixture: ComponentFixture<ClienteQuickCreateDialog>;
  let component: ClienteQuickCreateDialog;
  let api: { create: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { create: vi.fn().mockResolvedValue({ id: 'contacto-nuevo' }) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ClienteQuickCreateDialog],
      providers: [
        { provide: ContactosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteQuickCreateDialog);
    component = fixture.componentInstance;
  });

  it('crea el contacto con tipo CLIENTE_FINAL y cierra con el resultado', async () => {
    component.form.setValue({ nombre: 'Juan Pérez', whatsapp: '+51999999999' });

    await component.submit();

    expect(api.create).toHaveBeenCalledWith({
      nombre: 'Juan Pérez',
      whatsapp: '+51999999999',
      tipo: ContactType.CLIENTE_FINAL,
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'contacto-nuevo' });
  });

  it('no envía el formulario si falta el nombre o el whatsapp', async () => {
    await component.submit();

    expect(api.create).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('muestra un error si la creación falla', async () => {
    api.create.mockRejectedValue(new Error('falló'));
    component.form.setValue({ nombre: 'Juan Pérez', whatsapp: '+51999999999' });

    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo crear el cliente. Intenta de nuevo.');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancela sin crear nada', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
