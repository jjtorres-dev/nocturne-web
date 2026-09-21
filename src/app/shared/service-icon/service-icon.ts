import { Component, computed, input } from '@angular/core';
import { AvatarInicial } from '../avatar-inicial/avatar-inicial';
import { resolveServiceIcon } from './service-icon.util';

// Ícono de marca del servicio (por nombre) o, si no hay match, avatar de
// iniciales con color por hash. Decorativo (aria-hidden): siempre se usa junto
// al nombre.
@Component({
  imports: [AvatarInicial],
  selector: 'app-service-icon',
  styleUrl: './service-icon.scss',
  templateUrl: './service-icon.html',
})
export class ServiceIcon {
  readonly nombre = input.required<string>();
  readonly size = input(28);

  private readonly icon = computed(() => resolveServiceIcon(this.nombre()));
  protected readonly glyph = computed(() => {
    const icon = this.icon();
    return icon && 'path' in icon ? icon : null;
  });
  protected readonly image = computed(() => {
    const icon = this.icon();
    return icon && 'src' in icon ? icon : null;
  });
}
