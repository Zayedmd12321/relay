'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { motion, type Transition } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthNavbar from '@/components/AuthNavbar';
import Logo from '@/components/Logo';

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

export default function RegisterPage() {
  const { register, verifyOtp } = useAuth();
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
    <>
      <AuthNavbar />
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 dark:from-[#09090b] dark:via-[#09090b] dark:to-[#09090b] relative overflow-hidden py-12 transition-colors">
        {/* Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/20 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-teal-500/5 to-cyan-500/5 dark:from-teal-500/5 dark:to-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="max-w-md w-full relative z-10 px-6"
      >
        {!showOtpScreen ? (
          <>
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <Logo size="lg" showText={false} href={null} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">Create Account</h1>
              <p className="text-slate-500 dark:text-zinc-400 mt-2">Join the Relay workspace</p>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                    placeholder="name@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
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

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl mb-4 shadow-lg">
                <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">Verify Your Email</h1>
              <p className="text-slate-500 dark:text-zinc-400 mt-2">We've sent a 6-digit OTP to<br /><strong className="text-slate-900 dark:text-zinc-100">{formData.email}</strong></p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 shadow-xl dark:shadow-2xl">
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 text-center">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 dark:focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-center text-2xl font-bold tracking-[0.5em]"
                    placeholder="000000"
                  />
                  <p className="text-xs text-slate-500 dark:text-zinc-400 text-center mt-2">OTP is valid for 10 minutes</p>
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

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-zinc-400">
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
    </>
  );
}