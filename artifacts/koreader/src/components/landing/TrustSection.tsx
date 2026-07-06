import { Link } from 'wouter';
import { ArrowRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'This is the first app that made me want to read in Korean for fun, not just to study.',
    name: 'Beta tester',
    detail: 'Learning Korean · 4 months',
  },
  {
    quote: 'I finally understand grammar in context instead of memorizing rules. It just clicks.',
    name: 'Beta tester',
    detail: 'Learning Chinese · 7 months',
  },
  {
    quote: 'The passages feel like they were written by someone who actually knows me.',
    name: 'Beta tester',
    detail: 'Learning Spanish · 2 months',
  },
];

export function TrustSection() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#0B0F17] text-[#F7F5EE] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-24 md:py-28">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7DEBD9] mb-4">From early readers</p>
          <h2 className="font-serif font-semibold text-3xl sm:text-4xl leading-tight text-white">
            Loved by our beta readers.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.quote}
              className="rounded-3xl p-7 bg-white/[0.03] border border-white/[0.08] flex flex-col"
            >
              <Quote className="w-5 h-5 text-[#A78BFA]/70 mb-4" />
              <p className="text-white/75 text-[15px] leading-relaxed font-light mb-6 flex-1">
                “{t.quote}”
              </p>
              <div className="pt-4 border-t border-white/[0.08]">
                <p className="text-sm font-medium text-white/85">{t.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA band */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/[0.1] px-8 sm:px-14 py-14 sm:py-16 text-center">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(45,212,191,0.12), transparent 55%), radial-gradient(circle at 75% 80%, rgba(167,139,250,0.14), transparent 55%)' }} />
          </div>
          <div className="relative z-10 max-w-lg mx-auto">
            <h3 className="font-serif font-semibold text-2xl sm:text-3xl text-white mb-3">
              Help shape LinguaFlow.
            </h3>
            <p className="text-white/55 text-base leading-relaxed font-light mb-8">
              We're in beta and building this with our earliest readers. Join now and help decide where LinguaFlow goes next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[15px] text-[#0B0F17] transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(120deg, #7DEBD9 0%, #60A5FA 55%, #A78BFA 100%)' }}
              >
                Try the beta
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:hello@linguaflow.app?subject=LinguaFlow%20feedback"
                className="text-[15px] font-medium text-white/60 hover:text-white transition-colors duration-300"
              >
                Share feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
