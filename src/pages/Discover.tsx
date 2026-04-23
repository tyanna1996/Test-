import { Star, Users, Zap, Check } from 'lucide-react';
import { discoverServices } from '../data/services';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={11}
          style={{
            color: star <= Math.round(rating) ? '#f59e0b' : '#252d42',
            fill: star <= Math.round(rating) ? '#f59e0b' : 'transparent',
          }}
        />
      ))}
      <span
        className="text-xs ml-0.5"
        style={{ fontFamily: "'DM Mono', monospace", color: '#8892a4' }}
      >
        {rating}
      </span>
    </div>
  );
}

export default function Discover() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#e8eaf0' }}>
          Discover
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8892a4' }}>
          Explore new audio platforms that might complement your listening habits.
        </p>
      </div>

      <div
        className="rounded-xl p-5 flex items-start gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(0,153,204,0.05) 100%)',
          border: '1px solid rgba(0,212,170,0.2)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(0,212,170,0.15)' }}
        >
          <Zap size={18} style={{ color: '#00d4aa' }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>
            Personalized picks
          </h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8892a4' }}>
            Based on your listening patterns — primarily audiobooks and podcasts — here are services
            that would pair well with your current setup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discoverServices.map((service) => (
          <div
            key={service.id}
            className="rounded-xl overflow-hidden flex flex-col"
            style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
          >
            <div className="p-5 flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{
                    backgroundColor: `${service.accentColor}22`,
                    color: service.accentColor,
                    border: `1px solid ${service.accentColor}33`,
                  }}
                >
                  {service.logoChar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold" style={{ color: '#e8eaf0' }}>
                      {service.name}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${service.accentColor}18`,
                        color: service.accentColor,
                        border: `1px solid ${service.accentColor}30`,
                      }}
                    >
                      {service.category}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#8892a4' }}>
                    {service.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <RatingStars rating={service.rating} />
                <div className="flex items-center gap-1.5" style={{ color: '#8892a4' }}>
                  <Users size={12} />
                  <span className="text-xs">{service.userCount} users</span>
                </div>
              </div>

              <ul className="space-y-1.5">
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs" style={{ color: '#8892a4' }}>
                    <Check size={12} style={{ color: '#00d4aa', flexShrink: 0 }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: '1px solid #252d42' }}
            >
              <div>
                <p
                  className="text-base font-semibold"
                  style={{ fontFamily: "'DM Mono', monospace", color: '#e8eaf0' }}
                >
                  ${service.monthlyCost.toFixed(2)}
                  <span className="text-xs font-normal ml-1" style={{ color: '#8892a4' }}>
                    /mo
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#252d42', color: '#8892a4' }}
                >
                  Learn more
                </button>
                <button
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: '#00d4aa', color: '#0f1117' }}
                >
                  Try free
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: '#1a2035', border: '1px solid #252d42' }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e8eaf0' }}>
          Why you might be overpaying
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Bundle opportunity',
              body: 'Spotify + Audible together cost $25.94/mo. Some bundles offer both for under $18.',
              color: '#00d4aa',
            },
            {
              title: 'Low Podimo usage',
              body: 'You only used Podimo 1.8h last week. At $9.99/mo that\'s $5.55/hr — your highest cost.',
              color: '#f59e0b',
            },
            {
              title: 'Storytel overlap',
              body: 'Storytel and Audible both offer audiobooks. Consider consolidating to save ~$12/mo.',
              color: '#8b5cf6',
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="rounded-lg p-4"
              style={{ backgroundColor: '#0f1117', border: '1px solid #252d42' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tip.color }} />
                <p className="text-xs font-semibold" style={{ color: '#e8eaf0' }}>
                  {tip.title}
                </p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#8892a4' }}>
                {tip.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
