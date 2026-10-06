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
  nav-edge: "#6e1423"
  letrero: "#6e1423"
  on-letrero: "#fbf1ee"
  on-letrero-muted: "#e0bcb8"
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
  serie-ingresos: "#3d4a8a"
  serie-inversion: "#1c1615"
  serie-gastos: "#9a8f87"
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
  encabezado:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 68"
  dialogo:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
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
  button-outlined-lista:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    height: "36px"
    padding: "0 12px"
  button-whatsapp:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.base}"
    height: "36px"
    padding: "0 12px"
  button-whatsapp-celular:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.base}"
    height: "48px"
    padding: "0 12px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
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
  tablero:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
  tablero-encabezado:
    textColor: "{colors.ink}"
    typography: "{typography.encabezado}"
    height: "40px"
    padding: "0 8px"
  tablero-fila:
    textColor: "{colors.ink}"
    height: "48px"
    padding: "0 8px"
  tablero-fila-hover:
    backgroundColor: "{colors.surface-sunken}"
  casilla-accion:
    textColor: "{colors.ink-muted}"
    width: "36px"
  filtro-campo:
    rounded: "{rounded.base}"
    height: "44px"
    width: "220px"
  combo-enlace:
    textColor: "{colors.brand}"
  pestana-estado:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    height: "44px"
  pestana-estado-vencida:
    backgroundColor: "{colors.vencida}"
    textColor: "{colors.on-vencida}"
    height: "44px"
  pestana-estado-por-vencer:
    backgroundColor: "{colors.por-vencer}"
    textColor: "{colors.on-por-vencer}"
    height: "44px"
  pestana-estado-al-dia:
    backgroundColor: "{colors.al-dia}"
    textColor: "{colors.on-al-dia}"
    height: "44px"
  pestana-estado-vacia:
    backgroundColor: "{colors.vencida-tint}"
    textColor: "{colors.vencida-ink}"
    height: "44px"
  lista-cargando:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.base}"
    padding: "14px"
  lista-error:
    backgroundColor: "{colors.vencida-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "14px"
  lista-vacia:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "14px"
  dialogo-titulo:
    textColor: "{colors.ink}"
    typography: "{typography.dialogo}"
---

# Design System: Nocturne

## Overview

**Creative North Star: "Cartelera"**

Nocturne es la cartelera de un cine de barrio a plena luz: cada cuenta es una sala y cada venta una función con hora de término. El panel se lee como un tablero de letras blanco ópalo con rieles negros bajo cada título, un riel de navegación rojo butaca a la izquierda y el ámbar de una bombilla encendida marcando dónde estás. Tiene dos temas: el claro, que es el de siempre y con el que arranca, y el oscuro, la misma sala con las luces apagadas (ver "Modo oscuro"). Rechaza la rejilla de tarjetas iguales con un número grande sobre fondo azul oscuro.

Es una superficie de operación, densa y plana: filas de 36 a 50 px, paneles pegados a 16 px, color plano sin degradados y sin sombras en nada que esté apoyado en el tablero. El color fuerte se reserva para lo que cuesta dinero si se pasa por alto (vencidas, por vencer, caídas); todo lo demás es tinta sobre blanco. Celular y escritorio valen lo mismo: el mismo tablero se pliega a una columna con una barra inferior de cinco destinos.

**Alcance actual.** Están rediseñados en este mundo el layout del panel (riel, barra superior, barra inferior en celular), el buscador global, Inicio, el login (la fachada del mismo cine: a un lado el letrero, al otro la taquilla; con él se rehízo el favicon) las dos listas de uso diario, Ventas y Vencimientos, con los diálogos que se abren desde ellas (nueva venta, editar, renovar, finalizar), Cuentas (la lista, el detalle y sus diálogos), Clientes y proveedores (la lista y el diálogo de contacto), Servicios y Combos (cada lista y su diálogo) y Ventas de combos (la lista, el detalle con su diálogo de edición y la página "Nueva venta de combo"), Gastos (la lista y su diálogo), Contabilidad, Usuarios (la lista y su diálogo) y Configuración (el cambio de contraseña), además del menú del usuario al pie del riel. Con eso todas las pantallas de la app están dentro de la Cartelera.

Con Ventas y Vencimientos llegaron reglas que son GLOBALES y viven en `src/styles.scss`: el tablero de las listas, las reglas de diálogos, las de campos y las de botones. Las que se enganchan a Material (tablero blanco con borde, encabezados sobre el riel, margen de celdas, alto de filas, título y zonas de los diálogos, botones de texto en tinta) y el vacío compartido (`app-empty-state`) ya cambian el aspecto de todas las demás listas y diálogos de la app sin que nadie los haya tocado. Las pantallas que todavía no se rediseñaron las reciben sin revisar. Las piezas que se piden por clase (celda de dos renglones, casillas de acción, el cuándo, filtros compactos, carga y error de lista, tarjetas de celular) las usan Ventas, Vencimientos, Cuentas, Clientes y proveedores, Servicios, Combos, Ventas de combos, Gastos y Usuarios; Contabilidad, Configuración y los detalles usan los paneles y los mismos estados. Los diálogos que cargan opciones antes de mostrar el formulario ("Nueva venta", "Nueva cuenta", combo) usan el mismo estado de carga: el texto que dice qué llega y tres barras.

**Key Characteristics:**
- Tablero claro: fondo ópalo cálido, paneles blancos, líneas finas, riel negro de 2 px bajo cada título.
- Riel de navegación rojo butaca con la sección actual en ámbar de bombilla.
- Acción principal en tinta negra; el rojo es marca, nunca botón.
- Estados en color plano con significado fijo: bermellón, ámbar, verde, magenta, turquesa.
- Archivo en dos anchos: condensada en mayúsculas para títulos y cifras, normal para el texto; cifras tabulares.
- Una sola esquina (3 px) y sombra solo en capas flotantes.
- Cada fila urgente abre con su "función": el cuándo, en letras de cartelera.
- Las listas son tableros: encabezado en letras de cartelera sobre el riel, celdas de dos renglones y acciones en casillas fijas.
- El inventario es la cartelera: una sala por servicio y una butaca por perfil o cuenta completa, ocupada o libre.

## Colors

Blanco ópalo y tinta casi negra de tono cálido, un rojo vino para la marca y cinco colores de estado planos y saturados. Todos los valores viven en el frontmatter y, en el código, en el bloque `:root` de `src/styles.scss` como `--nc-*`.

### Primary
- **Tinta negra** (`ink`, `on-ink`): texto principal y acción principal. Los botones rellenos de Material son negros con texto blanco; los delineados llevan texto en tinta y borde `rule-field`; los de texto ("Cancelar" y las demás acciones secundarias) también van en tinta. También es el ítem activo del buscador, el anillo de foco sobre claro (`focus`) y, en todo campo de formulario, el contorno, la etiqueta y el cursor al enfocar.
- **Riel negro** (`rail`): la línea de 2 px bajo cada título de panel y de grupo de resultados. Mismo valor que la tinta, token aparte porque en modo oscuro se separan.

### Secondary
- **Rojo butaca** (`brand`, `brand-tint`, `on-brand`): marca, enlaces y selección de Material (`--mat-sys-primary`). Es el "Nocturne" de la barra superior en celular, los enlaces "Ver detalle" y el enlace "Parte de combo" de una fila. No marca el foco de un campo ni colorea un botón de texto.
- **Rojo del riel** (`nav`, `nav-hover`, `nav-active`, `nav-rule`, `on-nav`, `on-nav-muted`): familia del riel de navegación y de la barra inferior. `nav-active` es más hondo que `nav`, no más claro. Fuera del panel, `nav` es el fondo del letrero del login, del favicon y de la barra del navegador en celular (`theme-color`), con `on-nav` para la marca y `on-nav-muted` para la línea que dice qué es Nocturne.

