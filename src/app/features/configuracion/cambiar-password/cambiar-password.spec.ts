import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { CambiarPassword } from './cambiar-password';

describe('CambiarPassword', () => {
  const CHANGE_URL = `${environment.apiUrl}/auth/change-password`;
  const LOGOUT_URL = `${environment.apiUrl}/auth/logout`;

  let fixture: ComponentFixture<CambiarPassword>;
  let component: CambiarPassword;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn>; dismiss: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');
    localStorage.setItem(
      'nocturne_user',
      JSON.stringify({ id: 'u-1', email: 'rosa@nocturne.dev', name: 'Rosa', role: 'revendedor' }),
    );
    router = { navigate: vi.fn() };
    snackBar = { open: vi.fn(), dismiss: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CambiarPassword],
      providers: [
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarPassword);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function fill(currentPassword: string, newPassword: string, confirmPassword = newPassword) {
    component.form.setValue({ currentPassword, newPassword, confirmPassword });
    fixture.detectChanges();
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function alertText(): string | null {
    // El texto del aviso, sin el nombre de su ícono.
    return (
      fixture.nativeElement.querySelector('[role="alert"] > span')?.textContent?.trim() ?? null
    );
  }

  it('tiene los tres campos y avisa que se cerrarán todas las sesiones', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('input[type="password"]').length).toBe(3);
    expect(el.textContent).toContain('Contraseña actual');
    expect(el.textContent).toContain('Nueva contraseña');
    expect(el.textContent).toContain('Confirmar nueva contraseña');
    expect(el.textContent).toContain('se cerrará tu sesión en todos los dispositivos');
  });

  it('un envío exitoso dispara el logout y redirige a /login con ?passwordChanged=1 (no sessionExpired)', async () => {
    fill('vieja-1234', 'nueva-5678');
    expect(submitButton().disabled).toBe(false);

    submitButton().click();

    const change = httpMock.expectOne(CHANGE_URL);
    expect(change.request.method).toBe('PATCH');
    expect(change.request.body).toEqual({
      currentPassword: 'vieja-1234',
      newPassword: 'nueva-5678',
    });
    // Todavía no se cerró la sesión: primero responde el backend.
    expect(router.navigate).not.toHaveBeenCalled();
    change.flush({ message: 'Contraseña actualizada' });

    // Mismo flujo de logout de siempre: revoca el refresh token y limpia.
    const logout = await vi.waitFor(() => httpMock.expectOne(LOGOUT_URL));
    expect(logout.request.body).toEqual({ refreshToken: 'refresh-1' });
    logout.flush({ message: 'Sesión cerrada' });

    await vi.waitFor(() =>
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { passwordChanged: '1' },
      }),
    );
    expect(localStorage.getItem('nocturne_access_token')).toBeNull();
    expect(localStorage.getItem('nocturne_refresh_token')).toBeNull();
    expect(localStorage.getItem('nocturne_user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('con la contraseña actual incorrecta muestra el error y NO cierra la sesión', async () => {
    fill('mal-1234', 'nueva-5678');

    void component.submit();
    httpMock
      .expectOne(CHANGE_URL)
      .flush(
        { statusCode: 400, message: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    fixture.detectChanges();

    expect(alertText()).toBe('La contraseña actual no es correcta');
    expect(snackBar.open).toHaveBeenCalledWith(
      'La contraseña actual no es correcta',
      'Cerrar',
      expect.anything(),
    );
    // Sin logout: ni request al backend, ni redirect, ni sesión limpiada.
    httpMock.expectNone(LOGOUT_URL);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('nocturne_access_token')).toBe('access-1');
    expect(localStorage.getItem('nocturne_refresh_token')).toBe('refresh-1');
    // El formulario sigue disponible para reintentar.
    expect(submitButton().disabled).toBe(false);
  });

  it('al reintentar descarta el snackbar del error anterior, para que no quede sobre /login', async () => {
    fill('mal-1234', 'nueva-5678');
    void component.submit();
    httpMock
      .expectOne(CHANGE_URL)
      .flush(
        { message: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    snackBar.dismiss.mockClear();

    fill('vieja-1234', 'nueva-5678');
    void component.submit();

    expect(snackBar.dismiss).toHaveBeenCalledTimes(1);
    httpMock.expectOne(CHANGE_URL).flush({ message: 'ok' });
    const logout = await vi.waitFor(() => httpMock.expectOne(LOGOUT_URL));
    logout.flush({});
    await vi.waitFor(() => expect(router.navigate).toHaveBeenCalled());
  });

  it('con demasiados intentos (429) muestra el mensaje del backend y no cierra la sesión', async () => {
    fill('vieja-1234', 'nueva-5678');

    void component.submit();
    httpMock.expectOne(CHANGE_URL).flush(
      {
        statusCode: 429,
        message:
          'Demasiados intentos de cambio de contraseña. Espera un minuto antes de volver a intentar.',
      },
      { status: 429, statusText: 'Too Many Requests' },
    );
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    fixture.detectChanges();

    expect(alertText()).toBe(
      'Demasiados intentos de cambio de contraseña. Espera un minuto antes de volver a intentar.',
    );
    httpMock.expectNone(LOGOUT_URL);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('nocturne_refresh_token')).toBe('refresh-1');
  });

  it('un error inesperado (500) muestra un mensaje genérico y tampoco cierra la sesión', async () => {
    fill('vieja-1234', 'nueva-5678');

    void component.submit();
    httpMock
      .expectOne(CHANGE_URL)
      .flush('boom', { status: 500, statusText: 'Internal Server Error' });
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    fixture.detectChanges();

    expect(alertText()).toBe('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    httpMock.expectNone(LOGOUT_URL);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('nocturne_refresh_token')).toBe('refresh-1');
  });

  it('si la confirmación no coincide se detiene antes de llamar al backend', async () => {
    fill('vieja-1234', 'nueva-5678', 'otra-distinta');

    await component.submit();
    fixture.detectChanges();

    httpMock.expectNone(CHANGE_URL);
    httpMock.expectNone(LOGOUT_URL);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);
    expect(component.form.controls.confirmPassword.hasError('mismatch')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Las contraseñas no coinciden.');
    // El botón sigue respondiendo: al presionarlo, el campo dice qué falta.
    expect(submitButton().disabled).toBe(false);
  });

  it('revalida la confirmación cuando cambia la nueva contraseña', () => {
    fill('vieja-1234', 'nueva-5678', 'nueva-5678');
    expect(component.form.controls.confirmPassword.hasError('mismatch')).toBe(false);

    component.form.controls.newPassword.setValue('nueva-9999');

    expect(component.form.controls.confirmPassword.hasError('mismatch')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('no envía con la nueva contraseña de menos de 8 caracteres ni con campos vacíos', async () => {
    fill('vieja-1234', 'corta');
    await component.submit();
    fill('', 'nueva-5678');
    await component.submit();

    httpMock.expectNone(CHANGE_URL);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('el aviso de demasiados intentos lleva un reloj; los demás errores, el ícono de error', async () => {
    const icono = () =>
      fixture.nativeElement.querySelector('[role="alert"] mat-icon')?.textContent?.trim();

    fill('vieja-1234', 'nueva-5678');
    void component.submit();
    httpMock
      .expectOne(CHANGE_URL)
      .flush(
        { statusCode: 429, message: 'Demasiados intentos.' },
        { status: 429, statusText: 'Too Many Requests' },
      );
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    fixture.detectChanges();
    expect(icono()).toBe('timer');

    void component.submit();
    httpMock
      .expectOne(CHANGE_URL)
      .flush(
        { statusCode: 400, message: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );
    await vi.waitFor(() => expect(component.saving()).toBe(false));
    fixture.detectChanges();
    expect(icono()).toBe('error');
  });

  it('cada contraseña se escribe oculta y su ojo la deja ver', () => {
    const campos = () =>
      Array.from(fixture.nativeElement.querySelectorAll('input[formcontrolname]')).map(
        (i) => (i as HTMLInputElement).type,
      );
    expect(campos()).toEqual(['password', 'password', 'password']);

    const ojos: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button.ver-password'),
    );
    ojos[1].click();
    fixture.detectChanges();

    expect(campos()).toEqual(['password', 'text', 'password']);
    expect(ojos[1].getAttribute('aria-pressed')).toBe('true');
  });
});
