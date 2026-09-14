import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CuentasApi } from './cuentas-api';

describe('CuentasApi', () => {
  const baseUrl = `${environment.apiUrl}/accounts`;
  let api: CuentasApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CuentasApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista con filtros de servicio, proveedor y activo', async () => {
    const promise = api.list({
      servicioId: 'srv-1',
      proveedorId: 'prov-1',
      activo: true,
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('servicioId') === 'srv-1' &&
        r.params.get('proveedorId') === 'prov-1' &&
        r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('obtiene el detalle de una cuenta', async () => {
    const promise = api.findOne('abc');
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'abc' });
    await promise;
  });

  it('crea una cuenta', async () => {
    const payload = {
      servicioId: 'srv-1',
      correo: 'a@b.com',
      claveServicio: 'secreta',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      costo: 10,
      metodoPago: 'Yape',
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, activo: true });
    await promise;
  });

  it('actualiza una cuenta con PATCH', async () => {
    const payload = {
      servicioId: 'srv-1',
      correo: 'a@b.com',
      claveServicio: 'secreta',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      costo: 10,
      metodoPago: 'Yape',
    };
    const promise = api.update('abc', payload);
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'abc', ...payload, activo: true });
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
