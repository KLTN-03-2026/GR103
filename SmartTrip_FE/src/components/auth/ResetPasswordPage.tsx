import React, { useState } from 'react';
import * as Icons from '../../icons';
import { Page } from '../../types';
import { AuthLayout } from './AuthLayout';
import { authService } from '../../services/authService';

interface ResetPasswordPageProps {
  onNavigate: (p: Page) => void;
}

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // In a real app, we'd get the email and code from URL or state
      await authService.resetPassword({ 
        email: 'user@example.com', 
        code: '123456', 
        newPassword: password 
      });
      setSuccess(true);
      setTimeout(() => onNavigate('login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create New Password" 
      subtitle="Choose a strong password for your Azure Voyage account."
      onNavigate={onNavigate}
    >
      <div className="flex justify-center mb-10">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <Icons.ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      {success ? (
        <div className="bg-green-50 p-6 rounded-2xl flex gap-4 items-start">
          <div className="bg-green-600 rounded-full p-1 mt-0.5">
            <Icons.CheckCircle className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Success!</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-medium border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">NEW PASSWORD</label>
            <div className="relative">
              <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CONFIRM PASSWORD</label>
            <div className="relative">
              <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'} <Icons.ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center">
            <button type="button" onClick={() => onNavigate('login')} className="text-sm text-blue-600 font-bold hover:underline">Back to Login</button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
