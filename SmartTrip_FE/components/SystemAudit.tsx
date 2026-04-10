import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from '../icons';

const auditLogs = [
  { id: 'AUD-9284', user: 'Admin (mrduoc7979)', action: 'Modified System Settings', target: 'Financials/Exchange Rates', timestamp: '2026-03-29 13:45:22', status: 'Success', severity: 'Medium' },
  { id: 'AUD-9283', user: 'System', action: 'Automated Backup', target: 'Firestore/Production', timestamp: '2026-03-29 12:00:00', status: 'Success', severity: 'Low' },
  { id: 'AUD-9282', user: 'Staff (Jane Doe)', action: 'Updated Booking Status', target: 'Booking #BK-1029', timestamp: '2026-03-29 11:22:15', status: 'Success', severity: 'Low' },
  { id: 'AUD-9281', user: 'Unknown', action: 'Failed Login Attempt', target: 'Auth/AdminConsole', timestamp: '2026-03-29 10:45:01', status: 'Failed', severity: 'High' },
  { id: 'AUD-9280', user: 'Admin (mrduoc7979)', action: 'Deleted User', target: 'User #US-8821', timestamp: '2026-03-29 09:15:33', status: 'Success', severity: 'High' },
];

export function SystemAudit() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">System Audit</h2>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Comprehensive logs of all administrative actions and system-level events for security and compliance.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="bg-white border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
            />
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Icons.Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Events', value: '14,292', icon: Icons.Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Security Alerts', value: '12', icon: Icons.ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'System Health', value: '99.9%', icon: Icons.HeartPulse, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-3xl font-bold text-slate-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Audit Logs</h3>
          <div className="flex gap-2">
            {['All', 'Security', 'System', 'User'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User / Actor</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-blue-600">{log.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Icons.User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600">{log.action}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-400">{log.target}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400">{log.timestamp}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      log.severity === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                      log.severity === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-bold text-slate-900">{log.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-slate-50 flex justify-center">
          <button className="text-sm font-bold text-blue-600 hover:underline">Load More Logs</button>
        </div>
      </div>
    </div>
  );
}
