import { Menu, LogOut } from 'lucide-react';

export default function Header({ sidebarCollapsed, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200" role="banner">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost md:hidden"
          aria-label="打开菜单"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">栗庙村养老院智能监护系统</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
          <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-medium" aria-hidden="true">
            管
          </span>
          <span>管理员</span>
        </div>
        <button className="btn btn-ghost text-gray-500" aria-label="退出登录">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
