import { UserRole } from '../../core/auth/auth';

export { UserRole };

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.REVENDEDOR]: 'Revendedor',
};

export interface Usuario {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

// role ausente = "no tocar el rol" (el propio usuario editándose a sí mismo
// no debe mandar esta clave ni con el mismo valor: el backend da 403 si
// `role` viene definido y el id coincide con el usuario autenticado, sin
// importar si el valor es distinto o el mismo).
export interface UpdateUsuarioPayload {
  name?: string;
  role?: UserRole;
  password?: string;
}
