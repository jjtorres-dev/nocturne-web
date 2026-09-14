export enum ContactType {
  CLIENTE_FINAL = 'CLIENTE_FINAL',
  PROVEEDOR = 'PROVEEDOR',
  REVENDEDOR = 'REVENDEDOR',
}

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.CLIENTE_FINAL]: 'Cliente final',
  [ContactType.PROVEEDOR]: 'Proveedor',
  [ContactType.REVENDEDOR]: 'Revendedor',
};

export interface Contacto {
  id: string;
  nombre: string;
  whatsapp: string;
  tipo: ContactType;
  activo: boolean;
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
