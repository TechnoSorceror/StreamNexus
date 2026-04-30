import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { anilistService } from '../services/anilist';
import { vidsrcService } from '../services/vidsrc';
import { MediaItem } from '../types';
import Row from '../components/Row';
import Loader from '../components/Loader';
import CustomButton from '../components/CustomButton';
import AnimeCard from '../components/AnimeCard';
import MangaCard from '../components/MangaCard';
import AdBanner from '../components/AdBanner';
import NativeAd from '../components/NativeAd';
import { Info, BookOpen, Play } from 'lucide-react';
import { openAdAndIntercept } from '../lib/adInterceptor';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('cat'); // 'anime' | 'manga' | null

  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState<MediaItem | null>(null);
  
  const [data, setData] = useState<{
    // Movies & TV
    latestMovies: MediaItem[];
    latestTv: MediaItem[];
    trendingMovies: MediaItem[];
    trendingTv: MediaItem[];
    topRatedMovies: MediaItem[];
    popularTv: MediaItem[];
    actionMovies: MediaItem[];
    scifiMovies: MediaItem[];
    dramaMovies: MediaItem[];
    // Anime & Manga
    animeTrending: MediaItem[];
    animePopular: MediaItem[];
    animeTopRated: MediaItem[];
    animeAction: MediaItem[];
    animeRomance: MediaItem[];
    animeFantasy: MediaItem[];
    mangaTrending: MediaItem[];
    mangaPopular: MediaItem[];
  }>({
    latestMovies: [],
    latestTv: [],
    trendingMovies: [],
    trendingTv: [],
    topRatedMovies: [],
    popularTv: [],
    actionMovies: [],
    scifiMovies: [],
    dramaMovies: [],
    animeTrending: [],
    animePopular: [],
    animeTopRated: [],
    animeAction: [],
    animeRomance: [],
    animeFantasy: [],
    mangaTrending: [],
    mangaPopular: []
  });

  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreResults, setGenreResults] = useState<MediaItem[]>([]);
  const [loadingGenre, setLoadingGenre] = useState(false);

  const ANIME_GENRES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mecha', 'Mystery', 'Psychological', 'Romance', 
    'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  const MANGA_GENRES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Psychological', 'Romance', 
    'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
  ];

  useEffect(() => {
    // Reset selected genre when tab changes
    setSelectedGenre(null);
  }, [category]);

  useEffect(() => {
    let isActive = true;
    if (selectedGenre && category) {
      const fetchGenre = async () => {
        setLoadingGenre(true);
        try {
           const typeStr = category === 'anime' ? 'anime' : 'manga';
           const results = await anilistService.getByGenre(typeStr, selectedGenre);
           if (isActive) setGenreResults(results);
        } catch (e) {
           console.error("Genre fetch error", e);
        } finally {
           if (isActive) setLoadingGenre(false);
        }
      };
      fetchGenre();
    }
    return () => { isActive = false; };
  }, [selectedGenre, category]);

  useEffect(() => {
    let isActive = true;
    const fetchContent = async () => {
      setLoading(true);
      setHeroMovie(null); // Reset hero to prevent stale data
      
      try {
        if (category === 'anime') {
            // --- FETCH ANIME ---
            const [trending, popular, topRated, action, romance, fantasy] = await Promise.all([
                anilistService.getTrending('anime'),
                anilistService.getPopular('anime'),
                anilistService.getTopRated('anime'),
                anilistService.getByGenre('anime', 'Action'),
                anilistService.getByGenre('anime', 'Romance'),
                anilistService.getByGenre('anime', 'Fantasy'),
            ]);
            
            if (isActive) {
              setData(prev => ({ 
                  ...prev, 
                  animeTrending: trending, 
                  animePopular: popular,
                  animeTopRated: topRated,
                  animeAction: action,
                  animeRomance: romance,
                  animeFantasy: fantasy
              }));

              if (trending && trending.length > 0) {
                   const random = trending[Math.floor(Math.random() * Math.min(10, trending.length))];
                   setHeroMovie(random);
              }
            }

        } else if (category === 'manga') {
            // --- FETCH MANGA ---
            const [trending, popular] = await Promise.all([
                anilistService.getTrending('manga'),
                anilistService.getPopular('manga')
            ]);
            
            if (isActive) {
              setData(prev => ({ 
                  ...prev, 
                  mangaTrending: trending, 
                  mangaPopular: popular 
              }));

              if (trending && trending.length > 0) {
                   setHeroMovie(trending[0]);
              }
            }

        } else {
            // --- FETCH MOVIES & TV (Default) ---
            const [
              latestM,
              latestT,
              trendingM, 
              trendingT, 
              topRatedM, 
              popularT,
              action,
              scifi,
              drama
            ] = await Promise.all([
              vidsrcService.getLatestMovies(1),
              vidsrcService.getLatestTvShows(1),
              tmdbService.getTrending('movie'),
              tmdbService.getTrending('tv'),
              tmdbService.getTopRated('movie'),
              tmdbService.getPopular('tv'),
              tmdbService.getByGenre('movie', 28), // Action
              tmdbService.getByGenre('movie', 878), // Sci-Fi
              tmdbService.getByGenre('movie', 18),  // Drama
            ]);

            if (isActive) {
              setData(prev => ({
                ...prev,
                latestMovies: latestM,
                latestTv: latestT,
                trendingMovies: trendingM,
                trendingTv: trendingT,
                topRatedMovies: topRatedM,
                popularTv: popularT,
                actionMovies: action,
                scifiMovies: scifi,
                dramaMovies: drama
              }));

              // Pick a random movie from trending to be the hero
              if (trendingM && trendingM.length > 0) {
                const random = trendingM[Math.floor(Math.random() * Math.min(10, trendingM.length))];
                setHeroMovie(random);
              }
            }
        }
      } catch (e) {
        console.error("Home fetch error", e);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchContent();
    return () => { isActive = false; };
  }, [category]); // Re-run whenever category changes

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-nexus-900">
        <Loader />
      </div>
    );
  }

  // Helper to determine detail path prefix
  const getHeroPath = (item: MediaItem) => `/${item.type}/${item.id}`;
  const isReading = category === 'manga';

  return (
    <div className="pb-20 overflow-hidden">
      {/* Hero Billboard */}
      {heroMovie && (
        <div className="relative h-[85vh] w-full mb-8">
          <div className="absolute inset-0">
             <img 
               src={heroMovie.banner || heroMovie.poster} 
               alt={heroMovie.title} 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-nexus-900 via-nexus-900/40 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg max-w-2xl">
              {heroMovie.title}
            </h1>
            <p className="text-lg text-gray-200 max-w-xl line-clamp-3 mb-8 drop-shadow-md font-medium">
              {heroMovie.description}
            </p>
            <div className="flex items-center gap-4">
              <CustomButton 
                text={isReading ? 'Read Now' : 'Play Now'}
                onClick={(e) => {
                  openAdAndIntercept(e as unknown as React.MouseEvent);
                  navigate(getHeroPath(heroMovie));
                }}
                icon={isReading ? <BookOpen size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              />
              
              <button 
                onClick={(e) => {
                  openAdAndIntercept(e);
                  navigate(getHeroPath(heroMovie));
                }}
                className="bg-gray-600/80 backdrop-blur text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-600 transition h-[56px] mt-2"
              >
                <Info size={20} /> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="-mt-32 relative z-10 space-y-4">
        {category === 'anime' ? (
             <div className="flex flex-col lg:flex-row gap-6">
                {/* Mobile Genre Row */}
                <div className="lg:hidden flex overflow-x-auto gap-2 px-4 mb-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button 
                        onClick={() => setSelectedGenre(null)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition ${!selectedGenre ? 'bg-white text-black border-white' : 'bg-transparent text-gray-300 border-gray-600 hover:border-white'}`}
                    >
                        All Anime
                    </button>
                    {ANIME_GENRES.map(genre => (
                        <button 
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition ${selectedGenre === genre ? 'bg-nexus-accent text-white border-nexus-accent' : 'bg-transparent text-gray-300 border-gray-600 hover:border-white'}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Desktop Genre Sidebar */}
                <div className="hidden lg:block w-64 flex-shrink-0 px-4 space-y-6">
                    <div className="bg-nexus-800/80 backdrop-blur-md p-6 rounded-xl self-start sticky top-24 border border-nexus-700">
                        <h3 className="font-bold text-gray-200 mb-4 border-b border-gray-700 pb-3 text-lg">Categories</h3>
                        <ul className="space-y-1 py-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {ANIME_GENRES.map(genre => (
                                <li key={genre}>
                                    <button 
                                      onClick={() => setSelectedGenre(genre)}
                                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${selectedGenre === genre ? 'bg-nexus-accent text-white font-bold translate-x-2' : 'text-gray-400 hover:text-white hover:bg-nexus-700 hover:translate-x-1'}`}
                                    >
                                        {genre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {selectedGenre && (
                          <button 
                            onClick={() => setSelectedGenre(null)} 
                            className="mt-6 text-sm text-nexus-accent hover:text-white w-full text-center px-4 py-2 border border-nexus-accent rounded-lg transition-colors"
                          >
                            Clear Filter
                          </button>
                        )}
                    </div>
                    {/* PC Sidebar Ad */}
                    <div className="sticky top-[550px]">
                        <AdBanner id="bea3e504dcc997e720ed9d2f28d8f4e7" width={160} height={300} className="rounded-xl border border-nexus-700 bg-nexus-800/40 p-2" />
                    </div>
                </div>

                {/* Main Anime Content Area */}
                <div className="flex-1 overflow-hidden max-w-full">
                    {/* Top Ad for Anime Area */}
                    <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} className="lg:hidden" />
                    
                    {selectedGenre ? (
                        <div className="px-4">
                             <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-nexus-accent pl-3">
                               {selectedGenre} Anime
                             </h2>
                             {loadingGenre ? (
                                 <div className="py-24 flex justify-center"><Loader /></div>
                             ) : (
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-12">
                                     {/* Simple trick: we use AnimeCard logic dynamically or import it. Since this is Home, we need AnimeCard. Let's make sure it's imported correctly. */}
                                     {genreResults.map((item, idx) => (
                                         <div key={`${item.id}-${idx}`} className="transition-transform hover:scale-105 duration-200">
                                            {item.type === 'anime' ? (
                                                <AnimeCard item={item} />
                                            ) : (
                                                <MangaCard item={item} />
                                            )}
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    ) : (
                         <div className="space-y-4">
                             <Row title="Trending Anime" items={data.animeTrending} isLarge />
                             <AdBanner id="bd5ca73b855f1da9a5b443ecdb4cc6f1" width={468} height={60} />
                             <Row title="All Time Popular" items={data.animePopular} />
                             <NativeAd id="388542992bdcd8e47229c5eed7328b30" />
                             <Row title="Top Rated Anime" items={data.animeTopRated} />
                             <Row title="Action Packed" items={data.animeAction} />
                             <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
                             <Row title="Fantasy Worlds" items={data.animeFantasy} />
                             <Row title="Romance" items={data.animeRomance} />
                         </div>
                    )}
                </div>
             </div>
        ) : category === 'manga' ? (
             <div className="flex flex-col lg:flex-row gap-6">
                {/* Mobile Genre Row */}
                <div className="lg:hidden flex overflow-x-auto gap-2 px-4 mb-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button 
                        onClick={() => setSelectedGenre(null)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition ${!selectedGenre ? 'bg-white text-black border-white' : 'bg-transparent text-gray-300 border-gray-600 hover:border-white'}`}
                    >
                        All Manga
                    </button>
                    {MANGA_GENRES.map(genre => (
                        <button 
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold border transition ${selectedGenre === genre ? 'bg-nexus-accent text-white border-nexus-accent' : 'bg-transparent text-gray-300 border-gray-600 hover:border-white'}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Desktop Genre Sidebar */}
                <div className="hidden lg:block w-64 flex-shrink-0 px-4 space-y-6">
                    <div className="bg-nexus-800/80 backdrop-blur-md p-6 rounded-xl self-start sticky top-24 border border-nexus-700">
                        <h3 className="font-bold text-gray-200 mb-4 border-b border-gray-700 pb-3 text-lg">Categories</h3>
                        <ul className="space-y-1 py-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {MANGA_GENRES.map(genre => (
                                <li key={genre}>
                                    <button 
                                      onClick={() => setSelectedGenre(genre)}
                                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${selectedGenre === genre ? 'bg-nexus-accent text-white font-bold translate-x-2' : 'text-gray-400 hover:text-white hover:bg-nexus-700 hover:translate-x-1'}`}
                                    >
                                        {genre}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {selectedGenre && (
                          <button 
                            onClick={() => setSelectedGenre(null)} 
                            className="mt-6 text-sm text-nexus-accent hover:text-white w-full text-center px-4 py-2 border border-nexus-accent rounded-lg transition-colors"
                          >
                            Clear Filter
                          </button>
                        )}
                    </div>
                </div>

                {/* Main Manga Content Area */}
                <div className="flex-1 overflow-hidden max-w-full">
                    <AdBanner id="bd5ca73b855f1da9a5b443ecdb4cc6f1" width={468} height={60} />
                    
                    {selectedGenre ? (
                        <div className="px-4">
                             <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-nexus-accent pl-3">
                               {selectedGenre} Manga
                             </h2>
                             {loadingGenre ? (
                                 <div className="py-24 flex justify-center"><Loader /></div>
                             ) : (
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-12">
                                     {genreResults.map((item, idx) => (
                                         <div key={`${item.id}-${idx}`} className="transition-transform hover:scale-105 duration-200">
                                            <MangaCard item={item} />
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    ) : (
                         <div className="space-y-4">
                             <Row title="Trending Manga" items={data.mangaTrending} isLarge />
                             <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
                             <Row title="Most Popular to Read" items={data.mangaPopular} />
                             <NativeAd id="388542992bdcd8e47229c5eed7328b30" />
                         </div>
                    )}
                </div>
             </div>
        ) : (
            // Default Movie/TV View
            <>
                <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} className="mb-4" />
                {data.latestMovies.length > 0 && <Row title="Latest Added Movies" items={data.latestMovies} isLarge />}
                {data.latestTv.length > 0 && <Row title="Latest Added TV Shows" items={data.latestTv} />}
                <AdBanner id="bd5ca73b855f1da9a5b443ecdb4cc6f1" width={468} height={60} />
                <Row title="Trending Movies" items={data.trendingMovies} isLarge={data.latestMovies.length === 0} />
                <Row title="Trending TV Shows" items={data.trendingTv} />
                <Row title="Top Rated Movies" items={data.topRatedMovies} />
                <Row title="Popular TV Series" items={data.popularTv} />
                <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
                <Row title="Action Movies" items={data.actionMovies} />
                <Row title="Sci-Fi & Fantasy" items={data.scifiMovies} />
                <AdBanner id="bea3e504dcc997e720ed9d2f28d8f4e7" width={160} height={300} />
                <Row title="Dramatic Hits" items={data.dramaMovies} />
            </>
        )}
      </div>
    </div>
  );
};

export default Home;