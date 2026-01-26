'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Query } from '@/types';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Search, ChevronRight, UserPlus, FileText, Filter, LayoutGrid, List, X, CheckCircle2, BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface TeamHead {
  _id: string;
  name: string;
  email: string;
  assignedUnansweredCount: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [createForm, setCreateForm] = useState({ title: '', description: '' });
  const [teamHeads, setTeamHeads] = useState<TeamHead[]>([]);
  const [selectedTeamHead, setSelectedTeamHead] = useState<string>('');
  const [loadingTeamHeads, setLoadingTeamHeads] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!authLoading && user) fetchQueries();
  }, [user, authLoading, currentPage, itemsPerPage, statusFilter, debouncedSearchQuery]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });
      
      const res = await axiosInstance.get(`/queries?${params.toString()}`);
      if (res.data.success) {
        setQueries(res.data.data.queries);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Optimistic UI: Create temporary query
    const tempQuery: Query = {
      _id: 'temp-' + Date.now(),
      title: createForm.title,
      description: createForm.description,
      status: 'UNASSIGNED',
      createdBy: {
        _id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Show immediately in UI
    setQueries(prev => [tempQuery, ...prev]);
    setShowCreateModal(false);
    toast.success('Query created');
    setCreateForm({ title: '', description: '' });
    
    try {
      const res = await axiosInstance.post('/queries', createForm);
      if (res.data.success) {
        // Replace temp query with real one from server
        setQueries(prev => prev.map(q => 
          q._id === tempQuery._id ? res.data.data.query : q
        ));
      }
    } catch (e) {
      // Revert on error
      setQueries(prev => prev.filter(q => q._id !== tempQuery._id));
      toast.error('Failed to create query. Please try again.');
    }
  };

  const fetchTeamHeads = async () => {
    try {
      setLoadingTeamHeads(true);
      const res = await axiosInstance.get('/auth/team-heads');
      if (res.data.success) {
        setTeamHeads(res.data.data.teamHeads);
      }
    } catch (error) {
      toast.error('Failed to load team heads');
    } finally {
      setLoadingTeamHeads(false);
    }
  };

  const openAssignModal = (query: Query) => {
    setSelectedQuery(query);
    setSelectedTeamHead('');
    setShowAssignModal(true);
    fetchTeamHeads();
  };

  const handleAssign = async () => {
    if (!selectedQuery || !selectedTeamHead) {
      toast.error('Please select a Team Head');
      return;
    }
    
    const selectedHead = teamHeads.find(th => th._id === selectedTeamHead);
    if (!selectedHead) return;
    
    // Optimistic UI: Update query immediately
    const previousQueries = [...queries];
    setQueries(prev => prev.map(q => 
      q._id === selectedQuery._id 
        ? { 
            ...q, 
            status: 'ASSIGNED' as const,
            assignedTo: {
              _id: selectedHead._id,
              name: selectedHead.name,
              email: selectedHead.email,
              role: 'Team_Head' as const,
            }
          } 
        : q
    ));
    
    setShowAssignModal(false);
    setSelectedTeamHead('');
    toast.success('Assigned successfully');
    
    try {
      const res = await axiosInstance.patch(`/queries/${selectedQuery._id}/assign`, { teamHeadId: selectedTeamHead });
      if (res.data.success) {
        // Update with server response
        setQueries(prev => prev.map(q => 
          q._id === selectedQuery._id ? res.data.data.query : q
        ));
      }
    } catch (e) {
      // Revert on error
      setQueries(previousQueries);
      toast.error('Failed to assign. Please try again.');
    }
  };

  const openResolveModal = (query: Query) => {
    setSelectedQuery(query);
    setAnswer('');
    setShowResolveModal(true);
  };

  const handleResolve = async () => {
    if (!selectedQuery || !answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }
    setSubmitting(true);
    
    // Optimistic UI: Update query immediately
    const previousQueries = [...queries];
    setQueries(prev => prev.map(q => 
      q._id === selectedQuery._id 
        ? { 
            ...q, 
            status: 'RESOLVED' as const,
            answer: answer,
            resolvedBy: {
              _id: user!.id,
              name: user!.name,
              email: user!.email,
              role: user!.role,
            }
          } 
        : q
    ));
    
    setShowResolveModal(false);
    setAnswer('');
    toast.success('Query resolved successfully');
    setSubmitting(false);
    
    try {
      const res = await axiosInstance.patch(`/queries/${selectedQuery._id}/answer`, { answer });
      if (res.data.success) {
        // Update with server response
        setQueries(prev => prev.map(q => 
          q._id === selectedQuery._id ? res.data.data.query : q
        ));
      }
    } catch (e) {
      // Revert on error
      setQueries(previousQueries);
      toast.error('Failed to resolve query. Please try again.');
    }
  };

  const handleDismantle = async (query: Query) => {
    if (!confirm(`Are you sure you want to dismantle "${query.title}"?`)) return;
    try {
      const res = await axiosInstance.patch(`/queries/${query._id}/dismantle`);
      if (res.data.success) {
        toast.success('Query dismantled');
        fetchQueries();
      }
    } catch (e) {
      toast.error('Failed to dismantle');
    }
  };

  const handleRequest = async (query: Query) => {
    if (!confirm(`Request to be assigned "${query.title}"?`)) return;
    
    // Optimistic UI: Update query immediately
    const previousQueries = [...queries];
    setQueries(prev => prev.map(q => 
      q._id === query._id 
        ? { 
            ...q, 
            status: 'ASSIGNED' as const,
            assignedTo: {
              _id: user!.id,
              name: user!.name,
              email: user!.email,
              role: user!.role,
            }
          } 
        : q
    ));
    
    toast.success('Query assigned to you!');
    
    try {
      const res = await axiosInstance.patch(`/queries/${query._id}/request`);
      if (res.data.success) {
        // Update with server response
        setQueries(prev => prev.map(q => 
          q._id === query._id ? res.data.data.query : q
        ));
      }
    } catch (e: any) {
      // Revert on error
      setQueries(previousQueries);
      toast.error(e.response?.data?.message || 'Failed to request query. Please try again.');
    }
  };

  // No need for client-side filtering anymore - backend handles it
  const filteredQueries = queries;

  // Stats
  const stats = {
    total: totalCount,
    unassigned: queries.filter(q => q.status === 'UNASSIGNED').length,
    assigned: queries.filter(q => q.status === 'ASSIGNED').length,
    resolved: queries.filter(q => q.status === 'RESOLVED').length,
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200 transition-colors relative">
      {/* Radial gradient overlay - dark mode only */}
      <div className="hidden dark:block fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#09090b] to-[#09090b] pointer-events-none" />
      
      <div className="relative z-10">
        <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
              {user.role === 'Admin' ? 'Relay Console' : user.role === 'Team_Head' ? 'Assigned Tasks' : 'My Queries'}
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">
              {user.role === 'Admin' ? 'Assign and manage all queries' : 
               user.role === 'Team_Head' ? 'View all queries • Resolve assigned ones' : 
               'View all queries • Create new tickets'}
            </p>
          </div>
          
          {user.role === 'Participant' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              <Plus className="w-4 h-4" />
              New Query
            </motion.button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Queries', value: stats.total, color: 'indigo' },
            { label: 'Unassigned', value: stats.unassigned, color: 'amber' },
            { label: 'In Progress', value: stats.assigned, color: 'blue' },
            { label: 'Resolved', value: stats.resolved, color: 'emerald' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.1 }}
              className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all duration-300"
            >
              <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-medium mb-2">{stat.label}</p>
              <p className="text-3xl font-light text-slate-900 dark:text-zinc-100 font-sans">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Data Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
        >
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={statusFilter} 
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="UNASSIGNED">Unassigned</option>
                <option value="REQUESTED">Requested</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMANTLED">Dismantled</option>
              </select>
              {(searchQuery || statusFilter !== 'ALL') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right min-w-[200px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-zinc-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading queries...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                        <span>No queries found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q) => (
                    <motion.tr 
                      key={q._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => router.push(`/queries/${q._id}`)}
                      className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors duration-200 cursor-pointer border-t border-slate-100 dark:border-white/[0.05]"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{q.title}</div>
                        <div className="text-slate-500 dark:text-zinc-500 text-xs truncate max-w-64 mt-0.5">{q.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs text-white font-medium">
                            {q.createdBy.name[0]}
                          </div>
                          <span className="text-slate-700 dark:text-zinc-300">{q.createdBy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {q.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                              {q.assignedTo.name[0]}
                            </div>
                            <span className="text-slate-700 dark:text-zinc-300">{q.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 tabular-nums">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {/* Admin Actions */}
                          {user.role === 'Admin' && (q.status === 'UNASSIGNED' || q.status === 'REQUESTED') && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={spring}
                              onClick={() => openAssignModal(q)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                q.status === 'REQUESTED'
                                  ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5" /> {q.status === 'REQUESTED' ? 'Approve' : 'Assign'}
                            </motion.button>
                          )}

                          {/* Team Head Actions */}
                          {user.role === 'Team_Head' && (
                            <>
                              {/* Request button for unassigned queries */}
                              {q.status === 'UNASSIGNED' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={spring}
                                  onClick={() => handleRequest(q)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium border border-purple-500/20 transition-all"
                                >
                                  <UserPlus className="w-3.5 h-3.5" /> Request
                                </motion.button>
                              )}
                              {/* Resolve and Dismantle buttons for assigned queries */}
                              {q.assignedTo?._id?.toString() === user.id?.toString() && q.status === 'ASSIGNED' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={spring}
                                    onClick={() => openResolveModal(q)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20 transition-all"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={spring}
                                    onClick={() => handleDismantle(q)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium border border-red-500/20 transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" /> Dismantle
                                  </motion.button>
                                </>
                              )}
                            </>
                          )}

                          {/* View Details Icon */}
                          <button onClick={() => router.push(`/queries/${q._id}`)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-zinc-400">
              <span>
                Showing {queries.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} queries
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Submit New Query</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400 dark:text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    required 
                    value={createForm.title} 
                    onChange={e => setCreateForm({...createForm, title: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all" 
                    placeholder="Brief summary of issue" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={createForm.description} 
                    onChange={e => setCreateForm({...createForm, description: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all" 
                    placeholder="Detailed explanation..." 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition">Cancel</button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition shadow-lg shadow-blue-500/25"
                  >
                    Submit Ticket
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Assign to Team Head</h2>
                  <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Select a Team Head to assign this query</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400 dark:text-zinc-400" />
                </button>
              </div>

              {selectedQuery && (
                <>
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Query</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{selectedQuery.title}</p>
                  </div>
                  {selectedQuery.status === 'REQUESTED' && selectedQuery.requestedBy && (
                    <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-lg">
                      <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1.5">Requested by</p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-medium">
                          {selectedQuery.requestedBy.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-900 dark:text-purple-300">{selectedQuery.requestedBy.name}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">{selectedQuery.requestedBy.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6">
                {loadingTeamHeads ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : teamHeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-zinc-500">
                    <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No Team Heads available</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {teamHeads.map((head) => (
                      <motion.button
                        key={head._id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTeamHead(head._id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedTeamHead === head._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                            : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] bg-slate-50 dark:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                              selectedTeamHead === head._id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                            }`}>
                              {head.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-medium ${
                                selectedTeamHead === head._id
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-slate-900 dark:text-zinc-100'
                              }`}>
                                {head.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-500">{head.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              head.assignedUnansweredCount === 0
                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20'
                                : head.assignedUnansweredCount <= 2
                                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20'
                                : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20'
                            }`}>
                              {head.assignedUnansweredCount} active
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
                >
                  Cancel
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAssign}
                  disabled={!selectedTeamHead}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Query
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resolve Modal */}
      <AnimatePresence>
        {showResolveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Resolve Query</h2>
                  <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">Provide a solution to this query</p>
                </div>
                <button onClick={() => setShowResolveModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400 dark:text-zinc-400" />
                </button>
              </div>

              {selectedQuery && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Query</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-2">{selectedQuery.title}</p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">{selectedQuery.description}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none transition-all"
                  placeholder="Provide a detailed solution to resolve this query..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResolve}
                  disabled={submitting || !answer.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Resolved
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}