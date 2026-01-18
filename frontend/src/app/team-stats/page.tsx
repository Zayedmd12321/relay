'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Clock, Target, User, ArrowLeft, Crown, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamHeadStat {
  _id: string;
  name: string;
  email: string;
  avgResolutionTime: number;
  totalResolved: number;
  activeAssigned: number;
}

export default function TeamStatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamHeadStats, setTeamHeadStats] = useState<TeamHeadStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      fetchTeamHeadStats();
    }
  }, [user, authLoading]);

  const fetchTeamHeadStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/team-heads/stats');
      if (res.data.success) {
        setTeamHeadStats(res.data.data.teamHeads);
      }
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (!hours || hours === 0) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} mins`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  if (authLoading || !user) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">Team Statistics</h1>
                <p className="text-slate-500 dark:text-zinc-500 mt-1">Performance metrics for Team Heads</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : teamHeadStats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl"
            >
              <User className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-zinc-700" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">No Team Heads Found</h3>
              <p className="text-slate-500 dark:text-zinc-500">Add Team Heads to see their statistics</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamHeadStats.map((head, index) => {
                const isTopPerformer = index === 0 && head.totalResolved > 0;
                
                return (
                  <motion.div
                    key={head._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-white/[0.03] backdrop-blur-xl border rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 ${
                      isTopPerformer
                        ? 'border-amber-300 dark:border-amber-500/30 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-white/[0.08]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold ${
                          isTopPerformer
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        }`}>
                          {head.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">{head.name}</h3>
                            {isTopPerformer && (
                              <Crown className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-500">{head.email}</p>
                        </div>
                      </div>
                      {isTopPerformer && (
                        <div className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-lg">
                          <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-3">
                      {/* Avg Resolution Time */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/[0.05]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-zinc-400">Avg Time</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {formatTime(head.avgResolutionTime)}
                        </span>
                      </div>

                      {/* Total Resolved */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/[0.05]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-zinc-400">Resolved</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {head.totalResolved}
                        </span>
                      </div>

                      {/* Active Assigned */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/[0.05]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-zinc-400">Active</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {head.activeAssigned}
                        </span>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    {head.totalResolved > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-zinc-500">Performance</span>
                          <span className={`font-medium ${
                            head.avgResolutionTime < 24
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : head.avgResolutionTime < 72
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {head.avgResolutionTime < 24 ? 'Excellent' : head.avgResolutionTime < 72 ? 'Good' : 'Average'}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
