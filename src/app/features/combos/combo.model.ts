import type { Servicio } from '../services/servicio.model';

export interface Combo {
  id: string;
  nombre: string;
  descripcion: string | null;
  servicios: Servicio[];
  precioCombo: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComboPayload {
  nombre: string;
  descripcion?: string;
  servicioIds: string[];
  precioCombo: number;
}

export interface ComboFilters {
  activo?: boolean;
}
