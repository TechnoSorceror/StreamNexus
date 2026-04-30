import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, MonitorPlay, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Change nav background on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getSearchType = () => {
    const path = location.pathname;
    const cat = searchParams.get('cat');
    const t = searchParams.get('t');

    if (path.startsWith('/anime') || cat === 'anime' || t === 'anime') return 'anime';
    if (path.startsWith('/manga') || cat === 'manga' || t === 'manga') return 'manga';
    return 'media'; // Default is movies & tv
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const type = getSearchType();
      navigate(`/search?q=${encodeURIComponent(query)}&t=${type}`);
      setMobileMenuOpen(false);
    }
  };

  const getPlaceholder = () => {
    const type = getSearchType();
    if (type === 'anime') return 'Search Anime...';
    if (type === 'manga') return 'Search Manga...';
    return 'Search Movies & TV...';
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-nexus-900/95 border-b border-nexus-700 backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-nexus-accent hover:text-red-500 transition-colors">
          <MonitorPlay size={28} />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">StreamNexus</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300 shadow-black drop-shadow-md">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/?cat=anime" className="hover:text-white transition">Anime</Link>
          <Link to="/?cat=manga" className="hover:text-white transition">Manga</Link>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input
              type="text"
              placeholder={getPlaceholder()}
              className="bg-black/50 text-sm text-white px-4 py-1.5 pl-9 rounded-none border border-white/30 focus:border-white focus:outline-none w-48 focus:w-64 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          </form>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-nexus-900 border-b border-nexus-700 p-4 space-y-4">
           <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={getPlaceholder()}
              className="bg-nexus-800 text-sm text-white px-4 py-2 w-full rounded-md border border-nexus-700"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="flex flex-col gap-2 text-gray-300 font-bold">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/?cat=anime" onClick={() => setMobileMenuOpen(false)}>Anime</Link>
            <Link to="/?cat=manga" onClick={() => setMobileMenuOpen(false)}>Manga</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;