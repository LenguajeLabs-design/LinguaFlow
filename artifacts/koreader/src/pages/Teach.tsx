import { useEffect } from 'react';
import { Link } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sparkles, GraduationCap, BookOpen, Volume2, HelpCircle, Languages, ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const HOW_IT_WORKS = [
  {
    number: '1',
    heading: 'Choose what matters',
    body: 'Start with a curriculum topic, student interest, standard, or learning objective.',
    icon: BookOpen,
  },
  {
    number: '2',
    heading: 'Set the right level of challenge',
    body: 'Choose the language, proficiency level, text type, and details your learners need.',
    icon: Languages,
  },
  {
    number: '3',
    heading: 'Create the reading',
    body: 'Generate an engaging text using the existing LinguaFlow reading experience.',
    icon: Sparkles,
  },
  {
    number: '4',
    heading: 'Provide support when it is needed',
    body: 'Give learners access to vocabulary, audio, translation, and questions.',
    icon: HelpCircle,
  },
];

export default function Teach() {
  useEffect(() => {
    document.title = 'LinguaFlow for Educators | Supported Texts for Every Learner';
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) {
      meta.content = 'Create meaningful, level-appropriate mentor texts and supported readings with vocabulary, audio, questions, and multilingual support.';
    }
    return () => {
      document.title = 'LinguaFlow';
    };
  }, []);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* ── Hero ── */}
        <section className="text-center pt-10 pb-14 sm:pt-14 sm:pb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            For Educators
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
            Raise the level.<br className="sm:hidden" /> Keep every learner included.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            Create meaningful, level-appropriate mentor texts and supported readings with vocabulary, audio, questions, and multilingual support built in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
            >
              <Sparkles className="w-4 h-4" />
              Create a supported text
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border bg-card text-foreground hover:border-accent/30 transition-all"
            >
              <Users className="w-4 h-4 text-muted-foreground" />
              Join the teacher pilot
            </Link>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="mb-12">
          <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4">
              One lesson. Different learners. A better way in.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every classroom includes learners with different languages, proficiency levels, interests, and background knowledge. Finding one text that reaches everyone can feel impossible.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              LinguaFlow helps teachers create pathways into meaningful texts without lowering the intellectual level of the learning.
            </p>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-6">
            From a learning goal to a supported text.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                    {step.number}
                  </span>
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">{step.heading}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Outcome ── */}
        <section className="mb-12">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-7 sm:p-9">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-4">
              Increase access without decreasing ambition.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              LinguaFlow preserves meaningful, age-respectful ideas while adding the support learners need to understand, discuss, and write.
            </p>
          </div>
        </section>

        {/* ── Pilot ── */}
        <section className="mb-12">
          <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-1">
                  Start with five students.
                </h2>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-3">
              Imagine five students receiving texts connected to what they care about, at the right level of challenge, with support in a language they understand.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Try LinguaFlow with a small group of learners and help shape the educator experience.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
            >
              <Users className="w-4 h-4" />
              Join the teacher pilot
            </Link>
          </div>
        </section>

        {/* ── Learner link ── */}
        <section className="mb-12">
          <div className="rounded-2xl border border-border/60 bg-secondary/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">
                Learning a language yourself?
              </p>
              <p className="text-sm text-muted-foreground">
                Read what you love, at your level, with support when you need it.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:border-accent/30 transition-all shrink-0"
            >
              Explore for learners
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="text-center pb-10 sm:pb-14">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-7 pt-9 pb-6 text-center bg-gradient-to-b from-accent/5 to-transparent">
              <div
                className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%,0.12), hsl(255,52%,60%,0.12))' }}
              >
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">
                Give every learner access to texts worth reading.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Help learners gain the words to understand ideas, communicate what they know, and build connections across languages.
              </p>
            </div>
            <div className="px-7 pb-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
              >
                <Sparkles className="w-4 h-4" />
                Create a supported text
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
