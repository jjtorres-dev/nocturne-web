# Nocturne Web

Frontend de **Nocturne**, panel de gestión y reventa de cuentas/perfiles de
streaming (Netflix, Disney, Crunchyroll, etc). Consume la API en
[`nocturne-api`](../nocturne-api).

## Stack

- Angular 22 (standalone components, sin NgModules)
- Angular Material 22 (Material 3)
- Vitest para tests unitarios, ESLint (`@angular-eslint`) para lint

## Requisitos

- Node.js 22+
- El backend (`nocturne-api`) corriendo localmente para poder loguearse

## Puesta en marcha local

1. Instala dependencias (requiere `--legacy-peer-deps` por el mismo
   conflicto de peer deps que en el backend):

   ```bash
   npm install --legacy-peer-deps
   ```

2. Verifica que `src/environments/environment.development.ts` apunte al
   backend local (por defecto `http://localhost:3000/api`).

3. Con el backend corriendo (ver README de `nocturne-api`), levanta el
   frontend:

   ```bash
   npm start
   ```

4. Abre `http://localhost:4200`, deberías ser redirigido a `/login`.
   Inicia sesión con el usuario admin creado con `npm run seed` en el
   backend.

## Scripts

| Script         | Descripción                              |
| -------------- | ------------------------------------------ |
| `npm start`    | Levanta el dev server (`ng serve`)          |
| `npm run build`| Build de producción a `dist/`              |
| `npm run lint` | Lint con ESLint (`@angular-eslint`)         |
| `npm test`     | Tests unitarios (vitest, vía `ng test`)     |

## Estructura de carpetas

```
src/app/
  core/auth/          # Servicio Auth, guard de rutas y HTTP interceptor JWT
  layout/admin-layout/ # Sidebar + header del panel admin
  features/login/      # Pantalla de login
  features/dashboard/   # Placeholder de inicio (crecerá en fases futuras)
  app.routes.ts         # Rutas: /login pública, resto protegido por authGuard
src/environments/       # apiUrl por entorno (development / production)
```

A medida que avancen las fases del roadmap (ver `PROGRESS.md` en
`nocturne-api`), cada nueva sección (Servicios, Contactos, Cuentas, Ventas,
etc.) se agrega como una carpeta nueva bajo `features/` y una entrada nueva
en `navItems` de `AdminLayout`.

## CI/CD

### GitHub Actions

En cada push/PR a `main`, `.github/workflows/ci.yml` corre lint, tests
unitarios y build.

### Railway (auto-deploy en merge a `main`)

El frontend está desplegado en **Railway**, como un servicio aparte dentro
del mismo proyecto que `nocturne-api` (no se usó Vercel como se había
planeado originalmente). El deploy no se automatiza desde aquí; el setup
manual es:

1. En el mismo proyecto de Railway del backend, agregar otro servicio
   "Deploy from GitHub repo" apuntando a este repositorio (`nocturne-web`).
2. Build command: `npm run build`. Railway usa **Railpack** para detectar
   y servir el resultado como sitio estático.
3. Configurar la variable de entorno del servicio:

   ```
   RAILPACK_SPA_OUTPUT_DIR=dist/nocturne-web/browser
   ```

   Esto es necesario porque Angular (con `@angular/build:application`, el
   builder de Angular 22) no deja los archivos estáticos en la raíz de
   `dist/`, sino en `dist/nocturne-web/browser/`. Sin esta variable,
   Railpack no encuentra el `index.html` y el deploy sirve una app en
   blanco o da 404 en cualquier ruta que no sea `/`.
4. Activar auto-deploy en la rama `main` — cada merge que pase CI dispara
   un nuevo deploy.
5. La URL de la API de producción está hardcodeada en
   `src/environments/environment.ts` (`apiUrl`). Si se necesita inyectarla
   en build time en vez de commitearla, configurarla como variable de
   entorno del servicio en Railway, nunca hardcodeada en otro lado del
   repo.

Si se recrea este servicio desde cero, no olvidar volver a setear
`RAILPACK_SPA_OUTPUT_DIR` — es el paso que más fácil se pasa por alto.