### Tertiary
- **Ámbar de bombilla** (`bulb`, `on-bulb`): la selección dentro del riel: texto e ícono de la sección actual, el punto encendido a su derecha, la fila de bombillas punteada bajo la marca y el foco de teclado sobre el rojo. Fuera del riel solo aparece, por pedido expreso del usuario, como la fila de bombillas de la marca en el letrero del login y en el favicon.
- **Estados** (cada uno con sólido, `-ink` para texto sobre claro, `-tint` para fondos y `on-` para texto sobre el sólido):
  - **Bermellón vencida** (`vencida`): venta o cuenta con la fecha pasada; también el error de Material y una ganancia negativa.
  - **Ámbar por vencer** (`por-vencer`): vence pronto. Es el único sólido que lleva texto en tinta negra encima.
  - **Verde al día** (`al-dia`): en regla; también el chip "Activo" y el ícono de los vacíos buenos ("No tienes cuentas caídas").
  - **Magenta caída** (`caida`): cuenta caída, un cliente esperando reposición. No es un cobro atrasado y por eso no comparte color con vencida.
  - **Turquesa libre** (`libre`): perfiles o cuentas disponibles para vender (las butacas libres).
- **Series de dinero** (`serie-ingresos`, `serie-inversion`, `serie-gastos`, `serie-ganancia`): tintas propias de Contabilidad y de "Ganancia del mes". Lo que sale va en neutros (inversión en tinta, gastos en gris `#9a8f87`); lo que entra, en azul tinta (`#3d4a8a`); lo que queda, la ganancia, en verde. Las cuatro pasan 3:1 sobre blanco y se distinguen par a par, también con daltonismo (validadas con el script de paletas): un gris más oscuro para los gastos se confunde con el verde, y el gris claro que tenía "Cobrado" (`#b5aba3`, 2.25:1) no se leía.
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

**Regla del Token Único.** Todo color es un token CSS definido en el bloque `:root` de `src/styles.scss`. Ningún componente escribe un color literal (ni hex, ni `rgb()`, ni nombre): usa `var(--nc-*)` o un `--mat-sys-*`, que también apunta a ese bloque. Hay dos excepciones con nombre. **Datos de terceros:** los colores de marca de los servicios de streaming en `src/app/shared/service-icon/service-icons.data.ts`, que no son parte de la paleta. **Archivos de marca:** lo que el navegador lee antes o fuera del CSS no puede usar `var()` y lleva el valor literal de su token: `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png` y el `<meta name="theme-color">` de `src/index.html`, con su par en `src/app/core/theme/theme.ts` (rojo butaca del riel `#6e1423`, `#451019` en modo oscuro, claro `#fbf1ee` y ámbar de bombilla `#ffc83d`, los valores de `nav`, `on-nav` y `bulb`). Si uno de esos tokens cambia, esos archivos se actualizan a mano.

**Regla del Lienzo.** Lo que pinta en un `<canvas>` (Chart.js) no puede usar `var()`: lee el token ya resuelto con `cssToken('--nc-…')` de `src/app/shared/css-token.ts`. Nunca se copia el valor al TypeScript.

**Regla de la Tinta que Actúa.** Toda acción va en tinta. La principal es un relleno negro; la de fila, un delineado con texto en tinta; la secundaria ("Cancelar" y los demás botones de texto), texto en tinta con su capa de estado también en tinta; los botones de ícono y el ícono de ayuda (ⓘ), en tinta suave. El rojo butaca es marca, navegación, enlace y selección: no rellena botones ni colorea su texto. El bermellón es "vencida" y error. Así un botón nunca se confunde con un estado.

**Regla de la Bombilla.** El ámbar de bombilla se enciende dentro del riel rojo (y su barra inferior) para decir "estás acá" y, por pedido expreso del usuario, en la fila de bombillas de la marca en dos lugares más: el letrero del login y el favicon. No es un acento general: siempre va sobre rojo butaca y nunca sobre el tablero claro. Fuera de esos lugares, el ámbar que se ve es el estado "por vencer", que es otro token.

**Regla del Estado.** Bermellón, ámbar, verde, magenta y turquesa significan estados y nada más. No decoran, no distinguen categorías, no son series de dinero: para eso existen `--nc-serie-*`. En cero, un bloque de estado se apaga a su `-tint` con texto `-ink`: color solo donde hay algo que atender; vale igual para una pestaña de estado elegida. Un bloque o etiqueta toma los cuatro colores de su estado de las clases globales `.nc-estado-vencida`, `.nc-estado-por-vencer`, `.nc-estado-al-dia` y `.nc-estado-caida` (en `src/styles.scss`), que fijan `--estado`, `--sobre-estado`, `--estado-tinte` y `--estado-tinta`. Los avisos del login usan tres de esos tintes como fondo de un mensaje, con texto en tinta y el ícono en la `-ink` del estado: por vencer para la sesión expirada, al día para la contraseña cambiada y vencida para un error.

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
- **Diálogo** (700, 1.25rem, 1.2, condensada, mayúsculas, 0.02em): título de todo diálogo, sobre su riel negro.
- **Función** (700, 1rem, 1.2, condensada, mayúsculas, 0.02em): el cuándo que abre cada fila ("VENCE EN 3 DÍAS"), en la tinta de su estado. En las listas es la clase global `.nc-cuando`, que nunca se parte en dos renglones.
- **Encabezado** (700, 0.875rem, condensada, mayúsculas, 0.04em): encabezado de columna de todo tablero, en un solo renglón sobre el riel negro.
- **Body** (400, 0.875rem, 1.43, ancho normal): texto general, vía `--mat-sys-body-medium`. El nombre principal de una fila sube a 600; el dato secundario baja a 0.8125rem en tinta suave. En un tablero son los dos renglones de una celda (`.nc-celda-principal` y `.nc-celda-sub`, alto de línea 1.3).
- **Label** (600, 0.8125rem, 1.2, ancho normal, sin mayúsculas): etiqueta de tarjeta de estado, enlaces dentro de un título, texto de botón compacto, el enlace "Parte de combo" y, en tinta suave, el subtítulo que separa las salas por unidad de venta.
- **Grupo** (700, 0.8125rem, condensada, mayúsculas, 0.06em): título de grupo del menú; en el buscador, 0.875rem con 0.04em. La fecha de la barra superior usa el mismo registro a 0.9375rem, peso 600.
- **Code** (JetBrains Mono, 0.02em): códigos de venta y combo (V-00001, C-00001).

### Named Rules

**Regla de los Dos Anchos.** Condensada (68 %) en mayúsculas para títulos, cifras y el cuándo; normal (100 %) para todo lo que se lee como frase. Un texto dentro de un título que no es título (un enlace, una leyenda) vuelve a ancho normal, sin mayúsculas y sin tracking.

**Regla de la Cifra Tabular.** `font-variant-numeric: tabular-nums` está puesto en `body`: toda cifra se alinea en columna sin pedirlo.

**Regla del Signo Delante.** Todo monto en soles sale de `formatSoles` / el pipe `soles` (`src/app/shared/soles.pipe.ts`): "S/ 1,253.50". Un monto negativo lleva el signo menos tipográfico delante de la moneda, "−S/ 253.00", nunca "S/ -253.00"; vale para totales, tablas, tarjetas y el globo y el eje del gráfico. Los CSV son la excepción: exportan el número solo ("-253.00") para que la hoja de cálculo lo lea como número.

## Layout

Riel fijo de 232 px (`--nc-nav-width`) a la izquierda y, a su derecha, una barra superior de 52 px (`--nc-topbar-height`) pegada arriba con el buscador a la izquierda (hasta 520 px) y la fecha de hoy a la derecha. El contenido tiene un máximo de 1600 px con 20 px arriba, 24 px a los lados y 32 px abajo.

