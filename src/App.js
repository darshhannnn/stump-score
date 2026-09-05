import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ScorekeeperPage from './pages/ScorekeeperPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PremiumPage from './pages/PremiumPage';
import PaymentPage from './pages/PaymentPage';
import TeamsPage from './pages/TeamsPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import PremiumDashboardPage from './pages/PremiumDashboardPage';
import SeriesPage from './pages/SeriesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/scorekeeper" element={<ScorekeeperPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/premium" element={<PremiumPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/dashboard" element={<PremiumDashboardPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/teams/:teamId" element={<TeamDetailPage />} />
      <Route path="/series" element={<SeriesPage />} />
      <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/match/:matchId" element={<MatchDetailsPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="text-6xl mb-4">🏏</div>
      <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">That page bounced out of the park.</p>
      <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
        Back to Live Scores
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-[104px]">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
