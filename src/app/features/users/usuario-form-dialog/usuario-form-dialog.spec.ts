import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioFormDialog } from './usuario-form-dialog';
import { UsuariosApi } from '../usuarios-api';
import { Auth } from '../../../core/auth/auth';
import { UserRole, type Usuario } from '../usuario.model';

describe('UsuarioFormDialog', () => {
  let fixture: ComponentFixture<UsuarioFormDialog>;
  let component: UsuarioFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };

  const otroUsuario: Usuario = {
    id: 'user-1',
    email: 'otro@nocturne.dev',
    name: 'Otro',
    role: UserRole.REVENDEDOR,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };

  async function setup(
    data: { usuario?: Usuario } = {},
    loggedInUserId = 'admin-0',
  ) {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'user-new' }),
      update: vi.fn().mockResolvedValue({ id: 'user-1' }),
    };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: loggedInUserId }) };

    await TestBed.configureTestingModule({
      imports: [UsuarioFormDialog],
      providers: [
        { provide: UsuariosApi, useValue: api },
        { provide: Auth, useValue: auth },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioFormDialog);
    component = fixture.componentInstance;
  }

  it('arranca en modo creación, sin isSelf', async () => {
    await setup();
    await fixture.whenStable();

    expect(component.isEdit).toBe(false);
    expect(component.isSelf).toBe(false);
    expect(component.form.controls.role.enabled).toBe(true);
  });

  it('crea un usuario con el payload del formulario', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      email: 'nuevo@nocturne.dev',
      name: 'Nuevo',
      role: UserRole.REVENDEDOR,
      password: 'password123',
    });

    await component.submit();

    expect(api.create).toHaveBeenCalledWith({
      email: 'nuevo@nocturne.dev',
      name: 'Nuevo',
      role: UserRole.REVENDEDOR,
      password: 'password123',
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'user-new' });
  });

  it('no envía el formulario si la contraseña es muy corta al crear', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      email: 'nuevo@nocturne.dev',
      name: 'Nuevo',
      password: 'corta',
    });
    await component.submit();

    expect(api.create).not.toHaveBeenCalled();
  });

  it('precarga los datos del usuario en modo edición (email deshabilitado)', async () => {
    await setup({ usuario: otroUsuario });
    await fixture.whenStable();

    expect(component.isEdit).toBe(true);
    expect(component.form.controls.name.value).toBe('Otro');
    expect(component.form.controls.role.value).toBe(UserRole.REVENDEDOR);
    expect(component.form.controls.email.disabled).toBe(true);
  });

  it('actualiza un usuario ajeno incluyendo el rol, sin mandar password si viene vacío', async () => {
    await setup({ usuario: otroUsuario });
    await fixture.whenStable();

    component.form.patchValue({ name: 'Otro editado', role: UserRole.ADMIN });
    await component.submit();

    expect(api.update).toHaveBeenCalledWith('user-1', {
      name: 'Otro editado',
      role: UserRole.ADMIN,
    });
  });

  it('incluye password en el payload solo si se escribe una nueva', async () => {
    await setup({ usuario: otroUsuario });
    await fixture.whenStable();

    component.form.patchValue({ name: 'Otro', password: 'nuevaClave123' });
    await component.submit();

    expect(api.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ password: 'nuevaClave123' }),
    );
  });

  it('editándose a sí mismo: isSelf=true, el select de rol queda deshabilitado y el payload nunca incluye role', async () => {
    const yoMismo: Usuario = { ...otroUsuario, id: 'admin-0' };
    await setup({ usuario: yoMismo }, 'admin-0');
    await fixture.whenStable();

    expect(component.isSelf).toBe(true);
    expect(component.form.controls.role.disabled).toBe(true);

    component.form.patchValue({ name: 'Yo mismo editado' });
    await component.submit();

    expect(api.update).toHaveBeenCalledWith('admin-0', {
      name: 'Yo mismo editado',
    });
    expect(api.update).not.toHaveBeenCalledWith(
      'admin-0',
      expect.objectContaining({ role: expect.anything() }),
    );
  });

  it('muestra el mensaje real del backend (ej. el 409 de email duplicado), no el genérico', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Ya existe un usuario con ese email.' },
      }),
    );

    component.form.patchValue({
      email: 'nuevo@nocturne.dev',
      name: 'Nuevo',
      role: UserRole.REVENDEDOR,
      password: 'password123',
    });
    await component.submit();

    expect(component.errorMessage()).toBe('Ya existe un usuario con ese email.');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(new Error('network down'));

    component.form.patchValue({
      email: 'nuevo@nocturne.dev',
      name: 'Nuevo',
      role: UserRole.REVENDEDOR,
      password: 'password123',
    });
    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el usuario. Inténtalo de nuevo.');
  });

  it('con datos faltantes no guarda: marca los campos para que cada uno diga qué le falta', async () => {
    await setup();
    fixture.detectChanges();
    const guardar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(guardar.disabled).toBe(false);

    await component.submit();
    fixture.detectChanges();

    expect(api.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Escribe el correo.');
    expect(fixture.nativeElement.textContent).toContain('El nombre es obligatorio.');
    expect(fixture.nativeElement.textContent).toContain('La contraseña es obligatoria.');
  });

  it('la contraseña se escribe oculta y el ojo la deja ver', async () => {
    await setup();
    fixture.detectChanges();
    const campo: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[formcontrolname="password"]',
    );
    expect(campo.type).toBe('password');

    fixture.nativeElement.querySelector('button.ver-password').click();
    fixture.detectChanges();

    expect(campo.type).toBe('text');
  });
});
