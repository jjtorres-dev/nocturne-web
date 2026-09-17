import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart, registerables } from 'chart.js';
import { AccountingApi } from './accounting-api';
import {
  TimelineGroupBy,
  type AccountingSummary,
  type PaymentMethodBreakdown,
  type ServiceBreakdown,
  type TimelinePoint,
} from './accounting.model';
import { buildTimelineChartData } from './accounting-chart.util';
import { SolesPipe } from '../../shared/soles.pipe';
import { Auth, UserRole } from '../../core/auth/auth';
import { UsuariosApi } from '../users/usuarios-api';
import type { Usuario } from '../users/usuario.model';

// Sentinel para "sin filtro de dueño" en el backend (ver
// AccountingService.VIEW_ALL en nocturne-api) — nunca un id real.
const VIEW_ALL = 'all';
// Valor solo de UI: "sin viewOwnerId" (el admin ve lo mismo que vería
// siendo revendedor). No se manda al backend.
const VIEW_MINE = 'mine';

Chart.register(...registerables);

@Component({
  imports: [
    SolesPipe,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-accounting',
  styleUrl: './accounting.scss',
  templateUrl: './accounting.html',
})
export class Accounting implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(AccountingApi);
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('timelineCanvas')
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private viewReady = false;

  protected readonly groupByOptions = Object.values(TimelineGroupBy);
  protected readonly groupByLabels: Record<TimelineGroupBy, string> = {
    [TimelineGroupBy.DAY]: 'Día',
    [TimelineGroupBy.WEEK]: 'Semana',
    [TimelineGroupBy.MONTH]: 'Mes',
  };
  protected readonly byServiceColumns = [
    'nombre',
    'inversion',
    'ingresos',
    'ganancia',
  ];
  protected readonly byPaymentMethodColumns = [
    'metodoPago',
    'ingresos',
    'gastos',
    'neto',
  ];

  // Solo un ADMIN puede "ver como": un REVENDEDOR siempre ve lo suyo, sin
  // selector (mismo criterio que la columna "Dueño" en el resto de listas).
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );
  protected readonly VIEW_MINE = VIEW_MINE;
  protected readonly VIEW_ALL = VIEW_ALL;

  readonly summary = signal<AccountingSummary | null>(null);
  readonly byService = signal<ServiceBreakdown[]>([]);
  readonly byPaymentMethod = signal<PaymentMethodBreakdown[]>([]);
  readonly timeline = signal<TimelinePoint[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);

  desde = '';
  hasta = '';
  groupBy: TimelineGroupBy = TimelineGroupBy.DAY;
  // 'mine' | 'all' | <userId> — persiste en el query param `viewOwnerId`
  // de la URL para sobrevivir un refresh de la página.
  viewOwnerId = VIEW_MINE;

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.viewOwnerId =
        this.route.snapshot.queryParamMap.get('viewOwnerId') ?? VIEW_MINE;
      void this.loadUsuarios();
    }
    void this.refresh();
  }

  private async loadUsuarios(): Promise<void> {
    try {
      this.usuarios.set(await this.usuariosApi.list());
    } catch {
      // Si falla, el selector solo pierde las opciones de usuario
      // específico ("Mi negocio"/"Todo el negocio" siguen andando) — no
      // bloquea el resto de la pantalla.
    }
  }

  // Actualiza la URL (para que sobreviva un refresh) y refresca los 4
  // reportes con el filtro nuevo.
  onViewOwnerChange(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        viewOwnerId: this.viewOwnerId === VIEW_MINE ? null : this.viewOwnerId,
      },
      queryParamsHandling: 'merge',
    });
    void this.refresh();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // Vacíos por defecto: si no se tocan, no se manda el param y el backend
  // usa su propio default (mes calendario actual).
  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const filters = {
        desde: this.desde || undefined,
        hasta: this.hasta || undefined,
        viewOwnerId:
          this.isAdmin() && this.viewOwnerId !== VIEW_MINE
            ? this.viewOwnerId
            : undefined,
      };
      const [summary, byService, byPaymentMethod, timeline] =
        await Promise.all([
          this.api.summary(filters),
          this.api.byService(filters),
          this.api.byPaymentMethod(filters),
          this.api.timeline({ ...filters, groupBy: this.groupBy }),
        ]);
      this.summary.set(summary);
      this.byService.set(byService);
      this.byPaymentMethod.set(byPaymentMethod);
      this.timeline.set(timeline);
      if (this.viewReady) {
        this.renderChart();
      }
    } catch {
      this.snackBar.open('No se pudo cargar la contabilidad.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  private renderChart(): void {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) {
      // jsdom (tests) no implementa el contexto 2D: no hay nada que
      // renderizar ahí, y en el navegador real el canvas siempre lo tiene.
      return;
    }

    const data = buildTimelineChartData(this.timeline());
    if (this.chart) {
      this.chart.data = data;
      this.chart.update();
      return;
    }
    this.chart = new Chart(ctx, {
      type: 'bar',
      data,
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
}
