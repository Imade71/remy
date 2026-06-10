import Link from "next/link";

export const metadata = { title: "Terms of Service — REMY" };

export default function TermsOfService() {
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
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-muted-foreground/50 mb-16">Last updated: June 2026</p>

        <div className="space-y-12 text-sm leading-relaxed text-muted-foreground/70">

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Using REMY</h2>
            <p>
              By using REMY you agree to these terms. REMY is a tool to help you build and learn —
              use it responsibly. You may not use REMY for illegal purposes or to harm others.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — replace with your actual terms before launch.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Your account</h2>
            <p>
              You are responsible for keeping your account credentials secure. You own the content
              you create with REMY. We do not claim any rights over your conversations or outputs.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — clarify IP ownership, prohibited content, and account termination conditions.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Subscriptions and billing</h2>
            <p>
              Pro subscriptions are billed monthly and can be cancelled at any time. Cancellation
              takes effect at the end of the current billing period. Refunds are handled on a
              case-by-case basis — reach out and we will do right by you.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — add pricing details, refund policy, and trial terms if applicable.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted service. We may update,
              modify, or discontinue features at any time. We will give reasonable notice for
              significant changes.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — include SLA details if you offer them.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Limitation of liability</h2>
            <p>
              REMY is provided as-is. We are not liable for decisions made based on AI-generated
              content. Always apply your own judgement.
            </p>
            <p className="italic text-muted-foreground/40">
              [Placeholder — have a lawyer review this section before launch.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">Contact</h2>
            <p>
              Questions about these terms? Reach us at{" "}
              <span className="text-primary/70">legal@remy.app</span>.
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
