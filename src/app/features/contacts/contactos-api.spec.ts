import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ContactosApi } from './contactos-api';
import { ContactType } from './contacto.model';

describe('ContactosApi', () => {
  const baseUrl = `${environment.apiUrl}/contacts`;
  let api: ContactosApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ContactosApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista con filtros de tipo y activo', async () => {
    const promise = api.list({ tipo: ContactType.PROVEEDOR, activo: false });
    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('tipo') === 'PROVEEDOR' && r.params.get('activo') === 'false',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea un contacto', async () => {
    const payload = {
      nombre: 'Juan',
      whatsapp: '+51999999999',
      tipo: ContactType.CLIENTE_FINAL,
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
