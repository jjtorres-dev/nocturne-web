---
version: 1
slug: "src-app-layout-admin-layout-admin-layout-html"
primary_target: "src/app/layout/admin-layout/admin-layout.html"
related_targets: ["src/app/features/dashboard/dashboard.html","src/app/shared/global-search/global-search.html"]
---

# Panel: layout (menú, barra superior, buscador global) e Inicio

## Scope

Modo: Operate. Cubre el shell del panel (`layout/admin-layout`, `shared/global-search`) y la pantalla de Inicio (`features/dashboard`). Es la primera superficie del mundo visual nuevo; el resto de pantallas y el login lo heredan después.

## Audience and task

Administrador y revendedores, en celular y en laptop por igual. Al abrir Inicio resuelven primero qué urge hoy: ventas vencidas y por vencer, cuentas caídas y cuentas que hay que pagar al proveedor. Ganancia e inventario quedan en segundo plano.

## Constraints

- No cambiar la terminología del producto (servicio, cuenta, perfil, venta, vencimiento, etc.).
- Denso: más información por pantalla, sin scroll innecesario.
- Modo claro ahora. Todos los colores como variables CSS; ningún color escrito en componentes. El modo oscuro llega después con un botón.
- Evitar: plantilla de admin genérica, aire frío o corporativo, poca densidad.

## Direction contract

THESIS: Nocturne es la cartelera de un cine de barrio a plena luz: cada cuenta es una sala, cada venta una función con hora de término. Rechaza la rejilla de tarjetas iguales con número grande sobre fondo azul oscuro.

OWN-WORLD: Tablero de letras blanco ópalo con rieles negros de 2 px bajo cada título; riel de navegación rojo butaca; ámbar de bombilla solo para la selección dentro del riel; acciones en tinta negra. Estados en color plano: bermellón vencida, ámbar por vencer, verde al día, magenta caída, turquesa libre. Esquinas de 3 px, sin sombras salvo en capas flotantes. Archivo en dos anchos: condensada en mayúsculas para títulos y cifras, normal para texto; cifras tabulares.

STORY: Ve qué urge, entiende cuánto, entra con un toque a resolverlo.

FIRST VIEWPORT: Escritorio 1440: riel rojo de 232 px con el menú en grupos (Vender, Inventario, Dinero y, solo para el administrador, Administración) y el usuario al pie; barra superior con el buscador a la izquierda y la fecha de hoy a la derecha. Inicio abre con las tarjetas de estado a todo el ancho: bloques de color plano (vencidas, por vencer, al día) que se reparten el ancho según su conteo y, separado, el bloque de caídas. Debajo, a 8 columnas, las cuentas por pagar al proveedor, cada fila encabezada por su cuándo en letras de cartelera; a 4 columnas, las cuentas caídas y la ganancia del mes con su franja de desglose. Cierra, a todo el ancho, «Disponible para vender»: una rejilla de salas, una por servicio, con una butaca por perfil o cuenta completa, ocupada o libre. Celular 360: barra inferior de cinco destinos, las tarjetas de estado en rejilla 2×2 y las mismas secciones en una columna (caídas, por pagar, ganancia, salas).

Signature interaction: las tarjetas de estado, que son botones: las tres de ventas llevan a Vencimientos ya filtrado; la de caídas lleva a su lista en la misma pantalla y la resalta un momento (las caídas son cuentas, no ventas, y Vencimientos no tiene ese estado). El usuario pidió quitar la franja proporcional que iba encima: era redundante con las tarjetas. La metáfora de cartelera vive en las salas con butacas de «Disponible para vender». Motion: transiciones de estado de 160 ms, sin secuencias de entrada.

FORM: Cartelera de cine de barrio, candidata 1 de mi lista ordenada (elegida por el usuario sobre la asignada, «Carta de ajuste», de la que se toma la barra de señal). Seed key: eb3da4cc.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Modo oscuro («sala con las luces apagadas»): paleta por anotar en DESIGN.md, sin implementar.
- Login y demás pantallas: heredan los tokens; su rediseño propio queda pendiente.
