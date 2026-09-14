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

### Vercel (auto-deploy en merge a `main`)

El deploy a Vercel **no se automatiza desde aquí**; se configura una vez
manualmente:

1. Importar este repositorio en [Vercel](https://vercel.com/) como un
   nuevo proyecto (Framework Preset: Angular).
2. Build command: `npm run build` — Output directory:
   `dist/nocturne-web/browser` (Angular 22 con `@angular/build:application`
   genera el output ahí).
3. Configurar `main` como la rama de producción (Vercel hace auto-deploy en
   cada push/merge a esa rama por defecto).
4. Si en el futuro se necesita una variable de entorno inyectada en build
   (por ejemplo, para no commitear `environment.ts` con la URL de
   producción), configurarla como variable de entorno del proyecto en
   Vercel, nunca hardcodeada en el repo.

No se realizó ningún deploy real a Vercel desde este entorno; este es solo
el procedimiento a seguir.
