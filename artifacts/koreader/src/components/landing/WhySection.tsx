import { Feather, Sparkles, TrendingUp } from 'lucide-react';

const REASONS = [
  {
    icon: Feather,
    title: 'Calm reading',
    body:
      'No timers, no drills, no pressure. Every passage is designed as a peaceful space for deep focus — reading the way it was always meant to feel.',
    accent: '#2DD4BF',
  },
  {
    icon: Sparkles,
    title: 'Personalized passages',
    body:
      'Tell it a topic and a level. LinguaFlow writes a story around what genuinely interests you, so every session feels made for you — because it is.',
    accent: '#60A5FA',
  },
  {
    icon: TrendingUp,
    title: 'Natural vocabulary growth',
    body:
      'Tap any word for an instant gloss in context. Words you look up are quietly saved, so your vocabulary grows the way it does in real life — through reading.',
    accent: '#A78BFA',
  },
];

export function WhySection() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#0B0F17] text-[#F7F5EE] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-28">
        <div className="max-w-xl mb-16">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7DEBD9] mb-4">Why LinguaFlow</p>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl leading-tight text-white mb-4">
            Reading, the way it should feel.
          </h2>
          <p className="text-white/55 text-base leading-relaxed font-light">
            Most apps turn language learning into a chore. LinguaFlow is built around one idea: fluency grows fastest when reading feels like a pleasure, not a task.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {REASONS.map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="relative rounded-3xl p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.14]"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${accent}1A`, border: `1px solid ${accent}33` }}
              >
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <h3 className="font-serif font-semibold text-xl text-white mb-3">{title}</h3>
              <p className="text-white/55 text-[15px] leading-relaxed font-light">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
