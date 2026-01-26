'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Sun, Moon, Shield, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import { Notification } from '@/types';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Team_Head')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    const previousNotifications = [...notifications];
    
    setNotifications(prev => prev.map(n => 
      n._id === notification._id ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => notification.isRead ? prev : Math.max(0, prev - 1));
    setShowNotifications(false);
    
    router.push(`/queries/${notification.query._id}`);
    
    try {
      await axios.patch(`/notifications/${notification._id}/read`);
      await fetchNotifications();
    } catch (error) {
      setNotifications(previousNotifications);
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await axios.patch('/notifications/read-all');
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!user) return null;

  const showNotificationBell = user.role === 'Admin' || user.role === 'Team_Head';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand */}
          <Logo size="sm" showText={true} href="/" />

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/[0.02] p-1.5 rounded-full border border-slate-200/50 dark:border-white/[0.08]">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                pathname === '/dashboard'
                  ? 'bg-white dark:bg-white/[0.05] text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {user?.role === 'Admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  pathname === '/admin'
                    ? 'bg-white dark:bg-white/[0.05] text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {showNotificationBell && (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05] dark:text-zinc-400 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#09090b]" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-white/[0.03] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden ring-1 ring-slate-900/5"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 border-b border-slate-50 dark:border-white/[0.08] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                                !notification.isRead ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-teal-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                                <div>
                                  <p className="text-sm text-slate-900 dark:text-zinc-100 leading-snug">{notification.message}</p>
                                  <p className="text-xs text-slate-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08] mx-1" />

            <div className="flex items-center gap-3 pl-1">
               <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05] dark:text-zinc-400 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-slate-900 dark:text-zinc-100">{user.name}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400">{user.role.replace('_', ' ')}</div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}