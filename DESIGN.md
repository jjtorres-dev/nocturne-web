---
name: Nocturne
description: Cartelera de cine de barrio a plena luz para gestionar cuentas, ventas y vencimientos de streaming.
colors:
  ground: "#f3f1ee"
  surface: "#ffffff"
  surface-sunken: "#e9e5e0"
  rule: "#d8d2cb"
  rule-field: "#8c8179"
  rail: "#1c1615"
  ink: "#1c1615"
  ink-muted: "#5c524d"
  ink-faint: "#746a64"
  on-ink: "#ffffff"
  brand: "#8f1a2c"
  brand-tint: "#f6e3e5"
  on-brand: "#ffffff"
  nav: "#6e1423"
  nav-hover: "#85192b"
  nav-active: "#4f0d18"
  nav-rule: "#8f3040"
  on-nav: "#fbf1ee"
  on-nav-muted: "#e0bcb8"
  bulb: "#ffc83d"
  on-bulb: "#1c1615"
  vencida: "#c2330f"
  vencida-ink: "#b02b0b"
  vencida-tint: "#fbe6df"
  on-vencida: "#ffffff"
  por-vencer: "#f2b400"
  por-vencer-ink: "#855600"
  por-vencer-tint: "#fdf1cc"
  on-por-vencer: "#1c1615"
  al-dia: "#1f7a4d"
  al-dia-ink: "#1a6941"
  al-dia-tint: "#dff1e6"
  on-al-dia: "#ffffff"
  caida: "#8e2a8a"
  caida-ink: "#7d2379"
  caida-tint: "#f4e2f3"
  on-caida: "#ffffff"
  butaca-ocupada: "#9a8f87"
  libre: "#0d7c8c"
  libre-ink: "#0a6876"
  libre-tint: "#dcf0f3"
  on-libre: "#ffffff"
  serie-ingresos: "#b5aba3"
  serie-inversion: "#1c1615"
  serie-gastos: "#746a64"
  serie-ganancia: "#1f7a4d"
  avatar-1: "#8f1a2c"
  avatar-2: "#0a6876"
  avatar-3: "#1a6941"
  avatar-4: "#7d2379"
  avatar-5: "#855600"
  avatar-6: "#3d4a8a"
  on-avatar: "#ffffff"
  focus: "#1c1615"
  selection: "#ffe08a"
typography:
  display:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: "'wdth' 68"
  headline:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 68"
  title:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 68"
  funcion:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 68"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "'tnum'"
  label:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
  grupo:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 68"
  code:
    fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace"
    letterSpacing: "0.02em"
rounded:
  micro: "1px"
  base: "3px"
  full: "50%"
spacing:
  junta: "2px"
  xs: "4px"
  sm: "8px"
  fila: "10px"
  panel: "14px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.base}"
  button-primary-espera:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.base}"
    height: "48px"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    height: "32px"
    padding: "0 10px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
  panel-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "10px 14px 8px"
  nav-rail:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.on-nav}"
    width: "232px"
  nav-item:
    textColor: "{colors.on-nav}"
    rounded: "{rounded.base}"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.bulb}"
    rounded: "{rounded.base}"
  topbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    height: "52px"
    padding: "0 24px"
  bottom-bar:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.on-nav-muted}"
    height: "60px"
  bottom-item-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.bulb}"
  search-field:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    height: "36px"
    padding: "0 10px"
  search-field-focus:
    backgroundColor: "{colors.surface}"
  result-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
  senal-bloque-vencida:
    backgroundColor: "{colors.vencida}"
    textColor: "{colors.on-vencida}"
    rounded: "{rounded.base}"
    padding: "10px 16px"
  senal-bloque-por-vencer:
    backgroundColor: "{colors.por-vencer}"
    textColor: "{colors.on-por-vencer}"
    rounded: "{rounded.base}"
    padding: "10px 16px"
  senal-bloque-al-dia:
    backgroundColor: "{colors.al-dia}"
    textColor: "{colors.on-al-dia}"
    rounded: "{rounded.base}"
    padding: "10px 16px"
  senal-bloque-caida:
    backgroundColor: "{colors.caida}"
    textColor: "{colors.on-caida}"
    rounded: "{rounded.base}"
    padding: "10px 16px"
  senal-bloque-vacio:
    backgroundColor: "{colors.vencida-tint}"
    textColor: "{colors.vencida-ink}"
  fila-funcion:
    textColor: "{colors.ink}"
    padding: "7px 14px"
  fila-funcion-hover:
    backgroundColor: "{colors.surface-sunken}"
  chip-vencida:
    backgroundColor: "{colors.vencida-tint}"
    textColor: "{colors.vencida-ink}"
    rounded: "{rounded.base}"
  chip-caida:
    backgroundColor: "{colors.caida-tint}"
    textColor: "{colors.caida-ink}"
    rounded: "{rounded.base}"
  chip-activo:
    backgroundColor: "{colors.al-dia-tint}"
    textColor: "{colors.al-dia-ink}"
    rounded: "{rounded.base}"
  butaca:
    backgroundColor: "{colors.libre}"
    rounded: "3px 3px 1px 1px"
    width: "14px"
    height: "21px"
  butaca-ocupada:
    backgroundColor: "{colors.butaca-ocupada}"
    rounded: "3px 3px 1px 1px"
    width: "14px"
    height: "21px"
  butaca-cuenta:
    backgroundColor: "{colors.libre}"
    rounded: "3px 3px 1px 1px"
    width: "30px"
    height: "21px"
  letrero:
    backgroundColor: "{colors.nav}"
    textColor: "{colors.on-nav}"
  aviso-sesion:
    backgroundColor: "{colors.por-vencer-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
  aviso-ok:
    backgroundColor: "{colors.al-dia-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
  aviso-error:
    backgroundColor: "{colors.vencida-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "10px 12px"
---

