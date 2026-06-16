import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';

export default function Layout({ children, toast, onClearToast }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`transition-all duration-200 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-60'}`}>
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main id="main-content" className="p-4 md:p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 safe-bottom" role="status" aria-live="polite">
          <Toast message={toast.message} type={toast.type} onClose={onClearToast} />
        </div>
      )}
    </div>
  );
}
