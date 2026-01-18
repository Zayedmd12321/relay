import Link from 'next/link';
import { Query } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface QueryCardProps {
  query: Query;
  onAction?: (query: Query) => void;
  actionLabel?: string;
  actionColor?: 'blue' | 'green' | 'red';
}

export default function QueryCard({ query, onAction, actionLabel, actionColor = 'blue' }: QueryCardProps) {
  const getActionColorClasses = () => {
    switch (actionColor) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link 
            href={`/queries/${query._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
          >
            {query.title}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            Created {formatDate(query.createdAt)}
          </p>
        </div>
        <StatusBadge status={query.status} />
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {query.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex flex-col space-y-1">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Created by:</span> {query.createdBy.name}
          </div>
          {query.assignedTo && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Assigned to:</span> {query.assignedTo.name}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex space-x-2">
          <Link
            href={`/queries/${query._id}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            View Details
          </Link>
          {onAction && actionLabel && (
            <button
              onClick={() => onAction(query)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${getActionColorClasses()}`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
