import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Combo, ComboFilters, ComboPayload } from './combo.model';

const BASE_URL = `${environment.apiUrl}/combos`;

@Service()
export class CombosApi {
  private readonly http = inject(HttpClient);

  list(filters: ComboFilters = {}): Promise<Combo[]> {
    let params = new HttpParams();
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<Combo[]>(BASE_URL, { params }));
  }

  findOne(id: string): Promise<Combo> {
    return firstValueFrom(this.http.get<Combo>(`${BASE_URL}/${id}`));
  }

  create(payload: ComboPayload): Promise<Combo> {
    return firstValueFrom(this.http.post<Combo>(BASE_URL, payload));
  }

  update(id: string, payload: ComboPayload): Promise<Combo> {
    return firstValueFrom(this.http.patch<Combo>(`${BASE_URL}/${id}`, payload));
  }

  deactivate(id: string): Promise<Combo> {
    return firstValueFrom(this.http.delete<Combo>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Combo> {
    return firstValueFrom(
      this.http.patch<Combo>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
