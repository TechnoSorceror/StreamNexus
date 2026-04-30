import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Details from './pages/Details';
import SearchPage from './pages/Search';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-nexus-900 text-gray-100 font-sans selection:bg-nexus-accent selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Dynamic Routes for Details */}
          <Route path="/movie/:id" element={<Details />} />
          <Route path="/tv/:id" element={<Details />} />
          <Route path="/anime/:id" element={<Details />} />
          <Route path="/manga/:id" element={<Details />} />
        </Routes>
        
        <footer className="py-12 text-center text-xs text-gray-600 border-t border-nexus-800 mt-20 bg-nexus-900">
          <p className="mb-2">StreamNexus does not host any content on its servers.</p>
          <p>Powered by TMDB, AniList & VidSrc.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;