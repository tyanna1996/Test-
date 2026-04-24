import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notifications } from '../../data/services';
import type { Notification } from '../../types';

const typeDots: Record<Notification['type'], string> = {
  trial:   'bg-amber',
  billing: 'bg-teal',
  new:     'bg-green',
  usage:   'bg-purple',
};

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
      className="absolute right-0 top-12 w-80 card shadow-xl z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        <span className="text-xs text-text-secondary">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>
      <ul className="py-1 max-h-80 overflow-y-auto" role="list">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={[
              'px-4 py-3 flex gap-3 items-start cursor-pointer hover:bg-bg-hover transition-colors',
              !n.read ? 'bg-teal-dim/30' : '',
            ].join(' ')}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.read ? 'bg-border' : typeDots[n.type]}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-xs leading-relaxed ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                {n.message}
              </p>
              <p className="text-xs mt-1 text-text-muted">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sm:px-10 flex-shrink-0 bg-bg-primary border-b border-border"
      role="banner"
    >
      {/* Wordmark */}
      <span
        className="text-4xl font-black tracking-tight text-text-primary leading-none select-none"
        aria-label="MONO"
      >
        MONO
      </span>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover relative"
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
          >
            <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal" aria-hidden="true" />
            )}
          </button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer bg-teal text-white select-none"
          aria-label="Jamie Doe — account menu"
          role="button"
          tabIndex={0}
        >
          JD
        </div>
      </div>
    </header>
  );
}
