import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Todos los diálogos reciben `nc-dialog`: en pantallas angostas los
    // estilos globales (styles.scss) los ensanchan a casi todo el ancho.
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { panelClass: 'nc-dialog' } },
  ],
};
