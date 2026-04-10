import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import * as Icons from '../../icons';
import { Page, UserProfile, Booking } from '../../types';

interface BookingManagementProps {
  onNavigate: (p: Page, id?: string) => void;
  userProfile: UserProfile | null;
}

export function BookingManagement({ onNavigate, userProfile }: BookingManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [dateFilter, setDateFilter] = useState<string>('All Dates');
  const [activeSidebarTab, setActiveSidebarTab] = useState('Bookings');
  const [realBookings, setRealBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      try {
        let q;
        if (userProfile.role === 'Customer') {
          q = query(
            collection(db, 'bookings'), 
            where('userId', '==', userProfile.uid),
            orderBy('date', 'desc')
          );
        } else {
          q = query(
            collection(db, 'bookings'),
            orderBy('date', 'desc')
          );
        }

        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        })) as Booking[];
        
        setRealBookings(list);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userProfile]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userProfile) return;
      
      setReviewsLoading(true);
      try {
        let q;
        if (userProfile.role === 'Admin' || userProfile.role === 'Staff') {
          q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        } else {
          q = query(
            collection(db, 'reviews'), 
            where('userId', '==', userProfile.uid),
            orderBy('createdAt', 'desc')
          );
        }

        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        }));
        
        setReviews(list);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeSidebarTab === 'Reviews') {
      fetchReviews();
    }
  }, [userProfile, activeSidebarTab]);

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    setIsUpdating(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      
      // Update local state
      setRealBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      setOpenMenuId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bookings');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = realBookings.filter(booking => {
    const matchesSearch = 
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Statuses' || booking.status === statusFilter;
    
    // Simple date filtering for demo (could be more complex)
    const matchesDate = dateFilter === 'All Dates' || booking.date.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const completedBookings = realBookings.filter(b => b.status === 'Completed');

  const totalRevenue = realBookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const activeRequests = realBookings.filter(b => b.status === 'Pending').length;
  const completionRate = realBookings.length > 0 
    ? Math.round((realBookings.filter(b => b.status === 'Completed').length / realBookings.length) * 100)
    : 0;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: Icons.TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Requests', value: activeRequests.toString(), icon: Icons.Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Icons.CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const openTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Icons.Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Concierge</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Suggestions</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'Bookings', icon: Icons.BookOpen, label: 'My Bookings' },
            { id: 'Reviews', icon: Icons.Star, label: 'My Reviews' },
            { id: 'AI Insights', icon: Icons.Zap, label: 'AI Insights' },
            { id: 'Saved Stays', icon: Icons.Bookmark, label: 'Saved Stays' },
            { id: 'Flight Track', icon: Icons.Plane, label: 'Flight Track' },
            { id: 'Trip Budget', icon: Icons.Wallet, label: 'Trip Budget' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebarTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeSidebarTab === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Icons.User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{userProfile?.fullName || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{userProfile?.travelTier || 'Explorer'}</p>
            </div>
            <button onClick={() => onNavigate('landing')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <Icons.LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-10">
          <div className="flex items-center gap-12">
            <button onClick={() => onNavigate('landing')} className="text-xl font-bold text-blue-900 tracking-tight">
              The Voyager
            </button>
            <nav className="flex items-center gap-8">
              <button onClick={() => onNavigate('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Discover</button>
              <button className="text-sm font-bold text-blue-600 relative">
                My Trips
                <div className="absolute -bottom-[29px] left-0 right-0 h-1 bg-blue-600 rounded-full" />
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Icons.Bell className="w-5 h-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button onClick={() => onNavigate('profile')} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Icons.Settings className="w-5 h-5" />
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

        <div className="p-12 space-y-12">
          {activeSidebarTab === 'Bookings' ? (
            <>
              {/* Page Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                    {userProfile?.role === 'Customer' ? 'My Trips' : 'Booking Management'}
                  </h1>
                  <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                    {userProfile?.role === 'Customer' 
                      ? 'View and manage your upcoming luxury itineraries and past adventures.'
                      : 'Oversee and manage luxury itineraries with the precision of a digital concierge. Filter by status or timeline.'}
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('planner')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <Icons.Plus className="w-5 h-5" />
                  New Booking
                </button>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="flex-1 relative">
                  <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by customer name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => setDateFilter(dateFilter === 'All Dates' ? '2024' : 'All Dates')}
                      className="bg-slate-50 border-none px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 flex items-center gap-3 hover:bg-slate-100 transition-all"
                    >
                      <Icons.Calendar className="w-4 h-4" />
                      {dateFilter}
                      <Icons.ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-50 border-none px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 flex items-center gap-3 hover:bg-slate-100 transition-all outline-none appearance-none cursor-pointer pr-12"
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-10 py-8">Booking ID</th>
                        {userProfile?.role !== 'Customer' && <th className="px-10 py-8">Customer</th>}
                        <th className="px-10 py-8">Trip Date</th>
                        <th className="px-10 py-8">Total Price</th>
                        <th className="px-10 py-8">Status</th>
                        <th className="px-10 py-8 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr>
                          <td colSpan={userProfile?.role === 'Customer' ? 5 : 6} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Icons.Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading luxury bookings...</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={userProfile?.role === 'Customer' ? 5 : 6} className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Icons.Inbox className="w-8 h-8 text-slate-200" />
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No bookings found</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredBookings.map((booking) => (
                        <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-10 py-8">
                            {booking.status === 'Confirmed' || booking.status === 'Completed' ? (
                              <button 
                                onClick={() => openTicket(booking)}
                                className="text-sm font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-2"
                              >
                                <Icons.Ticket className="w-4 h-4" />
                                #{booking.id.slice(-6).toUpperCase()}
                              </button>
                            ) : (
                              <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <Icons.Lock className="w-3 h-3" />
                                #{booking.id.slice(-6).toUpperCase()}
                              </span>
                            )}
                          </td>
                          {userProfile?.role !== 'Customer' && (
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                                  {booking.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-bold text-slate-900">{booking.userName}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-10 py-8">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{booking.date}</p>
                              <p className="text-xs text-slate-400 font-medium">{booking.assetName} • {booking.assetType}</p>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-sm font-bold text-slate-900">${booking.amount?.toLocaleString()}</span>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold ${
                              booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                              booking.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                              booking.status === 'Completed' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                booking.status === 'Confirmed' ? 'bg-blue-600' :
                                booking.status === 'Pending' ? 'bg-orange-600' :
                                booking.status === 'Completed' ? 'bg-green-600' :
                                'bg-red-600'
                              }`} />
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right relative">
                            {booking.status === 'Pending' && userProfile?.role === 'Customer' ? (
                              <button 
                                onClick={() => onNavigate('checkout', booking.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <div className="relative">
                                <button 
                                  onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                                  className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                  <Icons.MoreVertical className="w-5 h-5" />
                                </button>
                                
                                <AnimatePresence>
                                  {openMenuId === booking.id && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-20" 
                                        onClick={() => setOpenMenuId(null)} 
                                      />
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-30 overflow-hidden"
                                      >
                                        <div className="p-2 space-y-1">
                                          {userProfile?.role !== 'Customer' && (
                                            <>
                                              <button 
                                                onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-3"
                                              >
                                                <Icons.ShieldCheck className="w-4 h-4" />
                                                Confirm Booking
                                              </button>
                                              <button 
                                                onClick={() => handleStatusUpdate(booking.id, 'Completed')}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all flex items-center gap-3"
                                              >
                                                <Icons.CheckCircle className="w-4 h-4" />
                                                Mark Completed
                                              </button>
                                              <button 
                                                onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center gap-3"
                                              >
                                                <Icons.Ban className="w-4 h-4" />
                                                Cancel Booking
                                              </button>
                                            </>
                                          )}
                                          <button 
                                            onClick={() => openTicket(booking)}
                                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3"
                                          >
                                            <Icons.Ticket className="w-4 h-4" />
                                            View Digital Pass
                                          </button>
                                        </div>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">
                    Showing {filteredBookings.length} bookings
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <Icons.ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((page) => (
                        <button 
                          key={page}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            page === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <Icons.ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Completed Tour Highlight (PB17) */}
              {completedBookings.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent History</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedBookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden">
                            <img 
                              src={`https://picsum.photos/seed/${booking.assetId}/200/200`} 
                              alt="Tour" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Icons.CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed {booking.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{booking.assetName}</h3>
                            <p className="text-sm text-slate-400 font-medium">{booking.assetType}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-2xl font-bold text-slate-900">${booking.amount?.toLocaleString()}</p>
                          <div className="flex flex-col items-end gap-1">
                            {!booking.hasReview ? (
                              <button 
                                onClick={() => onNavigate('review', booking.id)}
                                className="text-sm font-bold text-blue-600 hover:underline"
                              >
                                Review Now
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Reviewed</span>
                            )}
                            <button 
                              onClick={() => onNavigate('planner')}
                              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              Rebook with AI
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              {userProfile?.role !== 'Customer' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-blue-100 transition-all">
                      <div className={`w-16 h-16 ${stat.bg} rounded-3xl flex items-center justify-center ${stat.color} transition-all group-hover:scale-110`}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeSidebarTab === 'Reviews' ? (
            <div className="space-y-12">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Experience Reviews</h1>
                <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                  {userProfile?.role === 'Admin' 
                    ? 'Monitor and manage reviews from the Voyager community.' 
                    : 'Reflect on your past journeys and see how your feedback shapes future adventures.'}
                </p>
              </div>

              {reviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Icons.Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Icons.Star className="w-10 h-10 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">No reviews yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      Complete a trip to share your experience with the community.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveSidebarTab('Bookings')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    View my bookings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 group hover:border-blue-100 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                            {review.rating}<Icons.Star className="w-4 h-4 fill-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Booking #{review.bookingId.slice(-6).toUpperCase()}</h3>
                            <p className="text-xs text-slate-400 font-medium">
                              {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <Icons.Quote className="w-8 h-8 text-slate-100 group-hover:text-blue-100 transition-colors" />
                      </div>
                      
                      <p className="text-slate-600 leading-relaxed italic">
                        "{review.comment || 'No comment provided.'}"
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {review.highlights?.map((h: string, i: number) => (
                          <span key={i} className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeSidebarTab === 'AI Insights' ? (
            <div className="space-y-12">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">AI Insights</h1>
                <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                  Personalized travel intelligence powered by Voyager AI.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Travel Trend', content: 'Luxury eco-tourism is up 40% in your favorite regions.', icon: Icons.TrendingUp, color: 'text-blue-600' },
                  { title: 'Smart Saving', content: 'Booking Positano 3 weeks earlier could save you $1,200.', icon: Icons.Zap, color: 'text-orange-600' },
                  { title: 'Weather Alert', content: 'Expect perfect sunny weather for your upcoming Amalfi trip.', icon: Icons.Sun, color: 'text-yellow-600' },
                  { title: 'Tier Progress', content: 'You are only 2,500 miles away from Platinum status.', icon: Icons.Award, color: 'text-purple-600' },
                ].map((insight, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${insight.color}`}>
                      <insight.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{insight.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{insight.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSidebarTab === 'Saved Stays' ? (
            <div className="space-y-12">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Saved Stays</h1>
                <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                  Your curated collection of luxury properties and hidden gems.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Hotel Splendido', loc: 'Portofino, Italy', price: '$1,850', img: 'https://picsum.photos/seed/splendido/400/300' },
                  { name: 'Aman Tokyo', loc: 'Tokyo, Japan', price: '$2,100', img: 'https://picsum.photos/seed/aman/400/300' },
                  { name: 'Belmond Hotel Caruso', loc: 'Ravello, Italy', price: '$1,600', img: 'https://picsum.photos/seed/caruso/400/300' },
                ].map((stay, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all">
                    <div className="h-48 overflow-hidden">
                      <img src={stay.img} alt={stay.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-8 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{stay.name}</h3>
                        <p className="text-sm text-slate-400 font-medium">{stay.loc}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900">{stay.price}<span className="text-xs text-slate-400 font-medium">/night</span></span>
                        <button className="text-blue-600 font-bold text-sm hover:underline">Book Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSidebarTab === 'Flight Track' ? (
            <div className="space-y-12">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Flight Track</h1>
                <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                  Real-time monitoring of your luxury air travel.
                </p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                      <Icons.Plane className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Emirates EK 205</h3>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Milan (MXP) → New York (JFK)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-50 text-green-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">On Time</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex-1 text-center space-y-2">
                    <p className="text-4xl font-bold text-slate-900">16:10</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Departure</p>
                  </div>
                  <div className="flex-[2] relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-px bg-slate-100 border-t border-dashed border-slate-300" />
                    </div>
                    <div className="relative bg-white px-4">
                      <Icons.Plane className="w-6 h-6 text-blue-600 rotate-90" />
                    </div>
                  </div>
                  <div className="flex-1 text-center space-y-2">
                    <p className="text-4xl font-bold text-slate-900">19:00</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Arrival</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeSidebarTab === 'Trip Budget' ? (
            <div className="space-y-12">
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Trip Budget</h1>
                <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                  Financial overview of your upcoming adventures.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-2xl font-bold text-slate-900">Expense Breakdown</h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Accommodation', amount: 4500, color: 'bg-blue-500', percent: 60 },
                      { label: 'Flights', amount: 2200, color: 'bg-indigo-500', percent: 30 },
                      { label: 'Dining', amount: 800, color: 'bg-orange-500', percent: 10 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="text-slate-900">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-600 p-10 rounded-[3rem] shadow-xl shadow-blue-600/20 text-white space-y-8">
                  <h3 className="text-2xl font-bold">Total Estimated</h3>
                  <div className="space-y-2">
                    <p className="text-6xl font-bold tracking-tight">$7,500</p>
                    <p className="text-blue-100 font-medium">For Amalfi Coast Trip • 7 Days</p>
                  </div>
                  <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all">
                    Generate Detailed Report
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* E-Ticket Modal (Voyager Digital Pass) */}
        <AnimatePresence>
          {isTicketModalOpen && selectedBooking && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTicketModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setIsTicketModalOpen(false)}
                  className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10"
                >
                  <Icons.X className="w-6 h-6" />
                </button>

                <div className="p-10 space-y-10">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Voyager Digital Pass</p>
                    <h2 className="text-3xl font-bold text-slate-900">{selectedBooking.assetName}</h2>
                  </div>

                  {/* QR / Grid Pattern Area */}
                  <div className="bg-slate-50 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 border border-slate-100">
                    <div className="w-40 h-40 bg-white rounded-3xl p-4 shadow-sm grid grid-cols-4 gap-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-md ${
                            [0, 2, 5, 7, 10, 13, 15].includes(i) ? 'bg-slate-800' : 'bg-slate-100'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                      <p className="text-xl font-bold text-slate-900 tracking-tight">VY-{selectedBooking.id.slice(-4).toUpperCase()}-{selectedBooking.assetType.slice(0, 3).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.date}, 09:30 AM</p>
                      <p className="text-[10px] text-slate-400 font-medium">Positano Pier 4</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guests</p>
                      <p className="text-sm font-bold text-slate-900">2 Adults</p>
                      <p className="text-[10px] text-slate-400 font-medium">VIP Cabin</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guide</p>
                      <p className="text-sm font-bold text-slate-900">Marco Russo</p>
                      <p className="text-[10px] text-slate-400 font-medium">Speaks IT, EN</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-sm font-bold text-slate-900">+39 081 223 44</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <button className="flex-1 bg-blue-50 text-blue-600 px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-all">
                        <Icons.Download className="w-4 h-4" />
                        Download PDF
                      </button>
                      <button className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <Icons.Wallet className="w-4 h-4" />
                        Add to Wallet
                      </button>
                    </div>
                    <button className="w-full bg-slate-50 text-slate-600 px-6 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                      <Icons.Share2 className="w-4 h-4" />
                      Share Digital Pass
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto p-12 border-t border-slate-100 bg-white flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h4 className="font-bold text-slate-900 text-lg">The Intelligent Voyager</h4>
            <p className="text-sm text-slate-400 mt-1">© 2024 The Intelligent Voyager. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-10 text-sm font-bold text-slate-400">
            <button className="hover:text-slate-900 transition-colors">Terms</button>
            <button className="hover:text-slate-900 transition-colors">Privacy</button>
            <button className="hover:text-slate-900 transition-colors">Support</button>
            <button className="hover:text-slate-900 transition-colors">Partners</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
