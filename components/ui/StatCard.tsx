import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'emerald' | 'cyan' | 'indigo' | 'rose' | 'amber';
}

const colorMap = {
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-background backdrop-blur-xl border border-border p-6 rounded-2xl flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-border hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${colorMap[color].split(' ')[1].replace('text-', 'bg-')}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">from last month</span>
        </div>
      )}
    </div>
  );
}