Inicio abre con las tarjetas de estado a todo el ancho y debajo una rejilla de dos columnas `2fr / 1fr` (mínimo 300 px la derecha) con 16 px de separación, en tres filas de áreas: arriba, las cuentas por pagar al proveedor a la izquierda y las cuentas caídas a la derecha; bajo las caídas, la ganancia del mes (las cuentas por pagar ocupan las dos filas de su columna); y al pie, a todo el ancho, "Disponible para vender". Lo urgente a la izquierda, el negocio a la derecha, el inventario cerrando.

Una pantalla de lista se arma en tres pisos separados 12 px: el encabezado de página (`.page-header`: el `h1` a la izquierda y las acciones a la derecha, 8 px entre ellas), la línea de filtros o de resumen y el tablero. Los filtros compactos (`.nc-filtros`) van en una línea que se pliega, con 12 px entre campos de 220 px de ancho.

Ritmo observado (no hay tokens de espaciado en el CSS; son los valores que se repiten): 2 px entre bloques y tramos contiguos, 4 px entre butacas (3 px en celular), 4 y 8 px dentro de un grupo, 10 px entre columnas de una fila y a cada lado de una celda de tablero (14 px al borde izquierdo del tablero), 12 px entre los pisos de una lista y entre sus tarjetas en celular, 14 px de margen interno horizontal de panel, 16 px entre paneles, 20 px entre columnas de salas, 24 px de margen de página. Filas de 36 px en el menú y el buscador, alrededor de 50 px en las listas de cuentas de Inicio y, en todo tablero, 40 px de encabezado y 48 px como mínimo por fila (una fila con celdas de dos renglones crece lo que pidan). Material corre con densidad -1.

El login no lleva riel ni barras: son dos mitades a toda la altura, el letrero rojo a la izquierda y la taquilla clara a la derecha, en proporción `9fr / 11fr` (45 % y 55 %), sin tarjeta que envuelva el formulario. Las dos mitades empiezan a la misma altura (`clamp(48px, 28vh, 300px)`), así el tope de la marca y el del título comparten línea y el título no se mueve cuando aparece o desaparece un aviso. El formulario es una columna de 360 px como máximo, alineada a la izquierda de su mitad.

Cortes:
- **Menos de 900 px (solo el login):** una columna. El letrero pasa a ser una banda arriba con la marca, su fila de bombillas y la línea que dice qué es Nocturne; debajo, la misma columna del formulario, centrada, con 20 px a los lados.
- **Menos de 1400 px:** el botón de fila de Inicio acorta su texto ("Renovar").
- **Desde 1100 px:** la fila de cuentas por pagar pasa a un solo renglón en columnas. **Menos de 1100 px:** la rejilla de Inicio pasa a una columna en este orden: cuentas caídas, cuentas por pagar, ganancia, salas.
- **Menos de 768 px** (el mismo corte de `shared/breakpoints.ts`): el riel se vuelve un panel lateral sobre el contenido (hasta 288 px o 86 % del ancho) y aparece la barra inferior de 60 px más el área segura, con cuatro destinos diarios y "Menú". Las tarjetas de estado pasan a una rejilla 2×2 con 6 px de separación; los paneles se separan 12 px; los objetivos táctiles suben a 44 px; el margen de página baja a 16 px. Ventas, Vencimientos, Cuentas, Clientes y proveedores, Servicios, Combos, Ventas de combos, Gastos y Usuarios cambian su tablero por una lista de tarjetas (12 px entre ellas); las demás tablas hacen scroll horizontal dentro de `.table-scroll`, con las celdas en un renglón. El encabezado de página se pliega, los filtros de toda lista con más de uno se guardan tras un botón "Filtros" a todo el ancho (`app-filtros-plegables`, que dice cuántos están aplicando) y los diálogos ocupan el ancho menos 32 px.

**Regla del Teclado.** En el login en celular, los campos y el botón tienen que seguir a la vista con el teclado abierto. Cuando el área visible se achica (`visualViewport` por debajo del 75 % del alto de la ventana) o la ventana mide menos de 520 px de alto, la banda se compacta a un renglón (marca a 1.5rem sobre bombillas de 2 px), se ocultan la línea que dice qué es Nocturne y la línea de ayuda, el título baja a 1.375rem y el formulario sube hasta el borde de lo visible.

**Regla de las Casillas Fijas.** Las acciones de una fila viven en casillas de ancho fijo, a la derecha, siempre en el mismo orden (`.nc-acciones`: una casilla de 36 px por acción). Una fila con menos acciones deja sus casillas vacías; nunca corre las otras. Así cada acción queda en la misma columna en todo el tablero y una fila distinta (la venta que es parte de un combo) no desordena a las demás.

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
- **Outlined:** texto en tinta, borde `rule-field`, fondo transparente. Es el botón de fila. En Inicio ("Renovar con el proveedor"): 32 px de alto y 10 px de margen horizontal en escritorio; en celular, cuadrado de 44 px solo con el ícono y el nombre completo para lectores de pantalla. En el tablero de Vencimientos ("Renovar"): 36 px de alto y 12 px de margen horizontal, con ícono y nombre; en su tarjeta de celular, 48 px.
- **Text:** texto en tinta, con capa de estado y onda en tinta (`--mat-button-text-*`). Es "Cancelar" y toda acción secundaria de un diálogo. Nunca rojo.
- **Icon:** ícono en tinta suave (`--mat-icon-button-icon-color`). Son las acciones de fila de Ventas y el ícono de ayuda (ⓘ) junto a un campo o una casilla, que es una ayuda y no una alerta.
- **Hover / Focus:** capa de estado de Material; foco con anillo de 2 px en `focus`.
- **Botón que responde:** en los diálogos de venta (nueva, editar, renovar), en los de Cuentas, en los de contacto, servicio, combo, gasto, usuario y edición de venta de combo, en "Nueva venta de combo" y en "Cambiar contraseña" el botón principal está habilitado en reposo. Al presionarlo con datos faltantes se marcan todos los campos y cada uno dice qué le falta; solo deja de responder mientras guarda (y, en "Nueva venta", mientras cargan las opciones). Los demás formularios de la app todavía lo deshabilitan mientras el formulario no es válido: es deuda, no la regla.

### Chips
- **Style:** `mat-chip` con fondo `-tint`, texto `-ink` y contorno del estado, esquina de 3 px.
- **State:** "Activo" usa verde al día (`--mat-sys-secondary-container`); "Vencida" usa bermellón (`.chip-vencida`); "Cuenta caída" usa magenta (`.chip-caida`).

### Cards / Containers
- **Panel** (`.nc-panel`): blanco, borde de 1 px `rule`, esquina de 3 px, sin sombra, sin margen interno propio: las filas llegan de borde a borde.
- **Título de panel** (`.nc-panel-title`): registro Title, margen `10px 14px 8px`, riel negro de 2 px debajo. Puede llevar a la derecha un enlace o una leyenda en ancho normal. No lleva totales: el conteo ya está en su tarjeta de estado y cada fila dice lo suyo.
- **Vacío y error dentro de un panel de Inicio:** una línea dentro del panel, margen `12px 14px`; el vacío bueno lleva un ícono en verde al día, el error va en tinta bermellón. Los de una lista entera están en "Estados de una lista".
- **Barra de carga** (`.nc-skeleton`, clase global de `src/styles.scss`): bloque de 36 px en ópalo hundido que ocupa el lugar de una fila; pulsa, salvo con movimiento reducido.
- **Tarjeta de lista** (`.nc-card`, celular): blanca, borde de 1 px `rule`, sin sombra. Arriba el título en 600 a 1.05rem con su estado al otro extremo; debajo un renglón secundario a 0.8125rem en tinta suave; después los datos como pares etiqueta y valor (etiqueta de 104 px en tinta suave, 8 px entre renglones); al pie, tras una línea `rule`, las acciones. Cuando son varias y ninguna es la principal van en casillas iguales de 48 px, con el ícono en tinta suave arriba y el nombre escrito debajo a 0.75rem (`.nc-card-acciones`).

