import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Servicio,
  ServicioFilters,
  ServicioPayload,
} from './servicio.model';

const BASE_URL = `${environment.apiUrl}/services`;

@Service()
export class ServiciosApi {
  private readonly http = inject(HttpClient);

  list(filters: ServicioFilters = {}): Promise<Servicio[]> {
    let params = new HttpParams();
    if (filters.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<Servicio[]>(BASE_URL, { params }));
  }

  create(payload: ServicioPayload): Promise<Servicio> {
    return firstValueFrom(this.http.post<Servicio>(BASE_URL, payload));
  }

  update(id: string, payload: ServicioPayload): Promise<Servicio> {
    return firstValueFrom(
      this.http.patch<Servicio>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<Servicio> {
    return firstValueFrom(this.http.delete<Servicio>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Servicio> {
    return firstValueFrom(
      this.http.patch<Servicio>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
