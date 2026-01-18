'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { Loader2, MessageSquare, Sun, Moon, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import toast from 'react-hot-toast';

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

export default function RegisterPage() {
  const { register, verifyOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, 'Participant');
      setShowOtpScreen(true);
      toast.success('Registration successful! Please check your email for OTP.');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifying(true);
    try {
      await verifyOtp(formData.email, otp);
      // Success handled in context (redirects to dashboard)
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden py-12 transition-colors">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/20 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
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
      </div>

      {/* Back Link */}
      <Link href="/" className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="max-w-md w-full relative z-10 px-6"
      >
        {!showOtpScreen ? (
          <>
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-linear-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <MessageSquare className="w-6 h-6 text-white" fill="currentColor" />
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Join the workspace</p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={spring}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-4">
                <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Email</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">We've sent a 6-digit OTP to<br /><strong>{formData.email}</strong></p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="000000"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">OTP is valid for 10 minutes</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={spring}
                  type="submit"
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => toast.success('OTP resent to your email')}
                  className="w-full text-sm text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Wrong email?{' '}
                <button onClick={() => setShowOtpScreen(false)} className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition-colors">
                  Go back
                </button>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}