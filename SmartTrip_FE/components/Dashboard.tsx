import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import * as Icons from '../icons';
import { Hotel, Restaurant, Attraction, DashboardTab, Page, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { mockApi } from '../services/apiService';

interface DashboardProps {
  onNavigate: (p: Page, id?: string) => void;
  userProfile: UserProfile | null;
  initialTab?: DashboardTab;
}

export function Dashboard({ onNavigate, userProfile, initialTab = 'hotels' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState('Đang phân tích dữ liệu...');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // Form state
  const [hotelForm, setHotelForm] = useState({
    name: '',
    description: '',
    location: '',
    rating: 5,
    pricePerNight: 0,
    status: 'OPERATIONAL' as Hotel['status'],
    image: ''
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    cuisine: '',
    location: '',
    rating: 5,
    status: 'Active' as Restaurant['status'],
    image: '',
    description: ''
  });

  const [attractionForm, setAttractionForm] = useState({
    name: '',
    type: '',
    location: '',
    rating: 5,
    status: 'Active' as Attraction['status'],
    image: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Wait for userProfile if we are on bookings tab
      if (activeTab === 'bookings' && !userProfile) return;

      setLoading(true);
      const collectionName = activeTab === 'hotels' ? 'hotels' : 
                            activeTab === 'restaurants' ? 'restaurants' : 
                            activeTab === 'attractions' ? 'attractions' : 'bookings';
      
      try {
        let q;
        if (activeTab === 'bookings' && userProfile?.role === 'Customer') {
          q = query(collection(db, collectionName), where('userId', '==', userProfile.uid));
        } else {
          q = query(collection(db, collectionName));
        }

        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        }));
        
        if (activeTab === 'hotels') setHotels(list as Hotel[]);
        else if (activeTab === 'restaurants') setRestaurants(list as Restaurant[]);
        else if (activeTab === 'attractions') setAttractions(list as Attraction[]);
        else if (activeTab === 'bookings') setBookings(list);
        
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    };

    const fetchInsight = async () => {
      setIsInsightLoading(true);
      const insight = await mockApi.getAIInsights(activeTab);
      setAiInsight(insight);
      setIsInsightLoading(false);
    };

    fetchData();
    fetchInsight();
  }, [activeTab]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      if (activeTab === 'hotels') {
        setHotelForm({
          name: item.name,
          description: item.description,
          location: item.location,
          rating: item.rating,
          pricePerNight: item.pricePerNight,
          status: item.status,
          image: item.image
        });
      } else if (activeTab === 'restaurants') {
        setRestaurantForm({
          name: item.name,
          cuisine: item.cuisine,
          location: item.location,
          rating: item.rating,
          status: item.status,
          image: item.image,
          description: item.description
        });
      } else if (activeTab === 'attractions') {
        setAttractionForm({
          name: item.name,
          type: item.type,
          location: item.location,
          rating: item.rating,
          status: item.status,
          image: item.image,
          description: item.description
        });
      }
    } else {
      setEditingItem(null);
      const seed = Math.random();
      if (activeTab === 'hotels') {
        setHotelForm({
          name: '',
          description: '',
          location: '',
          rating: 5,
          pricePerNight: 0,
          status: 'OPERATIONAL',
          image: `https://picsum.photos/seed/${seed}/400/300`
        });
      } else if (activeTab === 'restaurants') {
        setRestaurantForm({
          name: '',
          cuisine: '',
          location: '',
          rating: 5,
          status: 'Active',
          image: `https://picsum.photos/seed/${seed}/400/300`,
          description: ''
        });
      } else if (activeTab === 'attractions') {
        setAttractionForm({
          name: '',
          type: '',
          location: '',
          rating: 5,
          status: 'Active',
          image: `https://picsum.photos/seed/${seed}/400/300`,
          description: ''
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionName = activeTab === 'hotels' ? 'hotels' : activeTab === 'restaurants' ? 'restaurants' : 'attractions';
    const data = activeTab === 'hotels' ? hotelForm : activeTab === 'restaurants' ? restaurantForm : attractionForm;
    
    try {
      if (editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), data);
      } else {
        await addDoc(collection(db, collectionName), data);
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, collectionName);
    }
  };

  const handleDelete = async (id: string) => {
    const collectionName = activeTab === 'hotels' ? 'hotels' : activeTab === 'restaurants' ? 'restaurants' : 'attractions';
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
      }
    }
  };

  const getFilteredData = () => {
    let list = [];
    if (activeTab === 'hotels') list = hotels;
    else if (activeTab === 'restaurants') list = restaurants;
    else if (activeTab === 'attractions') list = attractions;
    else if (activeTab === 'bookings') list = bookings;

    let filtered = list.filter((item: any) => {
      const searchStr = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(searchStr) || 
                       item.assetName?.toLowerCase().includes(searchStr) ||
                       item.userName?.toLowerCase().includes(searchStr);
      const locationMatch = item.location?.toLowerCase().includes(searchStr);
      
      return nameMatch || locationMatch;
    });

    if (filterStatus !== 'All') {
      filtered = filtered.filter((item: any) => item.status === filterStatus);
    }

    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const headers = activeTab === 'hotels' 
      ? ['Name', 'Location', 'Rating', 'Price', 'Status']
      : activeTab === 'bookings'
      ? ['User', 'Asset', 'Type', 'Date', 'Status', 'Amount']
      : ['Name', 'Type/Cuisine', 'Location', 'Status'];

    const rows = filteredData.map((item: any) => {
      if (activeTab === 'hotels') return [item.name, item.location, item.rating, item.pricePerNight, item.status];
      if (activeTab === 'bookings') return [item.userName, item.assetName, item.assetType, item.date, item.status, item.amount];
      return [item.name, activeTab === 'restaurants' ? item.cuisine : item.type, item.location, item.status];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAIInsight = () => {
    if (activeTab === 'hotels') {
      const avgPrice = hotels.reduce((acc, curr) => acc + curr.pricePerNight, 0) / (hotels.length || 1);
      return `Your average hotel price is $${avgPrice.toFixed(2)}. Consider dynamic pricing for the upcoming peak season to maximize revenue.`;
    }
    if (activeTab === 'restaurants') {
      const topCuisine = restaurants.reduce((acc: any, curr) => {
        acc[curr.cuisine] = (acc[curr.cuisine] || 0) + 1;
        return acc;
      }, {});
      const mostCommon = Object.keys(topCuisine).sort((a, b) => topCuisine[b] - topCuisine[a])[0];
      return `Your ${mostCommon || 'French'} Fusion listings are seeing 42% higher engagement this quarter. Consider adding more high-end bistro options in the Loire Valley region.`;
    }
    if (activeTab === 'attractions') {
      return `Local landmarks are trending. We recommend highlighting "Skip the line" features for your top-rated attractions to increase booking conversion.`;
    }
    return `Booking trends show a 15% increase in last-minute reservations. Ensure your inventory status is updated in real-time to avoid overbooking.`;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <button onClick={() => onNavigate('landing')} className="text-xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
            The Voyager
          </button>
        </div>

        <div className="px-4 mb-8">
          <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Icons.Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Concierge</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Suggestions</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'hotels', icon: Icons.Bookmark, label: 'Hotels' },
            { id: 'restaurants', icon: Icons.Utensils, label: 'Restaurants' },
            { id: 'attractions', icon: Icons.Ticket, label: 'Attractions' },
            { id: 'bookings', icon: Icons.BookOpen, label: 'Bookings' },
            { id: 'planner', icon: Icons.Bot, label: 'AI Planner' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'planner') {
                  onNavigate('planner');
                } else if (item.id === 'bookings') {
                  onNavigate('booking-management');
                } else {
                  setActiveTab(item.id as DashboardTab);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          {userProfile?.role === 'Admin' && (
            <>
              <button
                onClick={() => onNavigate('admin')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Icons.Shield className="w-4 h-4" />
                Admin Console
              </button>
              <button
                onClick={() => onNavigate('monitoring')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Icons.Activity className="w-4 h-4" />
                AI Monitoring
              </button>
            </>
          )}
        </nav>

        <div className="p-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {activeTab === 'hotels' ? 'Hotel Inventory' : activeTab === 'bookings' ? 'Booking Management' : 'Destination Assets'}
            </h1>
            <p className="text-slate-500 max-w-lg">
              {activeTab === 'hotels' 
                ? 'Manage your global hospitality portfolio with precision and atmospheric clarity.'
                : activeTab === 'bookings'
                ? 'Monitor and manage all reservations across your destination portfolio.'
                : 'Manage your curated list of culinary experiences and local attractions for the upcoming season.'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-100 pl-12 pr-6 py-3 rounded-xl font-bold transition-all shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`bg-white border border-slate-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm hover:bg-slate-50 ${filterStatus !== 'All' ? 'text-blue-600 border-blue-100 bg-blue-50/30' : 'text-slate-600'}`}
              >
                <Icons.SlidersHorizontal className="w-4 h-4" /> Filter
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                  >
                    {['All', 'Active', 'OPERATIONAL', 'MAINTENANCE', 'CLOSED', 'Confirmed', 'Pending', 'Cancelled'].filter(s => {
                      if (activeTab === 'hotels') return ['All', 'OPERATIONAL', 'MAINTENANCE', 'CLOSED'].includes(s);
                      if (activeTab === 'bookings') return ['All', 'Confirmed', 'Pending', 'Cancelled'].includes(s);
                      return ['All', 'Active', 'Pending Audit', 'Maintenance'].includes(s);
                    }).map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filterStatus === status ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={exportToCSV}
              className="bg-white border border-slate-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm hover:bg-slate-50 text-slate-600"
            >
              <Icons.Download className="w-4 h-4" /> Export
            </button>
            {activeTab !== 'bookings' && (
              <button 
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <Icons.Plus className="w-5 h-5" /> New Entry
              </button>
            )}
          </div>
        </header>

        {activeTab !== 'hotels' && activeTab !== 'bookings' && (
          <div className="bg-slate-50/50 p-1 rounded-2xl inline-flex mb-12 border border-slate-100">
            <button 
              onClick={() => setActiveTab('restaurants')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'restaurants' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Restaurants
            </button>
            <button 
              onClick={() => setActiveTab('attractions')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'attractions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Attractions
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {activeTab !== 'bookings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">
                {activeTab === 'hotels' ? 'Active Properties' : activeTab === 'restaurants' ? 'Total Restaurants' : 'Total Attractions'}
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">
                  {activeTab === 'hotels' ? hotels.length : activeTab === 'restaurants' ? restaurants.length : attractions.length}
                </span>
                <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                  <Icons.TrendingUp className="w-4 h-4" /> 12%
                </span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">
                {activeTab === 'hotels' ? 'Avg. Occupancy' : activeTab === 'restaurants' ? 'Avg. Table Turn' : 'Avg. Wait Time'}
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">
                  {activeTab === 'hotels' ? '84%' : activeTab === 'restaurants' ? '1.2h' : '15m'}
                </span>
                <span className="text-blue-500 text-sm font-bold flex items-center gap-1">
                  <Icons.Star className="w-4 h-4" /> Steady
                </span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">Global Rating</p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">
                  {((activeTab === 'hotels' ? hotels : activeTab === 'restaurants' ? restaurants : attractions).reduce((acc, curr) => acc + curr.rating, 0) / 
                    ((activeTab === 'hotels' ? hotels : activeTab === 'restaurants' ? restaurants : attractions).length || 1)).toFixed(1)}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Icons.Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">Total Bookings</p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">{bookings.length}</span>
                <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                  <Icons.TrendingUp className="w-4 h-4" /> 8%
                </span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">Pending Approval</p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">
                  {bookings.filter(b => b.status === 'Pending').length}
                </span>
                <span className="text-orange-500 text-sm font-bold flex items-center gap-1">
                  <Icons.Clock className="w-4 h-4" /> Action Required
                </span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-bold text-slate-400 mb-4">Total Revenue</p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">
                  ${bookings.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                </span>
                <span className="text-blue-500 text-sm font-bold flex items-center gap-1">
                  <Icons.DollarSign className="w-4 h-4" /> Growth
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-6">{activeTab === 'bookings' ? 'Customer' : 'Name'}</th>
                  <th className="px-8 py-6">
                    {activeTab === 'hotels' ? 'Location' : 
                     activeTab === 'restaurants' ? 'Cuisine / Type' : 
                     activeTab === 'attractions' ? 'Type' : 'Asset'}
                  </th>
                  <th className="px-8 py-6">
                    {activeTab === 'hotels' ? 'Rating' : 
                     activeTab === 'bookings' ? 'Date' : 'Location'}
                  </th>
                  <th className="px-8 py-6">
                    {activeTab === 'hotels' ? 'Price/Night' : 
                     activeTab === 'bookings' ? 'Amount' : 'Status'}
                  </th>
                  <th className="px-8 py-6">{activeTab === 'hotels' || activeTab === 'bookings' ? 'Status' : 'Rating'}</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400">Loading {activeTab}...</td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400">No {activeTab} found.</td>
                  </tr>
                ) : (
                  paginatedData.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {activeTab !== 'bookings' ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-xl object-cover shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Icons.User className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{activeTab === 'bookings' ? item.userName : item.name}</p>
                            <p className="text-xs text-slate-400">
                              {activeTab === 'bookings' ? item.userId.substring(0, 8) : item.description?.substring(0, 30) + '...'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {activeTab === 'hotels' ? (
                          <span className="text-sm text-slate-600">{item.location}</span>
                        ) : activeTab === 'bookings' ? (
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.assetName}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.assetType}</p>
                          </div>
                        ) : (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full">
                            {activeTab === 'restaurants' ? item.cuisine : item.type}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {activeTab === 'hotels' ? (
                          <div className="flex items-center gap-1.5">
                            <Icons.Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold text-slate-900">{item.rating}</span>
                          </div>
                        ) : activeTab === 'bookings' ? (
                          <span className="text-sm text-slate-600">{item.date}</span>
                        ) : (
                          <span className="text-sm text-slate-600">{item.location}</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {activeTab === 'hotels' ? (
                          <span className="text-sm font-bold text-blue-600">${item.pricePerNight}</span>
                        ) : activeTab === 'bookings' ? (
                          <span className="text-sm font-bold text-slate-900">${item.amount || 0}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              item.status === 'Active' ? 'bg-green-500' :
                              item.status === 'Pending Audit' ? 'bg-orange-500' :
                              'bg-slate-400'
                            }`} />
                            <span className="text-xs font-bold text-slate-600">{item.status}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {activeTab === 'hotels' ? (
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            item.status === 'OPERATIONAL' ? 'bg-green-50 text-green-600' :
                            item.status === 'MAINTENANCE' ? 'bg-blue-50 text-blue-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        ) : activeTab === 'bookings' ? (
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            item.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                            item.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Icons.Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold text-slate-900">{item.rating}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab !== 'bookings' ? (
                            <>
                              <button 
                                onClick={() => handleOpenModal(item)}
                                className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Icons.Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Icons.Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                              <Icons.ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
              Showing {paginatedData.length} of {filteredData.length} verified {activeTab}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-blue-600 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="relative z-10 max-w-xl">
              <h3 className="text-3xl font-bold mb-4">Concierge AI Insight</h3>
              <div className={`text-blue-100 mb-8 leading-relaxed min-h-[3rem] transition-opacity duration-300 ${isInsightLoading ? 'opacity-50' : 'opacity-100'}`}>
                {aiInsight}
              </div>
              <button 
                onClick={async () => {
                  setIsInsightLoading(true);
                  const insight = await mockApi.getAIInsights(activeTab);
                  setAiInsight(insight);
                  setIsInsightLoading(false);
                }}
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
              >
                {isInsightLoading && <Icons.RefreshCw className="w-4 h-4 animate-spin" />}
                Generate Report
              </button>
            </div>
            {/* Decorative Stars */}
            <div className="absolute right-12 bottom-12 opacity-20">
              <Icons.Sparkles className="w-32 h-32" />
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Icons.TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-5xl font-bold text-slate-900 mb-2">98.2%</h4>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Review Accuracy</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[98.2%]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="font-bold text-slate-900">The Intelligent Voyager</h4>
            <p className="text-xs text-slate-400 mt-1">© 2024 The Intelligent Voyager. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400">
            <button className="hover:text-slate-900 transition-colors">Terms</button>
            <button className="hover:text-slate-900 transition-colors">Privacy</button>
            <button className="hover:text-slate-900 transition-colors">Support</button>
            <button className="hover:text-slate-900 transition-colors">Partners</button>
          </div>
        </footer>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <Icons.Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                {activeTab === 'hotels' && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hotel Name</label>
                      <input 
                        required
                        type="text" 
                        value={hotelForm.name}
                        onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Grand Azure Resort"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                      <textarea 
                        required
                        value={hotelForm.description}
                        onChange={(e) => setHotelForm({...hotelForm, description: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none"
                        placeholder="Premium Waterfront..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                      <input 
                        required
                        type="text" 
                        value={hotelForm.location}
                        onChange={(e) => setHotelForm({...hotelForm, location: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Maldives, Baa Atoll"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price per Night ($)</label>
                      <input 
                        required
                        type="number" 
                        value={hotelForm.pricePerNight}
                        onChange={(e) => setHotelForm({...hotelForm, pricePerNight: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rating (1-5)</label>
                      <input 
                        required
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={hotelForm.rating}
                        onChange={(e) => setHotelForm({...hotelForm, rating: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                      <select 
                        value={hotelForm.status}
                        onChange={(e) => setHotelForm({...hotelForm, status: e.target.value as Hotel['status']})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="OPERATIONAL">OPERATIONAL</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'restaurants' && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Restaurant Name</label>
                      <input 
                        required
                        type="text" 
                        value={restaurantForm.name}
                        onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="L'Oiseau Bleu"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cuisine</label>
                      <input 
                        required
                        type="text" 
                        value={restaurantForm.cuisine}
                        onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="French Fusion"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                      <input 
                        required
                        type="text" 
                        value={restaurantForm.location}
                        onChange={(e) => setRestaurantForm({...restaurantForm, location: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Paris, FR"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                      <select 
                        value={restaurantForm.status}
                        onChange={(e) => setRestaurantForm({...restaurantForm, status: e.target.value as Restaurant['status']})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending Audit">Pending Audit</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rating</label>
                      <input 
                        required
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={restaurantForm.rating}
                        onChange={(e) => setRestaurantForm({...restaurantForm, rating: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'attractions' && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attraction Name</label>
                      <input 
                        required
                        type="text" 
                        value={attractionForm.name}
                        onChange={(e) => setAttractionForm({...attractionForm, name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Eiffel Tower"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                      <input 
                        required
                        type="text" 
                        value={attractionForm.type}
                        onChange={(e) => setAttractionForm({...attractionForm, type: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Landmark"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                      <input 
                        required
                        type="text" 
                        value={attractionForm.location}
                        onChange={(e) => setAttractionForm({...attractionForm, location: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Paris, FR"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</label>
                      <select 
                        value={attractionForm.status}
                        onChange={(e) => setAttractionForm({...attractionForm, status: e.target.value as Attraction['status']})}
                        className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Pending Audit">Pending Audit</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-4 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    {editingItem ? 'Update Entry' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
