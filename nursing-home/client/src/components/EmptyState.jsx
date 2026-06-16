import { Inbox } from 'lucide-react';

export default function EmptyState({ title = '暂无数据', description = '', action }) {
  return (
    <div className="card p-12 text-center flex flex-col items-center gap-3">
      <Inbox size={40} className="text-gray-300" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
