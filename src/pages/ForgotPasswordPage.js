import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setSending(true);
    // Simulated reset flow — in production this calls a backend endpoint that
    // emails a time-limited reset token for this address
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="py-10 min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto card overflow-hidden">
          <div className="p-8">
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">🔑</div>
                  <h1 className="text-2xl font-black text-brand-700 dark:text-brand-300 mb-2">Forgot your password?</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No worries. Enter the email linked to your account and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                      className={`input ${error ? 'border-rose-500' : ''}`}
                      placeholder="name@example.com"
                      autoFocus
                    />
                    {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
                  </div>

                  <button type="submit" disabled={sending} className="btn-primary w-full">
                    {sending ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                    ← Back to login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-6 animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2">Check your inbox</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  If an account exists for <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>, a password reset link is on its way.
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">The link expires in 30 minutes. Don't forget to check spam.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => navigate('/login')} className="btn-primary">Go to Login</button>
                  <button onClick={() => { setSent(false); setEmail(''); }} className="btn-ghost">Try another email</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-xs">
          New to StumpScore?{' '}
          <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
