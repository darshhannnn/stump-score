import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isPremium } = useAuth();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    setMobileMenuOpen(false);
  };
  return (
    <header className="bg-blue-800 text-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-2 px-4">
        <Link to="/" className="text-xl font-bold flex items-center">
          <span className="mr-1">🏏</span>
          StumpScore
        </Link>
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li><Link to="/" className="hover:text-blue-200 transition-colors text-sm">Home</Link></li>
            <li><Link to="/#live-matches" className="hover:text-blue-200 transition-colors text-sm">Live Matches</Link></li>
            <li><Link to="/teams" className="hover:text-blue-200 transition-colors text-sm">Teams</Link></li>
            <li><Link to="/#statistics" className="hover:text-blue-200 transition-colors text-sm">Statistics</Link></li>
            <li>
              <Link to="/premium" className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 font-bold py-1 px-3 rounded-full text-xs flex items-center transition-colors">
                <span className="mr-1">✨</span>
                {isPremium() ? 'PREMIUM ✓' : 'PREMIUM'}
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li>
                  <span className="text-xs font-medium px-2">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
                </li>
                <li>
                  <button onClick={handleLogout} className="bg-red-500 text-white hover:bg-red-600 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="bg-white text-blue-900 hover:bg-blue-100 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 py-4 px-4">
          <ul className="flex flex-col space-y-3">
            <li><Link to="/" className="block hover:text-blue-200 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><Link to="/#live-matches" className="block hover:text-blue-200 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Live Matches</Link></li>
            <li><Link to="/teams" className="block hover:text-blue-200 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Teams</Link></li>
            <li><Link to="/#statistics" className="block hover:text-blue-200 transition-colors text-sm" onClick={() => setMobileMenuOpen(false)}>Statistics</Link></li>
            <li>
              <Link 
                to="/premium" 
                className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 font-bold py-1 px-3 rounded-full text-xs inline-flex items-center transition-colors" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-1">✨</span>
                {isPremium() ? 'PREMIUM ✓' : 'PREMIUM'}
              </Link>
            </li>
            
            {isAuthenticated ? (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Hi, {user?.name?.split(' ')[0] || 'User'}</p>
                <button 
                  onClick={(e) => {
                    handleLogout(e);
                    setMobileMenuOpen(false);
                  }} 
                  className="bg-red-500 text-white hover:bg-red-600 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 mt-3">
                <Link 
                  to="/login" 
                  className="bg-white text-blue-900 hover:bg-blue-100 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-1 px-4 rounded-md text-sm flex items-center transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </ul>
        </div>
      )}
      
      {/* Score Ticker */}
      <div className="bg-blue-600 text-white overflow-hidden">
        <div className="py-1 whitespace-nowrap overflow-hidden relative">
          <div className="animate-marquee inline-block text-xs">
            <span className="inline-block px-4">🏏 IND vs AUS: 287/5 (42.3) - India leads by 105 runs</span>
            <span className="inline-block px-4">🏏 ENG vs SA: 230/8 (50) - Match in progress</span>
            <span className="inline-block px-4">🏏 NZ vs PAK: 356/7 (50) - New Zealand won by 46 runs</span>
            <span className="inline-block px-4">🏏 WI vs SL: Match starts in 2 hours</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;
