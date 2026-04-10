import React from 'react';
import { motion } from 'motion/react';
import * as Icons from '../../icons';
import { Page, UserProfile } from '../../types';
import { FEATURED_TRIPS } from '../../constants';
import { Navbar } from './Navbar';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (p: Page) => void;
  user: any;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export function LandingPage({ onNavigate, user, userProfile, onLogout }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <>
      <Navbar onNavigate={onNavigate} user={user} userProfile={userProfile} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6"
          >
            {t('hero.title')} <br />
            <span className="text-blue-600 italic">{t('hero.ai')}</span>
          </motion.h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            {t('hero.subtitle')}
          </p>

          <div className="max-w-3xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center border border-slate-100">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Icons.Sparkles className="w-5 h-5 text-blue-500" />
                <input 
                  type="text" 
                  placeholder={t('hero.placeholder')}
                  className="w-full py-3 outline-none text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <button 
                onClick={() => onNavigate('planner')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                {t('hero.cta')}
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <span className="text-slate-400 py-2">{t('hero.suggestions')}</span>
              {['Đi biển mùa hè', 'Tour ẩm thực Huế', 'Nghỉ dưỡng 5 sao'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('featured.title')}</h2>
              <p className="text-slate-500">{t('featured.subtitle')}</p>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              {t('featured.viewAll')} <Icons.ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Featured Card */}
            <div className="md:col-span-6 group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg">
              <img 
                src={FEATURED_TRIPS[0].image} 
                alt={FEATURED_TRIPS[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="inline-block bg-blue-500/80 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full mb-4">
                  {t('featured.popular')}
                </span>
                <h3 className="text-4xl font-bold mb-3">{FEATURED_TRIPS[0].title}</h3>
                <p className="text-slate-200 text-sm max-w-md mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {FEATURED_TRIPS[0].description}
                </p>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-white text-slate-900 px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                >
                  {t('featured.explore')}
                </button>
              </div>
            </div>

            {/* Grid of smaller cards */}
            <div className="md:col-span-6 grid grid-cols-2 gap-6">
              <div className="col-span-2 relative rounded-3xl overflow-hidden aspect-[16/9] shadow-md group">
                <img 
                  src={FEATURED_TRIPS[1].image} 
                  alt={FEATURED_TRIPS[1].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{FEATURED_TRIPS[1].title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <Icons.MapPin className="w-3 h-3" /> {FEATURED_TRIPS[1].location}
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden aspect-square shadow-md group">
                <img 
                  src={FEATURED_TRIPS[2].image} 
                  alt={FEATURED_TRIPS[2].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-lg font-bold">{FEATURED_TRIPS[2].title}</h3>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden aspect-square shadow-md group">
                <img 
                  src={FEATURED_TRIPS[3].image} 
                  alt={FEATURED_TRIPS[3].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-lg font-bold">{FEATURED_TRIPS[3].title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Concierge & Features Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('concierge.title')}</h3>
                <p className="text-xs text-slate-400">{t('concierge.subtitle')}</p>
              </div>
            </div>

            <nav className="space-y-2 mb-10">
              {[
                { icon: Icons.Sparkles, label: t('concierge.insights'), active: true },
                { icon: Icons.Bookmark, label: t('concierge.saved') },
                { icon: Icons.Plane, label: t('concierge.flights') },
                { icon: Icons.Wallet, label: t('concierge.budget') },
              ].map((item, i) => (
                <button 
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-sm font-medium italic mb-6 leading-relaxed">
                  {t('concierge.quote')}
                </p>
                <button 
                  onClick={() => onNavigate('planner')}
                  className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors"
                >
                  {t('concierge.cta')}
                </button>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { 
                icon: Icons.Search, 
                title: t('features.search.title'), 
                desc: t('features.search.desc') 
              },
              { 
                icon: Icons.ShieldCheck, 
                title: t('features.partners.title'), 
                desc: t('features.partners.desc') 
              },
              { 
                icon: Icons.Clock, 
                title: t('features.flexibility.title'), 
                desc: t('features.flexibility.desc') 
              },
              { 
                icon: Icons.Headphones, 
                title: t('features.support.title'), 
                desc: t('features.support.desc') 
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 mt-24 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">The Intelligent Voyager</h2>
            <p className="text-xs text-slate-400">© 2024 The Intelligent Voyager. {t('footer.rights')}</p>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <button className="hover:text-blue-600">{t('footer.terms')}</button>
            <button className="hover:text-blue-600">{t('footer.privacy')}</button>
            <button className="hover:text-blue-600">{t('footer.support')}</button>
            <button className="hover:text-blue-600">{t('footer.partners')}</button>
          </div>
          <div className="flex gap-4">
            <button className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
              <Icons.Globe className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
              <Icons.Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
