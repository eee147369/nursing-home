import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = '确认删除', danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-150">
      <div className="card w-full max-w-sm animate-[scaleIn_150ms_ease-out]" role="alertdialog" aria-modal="true" aria-label={title}>
        <div className="px-6 py-5 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onCancel} className="btn btn-secondary flex-1">取消</button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`btn flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
