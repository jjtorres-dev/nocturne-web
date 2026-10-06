---
version: 1
slug: "atures-sales-ventas-list-ventas-list-html-287834b1"
primary_target: "src/app/features/sales/ventas-list/ventas-list.html"
related_targets: ["src/app/features/vencimientos/vencimientos-list/vencimientos-list.html"]
---

# Ventas y Vencimientos

## Scope

Modo: Operate. Cubre `features/sales/ventas-list`, `features/vencimientos/vencimientos-list` y los diálogos que se abren desde ellas (nueva venta, editar, renovar, finalizar). Heredan el mundo de DESIGN.md (Cartelera, modo claro) sin cambiarlo.

## Audience and task

Las pantallas de uso diario del administrador y de cada revendedor, en celular y en escritorio. Prioridad: encontrar una venta y actuar rápido (copiar los datos para el cliente, renovar, finalizar, mandar el recordatorio por WhatsApp).

## Constraints

- No cambian funciones, datos ni la terminología del producto.
- Estados de carga, vacío y error en ambas pantallas.
- Ventas: las filas que son «Parte de combo» no pueden romper la alineación de la fila.
- Vencimientos: el recordatorio por WhatsApp es la acción central; la etiqueta «Avisarme con (días antes)» no se corta.
- Bien a 1440 px y a 360 px.

## Direction contract

THESIS: Cada venta es una función en cartelera: quién, qué sala y hasta cuándo, en una fila que se lee de un vistazo y se resuelve con un toque. Rechaza la tabla de diez columnas iguales con el estado perdido al final.

OWN-WORLD: El de DESIGN.md: tablero blanco con borde fino, encabezados en letras de cartelera sobre riel negro de 2 px, filas densas con renglón principal y renglón secundario, el cuándo en condensada mayúscula con el color de su estado, acciones en tinta, estados en sus tintes, esquinas de 3 px, sin sombras.

STORY: Filtra o reconoce la fila, lee el cuándo, actúa sin abrir nada más.

FIRST VIEWPORT: Ventas 1440: título y, a la derecha, Exportar CSV y Nueva venta; debajo los tres filtros compactos en una línea; luego el tablero: cliente con su código (y, si es parte de un combo, el enlace a ese combo en el mismo renglón secundario), servicio con cuenta y perfil, vence con su desde (la fecha toma el bermellón si ya pasó y el ámbar si vence dentro de tres días), cobrado, dueño (solo admin), estado y cuatro acciones en casillas fijas, de modo que una fila de combo deja casillas vacías en vez de desordenarse. Vencimientos 1440: el resumen son tres pestañas con su conteo (vencidas, por vencer, al día) en el color de su estado; el tablero abre cada fila con el cuándo y la cierra con el botón de WhatsApp con su nombre escrito y Renovar. Celular 360: tarjetas con el cliente y su estado arriba, datos en dos columnas y las acciones abajo; en Vencimientos el botón de WhatsApp ocupa el ancho.

Signature interaction: en Vencimientos, las pestañas de estado son a la vez el resumen y el filtro. Motion: transiciones de estado de 160 ms.

FORM: Extensión del mundo existente a dos listas. No se corrió el sorteo de composición (no hay seed key): fue decisión de quien construyó, porque el pedido ya fijaba estructura, prioridades y defectos a resolver; el usuario no lo pidió ni lo dispensó expresamente, y queda informado en la entrega.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
