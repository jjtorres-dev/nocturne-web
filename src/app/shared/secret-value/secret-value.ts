import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-secret-value',
  styleUrl: './secret-value.scss',
  templateUrl: './secret-value.html',
})
export class SecretValue {
  private readonly snackBar = inject(MatSnackBar);

  readonly value = input<string | null>(null);
  readonly label = input('Valor');

  readonly revealed = signal(false);

  toggle(): void {
    this.revealed.update((v) => !v);
  }

  async copy(): Promise<void> {
    const current = this.value();
    if (!current) {
      return;
    }
    try {
      await navigator.clipboard.writeText(current);
      this.snackBar.open(`${this.label()} copiado al portapapeles.`, 'Cerrar', {
        duration: 2000,
      });
    } catch {
      this.snackBar.open('No se pudo copiar al portapapeles.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
