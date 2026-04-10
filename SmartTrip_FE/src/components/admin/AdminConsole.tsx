import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  setDoc,
  doc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import * as Icons from '../../icons';
import { UserProfile, Page } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../firebase';

import { SystemConfiguration } from './SystemConfiguration';
import { SystemPulse } from './SystemPulse';
import { SystemAudit } from './SystemAudit';
import { AIConfiguration } from './AIConfiguration';

interface AdminConsoleProps {
  onNavigate: (p: Page) => void;
  userProfile: UserProfile | null;
  initialTab?: string;
}

export function AdminConsole({ onNavigate, userProfile, initialTab = 'statistics' }: AdminConsoleProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('Any Status');
  const [loading, setLoading] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState(initialTab);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPageNumber] = useState(1);
  const itemsPerPage = 5;

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'Customer' as UserProfile['role'],
    status: 'Active' as UserProfile['status']
  });

  useEffect(() => {
    // Temporarily disabled strict redirect for backend integration review
    /*
    if (userProfile?.role !== 'Admin') {
      onNavigate('dashboard');
      return;
    }
    */

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList = querySnapshot.docs.map(doc => ({
          ...doc.data()
        })) as UserProfile[];
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'Active' ? 'Locked' : 'Active';
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleRoleChange = async (user: UserProfile, newRole: UserProfile['role']) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.uid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'Any Status' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddUser = async () => {
    try {
      // In a real app, we'd use Firebase Auth to create the user first
      // For this demo, we'll add to Firestore
      const userRef = doc(collection(db, 'users'));
      const userData: UserProfile = {
        uid: userRef.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        isVerified: true,
        createdAt: new Date() as any,
        lastLogin: new Date() as any
      };
      await setDoc(userRef, userData);
      setUsers([...users, userData]);
      setShowAddUserModal(false);
      setNewUser({ fullName: '', email: '', role: 'Customer', status: 'Active' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-blue-900 tracking-tight">Admin Console</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Voyager System v2.1</p>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'statistics', icon: Icons.LayoutDashboard, label: 'Statistics' },
              { id: 'users', icon: Icons.Users, label: 'Users' },
              { id: 'financials', icon: Icons.Wallet, label: 'Financials' },
              { id: 'ai-config', icon: Icons.Sparkles, label: 'AI Config' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSidebarTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSidebarTab === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-50 space-y-4">
            <button 
              onClick={() => setActiveSidebarTab('audit')}
              className={`w-full py-3 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${
                activeSidebarTab === 'audit' 
                  ? 'bg-blue-700 text-white shadow-blue-700/20' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              New System Audit
            </button>
          <button 
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <Icons.LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-slate-100 px-12 py-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-12">
            <h2 className="text-xl font-bold text-blue-900 tracking-tight">The Intelligent Voyager</h2>
            <div className="relative w-96">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600">System Status: Optimal</span>
            </div>
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                <Icons.Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Icons.Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">Support</span>
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden">
                  <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-12">
          {activeSidebarTab === 'users' ? (
            <>
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">User Management</h2>
                  <p className="text-slate-500">Audit, modify roles, and manage access credentials for the Voyager ecosystem.</p>
                </div>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Icons.UserPlus className="w-5 h-5" /> Add New User
                </button>
              </header>

            {/* Search & Filters */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-100 rounded-xl px-6 py-3.5 font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>Staff</option>
                <option>Customer</option>
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-100 rounded-xl px-6 py-3.5 font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Any Status</option>
                <option>Active</option>
                <option>Locked</option>
              </select>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-6">User Details</th>
                      <th className="px-8 py-6">Role</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6">Date Joined</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400">Loading users...</td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.uid} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  user.fullName.split(' ').map(n => n[0]).join('')
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{user.fullName}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              user.role === 'Admin' ? 'bg-blue-50 text-blue-600' :
                              user.role === 'Staff' ? 'bg-slate-100 text-slate-600' :
                              'bg-indigo-50 text-indigo-600'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-xs font-bold text-slate-600">{user.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm text-slate-500">
                              {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                <Icons.UserPlus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowHistoryModal(true);
                                }}
                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <Icons.History className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2 rounded-lg transition-colors ${
                                  user.status === 'Active' ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <Icons.Toggle className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPageNumber(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPageNumber(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPageNumber(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-slate-100 text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-bold text-slate-900">Access Frequency</h4>
                  <Icons.BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-end justify-between gap-2 h-32 mb-6">
                  {[40, 70, 45, 90, 30].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${i === 3 ? 'bg-blue-600' : 'bg-blue-100 group-hover:bg-blue-200'}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-medium">System usage is up 12% from last week.</p>
              </div>

              <div className="lg:col-span-8 bg-[#001B3D] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-4">Security Overview</h4>
                  <p className="text-blue-200 mb-10 max-w-xl leading-relaxed">
                    No critical unauthorized login attempts detected in the last 24 hours. Your security shields are currently operational.
                  </p>
                  
                  <div className="flex gap-12">
                    <div>
                      <p className="text-4xl font-bold mb-1">1,204</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Active Users</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold mb-1">14</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Flagged Accounts</p>
                    </div>
                  </div>
                </div>
                <Icons.ShieldAlert className="absolute right-10 bottom-10 w-32 h-32 text-blue-900/20" />
              </div>
            </div>
          </>
        ) : activeSidebarTab === 'statistics' ? (
          <SystemPulse />
        ) : activeSidebarTab === 'financials' ? (
          <SystemConfiguration />
        ) : activeSidebarTab === 'ai-config' ? (
          <AIConfiguration />
        ) : activeSidebarTab === 'audit' ? (
          <SystemAudit />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Icons.LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-bold uppercase tracking-widest">Coming Soon</p>
            <p className="text-sm">This section is currently under development.</p>
          </div>
        )}
        </div>
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New User</h3>
              <p className="text-slate-500 mb-8">Create a new account for the Voyager system.</p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input 
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="e.g., John Doe"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input 
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="e.g., john@example.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option>Customer</option>
                      <option>Staff</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                    <select 
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option>Active</option>
                      <option>Locked</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddUser}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* User History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">User History</h3>
                  <p className="text-slate-500">Activity logs for <span className="font-bold text-blue-600">{selectedUser.fullName}</span></p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6">
                {[
                  { action: 'Logged In', date: 'Today, 12:45 PM', ip: '192.168.1.1', device: 'Chrome / macOS' },
                  { action: 'Updated Profile', date: 'Yesterday, 03:12 PM', ip: '192.168.1.1', device: 'Chrome / macOS' },
                  { action: 'Booked Trip: Tokyo', date: 'Mar 25, 2024', ip: '192.168.1.1', device: 'Safari / iPhone' },
                  { action: 'Logged In', date: 'Mar 25, 2024', ip: '192.168.1.1', device: 'Safari / iPhone' },
                  { action: 'Password Changed', date: 'Mar 10, 2024', ip: '10.0.0.42', device: 'Firefox / Windows' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Icons.Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-900">{log.action}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.date}</p>
                      </div>
                      <p className="text-xs text-slate-500">IP: {log.ip} • Device: {log.device}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
