import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Cuenta,
  CuentaCaida,
  CuentaFilters,
  CuentaListItem,
  CuentaPayload,
  CuentaPorRenovar,
  CuentaRentabilidad,
  CuentaRepuesta,
  PagoProveedor,
  RenovarProveedorPayload,
  ReponerCuentaPayload,
} from './cuenta.model';

const BASE_URL = `${environment.apiUrl}/accounts`;

@Service()
export class CuentasApi {
  private readonly http = inject(HttpClient);

  list(filters: CuentaFilters = {}): Promise<CuentaListItem[]> {
    let params = new HttpParams();
    if (filters.servicioId) {
      params = params.set('servicioId', filters.servicioId);
    }
    if (filters.proveedorId) {
      params = params.set('proveedorId', filters.proveedorId);
    }
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(this.http.get<CuentaListItem[]>(BASE_URL, { params }));
  }

  // Sin `dias` no se manda el param: el backend usa su default (7).
  porRenovar(dias?: number): Promise<CuentaPorRenovar[]> {
    let params = new HttpParams();
    if (dias !== undefined) {
      params = params.set('dias', String(dias));
    }
    return firstValueFrom(
      this.http.get<CuentaPorRenovar[]>(`${BASE_URL}/por-renovar`, { params }),
    );
  }

  rentabilidad(id: string): Promise<CuentaRentabilidad> {
    return firstValueFrom(
      this.http.get<CuentaRentabilidad>(`${BASE_URL}/${id}/rentabilidad`),
    );
  }

  pagosProveedor(id: string): Promise<PagoProveedor[]> {
    return firstValueFrom(
      this.http.get<PagoProveedor[]>(`${BASE_URL}/${id}/provider-payments`),
    );
  }

  // Crea el pago de renovación y mueve la fecha de vencimiento (atómico en
  // el backend). Devuelve la cuenta ya con la nueva fechaFin.
  renovarProveedor(id: string, payload: RenovarProveedorPayload): Promise<Cuenta> {
    return firstValueFrom(
      this.http.post<Cuenta>(`${BASE_URL}/${id}/renew-provider`, payload),
    );
  }

  caidas(): Promise<CuentaCaida[]> {
    return firstValueFrom(this.http.get<CuentaCaida[]>(`${BASE_URL}/caidas`));
  }

  // Marca la cuenta como caída desde ese día ('YYYY-MM-DD', no futuro).
  marcarCaida(id: string, fechaCaida: string): Promise<Cuenta> {
    return firstValueFrom(
      this.http.post<Cuenta>(`${BASE_URL}/${id}/mark-down`, { fechaCaida }),
    );
  }

  // Se marcó por error: quita la marca sin sumar días a nadie.
  quitarMarcaCaida(id: string): Promise<Cuenta> {
    return firstValueFrom(
      this.http.post<Cuenta>(`${BASE_URL}/${id}/unmark-down`, {}),
    );
  }

  // El proveedor repuso la cuenta: guarda las credenciales nuevas y les suma
  // los días a sus clientes (atómico en el backend). No registra ningún pago.
  reponer(id: string, payload: ReponerCuentaPayload): Promise<CuentaRepuesta> {
    return firstValueFrom(
      this.http.post<CuentaRepuesta>(`${BASE_URL}/${id}/restore`, payload),
    );
  }

  findOne(id: string): Promise<Cuenta> {
    return firstValueFrom(this.http.get<Cuenta>(`${BASE_URL}/${id}`));
  }

  create(payload: CuentaPayload): Promise<Cuenta> {
    return firstValueFrom(this.http.post<Cuenta>(BASE_URL, payload));
  }

  update(id: string, payload: CuentaPayload): Promise<Cuenta> {
    return firstValueFrom(
      this.http.patch<Cuenta>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<Cuenta> {
    return firstValueFrom(this.http.delete<Cuenta>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Cuenta> {
    return firstValueFrom(
      this.http.patch<Cuenta>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