### Inputs / Fields
- **Buscador:** 36 px de alto, fondo ópalo hundido, borde de 1 px `rule-field`, esquina de 3 px, lupa en tinta suave.
- **Hover:** el borde pasa a tinta suave.
- **Focus:** fondo blanco, borde y contorno de 1 px en `focus` (se lee como un borde de 2 px negro).
- **Resultados:** panel flotante con la sombra de capa. Cada categoría es un renglón del tablero: título condensado sobre riel negro, pegado arriba al hacer scroll. Ítems de 36 px (44 px en celular) con línea fina; el ítem activo con el teclado se invierte a tinta negra con texto blanco.
- **Campos de formulario** (Material, delineados): borde `--mat-sys-outline` (`rule-field`) y radio de 3 px. Al enfocar, contorno, etiqueta y cursor en tinta (Regla del Foco en Tinta); el error va en tinta bermellón con su mensaje debajo. El autocompletado del navegador no cambia el fondo ni la tinta del campo.
- **Obligatorio:** todo campo obligatorio muestra su asterisco, también "Método de pago", que lo toma del validador de su control.
- **Filtros compactos** (`.nc-filtros`): campos de 44 px de alto y 220 px de ancho, sin el renglón de ayuda, porque un filtro no lleva ayuda ni error. Un campo suelto en la misma situación quita ese renglón con `.nc-sin-ayuda`.
- El foco en tinta y el autocompletado son globales y se hicieron junto con el login; los revisados en pantalla son el login, los diálogos de venta y "Nueva cuenta". Los formularios de las demás pantallas los heredan sin revisar.

### Navigation
- **Menú del usuario:** sale de la tarjeta del usuario, hacia arriba, con su mismo ancho (216 px). Es una capa flotante: fondo `surface`, borde `rule`, esquina de 3 px y la sombra de capa. Tres zonas separadas por una línea `rule`: "Configuración" (40 px; 44 px en celular; en 600 con el ícono relleno si ya se está ahí), el grupo **Tema** y "Cerrar sesión". Tema lleva su título en el registro Grupo (condensada 700, mayúsculas, tinta suave) y tres opciones de 36 px (44 px en celular) con ícono de 20 px: Claro, Oscuro y Según el dispositivo. Son `menuitemradio`: la elegida va en 600, con el ícono relleno y un visto en tinta a la derecha, cuyo lugar está reservado en las tres para que el texto no se mueva. Elegir un tema no cierra el menú: se ve el cambio y se puede probar otro. Ver "Modo oscuro".
- **Riel** (232 px, `nav`): arriba la marca en letras de marquesina sobre una fila de bombillas punteada; el menú en grupos (Vender, Inventario, Dinero y, solo para el administrador, Administración) con título de grupo en `on-nav-muted` sobre una línea `nav-rule`; al pie, fijo, el usuario con avatar, nombre y rol.
- **Ítem:** 36 px (44 px en celular), texto `on-nav` 0.875rem peso 500 sin tracking, ícono de 20 px en `on-nav-muted`. Toda etiqueta se lee completa en un renglón, también en negrita cuando es la sección actual: la más larga ("Clientes y proveedores") es la que fija el margen del ícono y el lugar de la bombilla.
- **Hover:** capa de estado clara de Material; la tarjeta de usuario pasa a `nav-hover`.
- **Activo:** fondo `nav-active`, texto e ícono en ámbar de bombilla, peso 700, ícono relleno y una bombilla encendida de 6 px a la derecha, a 8 px del borde; la etiqueta termina antes de ella.
- **Foco:** contorno de 2 px en ámbar de bombilla, hacia adentro.
- **Barra superior** (52 px, blanca, línea fina abajo): buscador a la izquierda y fecha de hoy a la derecha en el registro Grupo, tinta suave. En celular muestra la marca en rojo butaca y la lupa.
- **Barra inferior (celular):** 60 px más área segura, fondo `nav`, cinco columnas iguales (Inicio, Ventas, Vencimientos, Cuentas, Menú) con ícono y etiqueta de 0.75rem en `on-nav-muted`; el activo va sobre `nav-active` en ámbar con ícono relleno.

### Listas
El tablero: toda tabla de la app, por reglas globales de `src/styles.scss`.

- **Tablero** (`.table-scroll`): blanco, borde de 1 px `rule`, esquina de 3 px, sin sombra; si la tabla no entra, hace scroll horizontal ahí dentro.
- **Encabezado:** 40 px, registro Encabezado en tinta, en un renglón, sobre el riel negro de 2 px. La columna de acciones no lleva texto visible, solo su nombre para lectores de pantalla.
- **Filas:** 48 px como mínimo, línea fina entre filas y ninguna bajo la última; al pasar el puntero cambian a ópalo hundido en 160 ms. Celdas con 8 px a cada lado (14 px la primera, al borde del tablero).
- **Celda de dos renglones** (`.nc-celda`): el dato principal en 600 y en un solo renglón (`.nc-celda-principal`) y debajo el secundario a 0.8125rem en tinta suave (`.nc-celda-sub`), que puede partirse sin dejar una palabra suelta pero nunca se recorta. Margen vertical de 6 px, 1 px entre renglones. Con un ícono de servicio, este mide 28 px y va a la izquierda, a 10 px.
- **Montos:** alineados a la derecha, encabezado incluido, en un renglón (`.mat-mdc-table .nc-celda-monto`); el monto en otra moneda va debajo, entre paréntesis.
- **Casillas de acción** (`.nc-acciones`): Regla de las Casillas Fijas; cada casilla es un botón de ícono con su nombre en un globo y para lectores de pantalla.
- **El cuándo** (`.nc-cuando`): registro Función en la tinta del estado que le da su clase `.nc-estado-*`; sin clase de estado, en tinta.
- **Enlace de combo** (`.combo-badge`): "Parte de combo C-00001" con un ícono de eslabón de 16 px, registro Label en rojo butaca, en un renglón. Lleva a la venta de combo.
- **En celular:** Ventas, Vencimientos, Cuentas, Clientes y proveedores, Servicios, Combos, Ventas de combos, Gastos y Usuarios pasan a tarjetas de lista; las demás tablas siguen en su tablero con scroll horizontal.

Las celdas de dos renglones, las casillas, el cuándo y el enlace de combo se piden por clase: los usan Ventas, Vencimientos, Cuentas, Clientes y proveedores, Servicios, Combos y Ventas de combos (el cuándo y el enlace de combo, solo las dos primeras). Lo demás de esta lista ya se aplica solo a toda tabla.

### Estados de una lista
Los tres son globales. Reemplazan al indicador giratorio y al ícono grande centrado.

- **Carga** (`.nc-lista-cargando`): un panel blanco con borde `rule`, margen interno de 14 px, que lo dice con una línea visible en tinta suave ("Cargando ventas…") sobre cuatro barras hundidas (`.nc-skeleton`) separadas 8 px. Se lee como carga también sin animación.
- **Error de carga** (`.nc-lista-error`): un aviso sobre tinte vencida, sin borde, margen interno de 14 px: ícono en tinta bermellón, una frase en tinta que dice qué pasó y cómo seguir, y un botón delineado "Reintentar". Si no entra en un renglón, el botón baja.
- **Vacío** (`app-empty-state`): una línea dentro de un panel de tablero (blanco, borde `rule`, margen interno de 14 px): ícono de 24 px en tinta tenue, el mensaje en tinta y, si hay algo que hacer, una segunda línea a 0.8125rem en tinta suave ("Prueba cambiando o quitando los filtros."). El ícono pasa a verde al día solo cuando el vacío es una buena noticia (opción `bueno`: "Ningún cliente tiene una venta vencida."). Sin ilustración ni ícono gigante.

