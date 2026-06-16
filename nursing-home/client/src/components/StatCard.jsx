import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, color = 'blue' }) {
  const borders = {
    blue: 'border-l-brand-500',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    purple: 'border-l-purple-500',
  };
  const bgs = {
    blue: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className={`card p-5 border-l-4 ${borders[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          {trend !== undefined && (
            <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              {trend >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
              <span>{Math.abs(trend)}% 较上月</span>
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgs[color]}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
