import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateVentaPayload,
  UpdateVentaPayload,
  Venta,
  VentaFilters,
} from './venta.model';

const BASE_URL = `${environment.apiUrl}/sales`;

@Service()
export class VentasApi {
  private readonly http = inject(HttpClient);

  list(filters: VentaFilters = {}): Promise<Venta[]> {
    let params = new HttpParams();
    if (filters.clienteId) {
      params = params.set('clienteId', filters.clienteId);
    }
    if (filters.servicioId) {
      params = params.set('servicioId', filters.servicioId);
    }
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<Venta[]>(BASE_URL, { params }));
  }

  findOne(id: string): Promise<Venta> {
    return firstValueFrom(this.http.get<Venta>(`${BASE_URL}/${id}`));
  }

  create(payload: CreateVentaPayload): Promise<Venta> {
    return firstValueFrom(this.http.post<Venta>(BASE_URL, payload));
  }

  update(id: string, payload: UpdateVentaPayload): Promise<Venta> {
    return firstValueFrom(
      this.http.patch<Venta>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<Venta> {
    return firstValueFrom(this.http.delete<Venta>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Venta> {
    return firstValueFrom(
      this.http.patch<Venta>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }

  renew(id: string): Promise<Venta> {
    return firstValueFrom(
      this.http.post<Venta>(`${BASE_URL}/${id}/renew`, {}),
    );
  }
}
