// Mismo shape que el `owner: { id, name, email }` que el backend agrega a
// las respuestas de findAllOwned/findOneOwned en todos los módulos con
// ownership (Servicios, Contactos, Cuentas, Ventas, Combos, Ventas Combo,
// Gastos) — nunca el resto de User, ni por accidente el password_hash.
export interface Owner {
  id: string;
  name: string;
  email: string;
}