# Design System: Nocturne

## Overview

**Creative North Star: "Cartelera"**

Nocturne es la cartelera de un cine de barrio a plena luz: cada cuenta es una sala y cada venta una función con hora de término. El panel se lee como un tablero de letras blanco ópalo con rieles negros bajo cada título, un riel de navegación rojo butaca a la izquierda y el ámbar de una bombilla encendida marcando dónde estás. Rechaza la rejilla de tarjetas iguales con un número grande sobre fondo azul oscuro.

Es una superficie de operación, densa y plana: filas de 36 a 50 px, paneles pegados a 16 px, color plano sin degradados y sin sombras en nada que esté apoyado en el tablero. El color fuerte se reserva para lo que cuesta dinero si se pasa por alto (vencidas, por vencer, caídas); todo lo demás es tinta sobre blanco. Celular y escritorio valen lo mismo: el mismo tablero se pliega a una columna con una barra inferior de cinco destinos.

**Alcance actual.** Están rediseñados en este mundo el layout del panel (riel, barra superior, barra inferior en celular), el buscador global, Inicio y el login, que es la fachada del mismo cine: a un lado el letrero, al otro la taquilla; con él se rehízo el favicon. Las demás pantallas (Ventas, Ventas de combos, Vencimientos, Clientes y proveedores, Servicios, Cuentas, Combos, Gastos, Contabilidad, Usuarios, Configuración) hoy solo heredan los tokens a través de Material; cada una todavía debe su propio rediseño dentro de la Cartelera.

**Key Characteristics:**
- Tablero claro: fondo ópalo cálido, paneles blancos, líneas finas, riel negro de 2 px bajo cada título.
- Riel de navegación rojo butaca con la sección actual en ámbar de bombilla.
- Acción principal en tinta negra; el rojo es marca, nunca botón.
- Estados en color plano con significado fijo: bermellón, ámbar, verde, magenta, turquesa.
- Archivo en dos anchos: condensada en mayúsculas para títulos y cifras, normal para el texto; cifras tabulares.
- Una sola esquina (3 px) y sombra solo en capas flotantes.
- Cada fila urgente abre con su "función": el cuándo, en letras de cartelera.
- El inventario es la cartelera: una sala por servicio y una butaca por perfil o cuenta completa, ocupada o libre.

## Colors

Blanco ópalo y tinta casi negra de tono cálido, un rojo vino para la marca y cinco colores de estado planos y saturados. Todos los valores viven en el frontmatter y, en el código, en el bloque `:root` de `src/styles.scss` como `--nc-*`.

### Primary
- **Tinta negra** (`ink`, `on-ink`): texto principal y acción principal. Los botones rellenos de Material son negros con texto blanco; los delineados llevan texto en tinta y borde `rule-field`. También es el ítem activo del buscador, el anillo de foco sobre claro (`focus`) y, en todo campo de formulario, el contorno, la etiqueta y el cursor al enfocar.
- **Riel negro** (`rail`): la línea de 2 px bajo cada título de panel y de grupo de resultados. Mismo valor que la tinta, token aparte porque en modo oscuro se separan.

### Secondary
- **Rojo butaca** (`brand`, `brand-tint`, `on-brand`): marca, enlaces y selección de Material (`--mat-sys-primary`). Es el "Nocturne" de la barra superior en celular y los enlaces "Ver detalle". No marca el foco de un campo.
- **Rojo del riel** (`nav`, `nav-hover`, `nav-active`, `nav-rule`, `on-nav`, `on-nav-muted`): familia del riel de navegación y de la barra inferior. `nav-active` es más hondo que `nav`, no más claro. Fuera del panel, `nav` es el fondo del letrero del login, del favicon y de la barra del navegador en celular (`theme-color`), con `on-nav` para la marca y `on-nav-muted` para la línea que dice qué es Nocturne.

### Tertiary
- **Ámbar de bombilla** (`bulb`, `on-bulb`): la selección dentro del riel: texto e ícono de la sección actual, el punto encendido a su derecha, la fila de bombillas punteada bajo la marca y el foco de teclado sobre el rojo. Fuera del riel solo aparece, por pedido expreso del usuario, como la fila de bombillas de la marca en el letrero del login y en el favicon.
- **Estados** (cada uno con sólido, `-ink` para texto sobre claro, `-tint` para fondos y `on-` para texto sobre el sólido):
  - **Bermellón vencida** (`vencida`): venta o cuenta con la fecha pasada; también el error de Material y una ganancia negativa.
  - **Ámbar por vencer** (`por-vencer`): vence pronto. Es el único sólido que lleva texto en tinta negra encima.
  - **Verde al día** (`al-dia`): en regla; también el chip "Activo" y el ícono de los vacíos buenos ("No tienes cuentas caídas").
  - **Magenta caída** (`caida`): cuenta caída, un cliente esperando reposición. No es un cobro atrasado y por eso no comparte color con vencida.
  - **Turquesa libre** (`libre`): perfiles o cuentas disponibles para vender (las butacas libres).
- **Series de dinero** (`serie-ingresos`, `serie-inversion`, `serie-gastos`, `serie-ganancia`): tintas propias de Contabilidad y de "Ganancia del mes". Ingresos, inversión y gastos van en grises y negro; solo lo que queda, la ganancia, lleva color.
- **Avatares** (`avatar-1` a `avatar-6`, `on-avatar`): seis tonos oscuros para la inicial en blanco.

