import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto card overflow-hidden">
          <div className="p-8">
            {success ? (
              <div className="text-center py-6 animate-scale-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2">Password reset!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your password has been updated. Redirecting you to login...</p>
                <Link to="/login" className="btn-primary">Go to Login</Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">🔐</div>
                  <h1 className="text-2xl font-black text-brand-700 dark:text-brand-300 mb-2">Set a new password</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Choose a strong password for your StumpScore account.</p>
                </div>

                {errors.form && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input ${errors.password ? 'border-rose-500' : ''}`}
                      placeholder="••••••••"
                      autoFocus
                    />
                    {errors.password && <p className="mt-1 text-sm text-rose-500">{errors.password}</p>}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`input ${errors.confirmPassword ? 'border-rose-500' : ''}`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-rose-500">{errors.confirmPassword}</p>}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">← Back to login</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
