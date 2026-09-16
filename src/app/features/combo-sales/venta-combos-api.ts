import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateVentaComboPayload,
  UpdateVentaComboPayload,
  VentaCombo,
  VentaComboFilters,
} from './venta-combo.model';

const BASE_URL = `${environment.apiUrl}/combo-sales`;

@Service()
export class VentaCombosApi {
  private readonly http = inject(HttpClient);

  list(filters: VentaComboFilters = {}): Promise<VentaCombo[]> {
    let params = new HttpParams();
    if (filters.clienteId) {
      params = params.set('clienteId', filters.clienteId);
    }
    if (filters.comboId) {
      params = params.set('comboId', filters.comboId);
    }
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<VentaCombo[]>(BASE_URL, { params }));
  }

  findOne(id: string): Promise<VentaCombo> {
    return firstValueFrom(this.http.get<VentaCombo>(`${BASE_URL}/${id}`));
  }

  create(payload: CreateVentaComboPayload): Promise<VentaCombo> {
    return firstValueFrom(this.http.post<VentaCombo>(BASE_URL, payload));
  }

  update(id: string, payload: UpdateVentaComboPayload): Promise<VentaCombo> {
    return firstValueFrom(
      this.http.patch<VentaCombo>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<VentaCombo> {
    return firstValueFrom(this.http.delete<VentaCombo>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<VentaCombo> {
    return firstValueFrom(
      this.http.patch<VentaCombo>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }

  renew(id: string): Promise<VentaCombo> {
    return firstValueFrom(
      this.http.post<VentaCombo>(`${BASE_URL}/${id}/renew`, {}),
    );
  }
}
