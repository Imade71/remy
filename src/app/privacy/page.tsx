import Link from "next/link";

export const metadata = { title: "Privacy Policy — REMY" };

export default function PrivacyPolicy() {
  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">R</div>
          <span className="font-semibold text-sm tracking-wide">REMY</span>
        </Link>
        <Link href="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-16">
        <p className="text-[11px] text-muted-foreground/35 tracking-widest uppercase mb-4">Legal</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground/50 mb-16">Last updated: June 2026</p>

        <div className="space-y-12 text-sm leading-relaxed text-muted-foreground/70">

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Overview</h2>
            <p>
              REMY is built on the principle that your data belongs to you. This policy explains what
              we collect, why we collect it, and how we protect it. We keep this simple because
              we believe you should actually be able to read it.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — replace with your actual privacy policy before launch.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">What we collect</h2>
            <p>
              We collect the information you provide when creating an account (name, email), your
              conversation history if you are a Pro user, and anonymous usage data to improve the
              product. We do not sell your data to third parties.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — add specific data types, retention periods, and third-party services used.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">How we use it</h2>
            <p>
              Your data is used solely to provide and improve the REMY service. Conversation history
              is used to personalise your experience. We use Stripe for payment processing and do not
              store card details on our servers.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — describe all use cases in detail.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Your rights</h2>
            <p>
              You can request deletion of your account and all associated data at any time by
              contacting us. You can also export your conversation history from your account settings.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — include GDPR / CCPA specifics if applicable.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Contact</h2>
            <p>
              Questions about this policy? Reach us at{" "}
              <span className="text-primary/70">privacy@remy.app</span>.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — replace with your actual contact address.]
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