### Neutral
- **Ópalo** (`ground`): fondo de página.
- **Blanco de tablero** (`surface`): paneles, barra superior, diálogos, menús.
- **Ópalo hundido** (`surface-sunken`): hover de filas, campo de búsqueda en reposo, marcadores de carga.
- **Línea fina** (`rule`): separador de 1 px entre filas y borde de paneles.
- **Borde de campo** (`rule-field`): borde de campos y de botones delineados; cumple 3:1 contra el tablero.
- **Tinta suave** (`ink-muted`) y **tinta tenue** (`ink-faint`): texto secundario y terciario; ambas pasan 4.5:1 sobre el fondo y sobre el blanco.
- **Butaca ocupada** (`butaca-ocupada`): gris cálido de la butaca ya vendida en "Disponible para vender". Es neutro a propósito: en la sala, lo único con color es lo libre.
- **Selección de texto** (`selection`): ámbar pálido con texto en tinta.

### Named Rules

**Regla del Token Único.** Todo color es un token CSS definido en el bloque `:root` de `src/styles.scss`. Ningún componente escribe un color literal (ni hex, ni `rgb()`, ni nombre): usa `var(--nc-*)` o un `--mat-sys-*`, que también apunta a ese bloque. Hay dos excepciones con nombre. **Datos de terceros:** los colores de marca de los servicios de streaming en `src/app/shared/service-icon/service-icons.data.ts`, que no son parte de la paleta. **Archivos de marca:** lo que el navegador lee antes o fuera del CSS no puede usar `var()` y lleva el valor literal de su token: `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png` y el `<meta name="theme-color">` de `src/index.html` (rojo butaca del riel `#6e1423`, claro `#fbf1ee` y ámbar de bombilla `#ffc83d`, los valores de `nav`, `on-nav` y `bulb`). Si uno de esos tokens cambia, esos archivos se actualizan a mano.

**Regla del Lienzo.** Lo que pinta en un `<canvas>` (Chart.js) no puede usar `var()`: lee el token ya resuelto con `cssToken('--nc-…')` de `src/app/shared/css-token.ts`. Nunca se copia el valor al TypeScript.

**Regla de la Tinta que Actúa.** La acción principal es negra. El rojo butaca es marca, navegación, enlace y selección; no rellena botones. Así un botón nunca se confunde con un estado ni con el bermellón de "vencida".

**Regla de la Bombilla.** El ámbar de bombilla se enciende dentro del riel rojo (y su barra inferior) para decir "estás acá" y, por pedido expreso del usuario, en la fila de bombillas de la marca en dos lugares más: el letrero del login y el favicon. No es un acento general: siempre va sobre rojo butaca y nunca sobre el tablero claro. Fuera de esos lugares, el ámbar que se ve es el estado "por vencer", que es otro token.

**Regla del Estado.** Bermellón, ámbar, verde, magenta y turquesa significan estados y nada más. No decoran, no distinguen categorías, no son series de dinero: para eso existen `--nc-serie-*`. En cero, un bloque de estado se apaga a su `-tint` con texto `-ink`: color solo donde hay algo que atender. Un bloque o etiqueta toma los cuatro colores de su estado de las clases globales `.nc-estado-vencida`, `.nc-estado-por-vencer`, `.nc-estado-al-dia` y `.nc-estado-caida` (en `src/styles.scss`), que fijan `--estado`, `--sobre-estado`, `--estado-tinte` y `--estado-tinta`. Los avisos del login usan tres de esos tintes como fondo de un mensaje, con texto en tinta y el ícono en la `-ink` del estado: por vencer para la sesión expirada, al día para la contraseña cambiada y vencida para un error.

**Regla del Foco en Tinta.** En todo campo de formulario, el contorno enfocado, la etiqueta enfocada y el cursor van en tinta (`--nc-focus` y `--nc-ink`, vía `--mat-form-field-outlined-focus-outline-color`, `--mat-form-field-outlined-focus-label-text-color` y `--mat-form-field-outlined-caret-color` en `src/styles.scss`). El rojo nunca significa foco: queda para la marca, y el bermellón para el error, así un campo enfocado no parece un campo con error. El autocompletado del navegador conserva el fondo del campo y su tinta en vez de pintar el suyo.

**Regla de la Ayuda que Empuja.** El texto de ayuda o de error bajo un campo ocupa el alto que necesite (por CSS global en `styles.scss`, sin la opción global de Material, que engordaba el bundle inicial): si pasa a dos renglones empuja al campo siguiente, nunca se monta sobre su etiqueta. `styles.scss` le da un mínimo de 20 px, para que los campos sin ayuda conserven el ritmo, y 8 px de aire abajo. En los diálogos el contenido se desplaza entre el título y los botones, con 10 px arriba, 16 px abajo y una línea `rule` sobre los botones que marca el fin de la zona que se desplaza.

**Regla de los Alias Heredados.** `--nc-bg`, `--nc-surface-elevated`, `--nc-border`, `--nc-text-primary`, `--nc-text-secondary` y `--nc-accent-solid` existen solo para las pantallas que todavía no se rediseñaron. No se usan en código nuevo; al rediseñar una pantalla se reemplazan por el token real y, cuando no quede ninguna, se borran.

## Typography

**Display Font:** Archivo variable, ancho 68 % (con 'Helvetica Neue', Arial, sans-serif)
**Body Font:** Archivo variable, ancho 100 % (misma familia)
**Label/Mono Font:** JetBrains Mono (con 'Roboto Mono', monospace), solo para códigos

**Character:** Una sola familia en dos anchos. La condensada en mayúsculas y peso 700–800 son las letras de plástico de la cartelera; la normal es el texto de trabajo. La fuente se carga con el eje de ancho 62–125 y pesos 400–800; los anchos en uso son los tokens `--nc-width-condensed` (68 %) y `--nc-width-normal` (100 %).

