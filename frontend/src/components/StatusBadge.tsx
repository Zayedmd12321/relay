import { QueryStatus } from '@/types';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: QueryStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  // Glow Pill Style - supports both light and dark themes
  const styles = {
    UNASSIGNED: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    REQUESTED: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    ASSIGNED: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    RESOLVED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    DISMANTLED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(239,68,68,0.2)]',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-200',
        styles[status] || 'bg-slate-100 dark:bg-zinc-500/10 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-500/20',
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}