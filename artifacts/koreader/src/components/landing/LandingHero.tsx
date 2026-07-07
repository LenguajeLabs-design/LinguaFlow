import { Link } from 'wouter';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import type { AppLanguage } from '@/hooks/use-language';

const HEADLINES: Record<AppLanguage, { eyebrow: string; title: JSX.Element; subtitle: string }> = {
  ko: {
    eyebrow: 'Now generating Korean stories',
    title: (
      <>
        Fluency, written<br />just for you.
      </>
    ),
    subtitle:
      'LinguaFlow turns any topic you love into a Korean story calibrated to your level — so reading feels less like studying, and more like falling into a good book.',
  },
  zh: {
    eyebrow: 'Now generating Chinese stories',
    title: (
      <>
        Fluency, written<br />just for you.
      </>
    ),
    subtitle:
      'LinguaFlow turns any topic you love into a Chinese story calibrated to your HSK level — so reading feels less like studying, and more like falling into a good book.',
  },
  es: {
    eyebrow: 'Now generating Spanish stories',
    title: (
      <>
        Fluency, written<br />just for you.
      </>
    ),
    subtitle:
      'LinguaFlow turns any topic you love into a Spanish story calibrated to your level — so reading feels less like studying, and more like falling into a good book.',
  },
};

export function LandingHero({ language }: { language: AppLanguage }) {
  const copy = HEADLINES[language];

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[#0B0F17] text-[#F7F5EE] isolate">
      {/* Ambient glow field */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-[8%] w-[28rem] h-[28rem] rounded-full"
          style={{ background: '#2DD4BF', opacity: 0.16, filter: 'blur(110px)' }} />
        <div className="absolute top-1/3 right-[4%] w-[26rem] h-[26rem] rounded-full"
          style={{ background: '#A78BFA', opacity: 0.18, filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full"
          style={{ background: '#60A5FA', opacity: 0.12, filter: 'blur(120px)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-[1.08fr_0.92fr] gap-10 md:gap-14 items-center">

          {/* ── Left: copy ── */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.12] text-xs font-semibold tracking-[0.14em] uppercase mb-8 text-[#7DEBD9]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{copy.eyebrow}</span>
            </div>

            <h1 className="font-serif font-semibold text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-7 text-white">
              {copy.title}
            </h1>

            <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-xl leading-relaxed font-light">
              {copy.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] text-[#0B0F17] shadow-[0_0_40px_-8px_rgba(45,212,191,0.6)] transition-all duration-300 hover:shadow-[0_0_56px_-6px_rgba(167,139,250,0.55)] hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(120deg, #7DEBD9 0%, #60A5FA 55%, #A78BFA 100%)' }}
              >
                Try the beta
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-2 py-3.5 text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-300"
              >
                <PlayCircle className="w-4.5 h-4.5" />
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-10">
              {['AI-personalized passages', 'Vocabulary that sticks', 'Built for real reading flow'].map((chip) => (
                <span
                  key={chip}
                  className="px-3.5 py-2 rounded-full text-[13px] font-medium text-white/70 bg-white/[0.04] border border-white/[0.08]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
              Read. Understand. Grow.
            </p>
          </div>

          {/* ── Right: brand vision visual ── */}
          <div className="hidden md:flex flex-col gap-4">
            <div
              className="relative rounded-[28px] overflow-hidden border border-white/[0.12]"
              style={{
                background: 'linear-gradient(180deg, rgba(19,25,42,0.92), rgba(12,15,24,0.94))',
                boxShadow: '0 28px 80px rgba(4,8,20,0.42)',
              }}
            >
              {/* Inner glow behind image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 70% 80%, rgba(167,139,250,0.2), transparent 55%)' }}
                aria-hidden
              />
              <div className="px-4 pt-4 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-[0.14em] uppercase text-white/40">
                <span>LinguaFlow Preview</span>
                <span className="text-[#7DEBD9]">Beta access open</span>
              </div>
              <img
                src="/linguaflow-hero.png"
                alt="LinguaFlow product preview"
                className="w-full block rounded-2xl"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Note below image */}
            <div
              className="rounded-2xl px-4 py-3.5 border border-white/[0.12] backdrop-blur-md"
              style={{ background: 'rgba(11,15,23,0.82)', boxShadow: '0 18px 36px rgba(4,8,20,0.38)' }}
            >
              <p className="text-[13px] font-semibold text-white mb-1">Designed for calm progress</p>
              <p className="text-[12px] text-white/50 leading-relaxed">A focused reading space that keeps learners in flow.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