### Hierarchy
- **Display** (800, 2.25rem, 0.95, condensada): la cifra de cada tarjeta de estado (1.875rem en celular). La cifra de "Ganancia del mes" baja a 1.875rem, mismo ancho y peso.
- **Headline** (800, 1.75rem, 1.1, condensada, mayúsculas, 0.01em): el `h1` de cada pantalla y la marca en el riel (esta con 0.06em). En el letrero del login la marca crece con el mismo ancho y peso: 6rem en escritorio (0.04em, alto de línea 0.9), 3rem en la banda de celular y 1.5rem en la banda compacta.
- **Title** (700, 1.125rem, 1.2, condensada, mayúsculas, 0.02em): título de panel, siempre sobre su riel negro.
- **Función** (700, 1rem, 1.2, condensada, mayúsculas, 0.02em): el cuándo que abre cada fila ("VENCE EN 3 DÍAS"), en la tinta de su estado.
- **Body** (400, 0.875rem, 1.43, ancho normal): texto general, vía `--mat-sys-body-medium`. El nombre principal de una fila sube a 600; el dato secundario baja a 0.8125rem en tinta suave.
- **Label** (600, 0.8125rem, 1.2, ancho normal, sin mayúsculas): etiqueta de tarjeta de estado, enlaces dentro de un título, texto de botón compacto y, en tinta suave, el subtítulo que separa las salas por unidad de venta.
- **Grupo** (700, 0.8125rem, condensada, mayúsculas, 0.06em): título de grupo del menú; en el buscador, 0.875rem con 0.04em. La fecha de la barra superior usa el mismo registro a 0.9375rem, peso 600.
- **Code** (JetBrains Mono, 0.02em): códigos de venta y combo (V-00001, C-00001).

### Named Rules

**Regla de los Dos Anchos.** Condensada (68 %) en mayúsculas para títulos, cifras y el cuándo; normal (100 %) para todo lo que se lee como frase. Un texto dentro de un título que no es título (un enlace, una leyenda) vuelve a ancho normal, sin mayúsculas y sin tracking.

**Regla de la Cifra Tabular.** `font-variant-numeric: tabular-nums` está puesto en `body`: toda cifra se alinea en columna sin pedirlo.

## Layout

Riel fijo de 232 px (`--nc-nav-width`) a la izquierda y, a su derecha, una barra superior de 52 px (`--nc-topbar-height`) pegada arriba con el buscador a la izquierda (hasta 520 px) y la fecha de hoy a la derecha. El contenido tiene un máximo de 1600 px con 20 px arriba, 24 px a los lados y 32 px abajo.

Inicio abre con las tarjetas de estado a todo el ancho y debajo una rejilla de dos columnas `2fr / 1fr` (mínimo 300 px la derecha) con 16 px de separación, en tres filas de áreas: arriba, las cuentas por pagar al proveedor a la izquierda y las cuentas caídas a la derecha; bajo las caídas, la ganancia del mes (las cuentas por pagar ocupan las dos filas de su columna); y al pie, a todo el ancho, "Disponible para vender". Lo urgente a la izquierda, el negocio a la derecha, el inventario cerrando.

Ritmo observado (no hay tokens de espaciado en el CSS; son los valores que se repiten): 2 px entre bloques y tramos contiguos, 4 px entre butacas (3 px en celular), 4 y 8 px dentro de un grupo, 10 px entre columnas de una fila, 14 px de margen interno horizontal de panel, 16 px entre paneles, 20 px entre columnas de salas, 24 px de margen de página. Filas de 36 px en el menú y el buscador y alrededor de 50 px en las listas de cuentas. Material corre con densidad -1.

El login no lleva riel ni barras: son dos mitades a toda la altura, el letrero rojo a la izquierda y la taquilla clara a la derecha, en proporción `9fr / 11fr` (45 % y 55 %), sin tarjeta que envuelva el formulario. Las dos mitades empiezan a la misma altura (`clamp(48px, 28vh, 300px)`), así el tope de la marca y el del título comparten línea y el título no se mueve cuando aparece o desaparece un aviso. El formulario es una columna de 360 px como máximo, alineada a la izquierda de su mitad.

Cortes:
- **Menos de 900 px (solo el login):** una columna. El letrero pasa a ser una banda arriba con la marca, su fila de bombillas y la línea que dice qué es Nocturne; debajo, la misma columna del formulario, centrada, con 20 px a los lados.
- **Menos de 1400 px:** el botón de fila acorta su texto ("Renovar").
- **Desde 1100 px:** la fila de cuentas por pagar pasa a un solo renglón en columnas. **Menos de 1100 px:** la rejilla de Inicio pasa a una columna en este orden: cuentas caídas, cuentas por pagar, ganancia, salas.
- **Menos de 768 px** (el mismo corte de `shared/breakpoints.ts`): el riel se vuelve un panel lateral sobre el contenido (hasta 288 px o 86 % del ancho) y aparece la barra inferior de 60 px más el área segura, con cuatro destinos diarios y "Menú". Las tarjetas de estado pasan a una rejilla 2×2 con 6 px de separación; los paneles se separan 12 px; los objetivos táctiles suben a 44 px; el margen de página baja a 16 px. Las tablas hacen scroll horizontal dentro de `.table-scroll` y los diálogos ocupan el ancho menos 32 px.

**Regla del Teclado.** En el login en celular, los campos y el botón tienen que seguir a la vista con el teclado abierto. Cuando el área visible se achica (`visualViewport` por debajo del 75 % del alto de la ventana) o la ventana mide menos de 520 px de alto, la banda se compacta a un renglón (marca a 1.5rem sobre bombillas de 2 px), se ocultan la línea que dice qué es Nocturne y la línea de ayuda, el título baja a 1.375rem y el formulario sube hasta el borde de lo visible.

Anchos de revisión: 1440 px en escritorio y 360 px en celular. A 360 px ninguna fila de cuenta se monta: lo que no entra en un renglón baja al siguiente. El login se revisa además a 360 px con el teclado abierto.

## Elevation & Depth

Plano. Nada apoyado en el tablero tiene sombra: los niveles 0 y 1 de Material están en `none` y los paneles se separan por un borde de 1 px (`rule`) y por el contraste blanco sobre ópalo. La profundidad es de dos planos: el tablero y lo que flota encima.

