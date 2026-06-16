import { CheckCircle, AlertCircle, X } from 'lucide-react';

const variants = {
  success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: CheckCircle },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: AlertCircle },
};

export default function Toast({ message, type = 'success', onClose }) {
  const v = variants[type] || variants.success;
  const Icon = v.icon;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${v.bg} ${v.text} shadow-lg animate-[slideUp_200ms_ease-out] text-sm font-medium`}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100" aria-label="关闭提示">
        <X size={16} />
      </button>
    </div>
  );
}
