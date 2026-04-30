import { VIDSRC_BASE, VIDSRC_RU_BASE } from '../constants';
import { MediaItem, PlaybackState } from '../types';

export const generateEmbedUrl = (media: MediaItem, state: PlaybackState): string => {
  const { type, tmdbId, anilistId } = media;
  const { season, episode, chapter, isDub } = state;

  // STRICT RULE: Use TMDB ID for Movies and TV.
  // Server 1: vidsrc.icu
  // Server 2: vidsrc-embed.ru

  switch (type) {
    case 'movie':
      if (!tmdbId) return '';
      // Using vidsrc-embed.ru
      return `${VIDSRC_RU_BASE}/movie?tmdb=${tmdbId}`;

    case 'tv':
      if (!tmdbId) return '';
      
      if (season && episode) {
        return `${VIDSRC_RU_BASE}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `${VIDSRC_RU_BASE}/tv?tmdb=${tmdbId}`;

    case 'anime':
      if (!tmdbId) return '';
      if (season && episode) {
        return `${VIDSRC_RU_BASE}/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      return `${VIDSRC_RU_BASE}/tv?tmdb=${tmdbId}&season=${season || 1}&episode=${episode || 1}`;

    case 'manga':
      // Manga is not affected by server selection
      if (!anilistId) return '';
      const chap = chapter || 1;
      return `${VIDSRC_BASE}/manga/${anilistId}/${chap}`;

    default:
      return '';
  }
};