### Shadow Vocabulary
- **Capa flotante** (`--nc-shadow-overlay`: `0 12px 32px -8px rgb(28 22 21 / 0.28), 0 2px 6px rgb(28 22 21 / 0.12)`): menús, diálogos, el panel de resultados del buscador y cualquier nivel 2 a 5 de Material. En celular el panel de resultados ocupa la pantalla y no lleva sombra.
- **Velo** (`--nc-scrim`: `rgb(28 22 21 / 0.45)`): detrás del panel lateral en celular.

### Named Rules

**Regla del Tablero Plano.** Si está apoyado, no tiene sombra. Solo flota lo que tapa otra cosa, y toda capa flotante usa la misma sombra.

**Regla del Riel que Aparece.** La respuesta al puntero no es elevación: una tarjeta de estado muestra un riel negro interior de 4 px abajo (8 px al presionar) y una fila cambia a ópalo hundido. Transiciones de 160 ms (`--nc-duration`) con `--nc-ease`, sin secuencias de entrada; con movimiento reducido el marcador de carga deja de pulsar.

## Shapes

Una sola esquina: 3 px (`--nc-radius`), la de las letras del tablero. Todos los radios de Material (de extra-small a extra-large, botones, botones de ícono, chips, diálogos) están reasignados a ese valor. El riel de navegación y la barra inferior van a ras, sin radio.

Las marcas pequeñas que miden algo (tramos de la franja de ganancia, muestras de leyenda) usan 1 px. La butaca tiene silueta propia: 3 px arriba y 1 px abajo, como un respaldo. El círculo queda para lo que es redondo en el mundo: avatares, íconos de servicio y la bombilla.

Las líneas tienen tres pesos con papel fijo: 1 px `rule` separa, 1 px `rule-field` delimita algo editable o pulsable, 2 px `rail` (`--nc-rail-width`) sostiene un título. La fila de bombillas bajo la marca es un borde punteado en ámbar cuyo grosor sigue al tamaño de la marca: 3 px en el riel del panel, 6 px en el letrero del login en escritorio, 4 px en la banda de celular y 2 px en la banda compacta. En el favicon son círculos dibujados.

Íconos: Material Symbols Sharp, contorno a 20–24 px, configurado como set por defecto en `app.config.ts`; el ícono de la sección actual pasa a relleno (`'FILL' 1`).

## Components

### Buttons
- **Shape:** esquina de tablero (3 px).
- **Primary:** relleno en tinta negra con texto blanco (`--mat-button-filled-*`).
- **Outlined:** texto en tinta, borde `rule-field`, fondo transparente. Es el botón de fila ("Renovar con el proveedor"): 32 px de alto y 10 px de margen horizontal en escritorio; en celular, cuadrado de 44 px solo con el ícono y el nombre completo para lectores de pantalla.
- **Hover / Focus:** capa de estado de Material; foco con anillo de 2 px en `focus`.

### Chips
- **Style:** `mat-chip` con fondo `-tint`, texto `-ink` y contorno del estado, esquina de 3 px.
- **State:** "Activo" usa verde al día (`--mat-sys-secondary-container`); "Vencida" usa bermellón (`.chip-vencida`); "Cuenta caída" usa magenta (`.chip-caida`).

### Cards / Containers
- **Panel** (`.nc-panel`): blanco, borde de 1 px `rule`, esquina de 3 px, sin sombra, sin margen interno propio: las filas llegan de borde a borde.
- **Título de panel** (`.nc-panel-title`): registro Title, margen `10px 14px 8px`, riel negro de 2 px debajo. Puede llevar a la derecha un enlace o una leyenda en ancho normal. No lleva totales: el conteo ya está en su tarjeta de estado y cada fila dice lo suyo.
- **Vacío y error:** una línea dentro del panel, margen `12px 14px`; el vacío bueno lleva un ícono en verde al día, el error va en tinta bermellón.
- **Carga** (`.nc-skeleton`, clase global de `src/styles.scss`): bloques de 36 px en ópalo hundido que ocupan el lugar del contenido.

### Inputs / Fields
- **Buscador:** 36 px de alto, fondo ópalo hundido, borde de 1 px `rule-field`, esquina de 3 px, lupa en tinta suave.
- **Hover:** el borde pasa a tinta suave.
- **Focus:** fondo blanco, borde y contorno de 1 px en `focus` (se lee como un borde de 2 px negro).
- **Resultados:** panel flotante con la sombra de capa. Cada categoría es un renglón del tablero: título condensado sobre riel negro, pegado arriba al hacer scroll. Ítems de 36 px (44 px en celular) con línea fina; el ítem activo con el teclado se invierte a tinta negra con texto blanco.
- **Campos de formulario** (Material, delineados): borde `--mat-sys-outline` (`rule-field`) y radio de 3 px. Al enfocar, contorno, etiqueta y cursor en tinta (Regla del Foco en Tinta); el error va en tinta bermellón con su mensaje debajo. El autocompletado del navegador no cambia el fondo ni la tinta del campo.
- Este cambio de foco y de autocompletado es global y se hizo junto con el login: después de hacerlo solo se revisó en pantalla el login. Los formularios de las demás pantallas lo heredan sin revisar.

