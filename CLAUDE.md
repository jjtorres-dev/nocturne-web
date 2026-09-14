# CLAUDE.md — nocturne-web

Contexto para Claude Code (u otros asistentes) trabajando en este repo.

## Qué es esto

Frontend de Nocturne, panel de gestión y reventa de cuentas/perfiles de
streaming, reemplazando una plantilla de Excel. Consume la API de
`nocturne-api`. El roadmap y estado del proyecto viven en `PROGRESS.md`
dentro del repo `nocturne-api`.

## Stack

- Angular 22, standalone components (no hay `NgModule`s en este proyecto)
- Angular Material 22 (Material 3, sin `@angular/animations` — Material ya
  no lo requiere como peer dependency en esta versión)
- Vitest (tests, vía `ng test`) + ESLint (`@angular-eslint`, vía `ng lint`)
- Convención de nombres de archivo sin sufijo de tipo: `login.ts` /
  `login.html` / `login.scss`, no `login.component.ts` — es el default de
  `ng generate` en esta versión y debe mantenerse en todo archivo nuevo.

## Estructura de carpetas

```
src/app/
  core/auth/           # Auth (servicio con signals), authGuard, authInterceptor
  layout/admin-layout/ # Sidebar + header del panel admin
  features/<nombre>/   # Una carpeta por sección/pantalla
  app.routes.ts
src/environments/      # apiUrl por entorno
```

Cada sección nueva del roadmap (Servicios, Contactos, Cuentas, Ventas,
Vencimientos, Contabilidad, Combos) se agrega como carpeta nueva bajo
`features/`, con su propia entrada en el array `navItems` de
`AdminLayout` (`src/app/layout/admin-layout/admin-layout.ts`).

## Convenciones de este repo

- **Autoría de commits**: únicamente `jjtorres-dev` /
  `jjtorres.devtech@gmail.com`. No agregar `Co-Authored-By` ni ningún footer
  de Claude/asistente en los commits de este repo.
- **Merges**: siempre `--ff-only`.
- **No commitear sin correr localmente primero**: antes de todo commit,
  correr `npm run lint`, `npm test` y `npm run build` y confirmar que
  pasan. Si el cambio toca login/API, probarlo manualmente contra el
  backend local corriendo.
- **Secrets de deploy**: cualquier variable sensible de Vercel va como
  variable de entorno del proyecto en Vercel (o GitHub Secret si se usa
  desde Actions), nunca hardcodeada en código ni commiteada.
- Este repo **no tiene `PROGRESS.md` propio** — el roadmap se lleva en
  `nocturne-api/PROGRESS.md` y se actualiza solo al cerrar una tarea/fase.
