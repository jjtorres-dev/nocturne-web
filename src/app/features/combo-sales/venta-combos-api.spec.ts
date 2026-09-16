import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { VentaCombosApi } from './venta-combos-api';
import { Moneda } from '../sales/venta.model';

describe('VentaCombosApi', () => {
  const baseUrl = `${environment.apiUrl}/combo-sales`;
  let api: VentaCombosApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(VentaCombosApi);
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

  it('lista con filtros de cliente, combo y activo', async () => {
    const promise = api.list({
      clienteId: 'cli-1',
      comboId: 'combo-1',
      activo: true,
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('clienteId') === 'cli-1' &&
        r.params.get('comboId') === 'combo-1' &&
        r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('obtiene el detalle', async () => {
    const promise = api.findOne('vc-1');
    const req = httpMock.expectOne(`${baseUrl}/vc-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
    await promise;
  });

  it('crea una venta de combo', async () => {
    const payload = {
      clienteId: 'cli-1',
      comboId: 'combo-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      duracionMeses: 1,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
      asignaciones: [{ servicioId: 'srv-1', cuentaId: 'cta-1' }],
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'vc-1', codigoVenta: 'C-00001' });
    await promise;
  });

  it('actualiza con PATCH', async () => {
    const promise = api.update('vc-1', { precio: 30 });
    const req = httpMock.expectOne(`${baseUrl}/vc-1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
    await promise;
  });

  it('desactiva (soft delete) con DELETE', async () => {
    const promise = api.deactivate('vc-1');
    const req = httpMock.expectOne(`${baseUrl}/vc-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    await promise;
  });

  it('reactiva con PATCH /:id/reactivate', async () => {
    const promise = api.reactivate('vc-1');
    const req = httpMock.expectOne(`${baseUrl}/vc-1/reactivate`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
    await promise;
  });

  it('renueva con POST /:id/renew', async () => {
    const promise = api.renew('vc-1');
    const req = httpMock.expectOne(`${baseUrl}/vc-1/renew`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    await promise;
  });
});
