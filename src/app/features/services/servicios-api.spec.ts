import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ServiciosApi } from './servicios-api';
import { ServiceType } from './servicio.model';

describe('ServiciosApi', () => {
  const baseUrl = `${environment.apiUrl}/services`;
  let api: ServiciosApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ServiciosApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista sin filtros', async () => {
    const promise = api.list();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('lista con filtros de tipo y activo', async () => {
    const promise = api.list({ tipo: ServiceType.IPTV, activo: true });
    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('tipo') === 'IPTV' && r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea un servicio', async () => {
    const payload = {
      nombre: 'Netflix',
      tipo: ServiceType.CON_PERFILES,
      duracionMeses: 1,
      pantallasMax: 4,
      precioBase: 10,
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, activo: true, createdAt: '', updatedAt: '' });
    await promise;
  });

  it('desactiva (soft delete) con DELETE', async () => {
    const promise = api.deactivate('abc');
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    await promise;
  });

  it('reactiva con PATCH /:id/reactivate', async () => {
    const promise = api.reactivate('abc');
    const req = httpMock.expectOne(`${baseUrl}/abc/reactivate`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
    await promise;
  });
});
