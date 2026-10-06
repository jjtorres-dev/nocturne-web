---
version: 1
slug: "accounts-cuenta-detail-cuenta-detail-html-74dcc1f3"
primary_target: "src/app/features/accounts/cuenta-detail/cuenta-detail.html"
related_targets: ["src/app/features/accounts/cuentas-list/cuentas-list.html"]
---

# Cuentas: lista y detalle

## Scope

Modo: Operate. Cubre `features/accounts/cuentas-list`, `features/accounts/cuenta-detail`, `shared/secret-value` y los diálogos que se abren desde ellas (nueva cuenta, editar, perfil, renovar con el proveedor, marcar como caída, reponer). Heredan el mundo de DESIGN.md (Cartelera, modo claro) sin cambiarlo.

## Audience and task

Administrador y revendedores. La lista sirve para encontrar una cuenta; el detalle, sobre todo desde el celular mientras se atiende WhatsApp, para revelar y copiar credenciales, ver qué perfil tiene quién y actuar sobre la cuenta (renovar con el proveedor, marcar como caída, reponer, quitar la marca).

## Constraints

- No cambian funciones, datos ni terminología.
- Credenciales ocultas por defecto, fáciles de revelar y copiar con el pulgar.
- Los perfiles del detalle se ven como butacas de la sala, igual que en Inicio: cuáles están ocupados y por quién.
- Una cuenta caída se distingue claramente, en la lista y en el detalle.
- Estados de carga, vacío y error. Bien a 1440 px y a 360 px.

## Direction contract

THESIS: Una cuenta es una sala: arriba las llaves para entrar, al centro sus butacas con nombre, a un lado la boletería (qué costó y qué dejó). Rechaza la ficha de quince renglones iguales donde la contraseña pesa lo mismo que el método de pago.

OWN-WORLD: El de DESIGN.md: paneles blancos con título sobre riel negro, credenciales en monoespaciada con botones de 44 px, butacas turquesa (libre) y grises (ocupada) con su nombre, el aviso de cuenta caída en tinte magenta a todo el ancho, acciones en tinta, esquinas de 3 px, sin sombras.

STORY: Abre la cuenta, copia lo que el cliente necesita, ve qué butaca queda y resuelve lo que la cuenta pide.

FIRST VIEWPORT: Detalle 1440: volver, título con el ícono y el correo, acciones a la derecha; si está caída, el aviso magenta ocupa todo el ancho antes que nada. Dos columnas: a la izquierda Credenciales (correo, contraseña de la cuenta, contraseña del correo, enlace) y la sala con una butaca por perfil, su nombre y su cliente, seguida de la lista de perfiles con PIN y acciones; a la derecha los datos de la cuenta, cuánto deja y los pagos al proveedor. Celular 360: una columna en ese orden, credenciales primero, botones de mostrar y copiar de 44 px. Lista 1440: tablero con servicio y correo, proveedor, vence con su urgencia, perfiles, dueño (admin) y estado con el chip de cuenta caída; en celular, tarjetas.

Signature interaction: revelar y copiar una credencial sin salir de la pantalla; la sala muestra de un vistazo ocupación y nombres. Motion: transiciones de estado de 160 ms.

FORM: Extensión del mundo existente; sin sorteo de composición porque el pedido fija la estructura (credenciales, sala de butacas, acciones). Decisión de quien construye, informada en la entrega.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