La carga y el error los usan Ventas, Vencimientos, Cuentas, Clientes y proveedores, Servicios, Combos, Ventas de combos, Gastos, Usuarios, Contabilidad y el detalle de una venta de combo; el vacío es un componente compartido y ya se ve así en todas las listas y en el buscador.

### Ventas
El tablero de todas las ventas: encontrar una y actuar sin abrir nada más.

- **Encabezado y filtros:** "Ventas" con "Exportar CSV" (delineado) y "Nueva venta" (relleno en tinta) a la derecha; debajo, tres filtros compactos en una línea: Cliente, Servicio y Estado.
- **Columnas:** siete para el administrador: Cliente (nombre sobre el código de venta en Code), Servicio y cuenta (ícono, servicio sobre correo y perfil), Vence (la fecha sobre "desde" y su fecha de inicio), Cobrado, Dueño, Estado (chip, más "Cuenta caída" si corresponde) y acciones. El revendedor ve seis: no lleva Dueño. Estado, Vence, Cobrado y acciones miden lo que su contenido; lo que sobra va al servicio.
- **Vence:** en una venta sin finalizar, la fecha toma la tinta bermellón si ya pasó y la tinta ámbar si vence dentro de 3 días; si no, queda en tinta.
- **Acciones:** cuatro casillas fijas: copiar los datos para el cliente, editar, renovar y finalizar. Una venta finalizada lleva copiar, editar y reactivar, y deja la cuarta vacía.
- **Fila de combo:** una venta que es parte de un combo solo conserva "copiar"; las otras tres casillas quedan vacías. Su enlace al combo va junto al código, en el mismo renglón secundario, y no se parte.
- **Vacío:** "No hay ventas con estos filtros." con su segunda línea.
- **Celular:** una tarjeta por venta: cliente y chips de estado arriba; código y dueño; Servicio, Cuenta / Perfil, Desde y Vence, Cobrado; el enlace de combo al final del contenido. Al pie, hasta cuatro acciones en casillas iguales de 48 px, cada una con su ícono en tinta suave arriba y su nombre escrito debajo a 0.75rem ("Copiar datos", "Editar", "Renovar", "Finalizar"). La tarjeta de combo deja solo "Copiar datos", centrado.

### Cuentas
La lista para encontrar una cuenta; el detalle (credenciales, sala de butacas, pagos al proveedor) tiene su propio resumen en `.impeccable/surfaces/`.

- **Encabezado y filtros:** "Cuentas compradas" con "Nueva cuenta" a la derecha; tres filtros compactos: Servicio, Proveedor y Estado.
- **Columnas:** Servicio y cuenta (ícono, servicio sobre el correo, que va entero en un renglón), Proveedor, Vence (proveedor) sobre "comprada" y su fecha, Perfiles creados, Dueño (solo el administrador), Estado (chip, más "Cuenta caída" si corresponde) y la flecha que abre el detalle. Toda la fila lleva al detalle; la flecha es el enlace para teclado y lector de pantalla.
- **Vence (proveedor):** en una cuenta activa, tinta bermellón si ya pasó y tinta ámbar si vence en los próximos 7 días, la misma ventana que "Cuentas que debes pagar al proveedor" de Inicio.
- **Perfiles creados:** "2/5" en lo que se vende por perfil; una cuenta que se vende completa dice "Cuenta completa".
- **Cuenta caída:** la fila entera toma el tinte magenta, además de su chip; en celular, la tarjeta lleva borde magenta y el mismo tinte.
- **Celular:** una tarjeta por cuenta que es toda un enlace al detalle: ícono, servicio y correo arriba con los chips de estado al otro extremo; debajo, en dos columnas, Vence (proveedor), Perfiles creados, Proveedor y Dueño.

### Clientes y proveedores
La agenda del negocio: encontrar a alguien y escribirle.

- **Encabezado y filtros:** "Clientes y proveedores" con "Nuevo contacto" a la derecha; dos filtros compactos: Tipo y Estado.
- **Columnas:** Nombre (avatar con iniciales y el nombre en 600), WhatsApp, Tipo, Dueño (solo el administrador), Estado y acciones. Número, tipo, estado y acciones miden lo que su contenido; lo que sobra va al nombre.
- **Acciones:** abrir el chat es la acción de la pantalla y va con su nombre: "WhatsApp", delineado de 36 px con ícono, un enlace que abre el chat en otra pestaña. Después, tres casillas fijas: copiar número, editar y desactivar o reactivar.
- **Celular:** una tarjeta por contacto: avatar y nombre arriba con su chip de estado; tipo y dueño en el renglón secundario. El número es un botón de 48 px con borde `rule-field` que lo copia al tocarlo: a un lado el número en 600, al otro "Copiar número" con su ícono en tinta suave. Al pie, "Abrir WhatsApp" de 48 px, relleno en tinta, toma el ancho libre; "Editar" y "Desactivar" o "Reactivar" van en casillas de 72 px con el ícono arriba y el nombre debajo.
- **Número:** se muestra y se copia tal como está guardado; solo el enlace del chat lo limpia.

### Servicios
El catálogo de lo que se vende.

- **Encabezado y filtros:** "Servicios que vendes" con "Nuevo servicio" a la derecha; dos filtros compactos: Cómo se vende y Estado.
- **Columnas:** Nombre (ícono del servicio y el nombre en 600), Cómo se vende, Duración, Perfiles por cuenta, Precio de venta, Dueño (solo el administrador), Estado y dos casillas fijas: editar y desactivar o reactivar. "Cómo se vende" va en corto ("Por perfiles", "Cuenta completa", "Plan familiar", "IPTV"); la explicación entre paréntesis queda en el filtro y en el diálogo. Todas miden lo que su contenido y lo que sobra va al nombre. El precio va a la derecha, en 600.
- **Celular:** una tarjeta por servicio: ícono y nombre arriba con su chip de estado; cómo se vende (en corto) y el dueño en el renglón secundario; Duración, Perfiles por cuenta y Precio de venta como pares. "Perfiles por cuenta" solo aparece en lo que se vende por perfil y, en el plan familiar, se llama "Cupos del plan", igual que en el formulario. Al pie, "Editar" y "Desactivar" o "Reactivar" en casillas iguales.
- **Diálogo:** las etiquetas siguen al tipo elegido ("Precio de venta por perfil", "por cupo" o "de la cuenta"; "Perfiles por cuenta" o "Cupos del plan" solo cuando aplica), cada una con su ícono de ayuda.

### Combos
Los paquetes de servicios que se venden juntos.

- **Encabezado y filtro:** "Combos" con "Nuevo combo" a la derecha; un solo filtro compacto, Estado, que no se pliega en celular.
- **Columnas:** Nombre en 600, Descripción en tinta suave, Servicios, Precio de venta a la derecha, Dueño (solo el administrador), Estado y dos casillas fijas.
- **Servicios:** la pila de íconos (`app-service-icon-stack`, 28 px, superpuestos 8 px con un anillo blanco) y, al lado, los nombres escritos en tinta suave unidos con " + ". No se usan chips: un chip es un estado.
- **Celular:** una tarjeta por combo: nombre y chip de estado; descripción y dueño debajo; la pila de íconos con los nombres; Precio de venta; al pie, "Editar" y "Desactivar" o "Reactivar".
- **Diálogo:** mientras cargan los servicios lo dice con una línea y barras. Los servicios elegidos se listan debajo del selector como fichas con su ícono y un botón para quitarlos.

