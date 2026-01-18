'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, LayoutDashboard, Sun, Moon, Shield, Bell } from 'lucide-react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import { Notification } from '@/types';

const spring: Transition = { type: "spring", stiffness: 400, damping: 30 };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Team_Head')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
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
    // Optimistic UI: Mark as read immediately
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications(prev => prev.map(n => 
      n._id === notification._id ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => notification.isRead ? prev : Math.max(0, prev - 1));
    setShowNotifications(false);
    
    // Navigate immediately
    router.push(`/queries/${notification.query._id}`);
    
    try {
      // Update in background
      await axios.patch(`/notifications/${notification._id}/read`);
      // Refresh to get accurate data
      await fetchNotifications();
    } catch (error) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI: Mark all as read immediately
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    try {
      await axios.patch('/notifications/read-all');
      // Refresh to get accurate data
      await fetchNotifications();
    } catch (error) {
      // Revert on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      console.error('Error marking all as read:', error);
    }
  };

  if (!user) return null;

  const showNotificationBell = user.role === 'Admin' || user.role === 'Team_Head';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="Relay" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Relay</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === '/dashboard'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {user?.role === 'Admin' && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            {showNotificationBell && (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                !notification.isRead ? 'bg-teal-50 dark:bg-teal-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${!notification.isRead ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-900 dark:text-white font-medium mb-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
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

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
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

            {/* User Info */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}