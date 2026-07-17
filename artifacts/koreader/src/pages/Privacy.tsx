import { AppLayout } from "@/components/layout/AppLayout";

const CONTACT_EMAIL = "forozc1@gmail.com";

export default function Privacy() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto prose-container">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Overview</h2>
            <p>
              LinguaFlow is a beta language-learning app. This policy explains, in plain
              language, what information we collect and how we use it. We only collect
              what's needed to make the app work well for you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Information we collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account information (such as your email address) when you sign up.</li>
              <li>Reading and vocabulary activity you generate or save while using the app.</li>
              <li>Basic usage data that helps us understand how the app is used and fix problems.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">How we use it</h2>
            <p>
              We use your information to operate LinguaFlow, save your library and
              vocabulary, personalize your reading level, and improve the product based
              on how it's actually used. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Beta status</h2>
            <p>
              LinguaFlow is under active development. Features, data structures, and this
              policy may change as the product evolves. We'll do our best to keep this
              page up to date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Contact</h2>
            <p>
              Questions about your data or this policy? Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
