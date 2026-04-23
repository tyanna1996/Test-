import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Compass,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subscriptions', icon: CreditCard, label: 'My Subscriptions' },
  { to: '/insights', icon: BarChart3, label: 'Usage & Insights' },
  { to: '/discover', icon: Compass, label: 'Discover' },
];

export default function Sidebar() {
  return (
    <aside
      style={{ backgroundColor: '#161b27', borderRight: '1px solid #252d42' }}
      className="w-60 flex-shrink-0 flex flex-col h-full"
    >
      <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: '1px solid #252d42' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: '#00d4aa', color: '#0f1117' }}
        >
          A
        </div>
        <span className="text-base font-semibold tracking-tight" style={{ color: '#e8eaf0' }}>
          Audify
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-teal bg-teal-dim'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { color: '#00d4aa', backgroundColor: 'rgba(0,212,170,0.12)' }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  style={{ color: isActive ? '#00d4aa' : undefined }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4" style={{ borderTop: '1px solid #252d42' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #0099cc 100%)', color: '#0f1117' }}
          >
            JD
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#e8eaf0' }}>
              Jamie Doe
            </p>
            <p className="text-xs truncate" style={{ color: '#8892a4' }}>
              jamie@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
