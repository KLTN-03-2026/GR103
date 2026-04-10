import React, { useState } from 'react';
import { authService } from '../../services/authService';
import * as Icons from '../../icons';
import { Page } from '../../types';
import { AuthLayout } from './AuthLayout';

interface LoginPageProps {
  onNavigate: (p: Page) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      window.location.reload(); // Refresh to trigger App.tsx auth check
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your journey with Azure Voyage."
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">EMAIL ADDRESS</label>
          <div className="relative">
            <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">PASSWORD</label>
            <button onClick={() => onNavigate('recovery')} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Forgot Password?</button>
          </div>
          <div className="relative">
            <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'} <Icons.ArrowRight className="w-4 h-4" />
        </button>
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Don't have an account? <button onClick={() => onNavigate('signup')} className="text-blue-600 font-bold hover:underline">Create Account</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
