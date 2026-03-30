import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

interface Log {
  _id: string;
  action: string;
  details?: string;
  createdAt: string;
}

export default function ActivityFeed({ logs }: { logs: Log[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log, index) => (
        <div key={log._id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center z-10">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            {index !== logs.length - 1 && (
              <div className="w-px h-full bg-muted absolute top-8 left-4 -translate-y-4" />
            )}
          </div>
          <div className="pt-1 pb-4">
            <p className="text-sm font-medium text-card-foreground">{log.action}</p>
            {log.details && (
              <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
