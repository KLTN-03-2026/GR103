import React, { useState } from 'react';
import * as Icons from '../../icons';
import { Page } from '../../types';
import { AuthLayout } from './AuthLayout';
import { authService } from '../../services/authService';

interface RecoveryPageProps {
  onNavigate: (p: Page) => void;
}

export function RecoveryPage({ onNavigate }: RecoveryPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      onNavigate('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Recovery Access" 
      subtitle="Enter the email address associated with your Azure Voyage account. We'll send a secure link to reset your credentials."
      onNavigate={onNavigate}
    >
      <div className="flex justify-center mb-10">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <Icons.Clock className="w-8 h-8" />
        </div>
      </div>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ACCOUNT EMAIL</label>
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
        <button 
          onClick={handleSendLink}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'} <Icons.ArrowRight className="w-4 h-4" />
        </button>
        <div className="text-center">
          <button onClick={() => onNavigate('login')} className="text-sm text-blue-600 font-bold hover:underline">Back to Login</button>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-2xl flex gap-4 items-start mt-8">
          <div className="bg-blue-600 rounded-full p-1 mt-0.5">
            <Icons.ShieldCheck className="w-3 h-3 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Check your inbox</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              If you don't receive an email within 5 minutes, please check your spam folder or contact our concierge support.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
