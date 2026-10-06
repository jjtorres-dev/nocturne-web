import { ElementRef, Injector, afterNextRender, inject, signal, type Signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface FormError {
  // Mensaje actual (o null); se pinta en el formulario, en el <p role="alert">.
  readonly message: Signal<string | null>;
  // Muestra el error en el formulario Y en un snackbar, y desplaza el
  // formulario hasta el mensaje: en móvil los diálogos largos hacen scroll
  // interno y el error (al final del formulario) quedaba fuera de vista.
  show(message: string): void;
  clear(): void;
}

// Saca el mensaje real que mandó el backend (ValidationPipe manda `message`
// como array si hay varias validaciones fallidas; una BadRequestException o
// ConflictException con un solo mensaje lo manda como string). `fallback`
// solo se usa cuando el backend no mandó ningún mensaje útil (p. ej. una
// caída de red, sin respuesta HTTP de por medio).
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const message: unknown = error.error?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.join(' ');
    }
  }
  return fallback;
}

// Estado de error de submit compartido por los formularios (diálogos y la
// página de crear Venta Combo). Solo se puede llamar en un contexto de
// inyección (inicializador de campo del componente). La plantilla debe
// pintar el mensaje en un elemento con `role="alert"`, que es al que se
// hace scroll.
export function injectFormError(): FormError {
  const snackBar = inject(MatSnackBar);
  const host = inject<ElementRef<HTMLElement>>(ElementRef);
  const injector = inject(Injector);
  const message = signal<string | null>(null);

  return {
    message: message.asReadonly(),
    clear: () => message.set(null),
    show(text: string): void {
      message.set(text);
      // Arriba: abajo taparía los botones Guardar/Cancelar del diálogo.
      snackBar.open(text, 'Cerrar', { duration: 5000, verticalPosition: 'top' });
      // Hay que esperar al render: el mensaje recién entra al DOM.
      afterNextRender(
        () => {
          host.nativeElement
            .querySelector('[role="alert"]')
            // Llamada opcional: jsdom (tests) no implementa scrollIntoView,
            // y este callback corre fuera del test que lo disparó.
            ?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
        },
        { injector },
      );
    },
  };
}
