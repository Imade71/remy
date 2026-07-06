import Link from "next/link";

export const metadata = { title: "Privacy Policy — REMY" };

export default function PrivacyPolicy() {
  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="text-lg font-extrabold tracking-tight">
            remy<span className="text-primary">.</span>
          </span>
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
            <p>
              REMY is operated by Hemad Hassoun ("we", "us", "our"). This Privacy Policy explains
              how we collect, use, and protect your personal data when you use REMY ("the Service").
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">1. Who We Are</h2>
            <p>REMY is an AI-powered software guidance tool. The data controller responsible for your personal data is:</p>
            <p className="text-foreground/70">
              Hemad Hassoun<br />
              Belgium<br />
              Contact: <span className="text-primary/70">[your email here]</span>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">2. What Data We Collect</h2>
            <p>We collect the following data when you use REMY:</p>
            <ul className="space-y-2 pl-4">
              {[
                ["Account data", "your name and email address when you register"],
                ["Conversation data", "messages and screenshots you share with REMY"],
                ["Usage data", "number of messages sent, features used, subscription status"],
                ["Payment data", "handled securely by Stripe; we never store your card details"],
                ["Technical data", "browser type, device type, IP address, session data"],
              ].map(([term, def]) => (
                <li key={term} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span><span className="text-foreground/70 font-medium">{term}</span> — {def}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">3. Why We Collect Your Data</h2>
            <p>We use your data to:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Provide and improve the REMY service",
                "Remember your conversations and project context across sessions (Pro users)",
                "Process payments and manage your subscription",
                "Send important service updates (no marketing without consent)",
                "Ensure security and prevent abuse",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground/50 text-xs pt-1">
              Legal basis (GDPR): Contract performance, legitimate interest, and consent where applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">4. How Long We Keep Your Data</h2>
            <ul className="space-y-2 pl-4">
              {[
                ["Account data", "kept as long as your account is active"],
                ["Conversation history", "kept as long as your account is active; deleted within 30 days of account deletion"],
                ["Payment records", "kept for 7 years as required by Belgian law"],
                ["Technical logs", "deleted after 90 days"],
              ].map(([term, def]) => (
                <li key={term} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span><span className="text-foreground/70 font-medium">{term}</span> — {def}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">5. Who We Share Your Data With</h2>
            <p>We share data only with trusted third parties necessary to run the service:</p>
            <ul className="space-y-2 pl-4">
              {[
                ["Anthropic", "processes your messages to generate AI responses"],
                ["Stripe", "processes payments securely"],
                ["Vercel", "hosts the application"],
              ].map(([term, def]) => (
                <li key={term} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span><span className="text-foreground/70 font-medium">{term}</span> — {def}</span>
                </li>
              ))}
            </ul>
            <p>We never sell your data to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">6. Your Rights (GDPR)</h2>
            <p>As a user in the European Economic Area, you have the right to:</p>
            <ul className="space-y-2 pl-4">
              {[
                ["Access", "request a copy of your personal data"],
                ["Correction", "ask us to correct inaccurate data"],
                ["Deletion", "request deletion of your account and data"],
                ["Portability", "receive your data in a machine-readable format"],
                ["Objection", "object to certain types of processing"],
                ["Complaint", "lodge a complaint with the Belgian Data Protection Authority (GBA/APD) at www.dataprotectionauthority.be"],
              ].map(([term, def]) => (
                <li key={term} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span><span className="text-foreground/70 font-medium">{term}</span> — {def}</span>
                </li>
              ))}
            </ul>
            <p>To exercise any of these rights, contact us at: <span className="text-primary/70">[your email here]</span></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">7. Cookies</h2>
            <p>
              REMY uses only essential cookies required for authentication and session management.
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">8. Data Security</h2>
            <p>
              We protect your data using industry-standard security measures including encrypted
              connections (HTTPS), secure password hashing, and access controls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">9. Children</h2>
            <p>
              REMY is not intended for users under the age of 16. We do not knowingly collect
              data from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes
              by email or via the app. Continued use of REMY after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">11. Contact</h2>
            <p>
              For any privacy-related questions, contact:<br />
              <span className="text-foreground/70 font-medium">Hemad Hassoun</span><br />
              Email: <span className="text-primary/70">[your email here]</span>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-border/30">
          <Link href="/" className="text-xs text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors">
            ← Back to REMY
          </Link>
        </div>
      </main>
    </div>
  );
}
