import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { path: '/', label: 'Live Scores', icon: '🏏' },
  { path: '/teams', label: 'Teams', icon: '👥' },
  { path: '/series', label: 'Series', icon: '🏆' },
  { path: '/scorekeeper', label: 'Scorekeeper', icon: '🎯' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '📊' },
];

const tickerItems = [
  '🏏 Live scores updating every 30 seconds',
  '🏆 T20 World Cup 2026 Semi-Finals',
  '📊 ICC Rankings updated weekly',
  '⚡ Ball-by-ball AI commentary on match pages',
  '🎯 Track your Stump 360 games with the Scorekeeper',
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, logout, isPremium } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-lg shadow-gray-900/5 dark:shadow-black/30 border-b border-gray-100 dark:border-gray-800'
        : 'bg-white/75 dark:bg-gray-950/75 backdrop-blur-md border-b border-transparent'
    }`}>
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 shadow-glow-brand flex items-center justify-center text-xl group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
            🏏
          </span>
          <span className="text-xl font-black bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400 hidden sm:block">
            StumpScore
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 shadow-inner'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                }`}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/premium" className={`ml-1 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isPremium()
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-glow-gold'
                  : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:shadow-glow-gold'
              }`}>
                ✨ Premium
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {searchOpen && (
              <form onSubmit={handleSearch} className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-100 dark:border-gray-700 p-3 animate-fade-in-down z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches, teams, players..."
                  autoFocus
                  className="input"
                />
              </form>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-600 dark:text-amber-300 hover:rotate-12"
            title={darkMode ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 pl-2 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${isPremium() ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-brand-500 to-indigo-600'}`}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </span>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <button onClick={handleLogout} className="px-3 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3.5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">Login</Link>
                <Link to="/signup" className="btn-primary !px-4 !py-2 text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Menu">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Score Ticker */}
      <div className="ticker bg-gradient-to-r from-brand-950 via-brand-800 to-indigo-950 dark:from-gray-950 dark:via-brand-950 dark:to-gray-950 text-white overflow-hidden border-t border-white/5">
        <div className="flex items-center">
          <span className="relative z-10 flex items-center gap-1.5 pl-4 pr-3 py-1.5 text-[11px] font-black uppercase tracking-widest shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            Live
          </span>
          <div className="py-1.5 whitespace-nowrap overflow-hidden relative flex-1">
            <div className="animate-marquee inline-flex text-xs text-blue-100/90">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="inline-flex items-center px-6">
                  {item}
                  <span className="ml-6 w-1 h-1 rounded-full bg-brand-400/60" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-xl animate-fade-in-down">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matches, teams..."
                className="input"
              />
            </form>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive(item.path)
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
                <span className="text-base">{item.icon}</span> {item.label}
              </Link>
            ))}
            <Link to="/premium" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 transition-colors">
              ✨ Premium
            </Link>
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />
            <button onClick={toggleTheme} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">Logout</button>
            ) : (
              <div className="flex gap-2 px-1 pt-2">
                <Link to="/login" className="flex-1 text-center btn-ghost !py-2.5 text-sm">Login</Link>
                <Link to="/signup" className="flex-1 text-center btn-primary !py-2.5 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
