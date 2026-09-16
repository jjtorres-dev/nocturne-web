import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.setItem('nocturne_access_token', 'expired-token');
    localStorage.setItem('nocturne_refresh_token', 'refresh-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('reintenta la petición original con el token nuevo tras un refresh exitoso', () => {
    let result: unknown;
    http.get(`${environment.apiUrl}/protected`).subscribe((res) => (result = res));

    const firstReq = httpMock.expectOne(`${environment.apiUrl}/protected`);
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-token' });
    refreshReq.flush({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });

    const retryReq = httpMock.expectOne(`${environment.apiUrl}/protected`);
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it('no dispara un segundo refresh en paralelo si ya hay uno en curso', () => {
    const results: unknown[] = [];
    http.get(`${environment.apiUrl}/a`).subscribe((res) => results.push(res));
    http.get(`${environment.apiUrl}/b`).subscribe((res) => results.push(res));

    httpMock
      .expectOne(`${environment.apiUrl}/a`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${environment.apiUrl}/b`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReqs = httpMock.match(`${environment.apiUrl}/auth/refresh`);
    expect(refreshReqs.length).toBe(1);
    refreshReqs[0].flush({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });

    httpMock.expectOne(`${environment.apiUrl}/a`).flush({ from: 'a' });
    httpMock.expectOne(`${environment.apiUrl}/b`).flush({ from: 'b' });

    expect(results).toEqual([{ from: 'a' }, { from: 'b' }]);
  });

  it('redirige a /login con sesión expirada y propaga el error cuando el refresh también falla', () => {
    let error: unknown;
    http.get(`${environment.apiUrl}/protected`).subscribe({ error: (err) => (error = err) });

    const firstReq = httpMock.expectOne(`${environment.apiUrl}/protected`);
    firstReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
    refreshReq.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(error).toMatchObject({ status: 401 });
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { sessionExpired: '1' },
    });
    expect(localStorage.getItem('nocturne_access_token')).toBeNull();
    expect(localStorage.getItem('nocturne_refresh_token')).toBeNull();
  });
});
