import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from './icons';
import { Page, UserProfile } from './types';

// Import separated components
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { RecoveryPage } from './components/auth/RecoveryPage';
import { VerifyPage } from './components/auth/VerifyPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';

import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { AdminConsole } from './components/AdminConsole';
import { AIMonitoring } from './components/AIMonitoring';
import { AIPlanner } from './components/AIPlanner';
import { BookingManagement } from './components/BookingManagement';
import { Checkout } from './components/Checkout';
import { Review } from './components/Review';
// import { QuickNav } from './components/QuickNav'; // Removed for production

import { authService } from './services/authService';
import { userService } from './services/userService';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await userService.getProfile();
          setUserProfile(profile);
          setUser({ uid: profile.uid, email: profile.email } as any);
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    authService.logout();
    setUser(null);
    setUserProfile(null);
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icons.Sparkles className="w-10 h-10 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  const handleNavigate = (page: Page, id?: string) => {
    setSelectedBookingId(id);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login': return <LoginPage onNavigate={handleNavigate} />;
      case 'signup': return <SignupPage onNavigate={handleNavigate} />;
      case 'recovery': return <RecoveryPage onNavigate={handleNavigate} />;
      case 'verify': return <VerifyPage onNavigate={handleNavigate} />;
      case 'reset-password': return <ResetPasswordPage onNavigate={handleNavigate} />;
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'profile': return <ProfilePage onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'admin': return <AdminConsole onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'system-pulse': return <AdminConsole onNavigate={handleNavigate} userProfile={userProfile} initialTab="statistics" />;
      case 'system-config': return <AdminConsole onNavigate={handleNavigate} userProfile={userProfile} initialTab="financials" />;
      case 'ai-config': return <AdminConsole onNavigate={handleNavigate} userProfile={userProfile} initialTab="ai-config" />;
      case 'system-audit': return <AdminConsole onNavigate={handleNavigate} userProfile={userProfile} initialTab="audit" />;
      case 'hotel-inventory': return <Dashboard onNavigate={handleNavigate} userProfile={userProfile} initialTab="hotels" />;
      case 'destination-assets': return <Dashboard onNavigate={handleNavigate} userProfile={userProfile} initialTab="restaurants" />;
      case 'monitoring': return <AIMonitoring onNavigate={handleNavigate} />;
      case 'planner': return <AIPlanner onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'booking-management': return <BookingManagement onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'checkout': return <Checkout onNavigate={handleNavigate} userProfile={userProfile} bookingId={selectedBookingId} />;
      case 'review': return <Review onNavigate={handleNavigate} userProfile={userProfile} bookingId={selectedBookingId} />;
      default: return <LandingPage onNavigate={handleNavigate} user={user} userProfile={userProfile} onLogout={handleLogout} />;
    }
  };

  return (
    <LanguageProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
          {/* QuickNav removed for production */}
        </div>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
