import { Link } from 'wouter';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import type { AppLanguage } from '@/hooks/use-language';
import logoMark from '/linguaflow-logo.png';

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
        <div className="hf-orb absolute -top-32 left-[8%] w-[28rem] h-[28rem] rounded-full"
          style={{ background: '#2DD4BF', opacity: 0.16, filter: 'blur(110px)' }} />
        <div className="hf-orb-2 absolute top-1/3 right-[4%] w-[26rem] h-[26rem] rounded-full"
          style={{ background: '#A78BFA', opacity: 0.18, filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full"
          style={{ background: '#60A5FA', opacity: 0.12, filter: 'blur(120px)' }} />
      </div>

      {/* Faint watermark logo */}
      <img
        src={logoMark}
        alt=""
        aria-hidden
        className="absolute -right-24 -bottom-24 w-[34rem] opacity-[0.05] pointer-events-none select-none hidden md:block -z-10"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-24 pb-28 md:pt-32 md:pb-36">
        <div className="max-w-2xl">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-14">
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
      </div>
    </section>
  );
}
