import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { GastosApi } from './gastos-api';
import { Moneda } from '../sales/venta.model';

describe('GastosApi', () => {
  const baseUrl = `${environment.apiUrl}/expenses`;
  let api: GastosApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(GastosApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista con filtro de activo', async () => {
    const promise = api.list({ activo: false });
    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('activo') === 'false',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea un gasto', async () => {
    const payload = {
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, tasaCambio: 1, montoPEN: 50, activo: true, createdAt: '', updatedAt: '' });
    await promise;
  });

  it('actualiza un gasto con PATCH', async () => {
    const payload = {
      descripcion: 'Hosting',
      monto: 60,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    };
    const promise = api.update('abc', payload);
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({});
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
