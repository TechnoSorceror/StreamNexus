import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, PlayCircle } from 'lucide-react';
import { MediaItem } from '../types';
import { openAdAndIntercept } from '../lib/adInterceptor';

interface AnimeCardProps {
  item: MediaItem;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const targetUrl = `/anime/${item.id}`;

  const handleClick = (e: React.MouseEvent) => {
    openAdAndIntercept(e);
    navigate(targetUrl);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative block bg-nexus-800 rounded-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-nexus-accent/20 cursor-pointer"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img 
          src={item.poster} 
          alt={item.title} 
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
          loading="lazy"
        />
        {/* AniList Style Score Badge */}
        <div className="absolute top-2 right-2 bg-nexus-900/90 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1 text-xs text-nexus-accent font-bold border border-nexus-700">
          <Star size={10} fill="currentColor" />
          <span>{item.rating ? (item.rating * 10).toFixed(0) + '%' : 'N/A'}</span>
        </div>
        
        {/* Episode Badge */}
        {item.episodes ? (
            <div className="absolute top-2 left-2 bg-nexus-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-gray-300 font-bold uppercase tracking-wider border border-nexus-700">
                {item.episodes} EP
            </div>
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-10 translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">{item.title}</h3>
          <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
            <span>Anime</span>
            <span>{item.releaseDate?.split('-')[0] || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;