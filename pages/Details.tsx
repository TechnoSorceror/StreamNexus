import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MediaItem, PlaybackState, EpisodeInfo } from '../types';
import { tmdbService } from '../services/tmdb';
import { anilistService } from '../services/anilist';
import { generateEmbedUrl } from '../services/embed';
import Row from '../components/Row';
import Loader from '../components/Loader';
import CustomButton from '../components/CustomButton';
import AdBanner from '../components/AdBanner';
import NativeAd from '../components/NativeAd';
import { Play, Calendar, Star, BookOpen, MonitorPlay, Server, Layers, Image as ImageIcon } from 'lucide-react';
import { openAdAndIntercept, shouldIntercept, markIntercepted } from '../lib/adInterceptor';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // Determine type from URL path: /movie/123 -> type = movie
  const type = location.pathname.split('/')[1] as 'movie' | 'tv' | 'anime' | 'manga';

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [collection, setCollection] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  // TV Specific Data
  const [episodes, setEpisodes] = useState<EpisodeInfo[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Playback State
  const [playState, setPlayState] = useState<PlaybackState>({
    isPlaying: false,
    season: 1,
    episode: 1,
    chapter: 1,
    isDub: false,
    server: 1
  });

  // Fetch Media Details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let result: MediaItem | null = null;
        if (type === 'movie' || type === 'tv') {
          result = await tmdbService.getDetails(Number(id), type);
          
          // If movie part of collection, fetch collection
          if (type === 'movie' && result?.collectionId) {
             const colParts = await tmdbService.getCollection(result.collectionId);
             setCollection(colParts.filter(p => p.id !== result?.id)); // Remove current
          } else {
             setCollection([]);
          }

        } else if (type === 'anime') {
          const anilistData = await anilistService.getDetails(Number(id), type);
          if (anilistData) {
              const tmdbTvResults = await tmdbService.search(anilistData.title, 'tv');
              let found = false;
              if (tmdbTvResults && tmdbTvResults.length > 0) {
                  result = await tmdbService.getDetails(Number(tmdbTvResults[0].id), 'tv');
                  found = !!result;
              }
              if (!found) {
                  const tmdbMovieResults = await tmdbService.search(anilistData.title, 'movie');
                  if (tmdbMovieResults && tmdbMovieResults.length > 0) {
                      result = await tmdbService.getDetails(Number(tmdbMovieResults[0].id), 'movie');
                      found = !!result;
                  }
              }
              if (!found) {
                  result = anilistData;
              } else if (result) {
                  // Keep the poster and banner from anilist if preferred, or use tmdb. Let's merge some.
                  result.title = anilistData.title; // Keep anilist title
                  result.anilistId = Number(anilistData.id);
              }
          }
        } else {
          result = await anilistService.getDetails(Number(id), type);
        }
        setMedia(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    
    // Reset Playback state on new media load
    setPlayState({
      isPlaying: false,
      season: 1,
      episode: 1,
      chapter: 1,
      isDub: false,
      server: 1
    });
    setEpisodes([]);
  }, [id, type]);

  // Fetch TV Episodes when Season Changes or Media Loads
  useEffect(() => {
    if ((media?.type === 'tv' || media?.type === 'anime') && media?.tmdbId) {
      const fetchEps = async () => {
        setLoadingEpisodes(true);
        const data = await tmdbService.getSeason(media.tmdbId!, playState.season);
        setEpisodes(data.episodes);
        setLoadingEpisodes(false);
      };
      fetchEps();
    }
  }, [media?.type, media?.tmdbId, playState.season]);

  // Ref to track the timeout to clear it on unmount
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleWatch = (e?: React.MouseEvent) => {
    if (e) openAdAndIntercept(e);
    setPlayState(prev => ({ ...prev, isPlaying: true }));
    scrollTimeoutRef.current = setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const selectEpisode = (epNum: number, e?: React.MouseEvent) => {
    if (e && !playState.isPlaying) openAdAndIntercept(e);
    setPlayState(prev => ({ ...prev, episode: epNum, isPlaying: true }));
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectChapter = (chapNum: number, e?: React.MouseEvent) => {
    if (e && !playState.isPlaying) openAdAndIntercept(e);
    setPlayState(prev => ({ ...prev, chapter: chapNum, isPlaying: true }));
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderEmbed = () => {
    if (!media) return null;
    const url = generateEmbedUrl(media, playState);

    return (
      <div className="w-full h-full bg-black rounded-lg overflow-hidden relative group">
         <iframe
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="origin"
        />
        <div className="absolute top-2 left-2 bg-black/50 text-[10px] text-gray-500 px-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Src: {url}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-nexus-900">
        <Loader />
    </div>
  );
  
  if (!media) return <div className="h-screen flex items-center justify-center text-white">Media Not Found</div>;

  return (
    <div className="min-h-screen pb-20 mt-16">
      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img 
            src={media.banner || media.poster} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-nexus-900/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto flex flex-col md:flex-row gap-8 items-end">
            <img 
              src={media.poster} 
              alt={media.title} 
              className="w-32 md:w-48 rounded-lg shadow-2xl border border-white/10 hidden sm:block"
            />
            
            <div className="flex-1 space-y-4 text-shadow-md">
              <h1 className="text-3xl md:text-5xl font-bold text-white">{media.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                
                {/* DYNAMIC RATING BADGE */}
                {media.type === 'anime' || media.type === 'manga' ? (
                  <span className="flex items-center gap-1 text-nexus-accent font-bold">
                    <Star size={16} fill="currentColor" /> {(media.rating * 10).toFixed(0)}% Score
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Star size={16} fill="currentColor" /> {media.rating.toFixed(1)}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar size={16} /> {media.releaseDate.split('-')[0]}
                </span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs uppercase tracking-wide">
                  {media.type}
                </span>
                {media.status && <span className="text-green-400">{media.status}</span>}
              </div>

              <p className="text-gray-300 max-w-2xl line-clamp-3 md:line-clamp-none">
                {media.description}
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex">
                  <CustomButton 
                    text={media.type === 'manga' ? 'Start Reading' : 'Watch Now'}
                    onClick={(e) => handleWatch(e as unknown as React.MouseEvent)}
                    icon={media.type === 'manga' ? <BookOpen size={20} /> : <Play size={20} fill="currentColor" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                {/* Player Section */}
                {playState.isPlaying && (
                    <div ref={playerRef} className="mb-12 animate-fade-in-up">
                         <div className="bg-nexus-800 rounded-t-xl p-4 flex flex-wrap gap-4 items-center justify-between border-b border-nexus-700">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <MonitorPlay size={20} className="text-nexus-accent" />
                                {media.type === 'manga' ? `Chapter ${playState.chapter}` : 
                                 media.type === 'movie' ? 'Watching Movie' :
                                 media.type === 'anime' ? `Episode ${playState.episode}` :
                                 `S${playState.season}:E${playState.episode}`}
                            </h3>
        
                            {/* Server Toggle for Movies/TV ONLY */}
                            {(media.type === 'movie' || media.type === 'tv') && (
                                <div className="flex items-center gap-2 bg-nexus-900 rounded p-1 border border-nexus-700">
                                    <span className="text-[10px] text-gray-500 px-2 uppercase font-bold tracking-wider flex items-center gap-1">
                                        <Server size={10} /> Server
                                    </span>
                                    <div className="px-3 py-1 text-xs font-bold rounded bg-nexus-accent text-white">
                                        MAIN
                                    </div>
                                </div>
                            )}
                         </div>
        
                         <div className="aspect-video w-full bg-black rounded-b-xl overflow-hidden shadow-2xl border border-nexus-700 border-t-0">
                            {renderEmbed()}
                         </div>
                         <AdBanner id="bd5ca73b855f1da9a5b443ecdb4cc6f1" width={468} height={60} />
                         <NativeAd id="388542992bdcd8e47229c5eed7328b30" />
                    </div>
                )}
        
                {/* --- TV SHOWS & ANIME: Seasons & Episodes --- */}
                {(media.type === 'tv' || media.type === 'anime') && media.seasons && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Layers className="text-nexus-accent" /> Episodes
                            </h2>
                            <select 
                                className="bg-nexus-800 text-white border border-nexus-700 rounded px-4 py-2 outline-none focus:border-nexus-accent"
                                value={playState.season}
                                onChange={(e) => setPlayState(prev => ({ ...prev, season: Number(e.target.value), episode: 1 }))}
                            >
                                {Array.from({ length: media.seasons }, (_, i) => i + 1).map(s => (
                                    <option key={s} value={s}>Season {s}</option>
                                ))}
                            </select>
                        </div>
        
                        {loadingEpisodes ? (
                            <div className="h-40 flex items-center justify-center">
                                 <Loader />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {episodes && episodes.length > 0 ? (
                                    episodes.map((ep) => (
                                        <button 
                                            key={ep.id}
                                            onClick={(e) => selectEpisode(ep.episode_number, e)}
                                            className={`flex gap-4 p-3 rounded-lg border text-left transition-all ${
                                                playState.episode === ep.episode_number && playState.isPlaying
                                                ? 'bg-nexus-800 border-nexus-accent' 
                                                : 'bg-nexus-900 border-nexus-800 hover:bg-nexus-800'
                                            }`}
                                        >
                                            <div className="w-24 h-16 flex-shrink-0 bg-black rounded overflow-hidden relative">
                                                {ep.still_path ? (
                                                    <img src={ep.still_path} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white">
                                                    Ep {ep.episode_number}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">{ep.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview || "No description available."}</p>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center text-gray-500">
                                        No episodes found for this season.
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="pt-8">
                            <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
                        </div>
                    </div>
                )}
        
                {/* --- MANGA: Chapter Selector --- */}
                {media.type === 'manga' && (media.chapters || 0) > 0 && (
                    <div className="space-y-6">
                         <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="text-nexus-accent" /> Chapters
                        </h2>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {Array.from({ length: media.chapters || 0 }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={(e) => selectChapter(num, e)}
                                    className={`py-2 rounded font-mono text-sm font-bold border transition-all ${
                                        playState.chapter === num && playState.isPlaying
                                        ? 'bg-nexus-accent border-nexus-accent text-white' 
                                        : 'bg-nexus-800 border-nexus-700 text-gray-300 hover:bg-nexus-700 hover:text-white'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
        
                {/* --- MOVIES: Collection (Only for Movies) --- */}
                {collection.length > 0 && media.type === 'movie' && (
                     <div className="mt-12">
                        <Row title={`More in the ${media.collectionName}`} items={collection} isLarge />
                     </div>
                )}
            </div>

            {/* Sidebar Ads */}
            <div className="hidden lg:block w-64 space-y-6">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-nexus-800/40 p-4 rounded-xl border border-nexus-700 text-center">
                        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-4">Advertisement</p>
                        <AdBanner id="bea3e504dcc997e720ed9d2f28d8f4e7" width={160} height={300} />
                    </div>
                    <div className="bg-nexus-800/40 p-4 rounded-xl border border-nexus-700 text-center">
                        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-4">Sponsor</p>
                        <AdBanner id="99395f50c2416dec8bd6eab9d9abb526" width={320} height={50} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Details;