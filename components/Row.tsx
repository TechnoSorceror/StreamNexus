import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import AnimeCard from './AnimeCard';
import MangaCard from './MangaCard';
import { MediaItem } from '../types';

interface RowProps {
  title: string;
  items: MediaItem[];
  isLarge?: boolean;
}

const Row: React.FC<RowProps> = ({ title, items, isLarge = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const slide = (offset: number) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 group">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 border-l-4 border-nexus-accent pl-3">
        {title}
      </h2>
      
      <div className="relative">
        <button 
          onClick={() => slide(-500)}
          className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
        >
          <ChevronLeft className="text-white" size={32} />
        </button>

        <div 
          ref={rowRef}
          className="flex overflow-x-scroll scrollbar-hide gap-4 px-4 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className={`flex-none ${isLarge ? 'w-[200px]' : 'w-[160px]'} transition-transform hover:scale-105 duration-200`}
            >
              {/* STRICT COMPONENT SEPARATION */}
              {item.type === 'anime' ? (
                <AnimeCard item={item} />
              ) : item.type === 'manga' ? (
                <MangaCard item={item} />
              ) : (
                <MediaCard item={item} />
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => slide(500)}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
        >
          <ChevronRight className="text-white" size={32} />
        </button>
      </div>
    </div>
  );
};

export default Row;