import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { InventarioItem } from './inventario.model';

const BASE_URL = `${environment.apiUrl}/dashboard`;

@Service()
export class DashboardApi {
  private readonly http = inject(HttpClient);

  inventario(): Promise<InventarioItem[]> {
    return firstValueFrom(
      this.http.get<InventarioItem[]>(`${BASE_URL}/inventario`),
    );
  }
}