### Navigation
- **Riel** (232 px, `nav`): arriba la marca en letras de marquesina sobre una fila de bombillas punteada; el menú en grupos (Vender, Inventario, Dinero y, solo para el administrador, Administración) con título de grupo en `on-nav-muted` sobre una línea `nav-rule`; al pie, fijo, el usuario con avatar, nombre y rol.
- **Ítem:** 36 px (44 px en celular), texto `on-nav` 0.875rem peso 500, ícono de 20 px en `on-nav-muted`.
- **Hover:** capa de estado clara de Material; la tarjeta de usuario pasa a `nav-hover`.
- **Activo:** fondo `nav-active`, texto e ícono en ámbar de bombilla, peso 700, ícono relleno y una bombilla encendida de 6 px a la derecha.
- **Foco:** contorno de 2 px en ámbar de bombilla, hacia adentro.
- **Barra superior** (52 px, blanca, línea fina abajo): buscador a la izquierda y fecha de hoy a la derecha en el registro Grupo, tinta suave. En celular muestra la marca en rojo butaca y la lupa.
- **Barra inferior (celular):** 60 px más área segura, fondo `nav`, cinco columnas iguales (Inicio, Ventas, Vencimientos, Cuentas, Menú) con ícono y etiqueta de 0.75rem en `on-nav-muted`; el activo va sobre `nav-active` en ámbar con ícono relleno.

### Tarjetas de estado
La interacción firma de Inicio. Son botones: color plano del estado, cifra en Display y etiqueta en Label, mínimo 72 px de alto (60 px en celular). Las cuatro (vencidas, por vencer, al día y cuentas caídas) tienen el mismo ancho en escritorio, sin importar su número, separadas 8 px: el dato es la cifra, no el tamaño de la tarjeta. En cero la tarjeta se apaga a su tinte. Al pasar el puntero aparece el riel negro interior. Las tres de ventas llevan a Vencimientos ya filtrado; la de caídas lleva a su panel en la misma pantalla y lo resalta un momento con un contorno magenta de 2 px que se desvanece. En celular las cuatro pasan a una rejilla 2×2.

### Fila de función
La fila de una lista urgente (cuentas caídas, cuentas por pagar) va en dos renglones, con el ícono del servicio (28 px) ocupando ambos. Arriba, el cuándo en el registro Función y en la tinta de su estado y, al otro extremo, el dato de clientes en tinta suave a 0.8125rem; si no entran juntos, los clientes bajan de renglón. Abajo, el servicio en 600 (con su dueño en pequeño) seguido del correo en tinta suave; si no entran juntos, el correo baja de renglón. Toda la fila es un enlace al detalle y cambia a ópalo hundido al pasar; la acción propia de la fila, si la hay, es un botón delineado al final. El dato de clientes se dice una sola vez, en la fila.

Desde 1100 px, la fila de cuentas por pagar pasa a un solo renglón en columnas: cuándo (9.5rem) | ícono | cuenta (servicio sobre correo) | clientes | acción. Las cuentas caídas viven en la columna angosta y conservan los dos renglones en todo ancho.

### Franja de ganancia
Cifra del mes en condensada 800 a 1.875rem (bermellón si es negativa), una franja de 12 px que reparte lo cobrado en inversión, gastos y lo que queda con las tintas `--nc-serie-*`, y una lista de pares etiqueta y monto con una muestra cuadrada de 10 px como leyenda: cada tramo de la franja tiene su renglón (pagado a proveedores, otros gastos y ganancia), más lo cobrado, que es el total. La franja solo aparece si hubo cobros y la ganancia no es negativa.

### Cartelera de salas
"Disponible para vender" es la cartelera: un panel a todo el ancho con una rejilla de salas, una por servicio, en tantas columnas de 250 px mínimo como entren (`repeat(auto-fill, minmax(250px, 1fr))`, 20 px entre columnas) y una línea fina bajo cada sala. Cada sala lleva el ícono del servicio (24 px), su nombre en 600 (con su dueño en pequeño), una línea de texto a 0.8125rem como "Libres: 3 de 5 perfiles" y su mapa de butacas.

- **Butacas:** una por perfil o por cuenta completa, primero las ocupadas (`butaca-ocupada`) y después las libres (turquesa `libre`), de 14×21 px con 4 px de separación en escritorio y 11×17 px con 3 px en celular. Su tamaño es fijo: si no entran en un renglón, siguen en el siguiente en vez de achicarse. En la leyenda del título son una muestra de 9×14 px. Se dibujan hasta 40 por sala; el texto siempre dice la cantidad real.
- **Unidad:** la línea de texto escribe siempre la unidad (perfil, perfiles, cuenta, cuentas) y la concuerda con el total. Los servicios se separan bajo dos subtítulos, "Se venden por perfil" y "Se venden por cuenta completa", para que las dos unidades nunca se mezclen; el subtítulo solo aparece cuando existen los dos grupos. La butaca de cuenta completa es más ancha (30 px en escritorio, 24 px en celular).
- **Leyenda:** en el título del panel, una butaca libre y una ocupada con su palabra, a 0.75rem en tinta suave.
- **Agotado:** una sala sin libres se apaga: ícono en gris a media opacidad, nombre y texto en tinta suave.

### Login
La fachada: dos mitades, letrero y taquilla, sin tarjeta.

- **Letrero:** fondo `nav`. La marca en letras de marquesina (`on-nav`) sobre su fila de bombillas y, debajo, una línea que dice qué es Nocturne (1.125rem en `on-nav-muted`, hasta 28 caracteres de ancho; 0.875rem en la banda de celular). Por debajo de 900 px es la banda superior y conserva esa línea.
- **Taquilla:** sobre el fondo ópalo, sin panel. Título "Ingresar" en Headline sobre el riel negro de 2 px, el aviso si corresponde, correo, contraseña, el botón a todo el ancho y una línea de ayuda.
- **Avisos:** un bloque sobre los campos con esquina de 3 px, margen interno `10px 12px`, texto en tinta a 0.875rem y un ícono de 20 px en la `-ink` de su estado. Tinte por vencer con reloj para la sesión expirada; tinte al día con visto para la contraseña cambiada; tinte vencida para los errores (credenciales, sin conexión, servidor). Entra con un fundido de 160 ms que no corre con movimiento reducido.
- **Botón Ingresar:** relleno en tinta, 48 px de alto, texto de 1rem en 600. Está habilitado en reposo: si falta un dato, al tocarlo se marcan los campos y el foco va al primero con problema. Mientras ingresa conserva el relleno en tinta, muestra un indicador de 18 px junto a "Ingresando…" y solo deja de responder.
- **Demasiados intentos (429):** el aviso bermellón lleva un cronómetro y cuenta los segundos en vivo ("Podrás intentar de nuevo en 59 s."); el lector de pantalla oye una sola frase fija. Es el único momento en que el botón se deshabilita: fondo ópalo hundido, texto en tinta suave y la misma cuenta ("Espera 59 s"). Se rehabilita solo al terminar.
- **Contraseña:** un botón de ícono al final del campo la muestra o la oculta, con nombre accesible y estado pulsado.
- **Sin registro:** no hay "crear cuenta". Una línea a 0.8125rem en tinta suave le dice a quien no tiene acceso que lo pida a su administrador.

