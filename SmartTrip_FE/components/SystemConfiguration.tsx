import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Icons from '../icons';
import { SystemSettings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';

export function SystemConfiguration() {
  const [settings, setSettings] = useState<SystemSettings>({
    profitMarkup: 12.5,
    defaultCurrency: 'USD - United States Dollar',
    exchangeRates: [
      { id: '1', pair: 'USD/VND', rate: 25430.00, change: '-0.2% vs Market', isOverride: false },
      { id: '2', pair: 'EUR/USD', rate: 1.0824, change: 'Matched', isOverride: false },
      { id: '3', pair: 'GBP/USD', rate: 1.2650, change: '+1.5% Override', isOverride: true },
    ],
    stripeApiKey: '',
    stripeWebhookSecret: '',
    paypalClientId: '',
    paypalSecret: '',
    lastSecretRotation: new Date(Date.now() - 181 * 24 * 60 * 60 * 1000) // 181 days ago
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const [activeSubTab, setActiveSubTab] = useState('financial');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'system', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SystemSettings);
        }
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'system/settings');
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system', 'settings'), settings);
      setSaving(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'system/settings');
      setSaving(false);
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Icons.Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-8">
          <nav className="flex gap-8 text-sm font-bold border-b border-slate-100 w-full">
            <button 
              onClick={() => setActiveSubTab('financial')}
              className={`pb-4 border-b-2 transition-all ${activeSubTab === 'financial' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Financial Parameters
            </button>
            <button 
              onClick={() => setActiveSubTab('taxation')}
              className={`pb-4 border-b-2 transition-all ${activeSubTab === 'taxation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Taxation Rules
            </button>
          </nav>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-2">System Configuration</h2>
        <p className="text-slate-500">Manage your global financial parameters, profit margins, and payment gateway security from a centralized console.</p>
      </header>

      {activeSubTab === 'financial' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Optimization */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Icons.TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Revenue Optimization</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Profit Markup Percentage (%)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={settings.profitMarkup}
                        onChange={(e) => setSettings({ ...settings, profitMarkup: parseFloat(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Default markup applied to all base travel costs before AI adjustments.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Default Currency</label>
                    <div className="relative">
                      <select 
                        value={settings.defaultCurrency}
                        onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                      >
                        <option>USD - United States Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                        <option>VND - Vietnamese Dong</option>
                      </select>
                      <Icons.ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Adjustments */}
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-4">AI-Powered Adjustments</h4>
                  <p className="text-blue-100 mb-8 max-w-xs leading-relaxed">
                    Real-time market volatility is currently affecting 3 active routes.
                  </p>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all backdrop-blur-md">
                    REVIEW SUGGESTIONS
                  </button>
                </div>
                <Icons.Settings className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5" />
              </div>
            </div>

            {/* Exchange Rate Overrides */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Icons.RefreshCw className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Exchange Rate Overrides</h3>
                </div>
                <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Add Pair</button>
              </div>

              <div className="space-y-4">
                {settings.exchangeRates.map((rate) => (
                  <div 
                    key={rate.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      rate.isOverride ? 'bg-blue-50/50 border-blue-100 ring-1 ring-blue-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-100">{rate.pair}</span>
                        <span className="text-xl font-bold text-slate-900">{rate.rate.toLocaleString('en-US', { minimumFractionDigits: 4 })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          rate.change.includes('+') ? 'text-blue-600' : 
                          rate.change.includes('-') ? 'text-red-500' : 
                          'text-slate-400'
                        }`}>
                          {rate.change}
                        </span>
                        {rate.isOverride && <Icons.CheckCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 mt-10 italic leading-relaxed">
                Overrides take precedence over the global Voyager API feed and will remain active until manually cleared.
              </p>
            </div>
          </div>

          {/* Payment Gateway Credentials */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm mb-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                <Icons.Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Payment Gateway Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                    <label className="text-xs font-bold text-slate-600">Stripe Production API Key</label>
                  </div>
                  <div className="relative">
                    <input 
                      type={showSecrets.stripeKey ? 'text' : 'password'}
                      value={settings.stripeApiKey}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button 
                      onClick={() => toggleSecret('stripeKey')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      {showSecrets.stripeKey ? 'HIDE' : 'REVEAL'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-4 block">Stripe Webhook Secret</label>
                  <div className="relative">
                    <input 
                      type={showSecrets.stripeWebhook ? 'text' : 'password'}
                      value={settings.stripeWebhookSecret}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button 
                      onClick={() => toggleSecret('stripeWebhook')}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      {showSecrets.stripeWebhook ? 'HIDE' : 'REVEAL'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center text-white text-[10px] font-bold">P</div>
                    <label className="text-xs font-bold text-slate-600">PayPal Client ID</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      value={settings.paypalClientId}
                      readOnly
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">COPY</button>
                  </div>
                </div>

                <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex gap-6">
                  <Icons.ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-red-900 mb-2">Unsafe Credentials Found</h5>
                    <p className="text-sm text-red-600 leading-relaxed">
                      The PayPal Secret key has not been rotated in 180 days. We recommend a security audit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Icons.ShieldAlert className="w-10 h-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Taxation Rules Engine</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Global taxation compliance and VAT calculation rules are currently being updated for the next fiscal quarter.
            </p>
          </div>
          <button 
            onClick={() => setActiveSubTab('financial')}
            className="text-blue-600 font-bold hover:underline"
          >
            Return to Financial Parameters
          </button>
        </div>
      )}

      <div className="flex justify-end items-center gap-8">
        <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Reset to Default</button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          {saving && <Icons.Loader2 className="w-5 h-5 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
