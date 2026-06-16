import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = '加载失败，请重试', onRetry }) {
  return (
    <div className="card p-12 text-center flex flex-col items-center gap-3">
      <AlertTriangle size={40} className="text-amber-400" aria-hidden="true" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary mt-2">
          <RefreshCw size={16} /> 重试
        </button>
      )}
    </div>
  );
}