### Ventas de combos
El mismo tablero que Ventas, para lo que se vende en paquete.

- **Encabezado y filtros:** "Ventas de combos" con "Nueva venta de combo" a la derecha; tres filtros compactos: Cliente, Combo y Estado.
- **Columnas:** Cliente (nombre sobre el código de venta en Code y rojo butaca, que es el enlace al detalle), Combo (la pila de íconos de sus servicios y el nombre en 600), Vence (la fecha sobre "desde" y su fecha de inicio), Cobrado, Dueño (solo el administrador), Estado (chip, más "Cuenta caída" si corresponde) y acciones. Las mismas medidas que Ventas.
- **Vence:** como en Ventas: tinta bermellón si ya pasó y tinta ámbar si vence dentro de 3 días, solo en una venta sin finalizar.
- **Acciones:** tres casillas fijas: ver detalle, renovar y finalizar. Una venta finalizada lleva ver y reactivar, y deja la tercera vacía.
- **Celular:** una tarjeta por venta: cliente y chips de estado arriba; código (enlace) y dueño; Combo con su pila de íconos, Desde y Vence, Cobrado. Al pie, "Ver detalle", "Renovar" y "Finalizar" en casillas iguales; la finalizada lleva "Ver detalle" y "Reactivar".
- **Nueva venta de combo:** es una página, no un diálogo. Dos paneles a la par desde 1100 px (hasta 1040 px en total): a la izquierda los datos de la venta; a la derecha "¿Qué le das de cada servicio?" sobre su riel, con un tramo por servicio (ícono, nombre, cuenta y perfil) separado por una línea `rule`. Antes de elegir el combo ese panel dice "Elige un combo para ver sus servicios." Por debajo de 1100 px, una columna de 560 px como máximo. Las acciones van al pie, tras una línea `rule`; en celular se reparten el ancho.

### Detalle de una venta de combo
Lo que el cliente recibe y la venta que lo cobra.

- **Cabecera:** el enlace para volver; "Venta de combo" con su código en Code y, debajo, el cliente en tinta suave. A la derecha las acciones: "Copiar datos para el cliente" en relleno de tinta (es lo que se hace a diario) y "Editar", "Renovar" y "Finalizar" (o "Reactivar") delineados. En celular, copiar ocupa el ancho y las otras se reparten el renglón.
- **Cuerpo:** dos paneles a la par desde 1100 px (`3fr / 2fr`). A la izquierda "Servicios incluidos": tablero de solo lectura con Servicio (ícono y nombre), Cuenta / Perfil (con el chip "Cuenta caída" si corresponde), Cliente y Vence; en celular, un renglón por servicio. A la derecha "Datos de la venta": pares etiqueta y valor separados por líneas `rule`, con el estado arriba, la fecha de vencimiento en la tinta de su urgencia y, al pie, los días sumados por cuentas caídas.
- **Estados:** carga con una línea y barras; si falla, el aviso con "Reintentar" y el enlace para volver.

### Gastos
Lo que se gasta fuera de las cuentas.

- **Encabezado y filtro:** "Gastos" con "Nuevo gasto" a la derecha; un solo filtro compacto, Estado.
- **Columnas:** Descripción en 600 (puede partirse), Fecha, Método de pago, Monto a la derecha (el monto en otra moneda debajo, entre paréntesis), Dueño (solo el administrador), Estado y dos casillas fijas: editar y desactivar o reactivar.
- **Celular:** una tarjeta por gasto: descripción y chip de estado; fecha y dueño en el renglón secundario; Monto en 600 y Método de pago; al pie, "Editar" y "Desactivar" o "Reactivar".

### Contabilidad
Los números del periodo: cuánto entró, cuánto salió y cuánto quedó.

- **Rango:** una línea de campos compactos: "Ver números de" (solo el administrador), Desde, Hasta y "Ver" en relleno de tinta. Al entrar, Desde y Hasta muestran el rango que el backend usa por defecto (el mes actual), sin enviarlo: un extremo solo se manda cuando se cambia. No se pliega en celular: es el control de la pantalla; ahí las dos fechas comparten renglón y "Ver" ocupa el ancho. Al volver a cargar con números ya en pantalla, estos se atenúan y una línea junto a "Ver" lo dice.
- **La cuenta del periodo:** un solo panel que se lee como se calcula: Cobrado a clientes − Pagado a proveedores − Otros gastos = Ganancia. Cada monto en Display con su etiqueta en Label y su ícono de ayuda; los signos van entre montos en condensada 800 y tinta tenue. El resultado va en negativo de tablero (fondo tinta, letras blancas) y, si el periodo dio pérdida, sobre bermellón. En celular la cuenta baja a renglones: el signo a la izquierda, la etiqueta y el monto a los extremos, y el resultado cierra a todo el ancho. No son tarjetas iguales: es una sola cuenta.
- **Reportes:** dos paneles a la par (uno bajo el otro por debajo de 1100 px), "Por servicio" y "Por método de pago", cada uno con su título sobre el riel y "Descargar Excel (CSV)" delineado a la derecha (32 px; 44 px en celular). "Por servicio" sigue el orden de la cuenta de arriba (Cobrado, Pagado a proveedores, Ganancia); su CSV conserva el suyo. Montos a la derecha, la última columna (el resultado de la fila) en 600 y en tinta bermellón si es negativa; los encabezados largos bajan a un segundo renglón y el nombre puede partirse. En celular cada fila es un bloque: el nombre y sus tres montos como pares, sin scroll horizontal.
- **Línea de tiempo:** panel "Cómo te fue en el tiempo" con "Ver por" a la derecha del título. Barras agrupadas con las tintas `--nc-serie-*` (Regla del Lienzo), esquina de 1 px, sin líneas verticales, la línea del cero en tinta y las demás en `rule`; eje y globo en soles, con los negativos como en el resto de la app ("−S/ 100" en el eje, sin decimales; "−S/ 100.00" en el globo); el periodo va en el formato de la app: en el eje, "01/10" por día o semana y "10/2026" por mes; en el globo, la fecha completa. El globo muestra las cuatro series del periodo; la muestra de color de cada una lleva un filo de 1 px del color del texto del globo, porque la de "Pagado a proveedores" es del mismo color que el globo en los dos temas. El lienzo lleva un nombre para lectores de pantalla.
- **Estados:** carga con una línea y barras; error con "Reintentar" en el lugar de los reportes; sin movimientos, cada panel lo dice con una línea ("No hay movimientos entre estas fechas.") y su botón de descarga queda deshabilitado.

### Usuarios
Quién puede entrar al panel. Solo la ve el administrador.

- **Encabezado y filtro:** "Usuarios" con "Nuevo usuario" a la derecha; un solo filtro compacto, Estado.
- **Columnas:** Nombre (avatar con iniciales y el nombre en 600), Correo, Rol, Estado y dos casillas fijas: editar y desactivar o reactivar.
- **El propio administrador:** no puede desactivarse ni cambiar su rol. En su fila, la casilla de desactivar queda apagada y su globo dice por qué; en su tarjeta de celular esa acción no aparece y una línea en tinta suave lo dice ("No puedes desactivarte a ti mismo."). En el diálogo, su rol va deshabilitado con su renglón de ayuda.
- **Celular:** una tarjeta por usuario: avatar, nombre y chip de estado; el correo en el renglón secundario; Rol; al pie, "Editar" y "Desactivar" o "Reactivar".
- **Diálogo:** Correo (fijo al editar), Nombre, Rol y Contraseña, que se escribe oculta y tiene su ojo para verla, como en el login.
- **Sin permiso:** si un revendedor llega a la dirección a mano, una línea en un panel con un candado: "Acceso restringido" y a quién le corresponde. Sin ícono gigante.

