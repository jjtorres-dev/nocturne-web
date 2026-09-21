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
    expect(resolveServiceIcon('Disney+')).toBeNull();
    expect(resolveServiceIcon('')).toBeNull();
    expect(resolveServiceIcon(null)).toBeNull();
    expect(resolveServiceIcon(undefined)).toBeNull();
  });

  it('el set curado tiene 15-20 íconos, cada uno con path y keywords', () => {
    expect(SERVICE_ICONS.length).toBeGreaterThanOrEqual(15);
    expect(SERVICE_ICONS.length).toBeLessThanOrEqual(20);
    for (const icon of SERVICE_ICONS) {
      expect(icon.path.length).toBeGreaterThan(0);
      expect(icon.keywords.length).toBeGreaterThan(0);
    }
  });
});
