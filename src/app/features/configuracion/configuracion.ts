import { Component } from '@angular/core';
import { CambiarPassword } from './cambiar-password/cambiar-password';

// Las secciones de configuración se agregan dentro de `.secciones`.
@Component({
  imports: [CambiarPassword],
  selector: 'app-configuracion',
  styleUrl: './configuracion.scss',
  templateUrl: './configuracion.html',
})
export class Configuracion {}
