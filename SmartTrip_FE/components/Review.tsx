import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import * as Icons from '../icons';
import { Page, UserProfile, Booking } from '../types';

interface ReviewProps {
  onNavigate: (p: Page, id?: string) => void;
  userProfile: UserProfile | null;
  bookingId?: string;
}

const HIGHLIGHT_OPTIONS = [
  'Expert Guide',
  'Stunning Views',
  'Value for Money',
  'Comfort',
  'Food & Drink'
];

export function Review({ onNavigate, userProfile, bookingId }: ReviewProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const toggleHighlight = (option: string) => {
    setSelectedHighlights(prev => 
      prev.includes(option) 
        ? prev.filter(h => h !== option) 
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (!userProfile || !bookingId || rating === 0) return;

    setIsSubmitting(true);
    try {
      // Add review
      await addDoc(collection(db, 'reviews'), {
        bookingId,
        userId: userProfile.uid,
        rating,
        highlights: selectedHighlights,
        comment,
        createdAt: serverTimestamp()
      });

      // Update booking to mark as reviewed
      await updateDoc(doc(db, 'bookings', bookingId), {
        hasReview: true
      });

      onNavigate('booking-management');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Icons.Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Icons.ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find the booking you're looking for.</p>
        <button 
          onClick={() => onNavigate('booking-management')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Back to My Trips
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Icons.Bell className="w-5 h-5" />
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

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Visuals */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Tour Completed
              </span>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                How was your <span className="text-blue-600">{booking.assetName}</span> escape?
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                Your feedback helps our AI concierge curate even better journeys for you and the Voyager community.
              </p>
            </div>

            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] group">
              <img 
                src={`https://picsum.photos/seed/${booking.assetId}/800/1000`} 
                alt={booking.assetName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Icons.MapPin className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-xl">{booking.assetName}, Italy</span>
                </div>
                <p className="text-white/70 font-medium">Guided Sunset Boat Tour • {booking.date}</p>
              </div>
            </div>
          </div>

          {/* Right Side: Review Form */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 md:p-12 space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Rate your experience</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Icons.Star 
                      className={`w-10 h-10 ${
                        star <= rating ? 'fill-slate-900 text-slate-900' : 'text-slate-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs italic text-slate-400 font-medium tracking-wide">Select a star to rate</p>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">What stood out?</p>
              <div className="flex flex-wrap gap-3">
                {HIGHLIGHT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleHighlight(option)}
                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                      selectedHighlights.includes(option)
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Share more details</p>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What made this trip special? Any tips for other voyagers?"
                  className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 text-sm focus:ring-2 focus:ring-blue-600/20 resize-none transition-all"
                />
                <Icons.Edit2 className="absolute top-6 right-6 w-4 h-4 text-slate-300" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button 
                onClick={() => onNavigate('booking-management')}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Skip for now
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className={`px-10 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2 ${
                  rating > 0 
                    ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting && <Icons.Loader2 className="w-4 h-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
