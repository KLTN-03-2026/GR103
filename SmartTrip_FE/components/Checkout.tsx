import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import * as Icons from '../icons';
import { Page, UserProfile, CheckoutItem } from '../types';

interface CheckoutProps {
  onNavigate: (p: Page, id?: string) => void;
  userProfile: UserProfile | null;
  bookingId?: string;
}

export function Checkout({ onNavigate, userProfile, bookingId }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo'>('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const flight: CheckoutItem = {
    id: 'FL-101',
    name: 'Flight to Tokyo',
    type: 'flight',
    price: 2450.00,
    details: 'Business Class',
    date: 'Oct 24',
    duration: '11h 20m'
  };

  const hotel: CheckoutItem = {
    id: 'HT-202',
    name: 'Aman Tokyo',
    type: 'hotel',
    price: 3120.00,
    details: 'Deluxe Palace Garden View Room. Includes daily breakfast for two.',
    image: 'https://picsum.photos/seed/hotel-room/800/400',
    date: 'Oct 24 - Oct 31',
    duration: '7 Nights'
  };

  const addons: CheckoutItem[] = [
    {
      id: 'AD-301',
      name: 'Private Tsukiji Tour',
      type: 'addon',
      price: 280.00,
      details: 'Personal culinary guide',
      image: 'https://picsum.photos/seed/tsukiji/100/100'
    },
    {
      id: 'AD-302',
      name: 'Tea Ceremony Experience',
      type: 'addon',
      price: 200.00,
      details: 'Authentic Kyoto ritual',
      image: 'https://picsum.photos/seed/tea/100/100'
    }
  ];

  const subtotalAddons = addons.reduce((sum, item) => sum + item.price, 0);
  const taxes = 145.20;
  const total = flight.price + hotel.price + subtotalAddons + taxes;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (bookingId) {
        await updateDoc(doc(db, 'bookings', bookingId), {
          status: 'Confirmed'
        });
      }

      setIsProcessing(false);
      setShowSuccess(true);
      // After 3 seconds, navigate back to trips
      setTimeout(() => {
        onNavigate('booking-management');
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-10">
        <div className="flex items-center gap-12">
          <button onClick={() => onNavigate('landing')} className="text-xl font-bold text-blue-900 tracking-tight">
            Voyager AI
          </button>
          <nav className="flex items-center gap-8">
            <button onClick={() => onNavigate('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Explore</button>
            <button onClick={() => onNavigate('booking-management')} className="text-sm font-bold text-blue-600 relative">
              My Trips
              <div className="absolute -bottom-[29px] left-0 right-0 h-1 bg-blue-600 rounded-full" />
            </button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Support</button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
            <Icons.Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                {userProfile?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-12 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Confirm Your Journey</h1>
          <p className="text-slate-500 text-lg">Please review your itinerary details before proceeding to secure payment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Itinerary Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Flight Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Icons.Plane className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Flight to Tokyo</h3>
                </div>
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {flight.details}
                </span>
              </div>

              <div className="flex items-center justify-between relative">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">SFO</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">San Francisco</p>
                  <p className="text-sm font-bold text-slate-900 mt-2">08:45 AM</p>
                </div>

                <div className="flex-1 px-8 flex flex-col items-center">
                  <div className="w-full h-px bg-slate-100 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold mt-4">{flight.duration}</p>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">NRT</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Narita Intl</p>
                  <p className="text-sm font-bold text-slate-900 mt-2">01:05 PM <span className="text-blue-600">+1</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hotel Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-50">
                  <Icons.Bed className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">{hotel.name}</h3>
                </div>
                <div className="aspect-video overflow-hidden">
                  <img src={hotel.image} alt="Hotel" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{hotel.details}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-sm font-bold text-slate-900">{hotel.date}</p>
                    <p className="text-sm font-bold text-blue-600">{hotel.duration}</p>
                  </div>
                </div>
              </div>

              {/* Add-ons Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-50">
                  <Icons.Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Curated Add-ons</h3>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                        <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{addon.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">{addon.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 space-y-8">
              <h3 className="text-xl font-bold text-slate-900">Payment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Flights (2 Adults)</span>
                  <span className="text-slate-900">${flight.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Hotel & Resorts</span>
                  <span className="text-slate-900">${hotel.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Add-ons & Insurance</span>
                  <span className="text-slate-900">${subtotalAddons.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Taxes & Fees</span>
                  <span className="text-slate-900">${taxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">USD</span>
                </div>
                <p className="text-5xl font-bold text-blue-600 tracking-tight">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Payment Method</p>
                
                {/* VNPay */}
                <button 
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
                      <Icons.Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">VNPay</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bank Transfer & QR</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'vnpay' ? 'border-blue-600' : 'border-slate-200'
                  }`}>
                    {paymentMethod === 'vnpay' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                </button>

                {/* MoMo */}
                <button 
                  onClick={() => setPaymentMethod('momo')}
                  className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'momo' ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
                      <Icons.Wallet className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">MoMo</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">E-Wallet Payment</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'momo' ? 'border-blue-600' : 'border-slate-200'
                  }`}>
                    {paymentMethod === 'momo' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                </button>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing || showSuccess}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 ${
                  showSuccess ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isProcessing ? (
                  <Icons.Loader2 className="w-5 h-5 animate-spin" />
                ) : showSuccess ? (
                  <>
                    <Icons.ShieldCheck className="w-5 h-5" />
                    Payment Successful
                  </>
                ) : (
                  <>
                    Securely Pay ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <Icons.ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Icons.Lock className="w-3 h-3" />
                Encrypted 256-bit SSL Secure Payment
              </div>
            </div>

            <div className="flex justify-center gap-8">
              <Icons.ShieldCheck className="w-6 h-6 text-slate-300" />
              <Icons.Shield className="w-6 h-6 text-slate-300" />
              <Icons.ShieldAlert className="w-6 h-6 text-slate-300" />
            </div>
          </div>
        </div>
      </main>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mb-8"
            >
              <Icons.CheckCircle className="w-12 h-12" />
            </motion.div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Payment Confirmed!</h2>
            <p className="text-slate-500 text-lg max-w-md">Your luxury journey is now secured. Redirecting you to your itinerary and digital pass...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
