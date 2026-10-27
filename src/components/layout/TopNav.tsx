import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { notifications } from '../../data/services';

const NAV_ITEMS = [
  { to: '/',              label: 'Discover',        end: true },
  { to: '/dashboard',     label: 'Dashboard',       end: false },
  { to: '/subscriptions', label: 'My Subscriptions', end: false },
  { to: '/insights',      label: 'Insights',        end: false },
];

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread   = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { setNotifOpen(false); setMobileOpen(false); } }
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('keydown', onKey);
    if (notifOpen) document.addEventListener('mousedown', onClickOutside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOutside); };
  }, [notifOpen]);

  const linkStyle = (isActive: boolean) => ({
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? '#0A0AFF' : '#6B7280',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 999,
    background: isActive ? '#E8E8FF' : 'transparent',
    transition: 'all 150ms',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <>
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #F0F0F0',
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center',
          height: 60, padding: '0 20px', gap: 12,
        }}
        role="banner"
      >
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.06em', color: '#0A0A0A' }}>
            MO<span style={{ color: '#0A0AFF' }}>N</span>O
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav
          className="hidden sm:flex items-center gap-0.5"
          style={{ marginLeft: 16 }}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => linkStyle(isActive)}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
              aria-expanded={notifOpen}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: notifOpen ? '#F3F4F6' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', color: '#6B7280',
              }}
            >
              <Bell size={17} strokeWidth={1.8} />
              {unread > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#0A0AFF', border: '1.5px solid #FFF',
                  }}
                />
              )}
            </button>

            {notifOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                style={{
                  position: 'absolute', right: 0, top: 44,
                  width: 300, borderRadius: 16,
                  background: '#FFF', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid #F0F0F0', overflow: 'hidden', zIndex: 50,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A' }}>Notifications</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{unread} unread</span>
                </div>
                <ul style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 0' }}>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      style={{
                        padding: '10px 16px', display: 'flex', gap: 10,
                        background: n.read ? 'transparent' : '#F8F8FF',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? '#E5E7EB' : '#0A0AFF', flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <p style={{ fontSize: 12, color: n.read ? '#6B7280' : '#0A0A0A', lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0A0AFF, #6200EE)',
              color: '#FFF', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', userSelect: 'none',
            }}
            aria-label="Account"
            role="button"
            tabIndex={0}
          >
            JD
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          style={{
            position: 'fixed', top: 60, left: 0, right: 0, zIndex: 39,
            background: '#FFF', borderBottom: '1px solid #F0F0F0',
            padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 2,
          }}
        >
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                ...linkStyle(isActive),
                display: 'block',
                padding: '10px 14px',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
