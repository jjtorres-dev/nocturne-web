import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { SearchApi } from './search-api';
import type { SearchResponse } from './search-result.model';

describe('SearchApi', () => {
  const baseUrl = `${environment.apiUrl}/search`;
  let api: SearchApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(SearchApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('busca con el término como query param q', () => {
    const respuesta: SearchResponse = {
      contactos: [],
      cuentas: [],
      servicios: [],
      combos: [],
      ventas: [],
      ventasCombo: [],
      gastos: [],
    };
    let recibido: SearchResponse | undefined;
    api.search('netflix').subscribe((r) => (recibido = r));

    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('q') === 'netflix',
    );
    expect(req.request.method).toBe('GET');
    req.flush(respuesta);

    expect(recibido).toEqual(respuesta);
  });
});
