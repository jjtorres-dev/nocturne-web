import { Service } from '@angular/core';

const STORAGE_KEY_PREFIX = 'nocturne_ultimo_metodo_pago_';

// Recuerda el último método de pago usado por cada usuario (localStorage,
// clave por userId para no mezclar sesiones distintas en el mismo
// navegador/perfil). Se lee como valor inicial en los formularios de CREAR
// (cuenta-form-dialog, venta-create-dialog, venta-combo-create,
// gasto-form-dialog); en editar siempre gana el valor ya guardado del
// registro, nunca esto. Se graba cada vez que cualquiera de esos 6
// formularios (los 4 de arriba + venta-edit-dialog y
// venta-combo-edit-dialog) guarda con éxito: tanto crear como editar
// representan un método de pago realmente usado.
@Service()
export class UltimoMetodoPago {
  get(userId: string): string | null {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    } catch {
      return null;
    }
  }

  set(userId: string, metodoPago: string): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, metodoPago);
    } catch {
      // Almacenamiento no disponible (modo privado, cuota llena...): no es
      // crítico, el formulario sigue funcionando sin recordar el valor.
    }
  }
}
