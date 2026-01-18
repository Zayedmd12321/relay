'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { Query } from '@/types';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ArrowLeft, User, Mail, Calendar, CheckCircle, AlertCircle, X, Shield, Lock, MessageSquare, RefreshCw, Users } from 'lucide-react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

interface TeamHead {
  _id: string;
  name: string;
  email: string;
  assignedUnansweredCount: number;
}

export default function QueryDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const queryId = params.id as string;
  const [query, setQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDismantleModal, setShowDismantleModal] = useState(false);
  const [answer, setAnswer] = useState('');
  const [dismantleReason, setDismantleReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teamHeads, setTeamHeads] = useState<TeamHead[]>([]);
  const [selectedTeamHead, setSelectedTeamHead] = useState('');

  useEffect(() => { 
    if (queryId && user) {
      fetchQuery();
      if (user.role === 'Admin') fetchTeamHeads();
    }
  }, [queryId, user]);

  const fetchQuery = async () => {
    try {
      const res = await axiosInstance.get(`/queries/${queryId}`);
      setQuery(res.data.data.query);
    } catch(e) { 
      toast.error("Failed to load query"); 
      router.push('/dashboard');
    } finally { 
      setLoading(false); 
    }
  };

  const fetchTeamHeads = async () => {
    try {
      const res = await axiosInstance.get('/auth/team-heads');
      setTeamHeads(res.data.data.teamHeads);
    } catch (e) {
      console.error('Failed to load team heads');
    }
  };

  const handleResolve = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosInstance.patch(`/queries/${queryId}/answer`, { answer });
      if (res.data.success) {
        toast.success('Query resolved successfully');
        setShowAnswerModal(false);
        setAnswer('');
        fetchQuery();
      }
    } catch (e) {
      toast.error('Failed to resolve query');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismantle = async () => {
    if (!dismantleReason.trim()) {
      toast.error('Please provide a reason for dismantling');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosInstance.patch(`/queries/${queryId}/dismantle`, { reason: dismantleReason });
      if (res.data.success) {
        toast.success('Query dismantled');
        setShowDismantleModal(false);
        setDismantleReason('');
        fetchQuery();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to dismantle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedTeamHead) {
      toast.error('Please select a team head');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosInstance.patch(`/queries/${queryId}/reassign`, { 
        teamHeadId: selectedTeamHead 
      });
      if (res.data.success) {
        toast.success('Query reassigned successfully');
        setShowReassignModal(false);
        setSelectedTeamHead('');
        fetchQuery();
        fetchTeamHeads();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reassign query');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user can take actions on this query
  const canResolve = (user?.role === 'Team_Head' && 
                     query?.assignedTo?._id?.toString() === user.id?.toString() && 
                     query?.status === 'ASSIGNED') ||
                     (user?.role === 'Admin' && query?.status === 'ASSIGNED');
  
  const canDismantle = ((user?.role === 'Team_Head' && 
                       query?.assignedTo?._id?.toString() === user.id?.toString() && 
                       query?.status === 'ASSIGNED') ||
                       (user?.role === 'Admin' && query?.status === 'ASSIGNED'));

  const canReassign = user?.role === 'Admin' && query?.status === 'ASSIGNED';

  if (loading || !query) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 dark:text-slate-400">Loading query...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={spring}
          onClick={() => router.push('/dashboard')} 
          className="group flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Query Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-none">
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{query.title}</h1>
                <StatusBadge status={query.status} />
              </div>
              
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{query.description}</p>
              </div>

              {/* Answer Section */}
              {query.answer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="mt-8 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-6"
                >
                  <h3 className="flex items-center text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
                    <CheckCircle className="w-4 h-4 mr-2" /> Official Resolution
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{query.answer}</p>
                  {query.resolvedBy && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-4">
                      Resolved by {query.resolvedBy.name} ({query.resolvedBy.role})
                    </p>
                  )}
                </motion.div>
              )}

              {/* Dismantle Reason Section */}
              {query.status === 'DISMANTLED' && query.dismantledReason && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                  className="mt-8 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6"
                >
                  <h3 className="flex items-center text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
                    <AlertCircle className="w-4 h-4 mr-2" /> Dismantled
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{query.dismantledReason}</p>
                </motion.div>
              )}
            </div>

            {/* Actions - For Team Head and Admin */}
            {((user?.role === 'Team_Head' && query.status === 'ASSIGNED') || 
              (user?.role === 'Admin' && query.status === 'ASSIGNED')) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-500" />
                  {user?.role === 'Admin' ? 'Admin Actions' : 'Team Head Actions'}
                </h3>
                
                {canResolve ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={spring}
                        onClick={() => setShowAnswerModal(true)}
                        className="flex-1 px-4 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve Query
                      </motion.button>
                      {canDismantle && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={spring}
                          onClick={() => setShowDismantleModal(true)}
                          className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-all flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Dismantle
                        </motion.button>
                      )}
                    </div>
                    
                    {canReassign && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={spring}
                        onClick={() => setShowReassignModal(true)}
                        className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reassign to Another Team Head
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-400">
                    <Lock className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">This query is not assigned to you</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Only the assigned Team Head can resolve this query</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* View Only Notice for Participants */}
            {user?.role === 'Participant' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.1 }}
                className="bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3"
              >
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You can view this query. Resolution will be provided by the assigned Team Head.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column: Metadata */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Meta Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl"><User className="w-4 h-4 text-slate-500 dark:text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Created By</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{query.createdBy.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{query.createdBy.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl"><Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" /></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Created On</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{format(new Date(query.createdAt), 'PPP')}</p>
                  </div>
                </div>

                {query.assignedTo && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 rounded-xl"><User className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">Assigned To</p>
                      <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{query.assignedTo.name}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400">Team Head</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Answer Modal */}
      <AnimatePresence>
        {showAnswerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resolve Query</h2>
                <button onClick={() => setShowAnswerModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Query Title</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{query.title}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Resolution</label>
                  <textarea 
                    rows={5} 
                    value={answer} 
                    onChange={e => setAnswer(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    placeholder="Provide the official resolution for this query..." 
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowAnswerModal(false)} 
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResolve}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                  >
                    {submitting ? 'Resolving...' : 'Submit Resolution'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassign Modal */}
      <AnimatePresence>
        {showReassignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                    Reassign Query
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a new team head for this query</p>
                </div>
                <button onClick={() => setShowReassignModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Current Assignment</p>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{query?.assignedTo?.name || 'Unassigned'}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Select New Team Head</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {teamHeads.map((head) => (
                      <label
                        key={head._id}
                        className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedTeamHead === head._id
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="teamHead"
                          value={head._id}
                          checked={selectedTeamHead === head._id}
                          onChange={(e) => setSelectedTeamHead(e.target.value)}
                          className="text-teal-600 focus:ring-teal-500"
                          disabled={query?.assignedTo?._id === head._id}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{head.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{head.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Active Queries</p>
                          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{head.assignedUnansweredCount}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowReassignModal(false)} 
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReassign}
                    disabled={submitting || !selectedTeamHead}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismantle Modal */}
      <AnimatePresence>
        {showDismantleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Dismantle Query
                </h2>
                <button onClick={() => setShowDismantleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
                <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Query Title</p>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">{query.title}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Reason for Dismantling <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={4} 
                    value={dismantleReason} 
                    onChange={e => setDismantleReason(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 dark:focus:border-red-500 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                    placeholder="Explain why this query is being dismantled..." 
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This reason will be visible to the query creator</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowDismantleModal(false);
                      setDismantleReason('');
                    }} 
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDismantle}
                    disabled={submitting || !dismantleReason.trim()}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Dismantling...' : 'Confirm Dismantle'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}