### Configuración
Lo propio de cada usuario. Hoy, una sola sección.

- **Cambiar contraseña:** un panel de 480 px como máximo con su título sobre el riel. Abre con un aviso sobre tinte por vencer que dice la consecuencia antes de pedir nada ("Al cambiarla se cerrará tu sesión en todos los dispositivos."). Tres campos, cada uno con su ojo; el botón en relleno de tinta, a la derecha (a todo el ancho y de 48 px en celular).
- **Error del intento:** un aviso sobre tinte vencida, encima del botón, con el mensaje que mandó el backend: ícono de error para la contraseña incorrecta o un fallo, un reloj cuando fueron demasiados intentos. La sesión no se cierra.
- **Éxito:** se cierran todas las sesiones y se va al login, que muestra su aviso verde "Contraseña actualizada. Vuelve a ingresar."

### Vencimientos
La lista de cobro: quién vence, cuándo, y el recordatorio a un toque.

- **Pestañas de estado:** la interacción firma. Tres pestañas juntas (Vencidas, Por vencer, Al día), cada una con su conteo: son el resumen y el filtro a la vez. 44 px de alto, borde y divisores `rule-field`, etiqueta en 600 y el conteo en condensada 800 a 1.25rem. La elegida se llena con el sólido de su estado y su texto `on-`; las otras quedan en blanco con el conteo en la tinta de su estado. Una pestaña en cero se apaga a su tinte con texto en la tinta del estado, también cuando está elegida. En celular ocupan todo el ancho.
- **Días de aviso:** a la derecha, el campo "Avisarme con (días antes)" de 44 px y 250 px de ancho, sin renglón de ayuda y con su ícono de ayuda; la etiqueta entra completa. En celular va a todo el ancho, bajo las pestañas.
- **Columnas:** cinco: Cuándo, Cliente, Servicio y cuenta, Cobrado y acciones. Cada fila abre con su cuándo ("VENCIÓ HACE 22 DÍAS") sobre la fecha; va en tinta bermellón si ya pasó y, si no, en la tinta de la pestaña en la que está. El enlace de combo va bajo el cliente.
- **Acciones:** en columnas fijas: "WhatsApp", botón relleno en tinta con ícono y nombre (columna de 124 px), y "Renovar", delineado con ícono y nombre (columna de 110 px), los dos de 36 px. Una venta de combo no se renueva sola y deja vacía esa columna; una venta con la cuenta caída muestra su chip magenta en lugar de los botones. En "Al día" no hay acciones. El recordatorio es la acción de la pantalla y por eso lleva el nombre escrito; no toma el verde de la marca de WhatsApp.
- **Vacío:** una línea por pestaña; solo el de Vencidas es buena noticia y lleva el ícono en verde al día.
- **Celular:** una tarjeta por venta con el cliente arriba y el cuándo al otro extremo; Servicio, Cuenta / Perfil, Vence y Cobrado. Al pie, "Enviar por WhatsApp" de 48 px, relleno en tinta, toma el ancho del pie; cuando hay "Renovar" (48 px, delineado), comparten el renglón y WhatsApp se queda con lo que sobra.

### Diálogos
Globales, por reglas de `src/styles.scss`.

- **Superficie:** blanca, borde de 1 px `rule`, esquina de 3 px, con la sombra de capa flotante.
- **Título:** registro Diálogo sobre el riel negro de 2 px, con 10 px de aire antes del riel.
- **Contenido:** se desplaza entre el título y los botones, que quedan fijos; 10 px arriba para que la etiqueta del primer campo no se recorte y 16 px abajo. Su alto máximo es el de la pantalla menos 220 px (menos 180 px en celular).
- **Acciones:** una línea `rule` encima marca dónde termina la zona que se desplaza. A la derecha, "Cancelar" como botón de texto en tinta y después la acción principal en relleno negro.
- **Celular:** el ancho de la pantalla menos 32 px.

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

- **Letrero:** fondo `letrero`, el mismo rojo en los dos temas (la fachada no se apaga). La marca en letras de marquesina (`on-letrero`) sobre su fila de bombillas y, debajo, una línea que dice qué es Nocturne (1.125rem en `on-letrero-muted`, hasta 28 caracteres de ancho; 0.875rem en la banda de celular). Por debajo de 900 px es la banda superior y conserva esa línea.
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
- **`theme-color`:** el rojo del riel del tema en uso (`#6e1423` en claro, `#451019` en oscuro), para la barra del navegador en celular. Lo cambian el script de `src/index.html` y `src/app/core/theme/theme.ts`.
- Estos archivos llevan colores literales: es la excepción "Archivos de marca" de la Regla del Token Único.

## Do's and Don'ts

### Do:
- **Sí:** toma cada color de un token `--nc-*` del bloque `:root` de `src/styles.scss`; si falta uno, se agrega ahí con su nombre de rol.
- **Sí:** en gráficos de canvas, lee el color con `cssToken()`.
- **Sí:** pon cada título de panel o de grupo sobre un riel negro de 2 px (`--nc-rail-width`, `--nc-rail`).
- **Sí:** usa la tinta negra para la acción principal, el botón delineado con borde `rule-field` para las acciones de fila y el botón de texto en tinta para "Cancelar" y las acciones secundarias.
- **Sí:** arma toda lista nueva con el tablero global: `.table-scroll`, `.nc-celda` para dos renglones, `.nc-acciones` para las acciones y `.nc-filtros` para los filtros.
- **Sí:** deja vacía la casilla de una acción que una fila no tiene.
- **Sí:** di la carga con `.nc-lista-cargando` y una línea visible, el error con `.nc-lista-error` y "Reintentar", y el vacío con `app-empty-state`.
- **Sí:** escribe el nombre de la acción central de una pantalla en su botón ("WhatsApp", "Renovar").
- **Sí:** marca con su asterisco todo campo obligatorio.
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
- **Sí:** cuando cambie `nav`, `on-nav` o `bulb`, actualiza a mano el favicon (SVG, ICO, PNG) y el `theme-color` (en `src/index.html` y en `src/app/core/theme/theme.ts`, un valor por tema).

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
- **No:** uses el rojo para marcar el foco de un campo, ni para un botón de texto o un ícono de ayuda.
- **No:** deshabilites el botón principal de un formulario porque le falten datos: queda habilitado y valida al presionarlo. En el login solo se deshabilita durante la espera por demasiados intentos; en los diálogos de venta, solo mientras guarda.
- **No:** uses un indicador giratorio suelto ni un ícono grande centrado para la carga o el vacío de una lista.
- **No:** pintes de verde el ícono de un vacío que no es una buena noticia.
- **No:** corras las acciones de una fila para tapar el hueco de una que falta.

## Modo oscuro

**Estado: construido y revisado en pantalla** (todas las pantallas, a 1440 px y 360 px, con el administrador y con un revendedor; contraste de texto medido sobre la interfaz real).

**Concepto: "una sala de cine con las luces apagadas".** La misma cartelera, de noche: el tablero se apaga a un negro cálido, las letras y los rieles pasan a claro, el riel rojo queda como terciopelo en penumbra y la bombilla ámbar sigue encendida.

**Cómo está hecho.** El bloque `:root[data-theme='dark']` de `src/styles.scss` redefine ÚNICAMENTE tokens, con `color-scheme: dark`; ningún componente sabe en qué tema está (Regla del Token Único). El tema de Material es `theme-type: color-scheme`, así lo poco que no pasa por un `--nc-*` sigue al mismo interruptor.

