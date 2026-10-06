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
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
import { ServiciosApi } from '../services/servicios-api';
import { exportToCsv, type CsvColumn } from '../../shared/csv-export';
import { hoyIso } from '../../shared/fecha.util';
import { InfoHint } from '../../shared/info-hint/info-hint';
import { InfoToggle } from '../../shared/info-hint/info-toggle';
import { FechaField } from '../../shared/fecha-field/fecha-field';
import { cssToken } from '../../shared/css-token';
import { injectIsMobile } from '../../shared/breakpoints';

// Sentinel para "sin filtro de dueño" en el backend (ver
// AccountingService.VIEW_ALL en nocturne-api) — nunca un id real.
const VIEW_ALL = 'all';
// Valor solo de UI: "sin viewOwnerId" (el admin ve lo mismo que vería
// siendo revendedor). No se manda al backend.
const VIEW_MINE = 'mine';

Chart.register(...registerables);

@Component({
  imports: [
    FechaField,
    SolesPipe,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    InfoHint,
    InfoToggle,
  ],
  selector: 'app-accounting',
  styleUrl: './accounting.scss',
  templateUrl: './accounting.html',
})
export class Accounting implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(AccountingApi);
  private readonly usuariosApi = inject(UsuariosApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
  protected readonly isMobile = injectIsMobile();
  protected readonly VIEW_MINE = VIEW_MINE;
  protected readonly VIEW_ALL = VIEW_ALL;

  readonly summary = signal<AccountingSummary | null>(null);
  readonly byService = signal<ServiceBreakdown[]>([]);
  readonly byPaymentMethod = signal<PaymentMethodBreakdown[]>([]);
  readonly timeline = signal<TimelinePoint[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  // La última carga falló: en vez de los reportes se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);

  // Lo que el gráfico dice, para quien no lo ve.
  protected readonly chartLabel = computed(() => {
    const puntos = this.timeline().length;
    return `Gráfico de barras: cobrado, pagado a proveedores, gastos y ganancia por ${this.groupByLabels[this.groupBy].toLowerCase()} (${puntos} ${puntos === 1 ? 'periodo' : 'periodos'}).`;
  });

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
    this.error.set(false);
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
      // El aviso va en el lugar de los reportes, con "Reintentar".
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  // Dueño solo tiene sentido en "Todo el negocio": ahí sí puede haber filas
  // de dueños distintos. En "Mi negocio" o viendo a un usuario puntual todas
  // las filas son del mismo dueño, así que la columna sería redundante.
  private verTodoElNegocio(): boolean {
    return this.isAdmin() && this.viewOwnerId === VIEW_ALL;
  }

  async exportByServiceCsv(): Promise<void> {
    const columns: CsvColumn<ServiceBreakdown>[] = [
      { header: 'Servicio', value: (r) => r.nombre },
      { header: 'Pagado a proveedores', value: (r) => r.inversion.toFixed(2) },
      { header: 'Cobrado', value: (r) => r.ingresos.toFixed(2) },
      { header: 'Ganancia (sin otros gastos)', value: (r) => r.ganancia.toFixed(2) },
    ];

    if (this.verTodoElNegocio()) {
      // GET /services sin filtro de owner: para un admin devuelve todos los
      // servicios (de cualquier usuario) con `owner` incluido (ver
      // ServicesService.findAllOwned en nocturne-api) — no hace falta tocar
      // el backend de Contabilidad para esto.
      const servicios = await this.serviciosApi.list();
      const duenoById = new Map(servicios.map((s) => [s.id, s.owner.name]));
      columns.push({
        header: 'Dueño',
        value: (r) => duenoById.get(r.servicioId) ?? '—',
      });
    }

    exportToCsv(
      `contabilidad-por-servicio-${hoyIso()}.csv`,
      columns,
      this.byService(),
    );
  }

  // "Método de Pago" es un string libre, sin dueño único por fila (ver
  // AccountingService.byPaymentMethod / metodoPago en nocturne-api): en
  // "Todo el negocio" una misma fila ya suma pagos de varios dueños, así
  // que nunca lleva columna Dueño.
  exportByPaymentMethodCsv(): void {
    const columns: CsvColumn<PaymentMethodBreakdown>[] = [
      { header: 'Método de pago', value: (r) => r.metodoPago },
      { header: 'Cobrado', value: (r) => r.ingresos.toFixed(2) },
      { header: 'Otros gastos', value: (r) => r.gastos.toFixed(2) },
      { header: 'Te quedó', value: (r) => r.neto.toFixed(2) },
    ];
    exportToCsv(
      `contabilidad-por-metodo-pago-${hoyIso()}.csv`,
      columns,
      this.byPaymentMethod(),
    );
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
    // Chart.js pinta en un <canvas> y no entiende `var(--nc-*)`: los colores
    // y la letra se leen de los tokens ya resueltos al crear el gráfico.
    const tinta = cssToken('--nc-ink');
    const tintaSuave = cssToken('--nc-ink-muted');
    const linea = cssToken('--nc-rule');
    const sobreTinta = cssToken('--nc-on-ink');
    const letra = { family: cssToken('--nc-font-sans'), size: 12 };
    this.chart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: tintaSuave,
        // El puntero muestra las cuatro series del periodo a la vez.
        interaction: { mode: 'index', intersect: false },
        datasets: {
          bar: {
            // Marca que mide: esquina de 1 px, con aire entre periodos.
            borderRadius: 1,
            categoryPercentage: 0.72,
            barPercentage: 0.9,
            maxBarThickness: 28,
          },
        },
        scales: {
          x: {
            ticks: { color: tintaSuave, font: letra },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: {
              color: tintaSuave,
              font: letra,
              callback: (value) => formatSoles(Number(value), 0),
            },
            // La línea del cero va en tinta: las pérdidas bajan de ella.
            grid: { color: (ctx) => (ctx.tick.value === 0 ? tinta : linea) },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            align: 'start',
            labels: {
              color: tinta,
              font: { ...letra, size: 13 },
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
            },
          },
          tooltip: {
            backgroundColor: tinta,
            titleColor: sobreTinta,
            bodyColor: sobreTinta,
            titleFont: letra,
            bodyFont: letra,
            borderColor: tinta,
            borderWidth: 1,
            cornerRadius: 3,
            padding: 10,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${formatSoles(Number(item.parsed.y), 2)}`,
            },
          },
        },
      },
    });
  }
}

// Monto en soles para el eje y el globo del gráfico (el pipe `soles` solo
// existe en plantillas).
function formatSoles(value: number, decimals: number): string {
  return `S/ ${value.toFixed(decimals)}`;
}
