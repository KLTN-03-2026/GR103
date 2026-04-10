import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import * as Icons from '../icons';
import { UserProfile, Page } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface ProfilePageProps {
  onNavigate: (p: Page) => void;
  userProfile: UserProfile | null;
}

export function ProfilePage({ onNavigate, userProfile }: ProfilePageProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '+1 (555) 000-1234',
        location: userProfile.location || 'San Francisco, CA',
        cabinPreference: userProfile.cabinPreference || 'Business Class',
        dietary: userProfile.dietary || 'Vegetarian, No Peanuts',
        bedType: userProfile.bedType || 'King Size / High Floor',
        aiConciergeMode: userProfile.aiConciergeMode ?? true,
        travelTier: userProfile.travelTier || 'Global Explorer',
        voyagerMiles: userProfile.voyagerMiles || 45200,
        avatarUrl: userProfile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile?.uid) return;
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), formData);
      setMessage({ text: 'Profile settings saved successfully!', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
      setMessage({ text: 'Failed to save profile settings.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <button onClick={() => onNavigate('landing')} className="text-2xl font-bold text-blue-900 tracking-tight">
            Voyager AI
          </button>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
            <button onClick={() => onNavigate('landing')} className="hover:text-slate-900 transition-colors">Explore</button>
            <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-900 transition-colors">My Trips</button>
            <button className="hover:text-slate-900 transition-colors">Support</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-slate-600 relative">
            <Icons.Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border-2 border-blue-100"
          >
            <Icons.User className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-center relative">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                  <img 
                    src={formData.avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute -right-2 -bottom-2 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  <Icons.Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-1">{formData.fullName}</h2>
              <p className="text-sm text-slate-400 font-medium mb-8">Premier Member • Since 2022</p>

              <div className="bg-blue-50/50 rounded-3xl p-6 text-left border border-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <Icons.Bookmark className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Travel Tier</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{formData.travelTier}</h3>
                <p className="text-xs text-slate-500 font-medium">{formData.voyagerMiles?.toLocaleString()} Voyager Miles</p>
              </div>

              <div className="mt-10 space-y-2 text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Quick Links</p>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icons.CreditCard className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">Billing</span>
                  </div>
                  <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Icons.Shield className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-bold text-slate-700">Privacy</span>
                  </div>
                  <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Form */}
          <div className="lg:col-span-8 space-y-10">
            {/* Personal Information */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h3>
              <p className="text-sm text-slate-400 mb-8">Update your details for personalized travel recommendations.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-3">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-3">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-3">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-3">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Travel Preferences */}
            <section>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Travel Preferences</h3>
              <p className="text-sm text-slate-400 mb-8">Help our AI curate your next escape.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 bg-blue-50/30 rounded-3xl p-8 border border-blue-50">
                  <div className="flex items-center gap-3 mb-6">
                    <Icons.Plane className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Cabin Preference</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Business Class', 'First Class', 'Premium Economy'].map((tier) => (
                      <button 
                        key={tier}
                        onClick={() => setFormData({...formData, cabinPreference: tier as any})}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          formData.cabinPreference === tier 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Icons.Utensils className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Dietary</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{formData.dietary}</p>
                </div>

                <div className="md:col-span-5 bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Icons.Bed className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Bed Type</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{formData.bedType}</p>
                </div>

                <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Icons.Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">AI Concierge Mode</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Allow AI to auto-confirm bookings</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, aiConciergeMode: !formData.aiConciergeMode})}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${formData.aiConciergeMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.aiConciergeMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Security & Password */}
            <section className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Security & Password</h3>
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-900 mb-3">Current Password</label>
                  <input 
                    type="password" 
                    value="••••••••"
                    disabled
                    className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-slate-700 shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => setMessage({ text: 'Password reset link sent to your email!', type: 'success' })}
                  className="w-full md:w-auto bg-blue-400 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-400/20"
                >
                  Change Password
                </button>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-10">
              {message.text && (
                <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile Settings'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
