import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { DashboardApi } from './dashboard-api';

describe('DashboardApi', () => {
  let api: DashboardApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DashboardApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('pide el inventario con GET /dashboard/inventario', async () => {
    const promise = api.inventario();
    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/inventario`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await promise;
  });
});
