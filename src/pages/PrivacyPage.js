import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect the information you provide directly: your name, email address, and password when you create a StumpScore account. We also store your subscription status and payment references (handled by Razorpay — we never see or store your full card details). Locally, in your browser, we save your theme preference and saved Scorekeeper games.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to authenticate you, maintain your account, provide premium features, show relevant live cricket content, and improve the app. We do not sell your personal data to third parties.',
  },
  {
    title: '3. Local Storage',
    body: 'StumpScore stores certain preferences in your browser\'s local storage: your auth token, cached user profile, theme choice, and your saved Scorekeeper games and leaderboard stats. Clearing your browser data will remove these. Game data is stored only on your device unless you share a game link.',
  },
  {
    title: '4. Payments',
    body: 'Premium subscriptions are processed by Razorpay. Payment card data is entered directly into Razorpay\'s PCI-DSS compliant checkout and never touches StumpScore servers. We only retain your subscription status, plan type, and Razorpay payment/order identifiers for reconciliation.',
  },
  {
    title: '5. Third-Party Services',
    body: 'We rely on third parties to operate: Razorpay (payments), cricket data providers such as CricAPI and RapidAPI/Cricbuzz (live scores), Firebase (optional Google sign-in), and Google Fonts (typefaces). These services process data under their own privacy policies.',
  },
  {
    title: '6. Data Security',
    body: 'Passwords are hashed with bcrypt before storage and never leave our servers. API access is protected with signed JWT tokens. However, no method of transmission over the internet is 100% secure — please use a unique password.',
  },
  {
    title: '7. Your Choices',
    body: 'You may update your profile information from your account, delete saved games at any time from the Scorekeeper, or contact us to request deletion of your account and associated data.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this policy from time to time. Material changes will be reflected on this page with an updated revision date.',
  },
];

const PrivacyPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">🔒</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: September 5, 2026</p>
        </div>

        <div className="card p-6 md:p-8 space-y-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Your privacy matters to us. This policy explains what data StumpScore collects, how it is used, and the choices you have. It applies to the StumpScore web application and all of its subpages.
          </p>
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{s.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
            </section>
          ))}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            Questions about this policy? <Link to="/contact" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Contact us</Link>.
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="btn-ghost">← Back to Live Scores</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
