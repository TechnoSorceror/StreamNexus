import { TMDB_BASE_URL, TMDB_IMAGE_BASE, TMDB_BACKDROP_BASE, DEFAULT_TMDB_API_KEY } from '../constants';
import { MediaItem, EpisodeInfo, SeasonInfo } from '../types';

// Strictly use the default key (server-side simulation)
const apiKey = DEFAULT_TMDB_API_KEY;

const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  if (!apiKey) return { results: [] }; 
  
  const query = new URLSearchParams({ api_key: apiKey, ...params }).toString();
  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`);
    if (!res.ok) {
        console.warn(`TMDB Fetch Error: ${res.status} ${res.statusText}`);
        return {}; 
    }
    return res.json();
  } catch (error) {
    console.error("Network error:", error);
    return {};
  }
};

const mapTMDBToMedia = (item: any, type: 'movie' | 'tv'): MediaItem => ({
  id: item.id,
  tmdbId: item.id,
  title: item.title || item.name,
  poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : 'https://picsum.photos/300/450?grayscale',
  banner: item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : undefined,
  description: item.overview,
  rating: item.vote_average,
  releaseDate: item.release_date || item.first_air_date || 'N/A',
  type,
  genres: [], // Populated in details
  status: 'Released'
});

export const tmdbService = {
  getTrending: async (type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const data = await fetchTMDB(`/trending/${type}/day`);
    return (data.results || []).map((i: any) => mapTMDBToMedia(i, type));
  },

  getPopular: async (type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const data = await fetchTMDB(`/${type}/popular`);
    return (data.results || []).map((i: any) => mapTMDBToMedia(i, type));
  },

  getTopRated: async (type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const data = await fetchTMDB(`/${type}/top_rated`);
    return (data.results || []).map((i: any) => mapTMDBToMedia(i, type));
  },

  getByGenre: async (type: 'movie' | 'tv', genreId: number): Promise<MediaItem[]> => {
    const data = await fetchTMDB(`/discover/${type}`, { 
        with_genres: genreId.toString(),
        sort_by: 'popularity.desc'
    });
    return (data.results || []).map((i: any) => mapTMDBToMedia(i, type));
  },

  getDetails: async (id: number, type: 'movie' | 'tv'): Promise<MediaItem | null> => {
    try {
      const data = await fetchTMDB(`/${type}/${id}`, { append_to_response: 'external_ids,genres' });
      if (!data || !data.id) return null;
      
      const base = mapTMDBToMedia(data, type);
      return {
        ...base,
        imdbId: data.external_ids?.imdb_id,
        genres: data.genres?.map((g: any) => g.name) || [],
        seasons: type === 'tv' ? data.number_of_seasons : undefined,
        episodes: type === 'tv' ? data.number_of_episodes : undefined,
        status: data.status,
        collectionId: data.belongs_to_collection?.id,
        collectionName: data.belongs_to_collection?.name
      };
    } catch (e) {
      return null;
    }
  },

  getSeason: async (tmdbId: number, seasonNumber: number): Promise<{ info: SeasonInfo, episodes: EpisodeInfo[] }> => {
    try {
      const data = await fetchTMDB(`/tv/${tmdbId}/season/${seasonNumber}`);
      if (!data) return { info: {} as SeasonInfo, episodes: [] };

      const episodes = (data.episodes || []).map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path ? `${TMDB_IMAGE_BASE}${ep.still_path}` : undefined,
        air_date: ep.air_date
      }));
      
      return { 
          info: {
              id: data.id,
              name: data.name,
              season_number: data.season_number,
              episode_count: episodes.length,
              air_date: data.air_date,
              poster_path: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : undefined
          }, 
          episodes 
      };
    } catch (e) {
      return { info: {} as SeasonInfo, episodes: [] };
    }
  },

  getCollection: async (collectionId: number): Promise<MediaItem[]> => {
      const data = await fetchTMDB(`/collection/${collectionId}`);
      if (!data || !data.parts) return [];
      
      const sortedParts = data.parts.sort((a: any, b: any) => {
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
      });

      return sortedParts.map((i: any) => mapTMDBToMedia(i, 'movie'));
  },

  search: async (query: string, type: 'movie' | 'tv'): Promise<MediaItem[]> => {
    const data = await fetchTMDB(`/search/${type}`, { query });
    return (data.results || []).map((i: any) => mapTMDBToMedia(i, type));
  }
};