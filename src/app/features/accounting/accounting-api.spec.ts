import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AccountingApi } from './accounting-api';
import { TimelineGroupBy } from './accounting.model';

describe('AccountingApi', () => {
  const baseUrl = `${environment.apiUrl}/accounting`;
  let api: AccountingApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AccountingApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('summary sin desde/hasta no manda esos query params', async () => {
    const promise = api.summary();
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${baseUrl}/summary` &&
        !r.params.has('desde') &&
        !r.params.has('hasta'),
    );
    expect(req.request.method).toBe('GET');
    req.flush({ ingresos: 0, inversion: 0, gastos: 0, ganancia: 0 });
    await promise;
  });

  it('summary con desde/hasta los manda como query params', async () => {
    const promise = api.summary({ desde: '2026-01-01', hasta: '2026-01-31' });
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${baseUrl}/summary` &&
        r.params.get('desde') === '2026-01-01' &&
        r.params.get('hasta') === '2026-01-31',
    );
    req.flush({ ingresos: 0, inversion: 0, gastos: 0, ganancia: 0 });
    await promise;
  });

  it('by-service hace GET a /accounting/by-service', async () => {
    const promise = api.byService();
    const req = httpMock.expectOne(`${baseUrl}/by-service`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('by-payment-method hace GET a /accounting/by-payment-method', async () => {
    const promise = api.byPaymentMethod();
    const req = httpMock.expectOne(`${baseUrl}/by-payment-method`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('timeline manda groupBy cuando se especifica', async () => {
    const promise = api.timeline({ groupBy: TimelineGroupBy.WEEK });
    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/timeline` && r.params.get('groupBy') === 'week',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });

  it('timeline sin groupBy no manda ese query param', async () => {
    const promise = api.timeline();
    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}/timeline` && !r.params.has('groupBy'),
    );
    req.flush([]);
    await promise;
  });
});
