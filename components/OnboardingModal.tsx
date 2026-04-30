import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Check } from 'lucide-react';
import { STORAGE_KEYS, DEFAULT_TMDB_API_KEY } from '../constants';

const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem(STORAGE_KEYS.TMDB_API_KEY);
    // Only show modal if user hasn't set a key AND we don't have a default fallback
    if (!key && !DEFAULT_TMDB_API_KEY) {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEYS.TMDB_API_KEY, apiKey.trim());
      setIsOpen(false);
      window.location.reload(); // Reload to initialize services
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-nexus-800 border border-nexus-700 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-nexus-700 mb-4 text-nexus-accent">
            <Key size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Setup Required</h2>
          <p className="text-gray-400 text-sm">
            To enable movie and TV show discovery, StreamNexus needs a TMDB API Key.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              TMDB API Key (v3)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g. eyJhbGciOiJIUzI1Ni..."
              className="w-full bg-nexus-900 border border-nexus-700 text-white px-4 py-3 rounded-lg focus:border-nexus-accent focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full bg-nexus-accent hover:bg-nexus-accentHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Connect & Start Streaming
          </button>
          
          <div className="pt-4 border-t border-nexus-700 text-center">
            <a 
              href="https://www.themoviedb.org/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-nexus-accent hover:underline"
            >
              Don't have a key? Get one here <ExternalLink size={10} />
            </a>
            <p className="text-[10px] text-gray-500 mt-2">
              Your key is stored locally in your browser. We do not track or store your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;