import React, { useState } from 'react';
import { authService } from '../../services/authService';
import * as Icons from '../../icons';
import { Page } from '../../types';
import { AuthLayout } from './AuthLayout';

interface SignupPageProps {
  onNavigate: (p: Page) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.signup({ fullName, email, password });
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Begin your intelligent journey with Azure Voyage."
      onNavigate={onNavigate}
    >
      <div className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
          <div className="relative">
            <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm Password</label>
            <div className="relative">
              <Icons.Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 py-2">
          <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            By creating an account, you agree to our <button className="text-blue-600 font-bold">Terms of Service</button> and <button className="text-blue-600 font-bold">Privacy Policy</button>.
          </p>
        </div>
        <button 
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-4">OR JOIN WITH</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <Icons.Globe className="w-4 h-4" /> Google
          </button>
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl text-sm font-bold transition-colors"
          >
            <Icons.Share2 className="w-4 h-4" /> Facebook
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account? <button onClick={() => onNavigate('login')} className="text-blue-600 font-bold hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
