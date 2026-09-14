import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { PerfilesApi } from './perfiles-api';

describe('PerfilesApi', () => {
  const baseUrl = `${environment.apiUrl}/accounts/cta-1/profiles`;
  let api: PerfilesApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PerfilesApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista los perfiles de una cuenta', async () => {
    const promise = api.list('cta-1', { activo: true });
    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea un perfil', async () => {
    const payload = { nombre: 'Perfil 1', pin: '1234' };
    const promise = api.create('cta-1', payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'p1', ...payload, activo: true });
    await promise;
  });

  it('actualiza un perfil con PATCH', async () => {
    const payload = { nombre: 'Perfil 1' };
    const promise = api.update('cta-1', 'p1', payload);
    const req = httpMock.expectOne(`${baseUrl}/p1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'p1', ...payload, activo: true });
    await promise;
  });

  it('desactiva (soft delete) con DELETE', async () => {
    const promise = api.deactivate('cta-1', 'p1');
    const req = httpMock.expectOne(`${baseUrl}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    await promise;
  });

  it('reactiva con PATCH /:id/reactivate', async () => {
    const promise = api.reactivate('cta-1', 'p1');
    const req = httpMock.expectOne(`${baseUrl}/p1/reactivate`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
    await promise;
  });
});
