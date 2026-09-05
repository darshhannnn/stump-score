import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using StumpScore ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, please do not use the Service.',
  },
  {
    title: '2. The Service',
    body: 'StumpScore provides live cricket score information, match analysis, a casual board-game scorekeeper, leaderboard statistics, and optional premium features. Live data is aggregated from third-party providers and may be delayed, simulated for demonstration purposes, or unavailable at times.',
  },
  {
    title: '3. Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information when signing up and be at least 13 years old to create an account.',
  },
  {
    title: '4. Premium Subscriptions & Billing',
    body: 'Premium plans are billed in advance through Razorpay and include a free trial period where stated. You can cancel at any time from your dashboard; cancellation stops future renewals, and access continues until the end of the paid period. Payments already made are generally non-refundable except where required by law.',
  },
  {
    title: '5. Acceptable Use',
    body: 'You agree not to: misuse the Service, attempt to disrupt or scrape it at scale, reverse engineer payment flows, resell access to premium features, or use the Service for any unlawful purpose. Scorekeeper game links you share are your responsibility.',
  },
  {
    title: '6. Predictions & Analysis Disclaimer',
    body: 'Match predictions, win probabilities, and AI commentary are generated from statistical models for entertainment purposes only. They are not advice, and no guarantee of accuracy is given. Please gamble responsibly — or better yet, don\'t gamble at all.',
  },
  {
    title: '7. Intellectual Property',
    body: 'The StumpScore name, design, and code are protected intellectual property. Team names, logos, and player references belong to their respective owners and are used here for informational purposes only.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, StumpScore shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may revise these terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised terms.',
  },
];

const TermsPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">📜</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: September 5, 2026</p>
        </div>

        <div className="card p-6 md:p-8 space-y-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to StumpScore! These terms govern your use of the app. Please read them carefully — we've kept them as short and human-readable as possible.
          </p>
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{s.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
            </section>
          ))}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            Something unclear? <Link to="/contact" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Get in touch</Link>.
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="btn-ghost">← Back to Live Scores</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
