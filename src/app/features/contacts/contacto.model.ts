import type { Owner } from '../../shared/owner.model';

export enum ContactType {
  CLIENTE_FINAL = 'CLIENTE_FINAL',
  PROVEEDOR = 'PROVEEDOR',
  REVENDEDOR = 'REVENDEDOR',
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.CLIENTE_FINAL]: 'Cliente',
  [ContactType.PROVEEDOR]: 'Proveedor',
  [ContactType.REVENDEDOR]: 'Revendedor (te compra para revender)',
};

export interface Contacto {
  id: string;
  nombre: string;
  whatsapp: string;
  tipo: ContactType;
  activo: boolean;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface ContactoPayload {
  nombre: string;
  whatsapp: string;
  tipo: ContactType;
}

export interface ContactoFilters {
  tipo?: ContactType;
  activo?: boolean;
}
