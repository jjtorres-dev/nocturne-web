import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateUsuarioPayload, UpdateUsuarioPayload, Usuario } from './usuario.model';

const BASE_URL = `${environment.apiUrl}/users`;

@Service()
export class UsuariosApi {
  private readonly http = inject(HttpClient);

  // GET /api/users no acepta filtros por query (a diferencia de Servicios/
  // Contactos/etc.) — el filtro activo/inactivo de la lista se aplica del
  // lado del cliente, sobre esta misma respuesta completa.
  list(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>(BASE_URL));
  }

  create(payload: CreateUsuarioPayload): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>(BASE_URL, payload));
  }

  update(id: string, payload: UpdateUsuarioPayload): Promise<Usuario> {
    return firstValueFrom(
      this.http.patch<Usuario>(`${BASE_URL}/${id}`, payload),
    );
  }

  deactivate(id: string): Promise<Usuario> {
    return firstValueFrom(this.http.delete<Usuario>(`${BASE_URL}/${id}`));
  }

  reactivate(id: string): Promise<Usuario> {
    return firstValueFrom(
      this.http.patch<Usuario>(`${BASE_URL}/${id}/reactivate`, {}),
    );
  }
}
