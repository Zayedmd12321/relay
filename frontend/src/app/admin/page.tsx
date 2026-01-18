'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, UserPlus, Trash2, Shield, Users, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';
import { motion } from 'framer-motion';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Team_Head';
  createdAt: string;
}

interface TeamHeadStats {
  _id: string;
  name: string;
  email: string;
  totalAssigned: number;
  totalResolved: number;
  activeQueries: number;
  avgResolutionTime: string;
  resolutionRate: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamHeadStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team_Head' as 'Admin' | 'Team_Head',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
      fetchTeamStats();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/users');
      setUsers(response.data.data.users);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await axios.get('/auth/team-heads/stats');
      setTeamStats(response.data.data.teamHeads);
    } catch (error: any) {
      console.error('Failed to fetch team stats:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Optimistic UI: Add user immediately
    const tempUser = {
      _id: 'temp-' + Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    
    const previousUsers = [...users];
    setUsers(prev => [...prev, tempUser]);
    setShowAddModal(false);
    toast.success(`${formData.role} added successfully`);
    const formDataCopy = { ...formData };
    setFormData({ name: '', email: '', password: '', role: 'Team_Head' });
    setSubmitting(false);
    
    try {
      await axios.post('/auth/users', formDataCopy);
      // Refresh to get accurate data with real IDs
      await fetchUsers();
      await fetchTeamStats();
    } catch (error: any) {
      // Revert on error
      setUsers(previousUsers);
      toast.error(error.response?.data?.message || 'Failed to add user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userRole: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    // Optimistic UI: Remove user immediately
    const previousUsers = [...users];
    const previousTeamStats = [...teamStats];
    
    setUsers(prev => prev.filter(u => u._id !== userId));
    setTeamStats(prev => prev.filter(ts => ts._id !== userId));
    toast.success(`${userRole} deleted successfully`);
    
    try {
      await axios.delete(`/auth/users/${userId}`);
      // Refresh to get accurate data
      await fetchUsers();
      await fetchTeamStats();
    } catch (error: any) {
      // Revert on error
      setUsers(previousUsers);
      setTeamStats(previousTeamStats);
      toast.error(error.response?.data?.message || 'Failed to delete user. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return null;
  }

  const admins = users.filter(u => u.role === 'Admin');
  const teamHeads = users.filter(u => u.role === 'Team_Head');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage Admins and Team Heads</p>
        </div>

        {/* Team Performance Section */}
        {teamStats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Team Performance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Track Team Head statistics and performance</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Team Head</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Assigned</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Resolved</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Avg Time</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {teamStats.map((stat, index) => (
                      <tr key={stat._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{stat.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-white">{stat.totalAssigned}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{stat.totalResolved}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="font-semibold text-amber-700 dark:text-amber-300">{stat.activeQueries}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {stat.avgResolutionTime} hrs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex-1 max-w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  stat.resolutionRate >= 80
                                    ? 'bg-emerald-500'
                                    : stat.resolutionRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${stat.resolutionRate}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold min-w-12 ${
                              stat.resolutionRate >= 80
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : stat.resolutionRate >= 50
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {stat.resolutionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="mb-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          Add Admin / Team Head
        </motion.button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admins */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admins</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{admins.length} total</p>
              </div>
            </div>

            <div className="space-y-3">
              {admins.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No admins found</p>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{admin.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{admin.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(admin._id, admin.name, admin.role)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Heads */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Heads</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{teamHeads.length} total</p>
              </div>
            </div>

            <div className="space-y-3">
              {teamHeads.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No team heads found</p>
              ) : (
                teamHeads.map((head) => (
                  <div
                    key={head._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{head.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{head.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(head._id, head.name, head.role)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete team head"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add New User</h2>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Team_Head' })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                >
                  <option value="Team_Head">Team Head</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', email: '', password: '', role: 'Team_Head' });
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
