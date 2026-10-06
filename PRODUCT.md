# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos tipos de usuario, ambos con login propio (confirmado por el dueño):

- **Administrador (dueño del negocio).** Administra y también vende: lleva
  su propio negocio (servicios, cuentas, proveedores, clientes, ventas,
  combos, gastos y contabilidad) y además gestiona los usuarios. En las
  listas, detalles, búsqueda global y exportaciones a CSV ve los registros
  con su dueño. En Contabilidad, el selector de dueño ("Ver números de") le
  permite ver su propio negocio, el de un revendedor específico o todo el
  negocio.
- **Revendedores.** Cada revendedor maneja su propio negocio completo y
  aislado: sus propios servicios, cuentas, proveedores, clientes, ventas,
  combos, gastos y contabilidad. Lo único que no ve es Usuarios.

El panel se usa por igual en dos situaciones (confirmado):

- **Celular**, en operación rápida: buscar una cuenta o un cliente, copiar
  credenciales, registrar una venta o una renovación.
- **Laptop/PC**, en sesiones de revisión: listas largas, vencimientos,
  gastos y contabilidad.

## Product Purpose

Nocturne es el panel de gestión de un negocio de reventa de cuentas y
perfiles de streaming (Netflix, Disney, Crunchyroll, IPTV, etc.). Reemplaza
la plantilla de Excel con la que se llevaba el negocio.

Permite saber, en un solo lugar: qué cuentas se tienen y a qué proveedor se
compraron, qué perfil está vendido a qué cliente, qué vence y cuándo, cuánto
entró, cuánto se gastó y cuál es la ganancia.

## Positioning

Fuente: documentación del repo, no una declaración del dueño.

Es una herramienta interna hecha a medida del modelo de este negocio, no un
CRM genérico: su unidad de trabajo es la cuenta de streaming con sus
perfiles, su proveedor, su vencimiento y su cliente.

## Operating Context

- **Idioma y región:** español, `es-PE`. Los métodos de pago que ofrece el
  selector incluyen Yape, Plin, transferencia bancaria, tarjeta, PayPal,
  Zelle, Mercado Pago, Binance/cripto y efectivo.
- **WhatsApp** es el canal con clientes y proveedores; cada contacto guarda
  su número.
- **Credenciales sensibles:** las cuentas guardan correo, clave del servicio,
  clave del correo y PIN de perfil. El backend las cifra y las listas nunca
  las muestran; solo se revelan y copian desde el detalle.
- **Exportación a CSV** pensada para abrirse en Excel.
- **Backend:** API propia (`nocturne-api`, NestJS + PostgreSQL). Frontend y
  backend están desplegados en Railway.

## Capabilities and Constraints

Secciones existentes (todas en producción):

- Inicio (dashboard con indicadores y gráficos)
- Servicios (catálogo: tipo, duración, pantallas máximas, precio base)
- Clientes y proveedores (clientes finales, proveedores, revendedores)
- Cuentas y perfiles (incluye marcar una cuenta como caída, reponerla y
  renovarla con el proveedor)
- Ventas (crear, editar, renovar, finalizar)
- Combos y Ventas de combos
- Vencimientos (incluye el recordatorio por WhatsApp al cliente)
- Gastos
- Contabilidad
- Usuarios (solo administrador)
- Configuración (cambio de contraseña)
- Búsqueda global

Restricciones técnicas:

- Angular 22 con standalone components y Angular Material 22 (Material 3),
  sin `@angular/animations`.
- Gráficos con Chart.js.
- Nada se borra físicamente: servicios, contactos, cuentas y perfiles se
  desactivan y se pueden reactivar.
- Los mensajes de error de las acciones muestran el texto real que devuelve
  el backend.

Terminología del producto (en español, tal como aparece en la interfaz):
servicio, cuenta, perfil, pantallas, proveedor, cliente, revendedor, venta,
combo, vencimiento, renovación, cuenta caída, reposición, gasto.

Sin decidir:

- Qué permisos exactos debería tener un revendedor más allá de los actuales.

## Brand Commitments

- El nombre **Nocturne** es fijo (confirmado).
- El logo/favicon actual y el resto de la identidad pueden cambiar
  (confirmado).

## Evidence on Hand

- Íconos de servicios de streaming en `src/app/shared/service-icon/assets/`.
- Favicon actual en `public/favicon.svg` y `public/favicon.ico` (no
  vinculante).
- Roadmap e historial de decisiones en `../nocturne-api/PROGRESS.md`.
- No hay testimonios, métricas públicas, material de marketing ni capturas
  versionadas. No inventarlos.

## Product Principles

1. **Más rápido que el Excel que reemplaza.** Buscar, registrar y renovar
   debe costar menos pasos que una hoja de cálculo.
2. **El celular y el escritorio valen lo mismo.** Ninguna tarea diaria puede
   depender de tener una pantalla grande.
3. **Las credenciales se cuidan.** Ocultas por defecto, visibles solo cuando
   se piden, fáciles de copiar sin exponerlas de más.
4. **Lo que vence manda.** Vencimientos y cuentas caídas son lo que cuesta
   dinero si se pasa por alto; deben ser imposibles de ignorar.
5. **Cada rol ve lo suyo.** El revendedor no debe encontrarse con acciones
   que no puede ejecutar.
