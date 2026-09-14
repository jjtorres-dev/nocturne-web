import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Perfil, PerfilFilters, PerfilPayload } from './perfil.model';

const baseUrl = (cuentaId: string) =>
  `${environment.apiUrl}/accounts/${cuentaId}/profiles`;

@Service()
export class PerfilesApi {
  private readonly http = inject(HttpClient);

  list(cuentaId: string, filters: PerfilFilters = {}): Promise<Perfil[]> {
    let params = new HttpParams();
    if (filters.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }
    return firstValueFrom(
      this.http.get<Perfil[]>(baseUrl(cuentaId), { params }),
    );
  }

  create(cuentaId: string, payload: PerfilPayload): Promise<Perfil> {
    return firstValueFrom(this.http.post<Perfil>(baseUrl(cuentaId), payload));
  }

  update(
    cuentaId: string,
    id: string,
    payload: PerfilPayload,
  ): Promise<Perfil> {
    return firstValueFrom(
      this.http.patch<Perfil>(`${baseUrl(cuentaId)}/${id}`, payload),
    );
  }

  deactivate(cuentaId: string, id: string): Promise<Perfil> {
    return firstValueFrom(
      this.http.delete<Perfil>(`${baseUrl(cuentaId)}/${id}`),
    );
  }

  reactivate(cuentaId: string, id: string): Promise<Perfil> {
    return firstValueFrom(
      this.http.patch<Perfil>(`${baseUrl(cuentaId)}/${id}/reactivate`, {}),
    );
  }
}
