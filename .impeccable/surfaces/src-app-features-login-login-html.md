---
version: 1
slug: "src-app-features-login-login-html"
primary_target: "src/app/features/login/login.html"
related_targets: []
---

# Login

## Scope

Modo: Operate. Cubre `features/login` y el favicon (`public/favicon.svg`, `public/favicon.ico`). Hereda el mundo de DESIGN.md (Cartelera, modo claro); no lo cambia.

## Audience and task

Lo primero que ve un revendedor nuevo, y lo que ve cualquiera al volver. Tarea única: entrar con correo y contraseña. No hay registro público: las cuentas las crea el administrador.

## Constraints

- El nombre Nocturne es fijo; logo y favicon pueden rediseñarse.
- Estados obligatorios: cargando, credenciales incorrectas (401), demasiados intentos (429; el backend limita a 5 por minuto), sin conexión, sesión expirada (`?sessionExpired=1`) y contraseña cambiada (`?passwordChanged=1`).
- Sin «crear cuenta».
- Bien a 360 px y en escritorio. En celular, con el teclado abierto, los campos y el botón Ingresar siguen a la vista.
- La mitad roja recibirá más adelante una imagen de marca: `public/login-marca.jpg`, reemplazable sin tocar código, ajustada para cubrir sin deformarse. Mientras ese archivo sea el marcador de 1×1 px, se muestra el letrero tipográfico.

## Direction contract

THESIS: El login es la fachada del cine partida en dos: a un lado el letrero, al otro la taquilla. Rechaza la tarjeta centrada con logo encima sobre un fondo vacío.

OWN-WORLD: El de DESIGN.md sin añadidos: rojo butaca del riel, letras de cartelera en Archivo condensada, fila de bombillas ámbar punteada, tablero blanco ópalo, título sobre riel negro de 2 px, botón principal en tinta negra, avisos en los tintes de estado, esquinas de 3 px, sin sombras.

STORY: Reconoce la marca, entiende qué es, escribe sus dos datos y entra; si algo falla, el aviso dice qué pasó y qué hacer.

FIRST VIEWPORT: Escritorio 1440: mitad izquierda (45 %) roja a toda la altura con NOCTURNE grande sobre su fila de bombillas y una línea que dice qué es; mitad derecha clara con una columna de 360 px: título «Ingresar» sobre riel negro, aviso si corresponde, correo, contraseña con botón para verla, Ingresar a todo el ancho y una línea para quien no tiene acceso. Celular 360: el rojo es una banda superior con la marca; debajo, la misma columna. Con el teclado abierto la banda se reduce y el formulario sube.

Signature interaction: el aviso de demasiados intentos cuenta los segundos y el botón se rehabilita solo al terminar. Motion: transiciones de estado de 160 ms; la banda se reduce al abrir el teclado.

FORM: Dos mitades (letrero y formulario), candidata 2 de mi lista ordenada, elegida por el usuario. Seed key: f4138b29.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- La imagen de marca definitiva (la aporta el usuario).
