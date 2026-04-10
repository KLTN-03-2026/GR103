import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { mockApi } from '../services/apiService';
import { 
  Activity, 
  Database, 
  Search, 
  Zap, 
  BarChart3, 
  HeartPulse, 
  Plus, 
  FileText, 
  LifeBuoy, 
  Bell, 
  Settings, 
  RefreshCw, 
  Hotel, 
  Utensils, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Sparkles,
  Layers,
  Cpu,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Edit2,
  Globe,
  Target,
  Ban,
  Info,
  ChevronDown,
  MousePointer2,
  CheckCircle,
  LayoutDashboard,
  Star,
  Route,
  Wallet,
  Coins,
  Map,
  ShieldCheck,
  Banknote
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';

const latencyData = [
  { time: '00:00', latency: 45 },
  { time: '02:00', latency: 52 },
  { time: '04:00', latency: 48 },
  { time: '06:00', latency: 65 },
  { time: '08:00', latency: 58 },
  { time: '10:00', latency: 72 },
  { time: '12:00', latency: 85 },
  { time: '14:00', latency: 68 },
  { time: '16:00', latency: 55 },
  { time: '18:00', latency: 42 },
];

const syncLogs = [
  { id: 'TXN-742-0129-XY', source: 'Hotel_Sync_PR_991', status: 'Success', latency: '42ms', icon: Hotel },
  { id: 'TXN-742-0129-AZ', source: 'Resto_Batch_Global', status: 'Success', latency: '118ms', icon: Utensils },
  { id: 'TXN-881-2290-ER', source: 'Attract_Map_Eu-West', status: 'Failed', latency: 'Timeout', icon: MapPin },
  { id: 'TXN-122-0994-BC', source: 'Hotel_Meta_Patch', status: 'Success', latency: '59ms', icon: Hotel },
];

interface AIMonitoringProps {
  onNavigate: (page: any) => void;
}

export const AIMonitoring: React.FC<AIMonitoringProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('RAG Traces');
  const [logs, setLogs] = useState<any[]>([]);
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<string | null>('TRC-8829-AZ');
  const [itineraryItems, setItineraryItems] = useState([
    { id: 1, time: '09:00 AM', location: 'NAPLES PORT', title: 'Private Hydrofoil Transfer', desc: 'Fast-track boarding to Sorrento with panoramic Vesuvius views.', active: true, cost: '$45' },
    { id: 2, time: '11:30 AM', location: 'POSITANO', title: 'Cliffside Terrace Lunch', desc: 'Reserved seating at La Sponda. Curated tasting menu with local pairings.', active: false, cost: '$85' },
    { id: 3, time: '03:00 PM', location: 'AMALFI TOWN', title: 'Cathedral & Lemon Grove Walk', desc: 'Guided heritage walk followed by private limoncello tasting.', active: false, cost: '$25' },
  ]);
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null);

  const handleRegenerate = async (id: number) => {
    setIsRegenerating(id);
    // Simulate AI regeneration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const alternatives = [
      { title: 'Luxury Yacht Charter', desc: 'Private sailing along the coast with champagne and appetizers.', cost: '$250' },
      { title: 'Cooking Class in Ravello', desc: 'Learn to make traditional pasta in a garden overlooking the sea.', cost: '$120' },
      { title: 'Ancient Pompeii Tour', desc: 'Expert-led private tour through the preserved Roman city.', cost: '$95' },
      { title: 'Sunset Kayak Adventure', desc: 'Paddle through sea caves as the sun dips below the horizon.', cost: '$65' }
    ];
    
    const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
    
    setItineraryItems(prev => prev.map(item => 
      item.id === id ? { ...item, title: randomAlt.title, desc: randomAlt.desc, cost: randomAlt.cost } : item
    ));
    setIsRegenerating(null);
  };

  const nlpLogs = [
    { id: 'TRX-9402', time: '2 minutes ago', text: '"We need a honeymoon suite in Paris for 5 nights starting June 12th."', confidence: 0.998, status: 'success' },
    { id: 'TRX-9388', time: '14 minutes ago', text: '"Somewhere warm and cheap for a family of six, maybe Mexico or Bali?"', confidence: 0.742, status: 'warning' },
    { id: 'TRX-9371', time: '45 minutes ago', text: '"Executive trip for 2 to London. Need high-speed wifi and central location."', confidence: 0.965, status: 'success' },
  ];

  const perfStats = [
    { label: 'AVG LATENCY', value: '1.2s', change: '-12%', icon: Clock, color: 'text-blue-600' },
    { label: 'TOKEN THROUGHPUT', value: '4.2k', sub: 'tokens/sec', change: '+8%', icon: Zap, color: 'text-blue-600' },
    { label: 'ERROR RATE', value: '0.04%', change: '-2%', icon: AlertCircle, color: 'text-green-600' },
    { label: 'MODEL AVAILABILITY', value: '99.99%', change: 'Stable', icon: CheckCircle2, color: 'text-blue-600' },
  ];

  const latencyDistribution = [
    { range: '0-200ms', count: 450 },
    { range: '200-500ms', count: 1200 },
    { range: '500-1s', count: 800 },
    { range: '1s-2s', count: 300 },
    { range: '2s+', count: 150 },
  ];

  const tokenUsageData = [
    { time: '08:00', input: 1200, output: 2400 },
    { time: '10:00', input: 1800, output: 3600 },
    { time: '12:00', input: 2400, output: 4800 },
    { time: '14:00', input: 2100, output: 4200 },
    { time: '16:00', input: 2800, output: 5600 },
    { time: '18:00', input: 2200, output: 4400 },
  ];

  const regionalPerf = [
    { region: 'US-East (N. Virginia)', latency: '0.8s', uptime: '99.99%', load: '42%' },
    { region: 'EU-West (Ireland)', latency: '1.1s', uptime: '99.98%', load: '38%' },
    { region: 'Asia-Pacific (Tokyo)', latency: '1.4s', uptime: '99.95%', load: '56%' },
    { region: 'South America (Sao Paulo)', latency: '2.1s', uptime: '99.90%', load: '24%' },
  ];

  const ragTraces = [
    { id: 'TRC-8829-AZ', query: 'Luxury boutique hotels in Paris under €500 with a spa', docs: 124, score: 0.98, time: 'Just now' },
    { id: 'RAG-102', query: 'Best luxury hotels in Kyoto', docs: 5, score: 0.94, time: '3s ago' },
    { id: 'RAG-101', query: 'Cheap flights to Bali in July', docs: 3, score: 0.88, time: '12s ago' },
    { id: 'RAG-100', query: 'Top 10 things to do in Rome', docs: 8, score: 0.91, time: '45s ago' },
  ];

  const driftData = [
    { time: 'Mon', drift: 0.02 },
    { time: 'Tue', drift: 0.03 },
    { time: 'Wed', drift: 0.05 },
    { time: 'Thu', drift: 0.04 },
    { time: 'Fri', drift: 0.08 },
    { time: 'Sat', drift: 0.12 },
    { time: 'Sun', drift: 0.15 },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    const [newLogs, newLatency] = await Promise.all([
      mockApi.getSyncLogs(),
      mockApi.getPerformanceData()
    ]);
    setLogs(newLogs);
    setLatencyData(newLatency);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-6 h-6 text-[#2563EB]" />
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">AI Monitoring</h1>
          </div>
          <p className="text-xs text-[#64748B] font-medium">Engine v4.2.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { name: 'Data Sync', icon: Database },
            { name: 'NLP Analysis', icon: Search },
            { name: 'RAG Traces', icon: Layers },
            { name: 'Itinerary Engine', icon: Route },
            { name: 'Perf Metrics', icon: BarChart3 },
            { name: 'Model Health', icon: HeartPulse },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.name 
                  ? 'bg-[#EFF6FF] text-[#2563EB]' 
                  : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-4">
          <button className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Trace
          </button>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B]">
              <FileText className="w-4 h-4" />
              Docs
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B]">
              <LifeBuoy className="w-4 h-4" />
              Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-[#E2E8F0] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-8">
            <h2 className="text-lg font-bold text-[#2563EB] tracking-tight">Voyager AI Ops</h2>
            <nav className="flex items-center gap-6">
              {['Dashboard', 'Analytics', 'Logs', 'Infrastructure'].map((item) => (
                <button 
                  key={item} 
                  className={`text-sm font-medium transition-colors ${
                    item === 'Logs' ? 'text-[#0F172A] border-b-2 border-[#2563EB] h-16 flex items-center' : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#F0FDF4] px-3 py-1.5 rounded-full border border-[#DCFCE7]">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#166534]">System Status</span>
            </div>
            <button className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
            </button>
            <button className="p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-[#E2E8F0] rounded-full border border-[#CBD5E1] flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/admin/32/32" alt="Profile" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'Data Sync' ? (
            <>
              <div className="flex items-start justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-5xl font-extrabold text-[#0F172A] leading-tight mb-4">
                    Vector Database <span className="text-[#2563EB]">Live Synchronization</span>
                  </h1>
                  <p className="text-[#64748B] text-lg leading-relaxed">
                    Real-time embedding pipeline monitor for regional travel data. Orchestrating semantic sync between PostgreSQL and Pinecone Vector Clusters.
                  </p>
                </div>
                <button 
                  onClick={fetchData}
                  disabled={isLoading}
                  className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Force Re-Index
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'HOTELS', value: '98.4%', change: '+ 2.1%', sub: 'vs last hour', vectors: '12,450 vectors', icon: Hotel, color: '#2563EB' },
                  { label: 'RESTAURANTS', value: '99.1%', change: '+ 0.4%', sub: 'vs last hour', vectors: '8,922 vectors', icon: Utensils, color: '#2563EB' },
                  { label: 'ATTRACTIONS', value: '82.7%', change: '- 14.2%', sub: 'latency spike detected', vectors: '15,103 vectors', icon: MapPin, color: '#EF4444', warning: true },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-[#F1F5F9] rounded-xl">
                        <stat.icon className="w-6 h-6 text-[#475569]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#94A3B8] tracking-widest">{stat.label}</span>
                    </div>
                    <div className="space-y-1 mb-4">
                      <div className="text-4xl font-black text-[#0F172A]">{stat.value}</div>
                      <div className={`text-xs font-bold flex items-center gap-1 ${stat.warning ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                        <Zap className="w-3 h-3 fill-current" />
                        {stat.change}
                        <span className="text-[#94A3B8] font-medium ml-1">{stat.sub}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: stat.value, backgroundColor: stat.color }} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase ${stat.warning ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                        {stat.warning ? 'Needs Review' : 'Sync Health: Optimal'}
                      </span>
                      <span className="text-[10px] font-bold text-[#2563EB]">{stat.vectors}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sync Event Log */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#0F172A]">Sync Event Log</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#F1F5F9] text-[#475569] text-xs font-bold rounded-lg hover:bg-[#E2E8F0]">Last 24 Hours</button>
                      <button className="px-3 py-1.5 bg-[#F1F5F9] text-[#475569] text-xs font-bold rounded-lg hover:bg-[#E2E8F0]">All Types</button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                          <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Source</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Event ID</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Latency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-[#64748B] text-sm italic">
                              Fetching live telemetry data...
                            </td>
                          </tr>
                        ) : logs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#F1F5F9] rounded-lg group-hover:bg-white transition-colors">
                                  <Database className="w-4 h-4 text-[#475569]" />
                                </div>
                                <span className="text-sm font-bold text-[#1E293B]">{log.source}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-[#64748B]">{log.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} />
                                <span className={`text-xs font-bold ${log.status === 'Success' ? 'text-[#166534]' : 'text-[#991B1B]'}`}>{log.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#475569] text-right">{log.latency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                      <div className="relative">
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2563EB]" />
                        <input 
                          type="text" 
                          placeholder="Ask Voyager AI to investigate a sync issue..." 
                          className="w-full bg-white border border-[#E2E8F0] rounded-full py-3 pl-10 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button 
                          onClick={() => alert('AI Diagnostic Query initiated. Analyzing system health...')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563EB]/10 text-[#2563EB] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#2563EB] hover:text-white transition-all"
                        >
                          Query
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Diagnostic & Latency */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-[#0F172A]">AI Diagnostic</h3>
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
                      <div className="flex items-center gap-2 text-[#2563EB]">
                        <Sparkles className="w-5 h-5 fill-current" />
                        <span className="text-xs font-black uppercase tracking-widest">Insight Engine</span>
                      </div>
                      <p className="text-sm text-[#475569] leading-relaxed">
                        Detected a consistency mismatch in <span className="text-[#2563EB] font-bold">Attractions</span> category. The embedding model (ada-002) is returning higher-than-normal cosine distance for Paris-based POIs.
                      </p>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] transition-all group">
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Suggested Action</p>
                            <p className="text-sm font-bold text-[#1E293B]">Re-embed cluster #1029</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] transition-all group">
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Database Task</p>
                            <p className="text-sm font-bold text-[#1E293B]">Clear vector cache</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                      <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-6">Global Sync Latency</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={latencyData}>
                            <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                              {latencyData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.latency > 70 ? '#EF4444' : '#BFDBFE'} 
                                />
                              ))}
                            </Bar>
                            <XAxis 
                              dataKey="time" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                              interval={2}
                            />
                            <Tooltip 
                              cursor={{ fill: '#F8FAFC' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] font-bold text-[#94A3B8]">00:00</span>
                        <span className="text-[10px] font-bold text-[#94A3B8]">NOW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'NLP Analysis' ? (
            <div className="space-y-10">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold text-[#0F172A] mb-4">NLP Intent Analysis</h1>
                <p className="text-[#64748B] text-lg leading-relaxed">
                  Observing the cognitive transformation of unstructured user travel prompts into high-fidelity operational entities.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Raw User Input */}
                <div className="bg-white rounded-[2rem] p-8 border border-[#E2E8F0] shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">Raw User Input</span>
                    <span className="text-[10px] font-medium text-[#94A3B8]">Source: Voyager Mobile App</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center px-8">
                    <p className="text-2xl font-medium text-[#1E293B] leading-relaxed text-center italic">
                      "I'm looking for a <span className="text-[#2563EB] underline decoration-2 underline-offset-4">luxury 10-day trip</span> to Japan for <span className="text-[#2563EB] underline decoration-2 underline-offset-4">4 guests</span> this October. We have a budget of roughly <span className="text-[#2563EB] underline decoration-2 underline-offset-4">$15,000</span> and really want to focus on <span className="text-[#2563EB] underline decoration-2 underline-offset-4">traditional tea ceremonies</span> and modern architecture."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-12">
                    <button className="bg-[#2563EB] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-lg shadow-blue-100">
                      <RefreshCw className="w-4 h-4" />
                      Re-run Extraction
                    </button>
                    <button className="bg-[#F1F5F9] text-[#475569] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#E2E8F0] transition-all">
                      <Edit2 className="w-4 h-4" />
                      Edit Prompt
                    </button>
                  </div>
                </div>

                {/* Parsed Entities */}
                <div className="bg-[#001B3D] rounded-[2rem] p-8 text-white shadow-xl flex flex-col h-full">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Cpu className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold">Parsed Entities</h3>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400/60">SCHEMA: V2.4-TRV</span>
                  </div>

                  <div className="flex-1 space-y-8">
                    {[
                      { key: 'destination', value: 'Japan', conf: '0.99' },
                      { key: 'duration', value: '10 days', conf: '1.00' },
                      { key: 'guests', value: '4', conf: '0.98' },
                      { key: 'budget', value: '15000.00', sub: 'USD', conf: '0.85' },
                    ].map((entity) => (
                      <div key={entity.key} className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-8">
                          <span className="text-sm font-mono text-blue-400/60 w-24">"{entity.key}"</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold">"{entity.value}"</span>
                            {entity.sub && <span className="text-[10px] font-bold text-blue-400/60">{entity.sub}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#22C55E]">CONF: {entity.conf}</span>
                      </div>
                    ))}

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-8">
                        <span className="text-sm font-mono text-blue-400/60 w-24 mt-1">"preferences"</span>
                        <div className="flex flex-wrap gap-2 max-w-xs">
                          {['Traditional Tea Ceremonies', 'Modern Architecture', 'Luxury Tier'].map((tag) => (
                            <span key={tag} className="px-3 py-1.5 bg-blue-500/20 rounded-full text-[10px] font-bold text-blue-300 border border-blue-500/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'INTENT', value: '99.4%', color: 'text-[#2563EB]', bg: 'bg-blue-50' },
                  { label: 'ENTITY', value: '97.8%', color: 'text-[#2563EB]', bg: 'bg-blue-50' },
                  { label: 'TONE', value: 'High-End', color: 'text-[#2563EB]', bg: 'bg-blue-50' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} p-6 rounded-2xl border border-blue-100/50 flex flex-col items-center justify-center text-center`}>
                    <span className="text-[10px] font-bold text-[#94A3B8] tracking-widest mb-2 uppercase">{stat.label}</span>
                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Historical Extraction Logs */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#0F172A]">Historical Extraction Logs</h3>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input 
                        type="text" 
                        placeholder="Filter logs..." 
                        className="bg-[#F1F5F9] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 w-64"
                      />
                    </div>
                    <button className="p-2 bg-[#F1F5F9] text-[#475569] rounded-lg hover:bg-[#E2E8F0]">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {nlpLogs.map((log) => (
                    <div key={log.id} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-xl ${log.status === 'success' ? 'bg-[#F0FDF4]' : 'bg-[#FFFBEB]'}`}>
                          {log.status === 'success' ? (
                            <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-[#F59E0B]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-[#2563EB]">{log.id}</span>
                            <span className="text-xs text-[#94A3B8]">• {log.time}</span>
                          </div>
                          <p className="text-sm font-medium text-[#475569]">{log.text}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="w-48">
                          <div className="flex justify-end mb-1">
                            <span className="text-[10px] font-bold text-[#475569]">{log.confidence}</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${log.status === 'success' ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`}
                              style={{ width: `${log.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                        <button className="p-2 text-[#94A3B8] hover:text-[#1E293B] opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'Itinerary Engine' ? (
            <div className="space-y-10">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-6xl font-black text-[#0F172A] tracking-tight leading-tight">
                    Itinerary Engine <br />
                    <span className="text-[#2563EB]">Performance</span>
                  </h1>
                  <p className="text-[#64748B] text-xl leading-relaxed font-medium">
                    Advanced telemetry for Voyager AI engine. Analyzing latency, token density, and spatial consistency across the global itinerary generation pipeline.
                  </p>
                </div>
                
                <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">LIVE STATUS</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#0F172A]">99.8%</span>
                      <span className="text-sm font-bold text-[#64748B]">Availability</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { icon: Clock, label: 'Avg Generation Time', value: '4.2s', change: '-12%', target: 'Target: < 5.0s', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Database, label: 'Avg Tokens / Trip', value: '12.4k', change: '+4.2%', target: 'Model: GPT-4o-Voyage', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Banknote, label: 'Cost per Generation', value: '$0.14', change: null, target: 'Daily Burn: $142.80', color: 'text-white', bg: 'bg-[#0F172A]', isDark: true },
                        { icon: ShieldCheck, label: 'Spatial Consistency', value: '94.2%', change: 'Stable', target: 'Route optimization check', color: 'text-blue-600', bg: 'bg-blue-50' },
                      ].map((stat, idx) => (
                  <div key={idx} className={`${stat.isDark ? 'bg-[#0F172A] text-white' : 'bg-white text-[#0F172A]'} rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-6 relative overflow-hidden`}>
                    <div className="flex items-center justify-between relative z-10">
                      <div className={`w-10 h-10 ${stat.isDark ? 'bg-white/10' : 'bg-blue-50'} rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.isDark ? 'text-blue-400' : 'text-[#2563EB]'}`} />
                      </div>
                      {stat.change && (
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${stat.change.startsWith('-') ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 relative z-10">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.isDark ? 'text-blue-400/60' : 'text-[#94A3B8]'}`}>{stat.label}</p>
                      <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.isDark ? 'text-white/40' : 'text-[#94A3B8]'}`}>{stat.target}</p>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Generation Timeline */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">RECENT GENERATION</p>
                      <h3 className="text-3xl font-black text-[#0F172A]">Amalfi Coast Express</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#F1F5F9] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-[#E2E8F0]">
                        <Database className="w-4 h-4 text-[#64748B]" />
                        <span className="text-xs font-bold text-[#475569]">+4</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] p-10 shadow-sm space-y-12">
                    <div className="space-y-10 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#F1F5F9]" />
                      
                      {itineraryItems.map((item, idx) => (
                        <div key={item.id} className="flex gap-8 relative z-10 group/item">
                          <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm mt-1.5 shrink-0 transition-colors ${item.active ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                                <span>{item.time}</span>
                                <span className="w-1 h-1 bg-[#CBD5E1] rounded-full" />
                                <span>{item.location}</span>
                                <span className="w-1 h-1 bg-[#CBD5E1] rounded-full" />
                                <span className="text-[#2563EB]">{item.cost}</span>
                              </div>
                              
                              <button 
                                onClick={() => handleRegenerate(item.id)}
                                disabled={isRegenerating === item.id}
                                className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3 h-3 ${isRegenerating === item.id ? 'animate-spin' : ''}`} />
                                {isRegenerating === item.id ? 'Regenerating...' : 'Regenerate'}
                              </button>
                            </div>
                            <h4 className="text-xl font-black text-[#1E293B]">{item.title}</h4>
                            <p className="text-[#64748B] leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="relative rounded-[2rem] overflow-hidden group">
                      <img 
                        src="https://picsum.photos/seed/amalfi/1200/600" 
                        alt="Amalfi Coast" 
                        className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-8 left-8">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-3 shadow-xl">
                          <Route className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-xs font-black text-[#0F172A] uppercase tracking-widest">12.4 km optimized path</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata & Insights */}
                <div className="space-y-8">
                  <div className="bg-white rounded-[2.5rem] border border-[#E2E8F0] p-10 shadow-sm space-y-10">
                    <h3 className="text-xl font-black text-[#0F172A]">Generation Metadata</h3>
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6">
                        <span className="text-sm font-medium text-[#64748B]">Calculation Method</span>
                        <span className="text-sm font-black text-[#0F172A]">RAG-Optimized (v4)</span>
                      </div>

                      <div className="space-y-4 border-b border-[#F1F5F9] pb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#64748B]">Token Breakdown</span>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#0F172A]">14,203 total</p>
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">3,122 PROMPT | 11,081 OUTPUT</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-6">
                        <span className="text-sm font-medium text-[#64748B]">Total Cost Est.</span>
                        <span className="text-sm font-black text-[#2563EB]">$0.1724</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#64748B]">Route Optimization Score</span>
                          <span className="text-sm font-black text-[#0F172A]">92%</span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '92%' }} />
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-[#F8FAFC] text-[#475569] py-4 rounded-2xl text-sm font-black uppercase tracking-widest border border-[#E2E8F0] flex items-center justify-center gap-3 hover:bg-[#F1F5F9] transition-all">
                      <FileText className="w-4 h-4" />
                      View JSON Trace
                    </button>
                  </div>

                  <div className="bg-[#F0F7FF] rounded-[2.5rem] p-10 border border-blue-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2563EB] fill-current" />
                      <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">VOYAGER INSIGHT</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-[#0F172A]">Model Drift Detected</h4>
                      <p className="text-sm text-[#475569] leading-relaxed font-medium">
                        Latency in Mediterranean-based itineraries has increased by 14% over the last 6 hours. This correlates with higher RAG retrieval depths for coastal transit nodes.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all">
                        Auto-Tune Prompt
                      </button>
                      <button className="px-6 py-3 text-xs font-black text-[#64748B] uppercase tracking-widest hover:text-[#1E293B]">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'Perf Metrics' ? (
            <div className="space-y-10">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold text-[#0F172A] mb-4">Performance Metrics</h1>
                <p className="text-[#64748B] text-lg leading-relaxed">
                  Deep telemetry into model latency, token efficiency, and global infrastructure health.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {perfStats.map((stat) => (
                  <div key={stat.label} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-[#F1F5F9] rounded-lg">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : stat.change === 'Stable' ? 'text-blue-600' : 'text-blue-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-[#0F172A]">{stat.value}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{stat.label}</span>
                        {stat.sub && <span className="text-[10px] text-[#94A3B8] lowercase italic">({stat.sub})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latency Distribution */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#0F172A]">Latency Distribution</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#F1F5F9] text-[#475569] text-xs font-bold rounded-lg hover:bg-[#E2E8F0]">Last 24h</button>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={latencyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="range" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                        />
                        <Tooltip 
                          cursor={{ fill: '#F8FAFC' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Token Usage Over Time */}
                <div className="bg-white p-8 rounded-[2rem] border border-[#E2E8F0] shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#0F172A]">Token Usage Over Time</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#2563EB] rounded-full" />
                        <span className="text-xs font-bold text-[#64748B]">Input</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#93C5FD] rounded-full" />
                        <span className="text-xs font-bold text-[#64748B]">Output</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tokenUsageData}>
                        <defs>
                          <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="input" stroke="#2563EB" fillOpacity={1} fill="url(#colorInput)" strokeWidth={2} />
                        <Area type="monotone" dataKey="output" stroke="#93C5FD" fillOpacity={1} fill="url(#colorOutput)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Regional Performance */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#0F172A]">Regional Performance</h3>
                <div className="bg-white rounded-[2rem] border border-[#E2E8F0] overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Region</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Avg Latency</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Uptime</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Current Load</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {regionalPerf.map((region) => (
                        <tr key={region.region} className="hover:bg-[#F8FAFC] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-[#475569]" />
                              <span className="text-sm font-bold text-[#1E293B]">{region.region}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-[#475569]">{region.latency}</td>
                          <td className="px-8 py-5 text-sm font-medium text-[#475569]">{region.uptime}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden max-w-[100px]">
                                <div 
                                  className="h-full bg-[#2563EB] rounded-full" 
                                  style={{ width: region.load }} 
                                />
                              </div>
                              <span className="text-xs font-bold text-[#475569]">{region.load}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="px-3 py-1 bg-[#F0FDF4] text-[#22C55E] text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Healthy
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'RAG Traces' ? (
            selectedTrace ? (
              <div className="space-y-8">
                {/* Breadcrumb & Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                      <button 
                        onClick={() => setSelectedTrace(null)}
                        className="hover:text-[#2563EB] transition-colors"
                      >
                        TRACES
                      </button>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-[#2563EB]">PB12_RAG_RETRIEVAL</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#0F172A]">
                      Retrieval & <span className="text-[#2563EB]">Filtering Trace</span>
                    </h1>
                    <p className="text-[#64748B] text-lg max-w-2xl">
                      Visualizing the vector search lifecycle: from semantic query translation to hard constraint enforcement.
                    </p>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">TRACE ID</p>
                      <p className="text-sm font-black text-[#0F172A]">#TRC-8829-AZ</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">LATENCY</p>
                      <p className="text-sm font-black text-[#2563EB]">142ms</p>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                  {/* Intent Query Card */}
                  <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-8">
                    <div className="flex items-center gap-2 text-[#2563EB]">
                      <Target className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Intent Query</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">User Input</p>
                        <p className="text-lg font-medium text-[#1E293B] italic leading-relaxed">
                          "Find me luxury boutique hotels in Paris for next weekend under €500 with a spa."
                        </p>
                      </div>

                      <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-2">Generated Search Vector</p>
                        <p className="text-sm font-mono text-blue-300 break-all leading-relaxed">
                          [0.12, -0.94, 0.44, 0.81 ... +1532 dims]
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Confidence Score</span>
                        <span className="text-sm font-black text-[#0F172A]">0.982</span>
                      </div>
                      <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '98.2%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Documents Retrieved Card */}
                  <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-blue-50 rounded-full">
                      <Database className="w-8 h-8 text-[#2563EB]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-6xl font-black text-[#0F172A]">124</div>
                      <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Documents Retrieved</p>
                    </div>
                  </div>

                  {/* Post-Filter Matches Card */}
                  <div className="bg-[#001B3D] rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                    <div className="p-4 bg-blue-500/20 rounded-full relative z-10">
                      <Filter className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-6xl font-black text-white">12</div>
                        <span className="text-lg font-bold text-blue-400">Passed</span>
                      </div>
                      <p className="text-xs font-bold text-blue-400/60 uppercase tracking-widest">Post-Filter Matches</p>
                    </div>
                  </div>

                  {/* AI Observer Insight Overlay */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 right-8 w-96 bg-white rounded-3xl shadow-2xl border border-[#E2E8F0] p-6 z-20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#2563EB] rounded-xl">
                        <Sparkles className="w-5 h-5 text-white fill-current" />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">AI Observer Insight</p>
                          <p className="text-sm text-[#475569] leading-relaxed">
                            "Retrieval was efficient but 84% of candidates were discarded due to the <span className="font-bold text-[#1E293B]">'Spa'</span> requirement. Consider widening the search radius if no matches are found in the final set."
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest hover:underline">Adjust Constraints</button>
                          <button className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest hover:underline">Dismiss</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Filtered Results Timeline */}
                <div className="space-y-6 pt-12">
                  <h3 className="text-xl font-bold text-[#0F172A]">Filtered Results Timeline</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        name: 'Hôtel de Crillon', 
                        price: '€ 480/night', 
                        rating: '4.9', 
                        status: 'success', 
                        metric: 'RELEVANCE', 
                        metricValue: '0.942',
                        image: 'https://picsum.photos/seed/crillon/100/100'
                      },
                      { 
                        name: 'Four Seasons George V', 
                        price: '€ 1,200/night', 
                        rating: '5.0', 
                        status: 'failed', 
                        metric: 'CONSTRAINT', 
                        metricValue: 'EXCEEDS_BUDGET',
                        image: 'https://picsum.photos/seed/georgev/100/100'
                      },
                      { 
                        name: 'Le Bristol Paris', 
                        price: '€ 420/night', 
                        rating: 'Full Spa', 
                        status: 'success', 
                        metric: 'RELEVANCE', 
                        metricValue: '0.887',
                        image: 'https://picsum.photos/seed/bristol/100/100'
                      },
                      { 
                        name: 'Hotel Regina Louvre', 
                        price: '€ 380/night', 
                        rating: 'No Spa', 
                        status: 'failed', 
                        metric: 'CONSTRAINT', 
                        metricValue: 'NO_FACILITY_MATCH',
                        image: 'https://picsum.photos/seed/regina/100/100'
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-6">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1">
                            <h4 className="text-lg font-bold text-[#1E293B]">{item.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-[#64748B]">
                              <span>{item.price}</span>
                              <span className="w-1 h-1 bg-[#CBD5E1] rounded-full" />
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{item.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{item.metric}</p>
                            <p className={`text-sm font-black ${item.status === 'success' ? 'text-[#2563EB]' : 'text-[#EF4444]'}`}>
                              {item.metricValue}
                            </p>
                          </div>
                          <div className={`p-2 rounded-full ${item.status === 'success' ? 'bg-blue-50 text-[#2563EB]' : 'bg-red-50 text-[#EF4444]'}`}>
                            {item.status === 'success' ? (
                              <CheckCircle className="w-6 h-6" />
                            ) : (
                              <Ban className="w-6 h-6" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-bold text-[#0F172A] mb-4">RAG Retrieval Traces</h1>
                  <p className="text-[#64748B] text-lg leading-relaxed">
                    Analyzing the semantic retrieval pipeline. Monitoring how context is injected into model prompts from the vector store.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-[#0F172A]">Recent Retrieval Events</h3>
                    <div className="bg-white rounded-[2rem] border border-[#E2E8F0] overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Trace ID</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Query</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Docs</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Sim Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {ragTraces.map((trace) => (
                            <tr 
                              key={trace.id} 
                              className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                              onClick={() => setSelectedTrace(trace.id)}
                            >
                              <td className="px-8 py-5 text-xs font-mono text-[#2563EB]">{trace.id}</td>
                              <td className="px-8 py-5">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-[#1E293B]">{trace.query}</p>
                                  <p className="text-[10px] text-[#94A3B8]">{trace.time}</p>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-sm font-medium text-[#475569]">{trace.docs}</td>
                              <td className="px-8 py-5 text-right">
                                <span className={`text-sm font-bold ${trace.score > 0.9 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
                                  {trace.score}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-[#0F172A]">Vector Space</h3>
                    <div className="bg-[#001B3D] rounded-[2rem] p-8 text-white shadow-xl h-[400px] flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">t-SNE Projection</span>
                        <Layers className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 relative border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        {/* Mock Vector Visualization */}
                        {[...Array(20)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-blue-400/40"
                            style={{ 
                              left: `${Math.random() * 90 + 5}%`, 
                              top: `${Math.random() * 90 + 5}%`,
                              opacity: Math.random() * 0.5 + 0.2
                            }}
                          />
                        ))}
                        <div className="absolute w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[10px] text-blue-400/60 mt-4 text-center italic">
                        Visualizing query embedding relative to nearest neighbors in Pinecone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : activeTab === 'Model Health' ? (
            <div className="space-y-10">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold text-[#0F172A] mb-4">Model Health & Drift</h1>
                <p className="text-[#64748B] text-lg leading-relaxed">
                  Monitoring semantic drift and classification accuracy. Ensuring the AI remains aligned with travel domain expertise.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'DRIFT SCORE', value: '0.12', change: '+0.02', icon: Activity, color: 'text-blue-600' },
                  { label: 'ACCURACY', value: '94.2%', change: '+1.2%', icon: CheckCircle2, color: 'text-green-600' },
                  { label: 'PRECISION', value: '92.8%', change: '-0.4%', icon: Target, color: 'text-blue-600' },
                  { label: 'RECALL', value: '95.1%', change: '+0.8%', icon: Search, color: 'text-blue-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-[#F1F5F9] rounded-lg">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-[#0F172A]">{stat.value}</div>
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-[#0F172A]">Semantic Drift Over Time</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#EF4444] rounded-full" />
                    <span className="text-xs font-bold text-[#64748B]">Drift Threshold (0.20)</span>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={driftData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} 
                        domain={[0, 0.25]}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="drift" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      <ReferenceLine y={0.20} stroke="#EF4444" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Activity className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-bold uppercase tracking-widest">Coming Soon</p>
              <p className="text-sm">This section is currently under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
