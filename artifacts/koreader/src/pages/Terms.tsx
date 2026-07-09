import { AppLayout } from "@/components/layout/AppLayout";

const CONTACT_EMAIL = "lenguajelabs@proton.me";

export default function Terms() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Beta software</h2>
            <p>
              LinguaFlow is currently in beta. That means the app is still being tested
              and improved, features may change, and you may occasionally run into bugs.
              By using LinguaFlow, you understand it's a work in progress.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Using LinguaFlow</h2>
            <p>
              LinguaFlow generates reading passages and vocabulary support for language
              learners. Content is generated automatically and is intended for
              educational and personal use. Please don't use the app for anything
              unlawful or harmful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Your account and content</h2>
            <p>
              If you create an account, you're responsible for keeping your login
              secure. Passages and vocabulary you save belong to you, and you can
              request that we delete your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">No warranty</h2>
            <p>
              LinguaFlow is provided "as is" during this beta period, without
              guarantees of uptime, accuracy of generated content, or fitness for a
              particular purpose. We'll do our best to keep things reliable, but as a
              beta product, things may occasionally break.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Changes to these terms</h2>
            <p>
              We may update these terms as LinguaFlow evolves. Continued use of the app
              after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-foreground mb-2">Contact</h2>
            <p>
              Questions about these terms? Email us at{" "}
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
