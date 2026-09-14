import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Contacto,
  ContactoFilters,
  ContactoPayload,
} from './contacto.model';

const BASE_URL = `${environment.apiUrl}/contacts`;

@Service()
export class ContactosApi {
  private readonly http = inject(HttpClient);

  list(filters: ContactoFilters = {}): Promise<Contacto[]> {
    let params = new HttpParams();
    if (filters.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<Contacto[]>(BASE_URL, { params }));
  }

  create(payload: ContactoPayload): Promise<Contacto> {
    return firstValueFrom(this.http.post<Contacto>(BASE_URL, payload));
  }

  update(id: string, payload: ContactoPayload): Promise<Contacto> {
    return firstValueFrom(
      this.http.patch<Contacto>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<Contacto> {
    return firstValueFrom(this.http.delete<Contacto>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Contacto> {
    return firstValueFrom(
      this.http.patch<Contacto>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
