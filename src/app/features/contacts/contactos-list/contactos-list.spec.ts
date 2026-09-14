import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactosList } from './contactos-list';
import { ContactosApi } from '../contactos-api';
import { ContactType, type Contacto } from '../contacto.model';

describe('ContactosList', () => {
  const contacto: Contacto = {
    id: '1',
    nombre: 'Juan',
    whatsapp: '+51999999999',
    tipo: ContactType.CLIENTE_FINAL,
    activo: true,
    createdAt: '',
    updatedAt: '',
  };
  const contactoInactivo: Contacto = { ...contacto, id: '2', activo: false };

  let fixture: ComponentFixture<ContactosList>;
  let component: ContactosList;
  let api: {
    list: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    reactivate: ReturnType<typeof vi.fn>;
  };
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = {
      list: vi.fn().mockResolvedValue([contacto]),
      deactivate: vi.fn().mockResolvedValue({ ...contacto, activo: false }),
      reactivate: vi.fn().mockResolvedValue({ ...contactoInactivo, activo: true }),
    };
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContactosList],
      providers: [
        { provide: ContactosApi, useValue: api },
        { provide: MatDialog, useValue: dialog },
        {
          provide: MatSnackBar,
          useValue: { open: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactosList);
    component = fixture.componentInstance;
  });

  it('carga los contactos al iniciar', async () => {
    await fixture.whenStable();

    expect(api.list).toHaveBeenCalledWith({ tipo: undefined, activo: true });
    expect(component.contactos()).toEqual([contacto]);
  });

  it('desactiva un contacto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmDeactivate(contacto);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.deactivate).toHaveBeenCalledWith('1');
  });

  it('reactiva un contacto tras confirmar', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(true) });

    component.confirmReactivate(contactoInactivo);
    await Promise.resolve();
    await Promise.resolve();

    expect(api.reactivate).toHaveBeenCalledWith('2');
  });

  it('no reactiva si se cancela la confirmación', async () => {
    await fixture.whenStable();
    dialog.open.mockReturnValue({ afterClosed: () => of(false) });

    component.confirmReactivate(contactoInactivo);
    await Promise.resolve();

    expect(api.reactivate).not.toHaveBeenCalled();
  });

  it('muestra el botón Reactivar en filas inactivas y Desactivar en las activas', async () => {
    api.list.mockResolvedValue([contacto, contactoInactivo]);

    await fixture.whenStable();
    fixture.detectChanges();

    const iconNames: string[] = Array.from(
      fixture.nativeElement.querySelectorAll('td.mat-column-acciones mat-icon'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(iconNames).toEqual(['edit', 'block', 'edit', 'restart_alt']);
  });
});
