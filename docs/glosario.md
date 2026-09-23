# Glosario de textos del panel

Referencia para cualquier texto visible nuevo o modificado. El panel lo usa un revendedor de streaming, no un contador ni un programador: español de Perú, simple, sin palabras técnicas, y **siempre los mismos términos** en todas las pantallas.

Esto aplica solo a textos visibles. Los nombres de variables, campos de la API y rutas (`precioBase`, `costo`, `inversion`, `activo`, `/accounts`…) no cambian para seguir el glosario.

## Lo que se compra y lo que se vende

| Término | Significa | No usar |
|---|---|---|
| **Cuenta** | Lo que **compras al proveedor**: un correo y una contraseña de Netflix, Disney+, etc. | "suscripción" |
| **Perfil** | Lo que **vendes a tu cliente**: un perfil dentro de una cuenta. | "pantalla" |
| **Cupo** | En un plan familiar, cada lugar del plan que le vendes a un cliente. En el sistema funciona como un perfil. | "miembro", "invitación" |
| **Cuenta completa** | Cuando la cuenta entera es para un solo cliente, sin dividirla en perfiles (también IPTV). | "sin perfiles" |
| **Servicio** | Lo que vendes y a cuánto: Netflix, Disney+, etc. (catálogo). | — |
| **Proveedor** | A quién le compras las cuentas. | — |
| **Cliente** | A quién le vendes. | "cliente final" |

### Tipos de servicio ("Cómo lo vendes")

| Tipo | Texto |
|---|---|
| `CON_PERFILES` | Por perfiles (una cuenta, varios clientes) |
| `FAMILIAR` | Plan familiar (por cupos) |
| `SIN_PERFILES` | Cuenta completa (un cliente por cuenta) |
| `IPTV` | IPTV (cuenta completa) |

"Perfiles por cuenta" (o "Cupos del plan" en plan familiar) solo aparece en los tipos que se venden por perfil.

## Dinero

| Término | Significa | No usar |
|---|---|---|
| **Precio de venta** | Lo que **cobras a tu cliente** (por perfil, por cupo, por la cuenta o por el combo). | "precio base" |
| **Precio cobrado** / **Cobrado** | Lo que efectivamente te pagó el cliente en una venta o renovación. | "precio", "ingreso" |
| **Costo de la cuenta** | Lo que **pagaste al proveedor** por la cuenta completa (no por perfil) al comprarla. | "costo" solo, "inversión" |
| **Costo de la renovación** | Lo que le pagaste al proveedor por un nuevo periodo de la cuenta. Puede ser distinto del costo de la cuenta. | "precio de renovación" (eso es lo que cobras al cliente) |
| **Pagos al proveedor** | Todo lo que pagaste al proveedor por una cuenta: la **Compra** y cada **Renovación**. | "inversiones" |
| **Otros gastos** | Lo que anotas en Gastos (publicidad, comisiones…). El costo de las cuentas no va ahí. | "gastos operativos" |
| **Tipo de cambio a soles** | Cuántos soles vale 1 unidad de otra moneda (ej.: 1 dólar = 3.75). | "tasa de cambio" |
| **Moneda** | Se muestra con código y nombre: "USD – Dólares". | solo el código |
| **Método de pago** | Con qué se pagó. En Cuentas: con qué le pagaste al proveedor. En Ventas: con qué te pagó el cliente. | — |

### Contabilidad

| Término | Significa | No usar |
|---|---|---|
| **Cobrado a clientes** | Todo lo que te pagaron los clientes (ventas y renovaciones) en el rango, en soles. | "ingresos" |
| **Pagado a proveedores** | Lo que les pagaste a tus proveedores en el rango, por comprar cuentas y por renovarlas (según el día en que pagaste, no el día en que registraste la cuenta). | "inversión" |
| **Ganancia** | Cobrado − pagado a proveedores − otros gastos. | "utilidad" |
| **Ganancia (sin otros gastos)** | En la tabla por servicio, porque los otros gastos no son de un servicio en particular. | "ganancia" a secas en esa tabla |
| **Te quedó** | Por método de pago: cobrado − otros gastos. No incluye lo pagado a proveedores. | "neto" |

