import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, GraduationCap, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api.js';

interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Authenticate via the backend API
      const data = await api.login(email, password);

      // Save token to localStorage for persistent session
      try {
        localStorage.setItem('qm_token', data.token);
        localStorage.setItem('qm_user', JSON.stringify(data.user));
      } catch (_) {
        console.warn('LocalStorage write is restricted or unavailable.');
      }
      
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 font-sans text-xs">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-2.5 bg-indigo-600 rounded text-white shadow-sm mb-3"
        >
          <GraduationCap className="h-7 w-7" />
        </motion.div>
        
        <h2 className="text-base font-bold tracking-tight text-slate-800">
          QuizMaster Administrator Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to control the global catalog, classifications, and system analytics.
        </p>
      </div>

      <motion.div 
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm"
      >
        <div className="bg-white py-6 px-5 shadow-xs border border-slate-200 rounded-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wide mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded border border-slate-200 px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:bg-white transition-colors text-xs"
                placeholder="admin@quizmaster.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wide mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded border border-slate-200 px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:bg-white transition-colors text-xs"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded bg-rose-50 p-2 border border-rose-100 text-rose-600 text-[11px] flex items-start gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-550 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 flex justify-center items-center gap-1.5 py-2 px-4 border border-transparent rounded text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-750 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In to Admin Workspace
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
