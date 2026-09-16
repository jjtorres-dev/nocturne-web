import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from './auth';

const AUTH_ENDPOINTS_WITHOUT_RETRY = ['/auth/login', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const isRetryExempt = AUTH_ENDPOINTS_WITHOUT_RETRY.some((endpoint) =>
    req.url.includes(endpoint),
  );

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        isRetryExempt ||
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401
      ) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((newAccessToken) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            }),
          ),
        ),
        // El refresh también falló: propagar el 401 original de esta petición.
        catchError(() => throwError(() => error)),
      );
    }),
  );
};
