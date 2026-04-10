import React from 'react';
import * as Icons from '../icons';
import { Page, UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onNavigate: (p: Page) => void;
  user: any;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export function Navbar({ onNavigate, user, userProfile, onLogout }: NavbarProps) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-10">
            <button onClick={() => onNavigate('landing')} className="text-2xl font-bold text-blue-900 tracking-tight">
              The Voyager
            </button>
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
              <button onClick={() => onNavigate('landing')} className="hover:text-slate-900 transition-colors">{t('nav.discover')}</button>
              <button onClick={() => onNavigate('booking-management')} className="hover:text-slate-900 transition-colors">{t('nav.myTrips')}</button>
              <button onClick={() => onNavigate('planner')} className="flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors">
                <Icons.Sparkles className="w-4 h-4" />
                {t('nav.planner')}
              </button>
              {userProfile?.role === 'Admin' && (
                <>
                  <button onClick={() => onNavigate('admin')} className="hover:text-slate-900 transition-colors">{t('nav.admin')}</button>
                  <button onClick={() => onNavigate('monitoring')} className="hover:text-slate-900 transition-colors">{t('nav.monitoring')}</button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600" title={t('nav.notifications')}>
              <Icons.Bell className="w-5 h-5" />
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{userProfile?.fullName || user.email}</p>
                  <button onClick={onLogout} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">{t('nav.logout')}</button>
                </div>
                <button 
                  onClick={() => onNavigate('profile')}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/20"
                >
                  <Icons.User className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all overflow-hidden"
              >
                <Icons.User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
