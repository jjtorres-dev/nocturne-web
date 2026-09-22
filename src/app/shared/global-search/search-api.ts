import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { SearchResponse } from './search-result.model';

const BASE_URL = `${environment.apiUrl}/search`;

@Service()
export class SearchApi {
  private readonly http = inject(HttpClient);

  // Devuelve el Observable crudo, a diferencia del resto de los *Api de este
  // repo (que envuelven en Promise con firstValueFrom): GlobalSearch necesita
  // que switchMap pueda cancelar la petición anterior in-flight cuando el
  // usuario sigue escribiendo, y eso solo funciona desuscribiendo el
  // Observable de HttpClient — envuelto en Promise ya no se puede cancelar.
  search(q: string): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(BASE_URL, {
      params: new HttpParams().set('q', q),
    });
  }
}
