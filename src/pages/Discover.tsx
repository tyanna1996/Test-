import { Star, Users, Zap, Check } from 'lucide-react';
import { discoverServices } from '../data/services';
import ServiceLogo from '../components/ui/ServiceLogo';

/* Rating displayed as filled/unfilled stars.
   Uses half-star precision: 4.5 → 4.5 stars, not rounded to 5. */
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return (
          <Star
            key={star}
            size={11}
            aria-hidden="true"
            className={filled ? 'text-amber' : half ? 'text-amber/50' : 'text-border'}
            fill={filled ? 'currentColor' : 'none'}
          />
        );
      })}
      <span className="text-xs font-mono text-text-secondary ml-0.5">{rating}</span>
    </div>
  );
}

/* Category badge — uses Tailwind-only classes mapped from id */
const categoryColours: Record<string, string> = {
  scribd:   'bg-blue-dim  text-blue',
  blinkist: 'bg-cyan/10   text-cyan',
  luminary: 'bg-purple-dim text-purple',
  findaway: 'bg-orange/10  text-orange',
};

export default function Discover() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Discover</h1>
        <p className="text-sm mt-0.5 text-text-secondary">
          Explore new audio platforms that might complement your listening habits.
        </p>
      </div>

      {/* Personalised picks banner */}
      <div className="rounded-xl p-5 flex items-start gap-4 bg-teal-dim border border-teal/20">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal/15">
          <Zap size={18} className="text-teal" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Personalised picks</h2>
          <p className="text-xs mt-1 leading-relaxed text-text-secondary">
            Based on your listening patterns — primarily audiobooks and podcasts — here are services
            that would pair well with your current setup.
          </p>
        </div>
      </div>

      {/* Service cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discoverServices.map((service) => (
          <article key={service.id} className="card flex flex-col" aria-label={service.name}>
            <div className="p-5 flex-1">
              <div className="flex items-start gap-4 mb-4">
                <ServiceLogo id={service.id} name={service.name} logoChar={service.logoChar} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-text-primary">{service.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColours[service.id] ?? 'bg-teal-dim text-teal'}`}>
                      {service.category}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-text-secondary">{service.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <RatingStars rating={service.rating} />
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Users size={12} aria-hidden="true" />
                  <span className="text-xs">{service.userCount} users</span>
                </div>
              </div>

              <ul className="space-y-1.5" aria-label={`${service.name} features`}>
                {service.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check size={12} className="text-teal flex-shrink-0" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
              <p className="text-base font-semibold font-mono text-text-primary">
                ${service.monthlyCost.toFixed(2)}
                <span className="text-xs font-sans font-normal text-text-secondary ml-1">/mo</span>
              </p>
              <div className="flex items-center gap-2">
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-bg-hover text-text-secondary hover:text-text-primary">
                  Learn more
                </button>
                <button
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal text-bg-primary hover:bg-teal-hover"
                  aria-label={`Try ${service.name} free`}
                >
                  Try free
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Value tips */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Why you might be overpaying</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Bundle opportunity',
              body: 'Spotify + Audible together cost $25.94/mo. Some bundles offer both for under $18.',
              dotClass: 'bg-teal',
            },
            {
              title: 'Low Podimo usage',
              body: "You only used Podimo 1.8h last week. At $9.99/mo that's $5.55/hr — your highest cost.",
              dotClass: 'bg-amber',
            },
            {
              title: 'Storytel overlap',
              body: 'Storytel and Audible both offer audiobooks. Consider consolidating to save ~$12/mo.',
              dotClass: 'bg-purple',
            },
          ].map((tip) => (
            <div key={tip.title} className="rounded-lg p-4 bg-bg-primary border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${tip.dotClass}`} aria-hidden="true" />
                <p className="text-xs font-semibold text-text-primary">{tip.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