## Fechas y estados

| Término | Significa | No usar |
|---|---|---|
| **Vence** / **vencimiento** | Cuándo termina algo. | "fecha de fin" |
| **Desde** | Cuándo empieza una venta. | "fecha de inicio" (en ventas) |
| **Fecha de compra** | Cuándo empezó la cuenta con el proveedor. | "fecha de inicio" (en cuentas) |
| **Vence con el proveedor** | Cuándo tienes que renovar o volver a pagar la cuenta. Se usa para no confundirlo con el vencimiento del cliente. | "fecha de fin" |
| **Renovar con el proveedor** | Registrar que le pagaste al proveedor otro periodo de la cuenta: guarda el pago y la nueva fecha en que vence. No confundir con **Renovar** una venta (eso es cobrarle al cliente). | "renovar" solo, en Cuentas |
| **Fecha de pago** | Cuándo le pagaste al proveedor. Es la fecha que usa Contabilidad. | — |
| **Vence ahora el** | La nueva fecha en que vence la cuenta con el proveedor después de renovarla. | "nueva fecha de fin" |
| **Vigente / Finalizada** | Estado de una venta (o venta de combo). | "activo/inactivo" en ventas |
| **Finalizar venta** | Deja libre el perfil o la cuenta para otro cliente. Lo cobrado sigue contando en Contabilidad. | "desactivar", "anular" |
| **Activo / Inactivo, Desactivar / Reactivar** | Solo en catálogos y registros (servicios, cuentas, perfiles, contactos, combos, gastos, usuarios). No se borra nada: deja de aparecer para usar. | "eliminar", "borrar" |

## Acceso y datos del cliente

| Término | Significa | No usar |
|---|---|---|
| **Correo** | Siempre "correo", también en el login y en Usuarios. | "email", "mail" |
| **Correo de la cuenta** | El correo con el que se entra a la plataforma. Así no se confunde con el correo del cliente. | "correo" solo, en Cuentas |
| **Contraseña de la cuenta** | La que se usa para entrar a Netflix, Disney+, etc. Es la que se le pasa al cliente. | "clave del servicio", "clave" |
| **Contraseña del correo** | La del Gmail/Outlook de la cuenta, para recibir códigos. **No se le pasa al cliente.** | "clave del correo" |
| **PIN del perfil** | El código que protege un perfil. | — |
| **Enlace de acceso** | La página para entrar, si el proveedor la dio. | "URL", "link" |
| **Copiar datos para el cliente** | Arma el texto con servicio, correo, contraseña, perfil y vencimiento para pegarlo en WhatsApp. | "portapapeles" |

## Estilo

- **Tuteo.** "Escribe cuánto pagaste", "Te faltan S/ 4.00", "Inténtalo de nuevo".
- **Los mensajes de error dicen qué hacer.** "Escribe tu precio de venta.", mejor que "El precio es obligatorio.".
- **Los estados vacíos dicen el siguiente paso.** "No tienes cuentas de este servicio. Regístralas en Cuentas."
- **Las confirmaciones dicen qué pasa con lo que ya existe.** "Sus ventas anteriores no se borran."
- **Los errores genéricos terminan en "Inténtalo de nuevo."**, siempre igual.
- **Hints cortos** (una línea): `mat-hint` dentro del campo.
- **Explicaciones largas o conceptos que se confunden** (precio vs. costo, las dos contraseñas, tipo de cambio, términos de Contabilidad): botón ⓘ con `app-info-toggle` + `app-info-hint` (`src/app/shared/info-hint/`). Se abre y se cierra con click o toque, así funciona en celular. **No usar tooltips con hover para explicar campos.**