**El selector.** Vive en el menú del usuario, grupo "Tema": Claro, Oscuro y Según el dispositivo. La app arranca en claro. La elección se guarda en el navegador de cada dispositivo (`localStorage`, clave `nocturne_theme`: `light`, `dark` o `system`), no en la cuenta: sobrevive al cierre de sesión y vale también para el login. La maneja `Theme` (`src/app/core/theme/theme.ts`), que pone `data-theme="light|dark"` en `<html>`, actualiza el `theme-color` y, en "Según el dispositivo", sigue al sistema aunque cambie con la app abierta.

**Sin parpadeo.** Un script en el `<head>` de `src/index.html` lee la misma clave y pone `data-theme` antes del primer pintado, antes de que cargue la app. Es la única copia de esa lógica fuera de `Theme`: si cambia la clave o sus valores, cambian los dos.

**Gráficos.** Lo que pinta en canvas lee tokens ya resueltos (Regla del Lienzo), así que no se entera solo: Contabilidad observa `Theme.resolved` y arma el gráfico de nuevo al cambiar de tema.

### Paleta

| Token | Claro | Oscuro |
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
| `--nc-nav` | `#6e1423` | `#451019` |
| `--nc-nav-hover` | `#85192b` | `#571522` |
| `--nc-nav-active` | `#4f0d18` | `#2a070e` |
| `--nc-nav-rule` | `#8f3040` | `#6b2a36` |
| `--nc-nav-edge` | `#6e1423` | `#6b2a36` |
| `--nc-on-nav` | `#fbf1ee` | `#fbf1ee` |
| `--nc-on-nav-muted` | `#e0bcb8` | `#c9a3a0` |
| `--nc-letrero`, `--nc-on-letrero`, `--nc-on-letrero-muted` | `#6e1423`, `#fbf1ee`, `#e0bcb8` | iguales |
| `--nc-bulb`, `--nc-on-bulb` | `#ffc83d`, `#1c1615` | iguales |
| `--nc-butaca-ocupada` | `#9a8f87` | `#75645f` |
| `--nc-serie-ingresos` | `#3d4a8a` | `#8f9eea` |
| `--nc-serie-inversion` | `#1c1615` | `#f1e6e2` |
| `--nc-serie-gastos` | `#9a8f87` | `#7d6f6a` |
| `--nc-serie-ganancia` | `#1f7a4d` | `#3fb37a` |
| `--nc-avatar-1` … `-6` | `#8f1a2c` `#0a6876` `#1a6941` `#7d2379` `#855600` `#3d4a8a` | `#b0354a` `#167d8c` `#268254` `#9c3d98` `#9a6a10` `#5563ad` |
| `--nc-on-avatar` | `#ffffff` | `#ffffff` |
| `--nc-tile-edge` | `transparent` | `rgb(241 230 226 / 0.26)` |
| `--nc-focus` | `#1c1615` | `#f1e6e2` |
| `--nc-selection` | `#ffe08a` | `#5a4410` |
| `--nc-scrim` | `rgb(28 22 21 / 0.45)` | `rgb(0 0 0 / 0.62)` |
| `--nc-shadow-overlay` | `0 12px 32px -8px rgb(28 22 21 / 0.28), 0 2px 6px rgb(28 22 21 / 0.12)` | `0 16px 40px -8px rgb(0 0 0 / 0.72), 0 2px 8px rgb(0 0 0 / 0.5)` |

Estados en oscuro (sólido / texto sobre el sólido `on-` / tinta `-ink` / tinte `-tint`):

| Estado | Sólido | `on-` | `-ink` | `-tint` |
| --- | --- | --- | --- | --- |
| Vencida | `#e5502a` | `#140e0f` | `#ff8a6b` | `#3a1a12` |
| Por vencer | `#f2b400` | `#140e0f` | `#ffcf4d` | `#3a2c08` |
| Al día | `#2f9e68` | `#140e0f` | `#5fd39a` | `#12301f` |
| Caída | `#c45cbf` | `#140e0f` | `#e88ae4` | `#331531` |
| Libre | `#1a9aad` | `#140e0f` | `#5fd0e0` | `#0f2c31` |

### Lo que se decidió al construirlo

- **Texto oscuro sobre los sólidos de estado.** El blanco no llega a 4.5:1 sobre los sólidos aclarados; el negro cálido sí (5:1 o más). "Caída" se aclaró de la propuesta (`#b548b0` a `#c45cbf`) para pasar con el mismo texto que los demás.
- **El riel se distingue por tres cosas.** Es más rojo y más claro que la propuesta (`#451019`, no `#2b0a11`, que quedaba a 1.05:1 del fondo), lleva un filo de 1 px hacia el tablero (`--nc-nav-edge`, invisible en claro porque vale lo mismo que `nav`) y la barra inferior del celular lleva ese filo arriba. `nav-active` sigue siendo más hondo que `nav`.
- **La fachada no se apaga.** El letrero del login tiene tokens propios (`--nc-letrero`, `--nc-on-letrero`, `--nc-on-letrero-muted`) que valen lo mismo en los dos temas; la taquilla sí se oscurece. El favicon no cambia. El `theme-color` sí sigue al tema: es el `nav` de cada uno.
- **El foco sigue en tinta.** La propuesta lo pasaba a ámbar; se descartó. En oscuro la tinta es clara (más de 13:1 sobre el tablero), la Regla del Foco en Tinta queda igual en los dos temas y el ámbar sigue sin salir del riel, donde se confundiría con "por vencer".
- **La acción principal se invierte con la tinta.** El relleno pasa a claro con letras oscuras; lo mismo el resultado de la cuenta en Contabilidad (el "negativo de tablero") y la opción resaltada del buscador.
- **Tarjetas de estado de Inicio más apagadas.** El sólido pleno encandila sobre el fondo oscuro, así que las tarjetas tienen relleno propio (`--nc-*-bloque` y `--nc-on-*-bloque`; en claro valen lo mismo que el sólido): vencida `#b53a19`, por vencer `#c99508`, al día `#23744b` y caída `#8e3a8a`, con texto claro `#fbf1ee` (oscuro `#140e0f` sobre el ámbar) a 4.5:1 o más. Los sólidos plenos siguen en lo chico: chips, filtros de Vencimientos y butacas.
- **Butaca ocupada** a `#75645f`: 3:1 contra el tablero, apagada pero visible, y lejos del turquesa de la libre.
- **Series de dinero:** los mismos papeles (lo que sale en neutros, lo que entra en azul, lo que queda en verde), todos a 3:1 o más sobre `surface`.
- **Avatares:** un punto más claros para despegar del tablero, todavía con iniciales en blanco a 4.5:1 o más.
- **Íconos de servicios.** Son datos de terceros y no cambian de color. En oscuro cada ícono lleva un filo interior de 1 px (`--nc-tile-edge`, transparente en claro): así un logo de fondo casi negro (Disney+) no se pierde contra el tablero. Los glifos negros ya iban sobre un tile claro.
- **Capas flotantes:** velo más negro y sombra más honda; conservan su borde `rule`, que en oscuro es lo que más las separa.
- **Autocompletado del navegador:** la misma regla que en claro (el campo conserva su fondo y su tinta, que salen de tokens), más `color-scheme: dark` para lo que el navegador dibuja por su cuenta (barras de desplazamiento, controles nativos). No se pudo capturar un autocompletado real en el navegador sin cabeza; falta verlo en un navegador con datos guardados.

### Qué no cambia
- La esquina de 3 px y las marcas de 1 px.
- Los rieles de 2 px bajo cada título, ahora claros.
- La tipografía, los dos anchos y las cifras tabulares.
- La densidad y todas las medidas.
- El color plano: sin degradados ni brillos.
- La bombilla ámbar y su regla: dentro del riel, en el letrero del login y en el favicon.
- El letrero del login y el favicon.
