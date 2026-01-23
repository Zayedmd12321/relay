'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { 
  ArrowRight, Users, FileText, 
  CheckCircle2, Shield, Zap, BarChart3, Sun, Moon,
  Check, ChevronRight, Sparkles, Globe
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

// Animation configs with proper typing
const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };
const gentle: Transition = { type: "spring", stiffness: 200, damping: 25 };

// Theme Toggle Button
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={spring}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="w-5 h-5 text-amber-500" />
          </motion.div>
        ) : (
          <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="w-5 h-5 text-slate-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color, delay }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ ...gentle, delay }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:border-teal-400 dark:hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 dark:hover:shadow-teal-500/10"
    >
      <div className={`w-12 h-12 rounded-xl ${colors[color]} border flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Animated Stats
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...spring, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
        {label}
      </div>
    </motion.div>
  );
}

// Glass Card for Animation
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

// Enhanced Ticket Animation - Runs Once
function TicketAnimation() {
  const [step, setStep] = useState(1);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (!hasPlayed) {
      const timers = [
        setTimeout(() => setStep(2), 3000),
        setTimeout(() => setStep(3), 6000),
        setTimeout(() => setStep(4), 9000),
        setTimeout(() => setHasPlayed(true), 12000)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [hasPlayed]);

  return (
    <div className="relative w-full flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ opacity: { duration: 0.6 }, y: { duration: 0.6 } }}
        className="w-full max-w-4xl bg-white dark:bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden flex flex-col h-120 shadow-2xl dark:shadow-none"
      >
        {/* macOS Window Header */}
        <div className="h-11 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50" />
          </div>
          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Support Dashboard
          </span>
          <div className="w-14" />
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-slate-50 dark:bg-linear-to-br dark:from-[#09090b] dark:to-[#09090b] flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Form Submission */}
            {step === 1 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={gentle}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">Step 1: User Submits Query</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Participant creates and submits their issue</p>
                  </div>

                  <GlassCard className="p-4">
                    <label className="text-[10px] uppercase tracking-wider font-medium text-slate-500 dark:text-zinc-600 mb-2 block">
                      Title
                    </label>
                    <div className="text-sm text-slate-700 dark:text-zinc-200">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                        className="inline-block overflow-hidden whitespace-nowrap"
                      >
                        Production API timeout issues
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-0.5 h-4 bg-teal-500 ml-1"
                      />
                    </div>
                  </GlassCard>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="w-full h-11 rounded-lg bg-teal-600 text-white font-medium text-sm"
                  >
                    Submit Query
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Query Submitted (UNASSIGNED) */}
            {step === 2 && (
              <motion.div
                key="unassigned"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={gentle}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">Step 2: Query Submitted</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Waiting for admin to assign to team head</p>
                  </div>
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Alice Chen</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-600 uppercase tracking-wider">Participant</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <span className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Unassigned</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">Production API timeout issues</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Experiencing 500ms+ response times in US-East</p>
                  </GlassCard>
                  
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500 dark:text-zinc-500">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    Awaiting admin assignment...
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Admin Assigns */}
            {step === 3 && (
              <motion.div
                key="assigned"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={gentle}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">Step 3: Assigned to Team Head</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Admin assigns query to appropriate team head</p>
                  </div>
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Alice Chen</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-600 uppercase tracking-wider">Participant</p>
                        </div>
                      </div>
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={spring} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                        <span className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Assigned</span>
                      </motion.div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">Production API timeout issues</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Experiencing 500ms+ response times in US-East</p>
                  </GlassCard>

                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...gentle, delay: 0.2 }}>
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                        <div className="flex-1">
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-0.5">Mike (Admin) assigned to</p>
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-md px-2 py-1 border border-slate-200 dark:border-white/10">
                            <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center text-white text-[9px] font-bold">R</div>
                            <span className="text-xs text-slate-900 dark:text-zinc-100 font-medium">Robert Kim</span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-600 uppercase">Team Head</span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Team Head Resolves */}
            {step === 4 && (
              <motion.div
                key="resolved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={gentle}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="w-full max-w-md space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1">Step 4: Team Head Replies & Resolves</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">Team head provides solution and marks as resolved</p>
                  </div>
                  <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">A</div>
                        <span className="text-xs text-slate-600 dark:text-zinc-400">Alice Chen</span>
                      </div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.3 }} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Resolved</span>
                      </motion.div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1">Production API timeout issues</h4>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-600">Assigned to Robert Kim</p>
                  </GlassCard>

                  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={gentle}>
                    <GlassCard className="p-5 relative">
                      <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-emerald-500 to-emerald-600 rounded-l-xl" />
                      
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-teal-900/50">R</div>
                        <div>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Robert Kim</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-600 uppercase tracking-wider">Team Head • Official Resolution</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-3">
                        Issue identified - load balancer misconfiguration. Restarted service and latency dropped to &lt;20ms.
                      </p>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-1.5 text-[10px] text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                        Email sent to Alice
                      </motion.div>
                    </GlassCard>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Main Page Component
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] transition-colors duration-300">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#09090b] to-[#09090b]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 dark:bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Relay" width={40} height={40} className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-zinc-100">Relay</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link 
              href="/login" 
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
              <Link 
                href="/register" 
                className="px-5 py-2.5 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...gentle, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
              >
                <span className="text-slate-900 dark:text-white">Resolve queries</span>
                <br />
                <span className="bg-linear-to-r from-teal-600 via-cyan-600 to-sky-600 dark:from-teal-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent">
                  10x faster
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...gentle, delay: 0.3 }}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Streamline your internal support with intelligent routing, real-time tracking, 
                and role-based workflows. From submission to resolution, all in one place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...gentle, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-semibold text-lg border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    View Demo
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-2">
                  {['bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-emerald-500'].map((bg, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">2,500+</span> teams trust us
                </div>
              </motion.div>
            </div>

            {/* Right - Ticket Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...gentle, delay: 0.3 }}
              className="relative"
            >
              <TicketAnimation />
              <div className="absolute -inset-4 bg-linear-to-r from-teal-600/20 to-cyan-600/20 rounded-3xl blur-3xl opacity-30 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="~12m" label="Avg Response" delay={0} />
            <StatCard value="98%" label="Resolution Rate" delay={0.1} />
            <StatCard value="50K+" label="Queries Resolved" delay={0.2} />
            <StatCard value="24/7" label="Availability" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={gentle}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to manage support
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built for teams who need reliable, fast, and organized query management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FileText}
              title="Structured Forms"
              description="Capture all details upfront with customizable query templates"
              color="teal"
              delay={0}
            />
            <FeatureCard
              icon={Users}
              title="Smart Routing"
              description="Automatically dispatch queries to the right team members"
              color="cyan"
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Fine-grained permissions for participants, admins, and heads"
              color="amber"
              delay={0.2}
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Resolution Tracking"
              description="Track every query from creation to official resolution"
              color="emerald"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={gentle}
            className="relative p-12 md:p-16 rounded-3xl bg-linear-to-br from-teal-600 to-cyan-600 text-center overflow-hidden"
          >
            {/* Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500/20 blur-3xl rounded-full" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to streamline your support?
              </h2>
              <p className="text-teal-100 mb-8 max-w-xl mx-auto">
                Join thousands of teams using Relay to resolve issues faster
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={spring}>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  Get Started Free
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Globe className="w-4 h-4" />
            <span className="text-sm">© 2026 Relay. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}