### Imagen de marca del login
`public/login-marca.jpg` es hoy un marcador de 1×1 px, y mientras lo sea se ve el letrero tipográfico. Al reemplazarlo por una imagen real con el mismo nombre, sin tocar código, la imagen cubre el letrero entero con `object-fit: cover` centrado, recibe el texto alternativo "Nocturne" y la marca tipográfica, sus bombillas y la línea que dice qué es Nocturne dejan de mostrarse.

- **Archivo recomendado:** 1600×2000 px, vertical 4:5.
- **Zona segura:** el sujeto y cualquier letra van dentro de la franja horizontal central (alrededor del 30 % central del alto y el 60 % central del ancho). La banda de celular mide 132 px de alto y muestra cerca de 360×132 px del centro; con el teclado abierto, 48 px de alto (360×48).
- Las capturas de revisión con imagen usan una imagen sintética de prueba; la definitiva la aporta el usuario y no se ha visto en pantalla.

### Favicon y marca
Una N condensada clara (el valor de `on-nav`) sobre rojo butaca del riel, con una fila de bombillas ámbar debajo: la marquesina en chico.

- **`public/favicon.svg`:** lienzo de 64, cinco bombillas redondas, esquina propia de ícono (10 de 64).
- **`public/favicon.ico`:** cuadros de 48, 32 y 16 px; el de 16 px está dibujado aparte, con tres bombillas más grandes para que se lean.
- **`public/apple-touch-icon.png`:** 180×180 px.
- **`theme-color`:** el rojo del riel, para la barra del navegador en celular.
- Estos archivos llevan colores literales: es la excepción "Archivos de marca" de la Regla del Token Único.

## Do's and Don'ts

### Do:
- **Sí:** toma cada color de un token `--nc-*` del bloque `:root` de `src/styles.scss`; si falta uno, se agrega ahí con su nombre de rol.
- **Sí:** en gráficos de canvas, lee el color con `cssToken()`.
- **Sí:** pon cada título de panel o de grupo sobre un riel negro de 2 px (`--nc-rail-width`, `--nc-rail`).
- **Sí:** usa la tinta negra para la acción principal y el botón delineado con borde `rule-field` para las acciones de fila.
- **Sí:** abre las filas que tienen fecha con su cuándo en condensada, mayúsculas y la tinta `-ink` de su estado.
- **Sí:** usa la variante `-ink` de un estado para texto sobre claro y el sólido solo como fondo con su `on-`.
- **Sí:** da a un bloque su estado con una clase global `.nc-estado-*` en vez de repetir sus cuatro colores.
- **Sí:** deja que lo que no entra en un renglón baje al siguiente antes de montarse sobre otro dato.
- **Sí:** escribe siempre la unidad junto a una cantidad de inventario (perfiles o cuentas) y no mezcles las dos en una misma lista.
- **Sí:** mantén 3 px en toda esquina y 1 px en las marcas que miden.
- **Sí:** da 44 px a todo lo que se toca por debajo de 768 px.
- **Sí:** agrega cada sección nueva al menú dentro de uno de los grupos existentes.
- **Sí:** enfoca todo campo de formulario en tinta: contorno, etiqueta y cursor.
- **Sí:** al reemplazar `public/login-marca.jpg`, usa 1600×2000 px (4:5) y deja el sujeto y las letras en la franja horizontal central.
- **Sí:** cuando cambie `nav`, `on-nav` o `bulb`, actualiza a mano el favicon (SVG, ICO, PNG) y el `theme-color`.

### Don't:
- **No:** escribas un color literal en un componente, ni copies el valor de un token a TypeScript.
- **No:** uses los alias heredados (`--nc-bg`, `--nc-surface-elevated`, `--nc-border`, `--nc-text-primary`, `--nc-text-secondary`, `--nc-accent-solid`) en código nuevo.
- **No:** rellenes un botón con rojo butaca ni con un color de estado.
- **No:** uses el ámbar de bombilla fuera del riel de navegación, su barra inferior, la fila de bombillas del letrero del login y el favicon; no es un acento general.
- **No:** uses un color de estado para decorar, para distinguir categorías o como serie de dinero.
- **No:** pongas sombra a un panel, una tarjeta o una fila; la sombra es solo de capas flotantes.
- **No:** repitas el mismo dato en dos formas en la misma vista (una medida encima de las tarjetas que ya lo dicen, un total en el título de una lista que ya lo dice fila por fila).
- **No:** uses degradados, vidrio ni esquinas redondeadas grandes.
- **No:** agregues secuencias de entrada; solo transiciones de estado de 160 ms.
- **No:** cambies la terminología del producto (servicio, cuenta, perfil, venta, vencimiento, cuenta caída).
- **No:** uses el rojo para marcar el foco de un campo.
- **No:** deshabilites el botón principal de un formulario en reposo ni mientras carga; en el login solo se deshabilita durante la espera por demasiados intentos.

## Modo oscuro (pendiente, no implementado)

