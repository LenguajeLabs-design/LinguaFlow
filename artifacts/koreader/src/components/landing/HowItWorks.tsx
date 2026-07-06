import { BookMarked, PlusCircle, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: PlusCircle,
    title: 'Choose a topic & level',
    body: 'Pick anything you actually care about — hiking, K-pop, philosophy — and set your reading level. No generic textbook chapters.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Your passage is written for you',
    body: 'In seconds, LinguaFlow generates an original story or article, calibrated to your level, with vocabulary and grammar woven in naturally.',
  },
  {
    number: '03',
    icon: BookMarked,
    title: 'Read, tap, and grow',
    body: 'Tap any word for an instant gloss and example sentence. Save it to your vocabulary list and watch your fluency build, one story at a time.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#0d0c1a] text-[#F7F5EE] border-t border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-28">
        <div className="max-w-xl mb-16">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C4B5FD] mb-4">The experience</p>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl leading-tight text-white mb-4">
            How it works.
          </h2>
          <p className="text-white/55 text-base leading-relaxed font-light">
            Three simple steps stand between you and your next story — no setup, no lesson plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-20">
          {STEPS.map(({ number, icon: Icon, title, body }, i) => (
            <div key={number} className="relative">
              <div className="flex items-center gap-4 mb-5">
                <span className="font-serif text-4xl text-white/15 leading-none">{number}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.05] border border-white/[0.1]">
                  <Icon className="w-4.5 h-4.5 text-[#A78BFA]" />
                </div>
              </div>
              <h3 className="font-serif font-semibold text-lg text-white mb-2.5">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">{body}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-5 left-full w-8 h-px bg-white/[0.12]" />
              )}
            </div>
          ))}
        </div>

        {/* Illustrative product preview */}
        <div className="relative rounded-[28px] border border-white/[0.1] bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-6 sm:p-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{ background: '#60A5FA', filter: 'blur(90px)' }} />
          <div className="relative grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6">
            <div className="rounded-2xl bg-[#0B0F17]/70 border border-white/[0.08] p-6">
              <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Sample passage</p>
              <p className="font-serif text-lg text-white/90 leading-relaxed mb-2">
                어느 조용한 마을에, 오래된 서점 하나가 있었다.
              </p>
              <p className="text-sm text-white/45 leading-relaxed">
                In a quiet town, there was an old bookstore.
              </p>
            </div>
            <div className="rounded-2xl bg-[#0B0F17]/70 border border-white/[0.08] p-6 flex flex-col justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/35 mb-3">Tapped word</p>
                <p className="font-serif text-2xl text-white mb-1">서점</p>
                <p className="text-sm text-[#7DEBD9] mb-1">seojeom</p>
                <p className="text-sm text-white/50">bookstore</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.08] text-xs text-white/35">
                Saved to your vocabulary
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
