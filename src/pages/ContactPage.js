import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email is invalid';
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulated submission — wire to a mail service or backend endpoint in production
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  };

  const channels = [
    { icon: '📧', title: 'Email Us', detail: 'support@stumpscore.com', note: 'Replies within 24-48 hours' },
    { icon: '🐞', title: 'Report a Bug', detail: 'bugs@stumpscore.com', note: 'Include the page and what happened' },
    { icon: '💼', title: 'Business & Press', detail: 'hello@stumpscore.com', note: 'Partnerships and media enquiries' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">📬</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Contact Us</h1>
          <p className="text-gray-500 dark:text-gray-400">Questions, feedback, or a bug to report? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {channels.map((c) => (
            <div key={c.title} className="card p-5 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-2">{c.icon}</div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{c.title}</h3>
              <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold mt-1">{c.detail}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{c.note}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 md:p-8 max-w-2xl mx-auto">
          {sent ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">Message sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Thanks for reaching out, {form.name.split(' ')[0]}. We'll get back to you at {form.email} soon.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: 'general', message: '' }); }} className="btn-ghost">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                  <input id="name" name="name" value={form.name} onChange={handleChange} className="input" placeholder="Virat Kohli" />
                  {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" />
                  {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Topic</label>
                <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="input cursor-pointer">
                  <option value="general">General question</option>
                  <option value="bug">Bug report</option>
                  <option value="premium">Premium & billing</option>
                  <option value="feedback">Feature suggestion</option>
                  <option value="business">Business enquiry</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={5} className="input resize-none" placeholder="Tell us what's on your mind..." />
                {errors.message && <p className="mt-1 text-sm text-rose-500">{errors.message}</p>}
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full">
                {sending ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="btn-ghost">← Back to Live Scores</Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
