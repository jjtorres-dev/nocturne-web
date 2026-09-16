import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CombosApi } from './combos-api';

describe('CombosApi', () => {
  const baseUrl = `${environment.apiUrl}/combos`;
  let api: CombosApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(CombosApi);
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

  it('lista con filtro de activo', async () => {
    const promise = api.list({ activo: true });
    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea un combo', async () => {
    const payload = {
      nombre: 'Combo Netflix + Disney',
      servicioIds: ['srv-1', 'srv-2'],
      precioCombo: 20,
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, servicios: [], activo: true, createdAt: '', updatedAt: '' });
    await promise;
  });

  it('actualiza un combo con PATCH', async () => {
    const payload = {
      nombre: 'Combo actualizado',
      servicioIds: ['srv-1', 'srv-2'],
      precioCombo: 25,
    };
    const promise = api.update('abc', payload);
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('PATCH');
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
