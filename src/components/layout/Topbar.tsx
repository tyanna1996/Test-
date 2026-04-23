import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { notifications } from '../../data/services';
import type { Notification } from '../../types';

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const typeColors: Record<Notification['type'], string> = {
    trial: '#ef4444',
    billing: '#f59e0b',
    new: '#00d4aa',
    usage: '#8b5cf6',
  };

  return (
    <div
      className="absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50"
      style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #252d42' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
          Notifications
        </h3>
        <button onClick={onClose} style={{ color: '#8892a4' }} className="hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="py-1 max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="px-4 py-3 flex gap-3 items-start hover:bg-bg-hover transition-colors cursor-pointer"
            style={{ backgroundColor: n.read ? 'transparent' : 'rgba(0,212,170,0.04)' }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: n.read ? 'transparent' : typeColors[n.type] }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed" style={{ color: n.read ? '#8892a4' : '#e8eaf0' }}>
                {n.message}
              </p>
              <p className="text-xs mt-1" style={{ color: '#4a5568' }}>
                {n.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ backgroundColor: '#161b27', borderBottom: '1px solid #252d42' }}
    >
      <div />

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative"
            style={{ color: '#8892a4' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a2035')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Bell size={17} strokeWidth={1.8} />
            {unread > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#00d4aa' }}
              />
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #00d4aa 0%, #0099cc 100%)', color: '#0f1117' }}
        >
          JD
        </div>
      </div>
    </header>
  );
}
