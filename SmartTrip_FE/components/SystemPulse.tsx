import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import * as Icons from '../icons';

const data = [
  { name: 'JAN', revenue2023: 1200000, revenue2024: 1400000 },
  { name: 'MAR', revenue2023: 1500000, revenue2024: 1800000 },
  { name: 'MAY', revenue2023: 1300000, revenue2024: 1600000 },
  { name: 'JUL', revenue2023: 1800000, revenue2024: 2200000 },
  { name: 'SEP', revenue2023: 1600000, revenue2024: 2000000 },
  { name: 'NOV', revenue2023: 2100000, revenue2024: 2482900 },
];

const destinations = [
  { name: 'Santorini, Greece', value: '4.2k', progress: 85 },
  { name: 'Kyoto, Japan', value: '3.8k', progress: 75 },
  { name: 'Reykjavik, Iceland', value: '2.9k', progress: 60 },
  { name: 'Amalfi Coast, Italy', value: '2.1k', progress: 45 },
  { name: 'Bali, Indonesia', value: '1.8k', progress: 35 },
];

const activities = [
  { id: 1, type: 'booking', title: 'New booking confirmed: Paris Luxury Getaway', meta: 'User #9284 • 2 minutes ago', icon: Icons.Plane, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 2, type: 'ai', title: 'AI Optimizer updated flight route pricing for Southeast Asia', meta: 'System • 14 minutes ago', icon: Icons.Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 3, type: 'security', title: 'Security Alert: Multiple failed login attempts from IP 192.x.x.x', meta: 'Security Engine • 45 minutes ago', icon: Icons.ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
];

export function SystemPulse() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">System Pulse</h2>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Real-time performance metrics and predictive financial modeling for the global Voyager ecosystem.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3.5 rounded-2xl border border-slate-100 font-bold text-blue-600 hover:bg-slate-50 transition-all">
            Download Report
          </button>
          <button className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            Refresh Engine
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'TOTAL REVENUE', value: '$2,482,900', change: '+12.4% vs last month', icon: Icons.Wallet, color: 'text-blue-600' },
          { label: 'TOTAL BOOKINGS', value: '18,492', change: '+8.1% vs last month', icon: Icons.Ticket, color: 'text-blue-600' },
          { label: 'ACTIVE AI SESSIONS', value: '1,204', change: 'Processing live requests', icon: Icons.Bot, color: 'text-white', bg: 'bg-blue-600', dark: true },
          { label: 'USER GROWTH', value: '+4,103', change: '+24% new signups', icon: Icons.UserPlus, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className={`p-10 rounded-[2.5rem] border border-slate-100 shadow-sm ${stat.dark ? 'bg-blue-600 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-8">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.dark ? 'text-blue-100' : 'text-slate-400'}`}>{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.dark ? 'text-blue-200' : 'text-blue-600'}`} />
            </div>
            <h4 className="text-4xl font-bold mb-2 tracking-tight">{stat.value}</h4>
            <p className={`text-xs font-bold ${stat.dark ? 'text-blue-200' : 'text-blue-600'}`}>
              {stat.change.includes('+') && <Icons.TrendingUp className="w-3 h-3 inline mr-1" />}
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Revenue Over Time</h3>
              <p className="text-xs text-slate-400 font-medium">Annual performance comparison</p>
            </div>
            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-400">2023</button>
              <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-white text-blue-600 shadow-sm">2024</button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue2024" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue2023" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Top Destinations</h3>
          <p className="text-xs text-slate-400 font-medium mb-10">Booking volume per region</p>
          <div className="space-y-8">
            {destinations.map((dest, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-600">{dest.name}</span>
                  <span className="text-sm font-bold text-slate-900">{dest.value}</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dest.progress}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-3xl transition-colors group">
                <div className={`w-14 h-14 rounded-2xl ${activity.bg} ${activity.color} flex items-center justify-center shrink-0`}>
                  <activity.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">{activity.meta}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-sm font-bold text-blue-600 hover:underline pl-4">View Full System Logs</button>
        </div>

        {/* System Health */}
        <div className="lg:col-span-5 bg-[#001B3D] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-2xl font-bold mb-1">System Health</h3>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Cluster: US-East-Voyager-01</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
              Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-12">
            {[
              { label: 'CPU LOAD', value: '24%', progress: 24, color: 'bg-blue-600' },
              { label: 'MEMORY', value: '6.2 GB', progress: 65, color: 'bg-green-500' },
              { label: 'API LATENCY', value: '42ms', status: 'optimal' },
              { label: 'ERROR RATE', value: '0.02%', status: 'secure' },
            ].map((metric, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">{metric.label}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.status === 'optimal' && <Icons.CheckCircle className="w-4 h-4 text-green-500" />}
                  {metric.status === 'secure' && <Icons.ShieldCheck className="w-4 h-4 text-blue-500" />}
                </div>
                {metric.progress && (
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color}`} style={{ width: `${metric.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-10 border-t border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#001B3D] bg-slate-700 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#001B3D] bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                +4
              </div>
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">On-call: Ops Team Alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
}
