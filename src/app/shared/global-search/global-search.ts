import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
} from 'rxjs';
import { Auth, UserRole } from '../../core/auth/auth';
import { injectIsMobile } from '../breakpoints';
import { EmptyState } from '../empty-state/empty-state';
import { SearchApi } from './search-api';
import {
  SEARCH_CATEGORIES,
  type SearchCategory,
  type SearchResultItem,
} from './search-result.model';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface DisplayItem {
  id: string;
  main: string;
  // Nombre del dueño — undefined si quien busca no es admin. Campo aparte
  // del backend (ver ownerName en nocturne-api), nunca parseado del label:
  // el label es texto libre del usuario y puede traer cualquier caracter.
  owner: string | undefined;
  category: SearchCategory;
  // Índice dentro de la lista aplanada de TODOS los resultados visibles
  // (todas las categorías, en orden): lo que mueven las flechas.
  globalIndex: number;
}

interface DisplayGroup {
  category: SearchCategory;
  items: DisplayItem[];
}

// Buscador global del header (ver admin-layout): input con debounce +
// mínimo de caracteres, resultados agrupados por categoría en un panel
// desplegable, navegable con teclado.
@Component({
  imports: [MatButtonModule, MatIconModule, EmptyState],
  selector: 'app-global-search',
  styleUrl: './global-search.scss',
  templateUrl: './global-search.html',
})
export class GlobalSearch {
  private readonly api = inject(SearchApi);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly isMobile = injectIsMobile();
  protected readonly isAdmin = computed(
    () => this.auth.currentUser()?.role === UserRole.ADMIN,
  );

  // Dos vías con AdminLayout: en móvil, expandirse tiene que ocultar el
  // botón de hamburguesa y el título del header para poder ocupar todo el
  // ancho (ver admin-layout.html), así que el estado no puede quedar
  // encapsulado del todo acá adentro.
  readonly mobileExpanded = model(false);

  readonly query = signal('');
  readonly open = signal(false);
  readonly loading = signal(false);
  readonly activeIndex = signal(-1);

  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly searchBarRef =
    viewChild<ElementRef<HTMLDivElement>>('searchBarEl');

  // En móvil el panel es `position: fixed` (ver global-search.scss — nada
  // de % ni vw relativos al wrapper, que puede no llegar de punta a punta):
  // este es el único valor que no se puede sacar por CSS puro, así que se
  // mide el borde inferior real de la barra (después del render) en vez de
  // asumir un alto de header en px que podría no coincidir con el tema.
  readonly mobilePanelTop = signal(0);

  private readonly searchResponse = toSignal(
    toObservable(this.query).pipe(
      debounceTime(DEBOUNCE_MS),
      map((value) => value.trim()),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length < MIN_QUERY_LENGTH) {
          this.loading.set(false);
          return of(null);
        }
        this.loading.set(true);
        return this.api.search(term).pipe(
          catchError(() => of(null)),
          finalize(() => this.loading.set(false)),
        );
      }),
    ),
    { initialValue: null },
  );

  readonly groups = computed<DisplayGroup[]>(() => {
    const response = this.searchResponse();
    if (!response) {
      return [];
    }
    let index = 0;
    const displayGroups: DisplayGroup[] = [];
    for (const category of SEARCH_CATEGORIES) {
      const items = response[category.key].map((item) =>
        this.toDisplayItem(item, category, index++),
      );
      if (items.length > 0) {
        displayGroups.push({ category, items });
      }
    }
    return displayGroups;
  });

  readonly flatItems = computed(() => this.groups().flatMap((g) => g.items));

  // La búsqueda ya volvió (searchResponse dejó de ser null) pero ninguna
  // categoría tuvo resultados.
  readonly showEmptyState = computed(
    () => this.searchResponse() !== null && this.groups().length === 0,
  );

  readonly showPanel = computed(
    () => this.open() && this.query().trim().length >= MIN_QUERY_LENGTH,
  );

  constructor() {
    // Cada búsqueda nueva vuelve a apuntar al primer resultado (si hay
    // alguno): Enter siempre abre algo sin tener que tocar las flechas antes.
    effect(() => {
      const items = this.flatItems();
      this.activeIndex.set(items.length > 0 ? 0 : -1);
    });

    // Se remide cada vez que el panel se abre en móvil (el borde inferior
    // de la barra no cambia mientras está abierto, pero si el usuario rota
    // el celular el listener de resize de abajo lo vuelve a medir).
    effect(() => {
      if (this.showPanel() && this.isMobile()) {
        this.updateMobilePanelTop();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.showPanel() && this.isMobile()) {
      this.updateMobilePanelTop();
    }
  }

  private updateMobilePanelTop(): void {
    const rect = this.searchBarRef()?.nativeElement.getBoundingClientRect();
    if (rect) {
      this.mobilePanelTop.set(rect.bottom);
    }
  }

  onQueryInput(value: string): void {
    this.query.set(value);
  }

  onFocus(): void {
    this.open.set(true);
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.flatItems();
    switch (event.key) {
      case 'ArrowDown':
        if (items.length > 0) {
          event.preventDefault();
          this.activeIndex.update((i) => Math.min(i + 1, items.length - 1));
        }
        break;
      case 'ArrowUp':
        if (items.length > 0) {
          event.preventDefault();
          this.activeIndex.update((i) => Math.max(i - 1, 0));
        }
        break;
      case 'Enter': {
        const active = items[this.activeIndex()];
        if (active) {
          event.preventDefault();
          this.select(active);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.open.set(false);
        break;
    }
  }

  select(item: DisplayItem): void {
    void this.router.navigate(item.category.route(item.id));
    this.closeAndReset();
  }

  expandMobile(): void {
    this.mobileExpanded.set(true);
    setTimeout(() => this.searchInputRef()?.nativeElement.focus());
  }

  collapseMobile(): void {
    this.closeAndReset();
  }

  private closeAndReset(): void {
    this.query.set('');
    this.open.set(false);
    this.mobileExpanded.set(false);
    this.activeIndex.set(-1);
  }

  private toDisplayItem(
    item: SearchResultItem,
    category: SearchCategory,
    globalIndex: number,
  ): DisplayItem {
    return {
      id: item.id,
      main: item.label,
      owner: item.ownerName,
      category,
      globalIndex,
    };
  }
}
