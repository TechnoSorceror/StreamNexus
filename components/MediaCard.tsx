import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MediaItem } from '../types';
import { openAdAndIntercept } from '../lib/adInterceptor';

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const targetUrl = `/${item.type}/${item.id}`;

  const handleClick = (e: React.MouseEvent) => {
    openAdAndIntercept(e);
    navigate(targetUrl);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative block bg-nexus-800 rounded-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50 cursor-pointer"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img 
          src={item.poster} 
          alt={item.title} 
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1 text-xs text-yellow-400 font-bold">
          <Star size={10} fill="currentColor" />
          <span>{item.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">{item.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400 capitalize">{item.type}</span>
            <span className="text-xs text-gray-400">{item.releaseDate.split('-')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;