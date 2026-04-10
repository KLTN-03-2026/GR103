import React from 'react';
import * as Icons from '../../icons';
import { Page } from '../../types';
import { AuthLayout } from './AuthLayout';

interface VerifyPageProps {
  onNavigate: (p: Page) => void;
}

export function VerifyPage({ onNavigate }: VerifyPageProps) {
  return (
    <AuthLayout 
      title="Secure Access" 
      subtitle="Enter the code sent to your email"
      onNavigate={onNavigate}
    >
      <div className="flex justify-center mb-10">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Icons.Lock className="w-8 h-8" />
        </div>
      </div>
      <div className="space-y-8">
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <input 
              key={i}
              type="text" 
              maxLength={1}
              className="w-12 h-16 bg-slate-50 border-none rounded-xl text-center text-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          ))}
        </div>
        <button 
          onClick={() => onNavigate('reset-password')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          Verify
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-2">Didn't receive the code?</p>
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm text-blue-600 font-bold hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
