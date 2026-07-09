import { AppLayout } from "@/components/layout/AppLayout";
import { Mail, MessageSquareHeart } from "lucide-react";

const CONTACT_EMAIL = "lenguajelabs@proton.me";

export default function Contact() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Contact</h1>
        <p className="text-muted-foreground mb-10">
          We'd love to hear from you.
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-serif font-bold text-foreground mb-3">
            A note from the founder
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Hi, I'm the person behind LinguaFlow. I've spent years teaching languages
            and I know how hard it is to find reading material that's actually at
            your level and about things you care about. I built LinguaFlow to solve
            that problem for myself and my students — and now I'm sharing it with you.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            LinguaFlow is still in beta, which means it's actively evolving, and your
            experience helps shape where it goes next.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-4.5 h-4.5 text-accent" />
            </div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              Beta feedback wanted
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Found a bug? Have an idea for a feature? Confused by something in the app?
            As a beta user, your feedback directly shapes what we build next. No issue
            is too small — I read every message.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-serif font-bold text-foreground mb-3">
            Get in touch
          </h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
