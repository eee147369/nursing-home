import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserRound, ClipboardList, HeartHandshake, Settings, ChevronLeft, Menu,
} from 'lucide-react';

const links = [
  { to: '/', label: '首页仪表盘', icon: LayoutDashboard, end: true },
  { to: '/nurses', label: '护工管理', icon: UserRound },
  { to: '/relatives', label: '亲属与老人', icon: Users },
  { to: '/orders', label: '订单管理', icon: ClipboardList },
  { to: '/projects', label: '护理项目', icon: HeartHandshake },
  { to: '/settings', label: '管理员设置', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-60'
      }`}
      aria-label="主导航"
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-3 border-b border-gray-100 flex-shrink-0">
        {!collapsed && (
          <span className="text-base font-semibold text-gray-900 truncate">
            养老院监护系统
          </span>
        )}
        <button
          onClick={onToggle}
          className="sidebar-link ml-auto flex-shrink-0"
          aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" role="navigation">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">栗庙村养老院 v1.0</p>
        </div>
      )}
    </aside>
  );
}
