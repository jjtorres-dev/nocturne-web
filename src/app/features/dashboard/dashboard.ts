import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasApi } from '../sales/ventas-api';
import { VencimientoFiltro, type SalesSummary } from '../sales/venta.model';

@Component({
  imports: [MatCardModule, MatProgressSpinnerModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly ventasApi = inject(VentasApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly VencimientoFiltro = VencimientoFiltro;

  readonly summary = signal<SalesSummary | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      this.summary.set(await this.ventasApi.summary());
    } catch {
      this.snackBar.open('No se pudo cargar el resumen de ventas.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  goToVencimientos(estado: VencimientoFiltro): void {
    void this.router.navigate(['/vencimientos'], {
      queryParams: { estado },
    });
  }
}
