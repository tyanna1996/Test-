import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Compass,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Compass, label: 'Discover' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subscriptions', icon: CreditCard, label: 'My Subscriptions' },
  { to: '/insights', icon: BarChart3, label: 'Usage & Insights' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        role="navigation"
        aria-label="Main navigation"
        className={[
          'flex flex-col h-full w-60 flex-shrink-0 z-40',
          'bg-bg-secondary border-r border-border',
          /* mobile: slide in/out */
          'fixed top-0 left-0 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-teal text-bg-primary select-none"
              aria-hidden="true"
            >
              A
            </div>
            <span className="text-base font-semibold tracking-tight text-text-primary">
              Audify
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  isActive
                    ? 'nav-link-active'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? 'text-teal' : 'text-text-secondary'}
                    aria-hidden="true"
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="px-4 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-gradient-to-br from-teal to-cyan text-bg-primary select-none"
              aria-hidden="true"
            >
              JD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-text-primary">Jamie Doe</p>
              <p className="text-xs truncate text-text-secondary">jamie@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
