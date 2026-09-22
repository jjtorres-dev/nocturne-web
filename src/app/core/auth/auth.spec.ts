import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empieza sin usuario autenticado', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('login guarda accessToken y refreshToken por separado', async () => {
    const promise = service.login('admin@nocturne.dev', 'password123');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: '1', email: 'admin@nocturne.dev', name: 'Admin', role: 'admin' },
    });

    await promise;

    expect(service.getAccessToken()).toBe('access-1');
    expect(service.getRefreshToken()).toBe('refresh-1');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout revoca el refreshToken en el servidor antes de limpiar el estado local', async () => {
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');
    localStorage.setItem(
      'nocturne_user',
      JSON.stringify({ id: '1', email: 'a@a.com', name: 'A', role: 'admin' }),
    );

    const promise = service.logout();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.body).toEqual({ refreshToken: 'refresh-1' });
    req.flush({ message: 'Sesión cerrada' });

    await promise;

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('logout limpia el estado local aunque la revocación en el servidor falle', async () => {
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');

    const promise = service.logout();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    req.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

    await promise;

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('refreshAccessToken comparte una única petición HTTP entre llamadas concurrentes', () => {
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');

    const results: string[] = [];
    service.refreshAccessToken().subscribe((token) => results.push(token));
    service.refreshAccessToken().subscribe((token) => results.push(token));

    const requests = httpMock.match(`${environment.apiUrl}/auth/refresh`);
    expect(requests.length).toBe(1);
    requests[0].flush({ accessToken: 'access-2', refreshToken: 'refresh-2' });

    expect(results).toEqual(['access-2', 'access-2']);
    expect(service.getAccessToken()).toBe('access-2');
    expect(service.getRefreshToken()).toBe('refresh-2');
  });

  it('refreshAccessToken limpia la sesión y redirige a login cuando el refresh falla', () => {
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');

    let error: unknown;
    service.refreshAccessToken().subscribe({ error: (err) => (error = err) });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeDefined();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { sessionExpired: '1' },
    });
  });

  it('changePassword envía PATCH /auth/change-password con la contraseña actual y la nueva', async () => {
    const promise = service.changePassword('vieja-1234', 'nueva-5678');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      currentPassword: 'vieja-1234',
      newPassword: 'nueva-5678',
    });
    req.flush({ message: 'Contraseña actualizada' });

    await expect(promise).resolves.toBeUndefined();
  });

  it('changePassword propaga el 400 del backend sin tocar la sesión', async () => {
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');

    const promise = service.changePassword('mal', 'nueva-5678');
    httpMock
      .expectOne(`${environment.apiUrl}/auth/change-password`)
      .flush(
        { message: 'La contraseña actual no es correcta' },
        { status: 400, statusText: 'Bad Request' },
      );

    await expect(promise).rejects.toMatchObject({ status: 400 });
    expect(service.getAccessToken()).toBe('access-1');
    expect(service.getRefreshToken()).toBe('refresh-1');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('logout("passwordChanged") hace el mismo logout y redirige a /login con ?passwordChanged=1 (no sessionExpired)', async () => {
    localStorage.setItem('nocturne_access_token', 'access-1');
    localStorage.setItem('nocturne_refresh_token', 'refresh-1');

    const promise = service.logout('passwordChanged');
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.body).toEqual({ refreshToken: 'refresh-1' });
    req.flush({ message: 'Sesión cerrada' });
    await promise;

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { passwordChanged: '1' },
    });
  });
});
