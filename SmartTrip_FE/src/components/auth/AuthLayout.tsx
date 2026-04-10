import React from 'react';
import { motion } from 'motion/react';
import * as Icons from '../../icons';
import { Page } from '../../types';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onNavigate: (p: Page) => void;
}

export function AuthLayout({ children, title, subtitle, onNavigate }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-8">
        <button onClick={() => onNavigate('landing')} className="text-2xl font-bold text-blue-600">
          Azure Voyage
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 p-10 border border-slate-100"
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">{title}</h1>
              <p className="text-slate-500 text-sm">{subtitle}</p>
            </div>
            {children}
          </motion.div>
          <div className="mt-8 flex justify-center items-center gap-4 text-xs text-slate-400 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-1.5">
              <Icons.ShieldCheck className="w-3.5 h-3.5" /> SECURE AUTHENTICATION
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Icons.Sparkles className="w-3.5 h-3.5" /> AI OPTIMIZED TRAVEL
            </div>
          </div>
        </div>
      </main>
      <footer className="p-8 flex justify-between items-center text-xs text-slate-400">
        <p>© 2024 Azure Voyage. All rights reserved.</p>
        <div className="flex gap-6">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
          <button>Support</button>
        </div>
      </footer>
    </div>
  );
}
