'use client';

import { useState, FormEvent, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Loader2, Mail, User, Lock, CheckCircle } from 'lucide-react';
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
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      const otpString = newOtp.join('');
      submitOtp(otpString);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      // Auto-submit on paste
      submitOtp(pastedData);
    } else {
      toast.error('Please paste a valid 6-digit OTP');
    }
  };

  const submitOtp = async (otpString: string) => {
    setIsVerifying(true);
    try {
      await verifyOtp(formData.email, otpString);
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-[#09090b] relative overflow-hidden">
      <AuthNavbar />
      
      {/* Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-900/20 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center transform hover:scale-105 transition-transform duration-300">
              <Logo size="lg" showText={false} href={null} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {!showOtpScreen ? "Create your account" : "Verify your email"}
            </h1>
            {!showOtpScreen && (
               <p className="text-slate-500 dark:text-zinc-400 mt-2 text-sm">
                 Join the Relay workspace to collaborate.
               </p>
            )}
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-[0px_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none relative overflow-hidden">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-80" />

            {!showOtpScreen ? (
              /* --- REGISTER FORM --- */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={spring}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
                </motion.button>
              </form>
            ) : (
              /* --- OTP SCREEN --- */
              <div className="space-y-6">
                
                {/* Email Badge - Contextual Helper */}
                <div className="flex flex-col items-center justify-center space-y-3">
                   <p className="text-slate-500 dark:text-zinc-400 text-sm text-center">
                     Enter the code sent to
                   </p>
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 dark:bg-teal-900/20 dark:border-teal-800/50">
                      <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                        {formData.email}
                      </span>
                   </div>
                </div>

                <div>
                  {/* OTP Input Container */}
                  <div className="flex gap-2.5 justify-center my-6">
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isVerifying}
                        className={`
                          w-12 h-14 text-center text-xl font-semibold rounded-xl transition-all duration-200 outline-none
                          ${digit 
                            ? 'border-teal-500 ring-1 ring-teal-500 bg-teal-50/30 text-teal-700 dark:text-teal-300 dark:bg-teal-900/20' 
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100'
                          }
                          border-2 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-zinc-900
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      />
                    ))}
                  </div>
                  
                  {isVerifying ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Verifying code...</span>
                    </motion.div>
                  ) : (
                     <div className="flex items-center justify-between px-1">
                        <button 
                          onClick={() => {
                            setShowOtpScreen(false);
                            setOtp(['', '', '', '', '', '']);
                          }}
                          className="text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                          Change email
                        </button>
                        <button
                          onClick={() => toast.success('OTP resent')}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                        >
                          Resend code
                        </button>
                     </div>
                  )}
                </div>
              </div>
            )}

            {!showOtpScreen && (
              <p className="mt-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* If you have a Footer component, place it here. */}
    </div>
  );
}