**Estado: propuesta.** Nada de esta sección existe en el código. El usuario pidió documentarla ahora y construirla después, detrás de un botón. La paleta de abajo **no se ha renderizado ni revisado en pantalla**; los contrastes no están verificados sobre la interfaz real y los valores pueden cambiar al construirla.

**Concepto: "una sala de cine con las luces apagadas".** La misma cartelera, de noche: el tablero se apaga a un negro cálido, las letras y los rieles pasan a claro, el riel rojo se oscurece como terciopelo en penumbra y la bombilla ámbar sigue encendida.

**Cómo se va a implementar.** Redefiniendo ÚNICAMENTE el bloque de tokens `:root` bajo un selector de tema (por ejemplo `[data-theme='dark']`), con `color-scheme: dark`. Ningún componente cambia: por eso existe la Regla del Token Único. Los gráficos de canvas deben volver a leer `cssToken()` al cambiar de tema.

**Login y favicon (propuesta, sin revisar).** El letrero del login y el favicon conservan el rojo butaca y el ámbar de bombilla también en modo oscuro: la fachada no se apaga. El favicon ya es así porque sus colores son literales. El letrero hoy pinta con `--nc-nav`, que en la tabla de abajo se oscurece; conservar su rojo va a pedir un token propio o una excepción al construirlo. Nada de esto se ha renderizado.

### Paleta propuesta

| Token | Claro (construido) | Oscuro (propuesto) |
| --- | --- | --- |
| `--nc-ground` | `#f3f1ee` | `#140e0f` |
| `--nc-surface` | `#ffffff` | `#1f1617` |
| `--nc-surface-sunken` | `#e9e5e0` | `#2a1e20` |
| `--nc-rule` | `#d8d2cb` | `#3a2b2d` |
| `--nc-rule-field` | `#8c8179` | `#8a7a76` |
| `--nc-rail` | `#1c1615` | `#f1e6e2` |
| `--nc-ink` | `#1c1615` | `#f1e6e2` |
| `--nc-ink-muted` | `#5c524d` | `#c2b3ae` |
| `--nc-ink-faint` | `#746a64` | `#9c8d88` |
| `--nc-on-ink` | `#ffffff` | `#140e0f` |
| `--nc-brand` | `#8f1a2c` | `#ff8a98` |
| `--nc-brand-tint` | `#f6e3e5` | `#3a1219` |
| `--nc-on-brand` | `#ffffff` | `#140e0f` |
| `--nc-nav` | `#6e1423` | `#2b0a11` |
| `--nc-nav-hover` | `#85192b` | `#3d0f19` |
| `--nc-nav-active` | `#4f0d18` | `#1a0509` |
| `--nc-nav-rule` | `#8f3040` | `#4a1a24` |
| `--nc-on-nav` | `#fbf1ee` | `#fbf1ee` |
| `--nc-on-nav-muted` | `#e0bcb8` | `#c9a3a0` |
| `--nc-bulb` | `#ffc83d` | `#ffc83d` |
| `--nc-on-bulb` | `#1c1615` | `#1c1615` |
| `--nc-butaca-ocupada` | `#9a8f87` | `#5a4a47` |
| `--nc-focus` | `#1c1615` | `#ffc83d` |
| `--nc-selection` | `#ffe08a` | `#5a4410` |

Estados (sólido / tinta sobre oscuro `-ink` / tinte `-tint`):

| Estado | Sólido | `-ink` | `-tint` |
| --- | --- | --- | --- |
| Vencida | `#e5502a` | `#ff8a6b` | `#3a1a12` |
| Por vencer | `#f2b400` | `#ffcf4d` | `#3a2c08` |
| Al día | `#2f9e68` | `#5fd39a` | `#12301f` |
| Caída | `#b548b0` | `#e88ae4` | `#331531` |
| Libre | `#1a9aad` | `#5fd0e0` | `#0f2c31` |

Sombra de capa flotante (`--nc-shadow-overlay`): más profunda y más negra que la clara; valor por definir al construir.

### Qué no cambia
- La esquina de 3 px y las marcas de 1 px.
- Los rieles de 2 px bajo cada título, ahora claros.
- La tipografía, los dos anchos y las cifras tabulares.
- La densidad y todas las medidas.
- El color plano: sin degradados ni brillos.
- El riel rojo, más oscuro, como terciopelo en la penumbra.
- La bombilla ámbar y su regla: dentro del riel, en el letrero del login y en el favicon, más el foco.
- El letrero del login y el favicon: rojo butaca y ámbar, como en claro (propuesta, sin revisar).

### Por resolver al construirlo
La propuesta no trae valores para estos tokens; se deciden y se revisan en pantalla, no antes:
- Los `--nc-on-*` de los estados (texto sobre el sólido). Por cálculo, el blanco no alcanza 4.5:1 sobre los sólidos propuestos de vencida, al día y libre; hay que elegir entre texto oscuro o ajustar el sólido.
- `--nc-nav` propuesto queda casi al mismo valor de luz que `--nc-ground` (cerca de 1.05:1): verificar en pantalla que el riel se siga leyendo como riel.
- `--nc-butaca-ocupada` propuesto (`#5a4a47`) no se ha visto sobre `--nc-surface` oscuro: verificar en pantalla que la butaca ocupada se distinga del tablero y de la libre.
- `--nc-serie-*`, `--nc-avatar-*`, `--nc-on-avatar` y `--nc-scrim`.
- El valor exacto de `--nc-shadow-overlay`.
- El botón de tema, dónde vive y cómo se recuerda la preferencia.
- Cómo conserva el letrero del login su rojo si `--nc-nav` se oscurece, y si el `theme-color` cambia con el tema.
- `--nc-focus` pasa a ámbar en la propuesta: con la Regla del Foco en Tinta, el contorno enfocado de todo campo sería ámbar sobre oscuro; verificarlo en pantalla junto al tinte y la tinta de "por vencer".
