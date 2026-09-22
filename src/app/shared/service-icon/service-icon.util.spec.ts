import { resolveServiceIcon } from './service-icon.util';
import { SERVICE_ICONS } from './service-icons.data';

describe('resolveServiceIcon', () => {
  it('resuelve el ícono por nombre exacto', () => {
    expect(resolveServiceIcon('Netflix')?.slug).toBe('netflix');
  });

  it('matchea por substring sin distinguir mayúsculas', () => {
    expect(resolveServiceIcon('Netflix 2 Meses')?.slug).toBe('netflix');
    expect(resolveServiceIcon('SPOTIFY PREMIUM')?.slug).toBe('spotify');
    expect(resolveServiceIcon('cuenta crunchyroll mega fan')?.slug).toBe('crunchyroll');
  });

  it('ignora acentos y espacios extremos', () => {
    expect(resolveServiceIcon('  Déezer Familiar ')?.slug).toBe('deezer');
  });

  it('prefiere la keyword más específica ("hbo max" antes que "hbo", "youtube music" antes que "youtube")', () => {
    expect(resolveServiceIcon('HBO Max 3 Meses')?.slug).toBe('hbomax');
    expect(resolveServiceIcon('HBO')?.slug).toBe('hbo');
    expect(resolveServiceIcon('YouTube Music Premium')?.slug).toBe('youtubemusic');
    expect(resolveServiceIcon('YouTube Premium')?.slug).toBe('youtube');
    expect(resolveServiceIcon('Apple TV+')?.slug).toBe('appletv');
    expect(resolveServiceIcon('Apple Music')?.slug).toBe('applemusic');
  });

  it('las keywords cortas exigen palabra completa', () => {
    expect(resolveServiceIcon('Max Premium')?.slug).toBe('hbomax');
    expect(resolveServiceIcon('Maximo Streaming')).toBeNull();
  });

  it('devuelve null si no hay match', () => {
    expect(resolveServiceIcon('Servicio Inventado')).toBeNull();
    expect(resolveServiceIcon('')).toBeNull();
    expect(resolveServiceIcon(null)).toBeNull();
    expect(resolveServiceIcon(undefined)).toBeNull();
  });

  it('Disney+ y Prime Video resuelven a un ícono real (archivo SVG local), no a un color de marca', () => {
    for (const nombre of ['Disney+', 'DISNEY+ Premium 3 Meses', 'Disney Plus']) {
      const icon = resolveServiceIcon(nombre);
      expect(icon?.slug).toBe('disneyplus');
      expect(icon && 'src' in icon && icon.src).toBe('service-icons/disney-plus.svg');
    }
    for (const nombre of ['Prime Video', 'Amazon Prime Video 1 mes', 'PrimeVideo']) {
      const icon = resolveServiceIcon(nombre);
      expect(icon?.slug).toBe('primevideo');
      expect(icon && 'src' in icon && icon.src).toBe('service-icons/prime-video-alt.svg');
    }
  });

  it('ChatGPT/OpenAI resuelve al ícono de ChatGPT (archivo SVG local), no a Simple Icons', () => {
    for (const nombre of ['ChatGPT Plus 1 mes', 'OpenAI Team', 'Chat GPT Personal', 'GPT Plus']) {
      const icon = resolveServiceIcon(nombre);
      expect(icon?.slug).toBe('chatgpt');
      expect(icon && 'src' in icon && icon.src).toBe('service-icons/chatgpt.svg');
    }
  });

  it('el set curado tiene 15-25 íconos, cada uno con su gráfico (path o src) y keywords', () => {
    expect(SERVICE_ICONS.length).toBeGreaterThanOrEqual(15);
    expect(SERVICE_ICONS.length).toBeLessThanOrEqual(25);
    for (const icon of SERVICE_ICONS) {
      const grafico = 'path' in icon ? icon.path : icon.src;
      expect(grafico.length).toBeGreaterThan(0);
      expect(icon.keywords.length).toBeGreaterThan(0);
    }
  });
});
