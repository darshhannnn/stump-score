import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-gray-950 dark:bg-black text-white mt-auto overflow-hidden">
      {/* Top accent gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-48 bg-brand-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 flex items-center justify-center text-lg group-hover:rotate-6 transition-transform duration-300">
                🏏
              </span>
              <span className="text-lg font-black">StumpScore</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Live cricket scores, AI-powered match insights, and the ultimate board-game scorekeeper — all in one hub.
            </p>
            <div className="flex gap-2 mt-4">
              {['twitter', 'github'].map(s => (
                <a key={s} href={`https://${s}.com`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-600 hover:border-brand-500 hover:shadow-glow-brand flex items-center justify-center transition-all hover:scale-110"
                  aria-label={s}>
                  <span className="text-xs font-bold">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cricket</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-brand-400 transition-all duration-200" />Live Scores</Link></li>
              <li><Link to="/teams" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-brand-400 transition-all duration-200" />Teams</Link></li>
              <li><Link to="/series" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-brand-400 transition-all duration-200" />Series</Link></li>
              <li><Link to="/scorekeeper" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-brand-400 transition-all duration-200" />Scorekeeper</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Premium</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/premium" className="text-gray-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-amber-400 transition-all duration-200" />Subscribe</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-amber-400 transition-all duration-200" />Dashboard</Link></li>
              <li><Link to="/leaderboard" className="text-gray-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 group"><span className="w-0 group-hover:w-2 h-px bg-amber-400 transition-all duration-200" />Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} StumpScore. All rights reserved.</p>
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            Made for cricket fans <span className="text-rose-500">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
