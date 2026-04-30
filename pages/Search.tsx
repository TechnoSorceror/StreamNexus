import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { anilistService } from '../services/anilist';
import { MediaItem } from '../types';
import MediaCard from '../components/MediaCard';
import AnimeCard from '../components/AnimeCard';
import MangaCard from '../components/MangaCard';
import Loader from '../components/Loader';
import AdBanner from '../components/AdBanner';
import NativeAd from '../components/NativeAd';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('t') || 'all'; // 'media' | 'anime' | 'manga' | 'all'
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      
      try {
        const promises = [];
        
        if (searchType === 'media' || searchType === 'all') {
          promises.push(tmdbService.search(query, 'movie'));
          promises.push(tmdbService.search(query, 'tv'));
        }

        if (searchType === 'anime' || searchType === 'all') {
          promises.push(anilistService.search(query, 'anime'));
        }

        if (searchType === 'manga' || searchType === 'all') {
          promises.push(anilistService.search(query, 'manga'));
        }

        const responseGroups = await Promise.all(promises);
        const flatResults = responseGroups.flat();
        
        if (isActive) setResults(flatResults);
      } catch (e) {
        console.error("Search error", e);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 500);
    return () => {
      isActive = false;
      clearTimeout(debounce);
    };
  }, [query, searchType]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h2 className="text-2xl font-bold text-white mb-6">
        Results for "{query}"
      </h2>
      
      <div className="mb-6">
        <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
            <Loader />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item, idx) => {
               const key = `${item.type}-${item.id}-${idx}`;
               if (item.type === 'anime') return <AnimeCard key={key} item={item} />;
               if (item.type === 'manga') return <MangaCard key={key} item={item} />;
               return <MediaCard key={key} item={item} />;
            })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
            No results found.
        </div>
      )}

      <div className="mt-12 flex flex-col items-center gap-6">
        <AdBanner id="bd5ca73b855f1da9a5b443ecdb4cc6f1" width={468} height={60} />
        <NativeAd id="388542992bdcd8e47229c5eed7328b30" />
      </div>
    </div>
  );
};

export default SearchPage;