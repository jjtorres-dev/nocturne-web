import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Gasto, GastoFilters, GastoPayload } from './expense.model';

const BASE_URL = `${environment.apiUrl}/expenses`;

@Service()
export class GastosApi {
  private readonly http = inject(HttpClient);

  list(filters: GastoFilters = {}): Promise<Gasto[]> {
    let params = new HttpParams();
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<Gasto[]>(BASE_URL, { params }));
  }

  create(payload: GastoPayload): Promise<Gasto> {
    return firstValueFrom(this.http.post<Gasto>(BASE_URL, payload));
  }

  update(id: string, payload: GastoPayload): Promise<Gasto> {
    return firstValueFrom(this.http.patch<Gasto>(`${BASE_URL}/${id}`, payload));
  }

  deactivate(id: string): Promise<Gasto> {
    return firstValueFrom(this.http.delete<Gasto>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Gasto> {
    return firstValueFrom(
      this.http.patch<Gasto>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
