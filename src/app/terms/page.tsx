import Link from "next/link";

export const metadata = { title: "Terms of Service — REMY" };

export default function TermsOfService() {
  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="text-lg font-extrabold tracking-tight">
            remy<span className="text-primary">.</span>
          </span>
        </Link>
        <Link href="/" className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors">
          ← Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-16">
        <p className="text-[11px] text-muted-foreground/70 tracking-widest uppercase mb-4">Legal</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-muted-foreground/70 mb-16">Last updated: June 2026</p>

        <div className="space-y-12 text-sm leading-relaxed text-muted-foreground/70">

          <section className="space-y-3">
            <p>
              These Terms of Service ("Terms") govern your use of REMY, operated by Hemad Hassoun
              ("we", "us", "our"). By creating an account and using REMY, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">1. What REMY Is</h2>
            <p>
              REMY is an AI-powered software guidance tool that helps users navigate programs like
              Bubble, Excel, CapCut, Word, PowerPoint, and similar tools. REMY uses artificial
              intelligence to provide guidance, suggestions, and step-by-step assistance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">2. Your Account</h2>
            <ul className="space-y-2 pl-4">
              {[
                "You must be at least 16 years old to use REMY",
                "You are responsible for keeping your login credentials secure",
                "One account per person — you may not share or transfer your account",
                "You are responsible for all activity that occurs under your account",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">3. Acceptable Use</h2>
            <p>You agree not to use REMY to:</p>
            <ul className="space-y-2 pl-4">
              {[
                "Violate any applicable laws or regulations",
                "Harass, abuse, or harm others",
                "Attempt to reverse-engineer, hack, or disrupt the service",
                "Upload malicious files or harmful content",
                "Impersonate other users or third parties",
                "Use REMY for any illegal or fraudulent purpose",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">4. Subscription Plans</h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card/40 px-5 py-4 space-y-2">
                <p className="text-foreground/70 font-medium">Free Plan</p>
                <ul className="space-y-1.5 pl-4">
                  {[
                    "30 messages per day",
                    "3 screenshot uploads per day",
                    "Session-only memory (resets on logout)",
                    "No credit card required",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-foreground/40 shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-2">
                <p className="text-primary/80 font-medium">REMY Pro — €19/month</p>
                <ul className="space-y-1.5 pl-4">
                  {[
                    "Unlimited messages",
                    "Unlimited screenshot uploads",
                    "Full cross-session memory",
                    "Priority support",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-foreground/40 shrink-0">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p>
              Subscriptions are billed monthly. You can cancel at any time. Cancellation takes
              effect at the end of the current billing period. We do not offer refunds for partial months.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">5. Payments</h2>
            <p>
              Payments are processed securely by Stripe. By subscribing to REMY Pro, you authorize
              us to charge your payment method on a recurring monthly basis until you cancel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">6. AI-Generated Content</h2>
            <p>REMY uses artificial intelligence to generate responses. While we strive for accuracy:</p>
            <ul className="space-y-2 pl-4">
              {[
                "AI responses may occasionally be incorrect or incomplete",
                "REMY is a guidance tool, not a substitute for professional advice",
                "We are not responsible for decisions made based on REMY's guidance",
                "Always verify important information independently",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-foreground/60 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">7. Your Content</h2>
            <p>
              You retain ownership of the content you share with REMY (messages, screenshots, etc.).
              By using REMY, you grant us a limited license to process this content solely to provide
              the service.
            </p>
            <p>We do not use your conversations to train AI models without your explicit consent.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">8. Intellectual Property</h2>
            <p>
              REMY, its logo, design, and all related content are the intellectual property of
              Hemad Hassoun. You may not copy, reproduce, or distribute any part of REMY without
              written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">9. Service Availability</h2>
            <p>
              We aim to keep REMY available 24/7 but cannot guarantee uninterrupted service. We may
              perform maintenance, updates, or experience technical issues. We are not liable for any
              losses caused by service interruptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms.
              You may delete your account at any time by contacting us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Hemad Hassoun shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of REMY.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">12. Governing Law</h2>
            <p>
              These Terms are governed by Belgian law. Any disputes shall be subject to the
              jurisdiction of the courts of Belgium.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">13. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of significant changes
              via email or the app. Continued use of REMY after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground/80">14. Contact</h2>
            <p>
              For any questions about these Terms, contact:<br />
              <span className="text-foreground/70 font-medium">Hemad Hassoun</span><br />
              Email: <span className="text-primary/70">[your email here]</span>
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-border/30">
          <Link href="/" className="text-xs text-muted-foreground/70 hover:text-muted-foreground/90 transition-colors">
            ← Back to REMY
          </Link>
        </div>
      </main>
    </div>
  );
}
