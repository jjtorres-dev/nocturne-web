import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { VentasApi } from './ventas-api';
import { Moneda, VencimientoFiltro } from './venta.model';

describe('VentasApi', () => {
  const baseUrl = `${environment.apiUrl}/sales`;
  let api: VentasApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(VentasApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('lista con filtros de cliente, servicio y activo', async () => {
    const promise = api.list({
      clienteId: 'cli-1',
      servicioId: 'srv-1',
      activo: true,
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('clienteId') === 'cli-1' &&
        r.params.get('servicioId') === 'srv-1' &&
        r.params.get('activo') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('crea una venta', async () => {
    const payload = {
      clienteId: 'cli-1',
      cuentaId: 'cta-1',
      perfilId: 'per-1',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-02-01',
      precio: 15,
      moneda: Moneda.PEN,
      metodoPago: 'Yape',
    };
    const promise = api.create(payload);
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: '1', ...payload, activo: true });
    await promise;
  });

  it('actualiza una venta con PATCH', async () => {
    const payload = { precio: 20, moneda: Moneda.USD };
    const promise = api.update('abc', payload);
    const req = httpMock.expectOne(`${baseUrl}/abc`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'abc' });
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

  it('renueva con POST /:id/renew, sin body si no se pasa nada', async () => {
    const promise = api.renew('abc');
    const req = httpMock.expectOne(`${baseUrl}/abc/renew`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ id: 'abc', fechaFin: '2026-03-01' });
    await promise;
  });

  it('renueva con POST /:id/renew mandando el body (precio, moneda, tasaCambio, metodoPago) — nunca fechaFin', async () => {
    const payload = { precio: 20, moneda: Moneda.USD, tasaCambio: 3.75, metodoPago: 'Plin' };
    const promise = api.renew('abc', payload);
    const req = httpMock.expectOne(`${baseUrl}/abc/renew`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.body.fechaFin).toBeUndefined();
    req.flush({ id: 'abc', fechaFin: '2026-03-01' });
    await promise;
  });

  it('lista con filtros de vencimiento y diasAlerta', async () => {
    const promise = api.list({
      vencimiento: VencimientoFiltro.POR_VENCER,
      diasAlerta: 5,
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('vencimiento') === 'por_vencer' &&
        r.params.get('diasAlerta') === '5',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('obtiene el resumen con GET /summary', async () => {
    const promise = api.summary(4);
    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/summary` && r.params.get('diasAlerta') === '4',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ vencidas: 1, porVencer: 2, alDia: 3 });
    await promise;
  });

  it('summary sin diasAlerta no manda el query param', async () => {
    const promise = api.summary();
    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/summary` && !r.params.has('diasAlerta'),
    );
    req.flush({ vencidas: 0, porVencer: 0, alDia: 0 });
    await promise;
  });
});
