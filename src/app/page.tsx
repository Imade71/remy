"use client";

import { useEffect, useRef, useState } from "react";

const PROGRAMS = [
  { name: "Bubble",          logo: "/logos/bubble.svg" },
  { name: "Excel",           logo: "/logos/excel.svg" },
  { name: "Word",            logo: "/logos/word.svg" },
  { name: "PowerPoint",      logo: "/logos/powerpoint.svg" },
  { name: "CapCut",          logo: "/logos/capcut.svg" },
  { name: "Premiere Pro",    logo: "/logos/premiere-pro.svg" },
  { name: "Webflow",         logo: "/logos/webflow.svg" },
  { name: "DaVinci Resolve", logo: "/logos/davinci-resolve.svg" },
];

export default function LandingPage() {
  const [waitlistCount, setWaitlistCount] = useState(247);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [showWaitlistSuccess, setShowWaitlistSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [copyText, setCopyText] = useState("Copy link");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reveals = container.querySelectorAll(".rl-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("rl-visible");
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToId(id: string) {
    containerRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
  }

  function handleWaitlist() {
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setShowWaitlistSuccess(true);
    setWaitlistCount((c) => c + 1);
  }

  function shareTwitter() {
    window.open(
      "https://twitter.com/intent/tweet?text=Just+joined+the+waitlist+for+Remy+%E2%80%94+an+AI+that+guides+you+through+any+software+step+by+step.+%F0%9F%9A%80&url=https://getremy.ai",
      "_blank"
    );
  }

  function copyLink() {
    navigator.clipboard.writeText("https://getremy.ai");
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy link"), 2000);
  }

  return (
    <div ref={containerRef} className="remy-landing">
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="nav-logo-mark">R</div>
          <span className="nav-logo-text">REMY</span>
        </a>
        <ul className="nav-links">
          <li><a href="#how" onClick={(e) => { e.preventDefault(); scrollToId("how"); }}>How it works</a></li>
          <li><a href="#programs" onClick={(e) => { e.preventDefault(); scrollToId("programs"); }}>Programs</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToId("pricing"); }}>Pricing</a></li>
        </ul>
        <button className="nav-cta" onClick={() => scrollToId("waitlist")}>Get early access</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-badge">
          <div className="hero-badge-dot"></div>
          Introducing REMY
        </div>
        <h1 className="hero-title">Stop getting stuck<br />in <span>software.</span></h1>
        <p className="hero-subtitle">Show Remy your screen — get the exact next step.</p>
        <p className="hero-hint">📸 Paste or upload a screenshot for instant guidance.</p>
        <div className="hero-actions">
          <a href="/chat" className="btn-primary">Start for free</a>
          <button className="btn-secondary" onClick={() => scrollToId("how")}>See how it works</button>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line"></div>
          <span style={{ fontSize: "11px", letterSpacing: "1px" }}>SCROLL</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features rl-reveal">
        <p className="section-label">What makes Remy different</p>
        <h2 className="section-title">Built for the moment<br />you&apos;re actually stuck.</h2>
        <div className="features-grid">
          {([
            { icon: "📸", title: "Screenshot Analysis", body: "Show Remy your screen and get help instantly. Paste any screenshot — Remy sees exactly what you see." },
            { icon: "🎯", title: "Goal-First Onboarding", body: "Tell Remy what you're trying to build. It maps your goal to your exact software and gives you a clear plan from the start." },
            { icon: "🧠", title: "Memory", body: "Remy remembers your project across sessions so you never have to re-explain where you left off." },
            { icon: "🎙️", title: "Adapts to You", body: "Direct or hand-holding, fast or slow — Remy reads how you communicate and matches your style automatically." },
          ] as { icon: string; title: string; body: string }[]).map(({ icon, title, body }, i) => (
            <div key={title} className={`feature-card${i === 0 ? " feature-card-highlight" : ""}`}>
              <span className="feature-icon">{icon}</span>
              <div className="feature-title">{title}</div>
              <p className="feature-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section className="demo rl-reveal">
        <p className="section-label">Real example</p>
        <h2 className="section-title">Share your screen.<br />Get the exact fix.</h2>
        <div className="demo-window">
          <div className="demo-bar">
            <div className="demo-dots">
              <div className="demo-dot" style={{ background: "#ff5f57" }}></div>
              <div className="demo-dot" style={{ background: "#febc2e" }}></div>
              <div className="demo-dot" style={{ background: "#28c840" }}></div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>REMY</span>
            <div style={{ width: "48px" }}></div>
          </div>
          <div className="demo-messages">
            <div className="demo-msg user" style={{ animationDelay: "0.3s" }}>
              <div className="demo-bubble demo-bubble-with-img">
                <svg className="demo-screenshot-thumb" viewBox="0 0 260 160" xmlns="http://www.w3.org/2000/svg">
                  <rect width="260" height="160" fill="#f8fafc"/>
                  <rect width="260" height="24" fill="#1e293b"/>
                  <circle cx="10" cy="12" r="3.5" fill="#ff5f57"/>
                  <circle cx="22" cy="12" r="3.5" fill="#febc2e"/>
                  <circle cx="34" cy="12" r="3.5" fill="#28c840"/>
                  <text x="130" y="16" fill="#64748b" fontSize="8" fontFamily="system-ui,sans-serif" textAnchor="middle">Bubble — Workflow Editor</text>
                  <rect x="0" y="24" width="50" height="136" fill="#f1f5f9"/>
                  <rect x="0" y="24" width="50" height="136" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                  <text x="25" y="40" fill="#94a3b8" fontSize="7" fontFamily="system-ui,sans-serif" textAnchor="middle">EVENTS</text>
                  <rect x="4" y="45" width="42" height="16" rx="3" fill="#dbeafe"/>
                  <text x="25" y="57" fill="#3b82f6" fontSize="7" fontFamily="system-ui,sans-serif" textAnchor="middle">Button A</text>
                  <rect x="60" y="32" width="188" height="28" rx="5" fill="#3b82f6"/>
                  <text x="70" y="47" fill="white" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">⚡ Button A is clicked</text>
                  <text x="70" y="57" fill="rgba(255,255,255,0.65)" fontSize="7" fontFamily="system-ui,sans-serif">Trigger</text>
                  <line x1="154" y1="60" x2="154" y2="72" stroke="#94a3b8" strokeWidth="1.5"/>
                  <polygon points="150,70 154,76 158,70" fill="#94a3b8"/>
                  <rect x="60" y="76" width="188" height="36" rx="5" fill="white" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3"/>
                  <text x="70" y="92" fill="#d97706" fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="600">▸ Condition</text>
                  <text x="70" y="105" fill="#94a3b8" fontSize="7.5" fontFamily="system-ui,sans-serif">Empty — click to add a condition</text>
                  <line x1="154" y1="112" x2="154" y2="124" stroke="#e2e8f0" strokeWidth="1.5"/>
                  <polygon points="150,122 154,128 158,122" fill="#e2e8f0"/>
                  <rect x="60" y="128" width="188" height="24" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
                  <text x="70" y="142" fill="#cbd5e1" fontSize="8.5" fontFamily="system-ui,sans-serif">Make changes to a Thing...</text>
                  <text x="70" y="150" fill="#e2e8f0" fontSize="7" fontFamily="system-ui,sans-serif">Action</text>
                </svg>
                <span>Why isn&apos;t this workflow running? The button click isn&apos;t triggering anything.</span>
              </div>
            </div>
            <div className="demo-msg" style={{ animationDelay: "1.4s" }}>
              <div className="demo-avatar">R</div>
              <div className="demo-bubble">Your condition is empty, which is why the workflow never runs. Click the condition step and add a rule — for example, check that the input&apos;s value is not empty — and it will start executing.</div>
            </div>
            <div className="demo-msg user" style={{ animationDelay: "2.6s" }}>
              <div className="demo-bubble">My Excel formula keeps showing #REF! and I don&apos;t know why.</div>
            </div>
            <div className="demo-msg" style={{ animationDelay: "3.6s" }}>
              <div className="demo-avatar">R</div>
              <div className="demo-bubble">A <strong style={{ color: "var(--text)" }}>#REF!</strong> error means the formula is pointing at a cell that&apos;s been deleted. Click the cell, look at the formula bar for the part that says <strong style={{ color: "var(--text)" }}>#REF!</strong>, and re-select the range it should point to — that&apos;ll fix it.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="programs" id="programs">
        <div className="programs-inner">
          <p className="section-label rl-reveal">Supported programs</p>
          <h2 className="section-title rl-reveal">One subscription.<br />Every tool you use.</h2>
          <div className="programs-grid rl-reveal">
            {PROGRAMS.map(({ name, logo }) => (
              <div key={name} className="program-item">
                <img src={logo} alt={name} className="program-logo" />
                <div className="program-name">{name}</div>
              </div>
            ))}
          </div>
          <p className="programs-more rl-reveal">And any other program you can think of — just ask Remy.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <p className="section-label rl-reveal">The process</p>
        <h2 className="section-title rl-reveal">How Remy works</h2>
        <div className="steps">
          {[
            { n: 1, title: "Tell Remy your goal", body: "Open Remy and describe what you're trying to accomplish. No technical language needed — just say it in plain words." },
            { n: 2, title: "Get step by step guidance", body: "Remy breaks your goal into clear, precise steps tailored to exactly the program you're using. Follow at your own pace." },
            { n: 3, title: "Stuck? Just say so.", body: 'Hit the "I\'m stuck" button at any point and Remy slows down, zooms in, and walks you through the exact moment you\'re struggling with.' },
            { n: 4, title: "Accomplish more, faster", body: "No more YouTube rabbit holes. No more outdated tutorials. Just clear guidance, right when you need it." },
          ].map(({ n, title, body }) => (
            <div key={n} className="step rl-reveal">
              <div className="step-num">{n}</div>
              <div className="step-content">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUCK FEATURE */}
      <section className="stuck">
        <div className="stuck-bg"></div>
        <div className="stuck-inner rl-reveal">
          <p className="section-label">The safety net</p>
          <h2 className="section-title">Everyone gets stuck.<br /><span style={{ color: "var(--blue)" }}>Remy gets you unstuck.</span></h2>
          <div className="stuck-button-demo">I&apos;m stuck — help me</div>
          <p className="stuck-desc">One button. That&apos;s all it takes. Remy immediately switches into a more detailed, hand-holding mode — slowing down, asking what you see on screen, and guiding you through the exact moment of confusion.</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="pricing-inner">
          <p className="section-label rl-reveal">Simple pricing</p>
          <h2 className="section-title rl-reveal">Start free.<br />Upgrade when ready.</h2>
          <div className="pricing-grid rl-reveal" style={{ maxWidth: 640, marginInline: "auto" }}>
            <div className="pricing-card">
              <p className="pricing-tier">Free</p>
              <div className="pricing-price"><span>$</span>0</div>
              <p className="pricing-period">forever</p>
              <ul className="pricing-features">
                <li>30 messages per day</li>
                <li>3 screenshot uploads per day</li>
                <li>Session-only memory</li>
                <li>All programs supported</li>
                <li>I&apos;m stuck feature</li>
              </ul>
              <a href="/chat" className="btn-secondary" style={{ width: "100%", display: "block", textAlign: "center", textDecoration: "none" }}>Get started</a>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most popular</div>
              <p className="pricing-tier">Pro</p>
              <div className="pricing-price"><span>$</span>19</div>
              <p className="pricing-period">per month</p>
              <ul className="pricing-features">
                <li>Unlimited messages</li>
                <li>Unlimited screenshot uploads</li>
                <li>Full cross-session memory</li>
                <li>All programs supported</li>
                <li>I&apos;m stuck feature</li>
                <li>Priority support</li>
              </ul>
              <a href="/chat" className="btn-primary" style={{ width: "100%", display: "block", textAlign: "center", textDecoration: "none" }}>Start for free</a>
            </div>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="waitlist" id="waitlist">
        <div className="waitlist-bg"></div>
        <div className="waitlist-inner rl-reveal">
          <div className="waitlist-count">
            <div className="waitlist-count-dot"></div>
            <span>{waitlistCount}</span> people on the waitlist
          </div>
          <h2 className="section-title">Be first.<br /><span style={{ color: "var(--blue)" }}>Get early access.</span></h2>
          <p style={{ fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.8, marginTop: "14px" }}>Remy is launching soon. Join the waitlist and be among the first to navigate any software with confidence.</p>

          {!showWaitlistSuccess ? (
            <div className="waitlist-form">
              <input
                type="email"
                className="waitlist-input"
                placeholder={emailError ? "Please enter a valid email" : "Your email address"}
                value={waitlistEmail}
                onChange={(e) => { setWaitlistEmail(e.target.value); setEmailError(false); }}
                style={emailError ? { borderColor: "rgba(239,68,68,0.5)" } : undefined}
              />
              <button className="waitlist-submit" onClick={handleWaitlist}>Join waitlist</button>
            </div>
          ) : (
            <div className="waitlist-success" style={{ display: "flex" }}>
              <div className="waitlist-success-icon">✓</div>
              <p>You&apos;re on the list. <strong>Remy will be in touch.</strong></p>
              <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Share Remy with someone who needs it.</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button onClick={shareTwitter} className="btn-secondary" style={{ fontSize: "13px", padding: "10px 18px" }}>Share on X</button>
                <button onClick={copyLink} className="btn-secondary" style={{ fontSize: "13px", padding: "10px 18px" }}>{copyText}</button>
              </div>
            </div>
          )}

          <p className="waitlist-note">No spam. No noise. Just Remy when it&apos;s ready.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="footer-logo">
            <div className="nav-logo-mark">R</div>
            <span className="nav-logo-text">REMY</span>
          </div>
          <p className="footer-tagline">Navigate anything.</p>
          <p className="footer-copy">© 2026 REMY. All rights reserved.</p>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", opacity: 0.5, marginTop: "12px", maxWidth: "560px", textAlign: "center", lineHeight: 1.7 }}>
          All product names, logos, and brands are property of their respective owners. REMY is not affiliated with, endorsed by, or sponsored by any of the companies mentioned.
        </p>
      </footer>
    </div>
  );
}

const LANDING_CSS = `
.remy-landing {
  --navy: #0a0f1e;
  --navy-2: #0f1528;
  --navy-3: #141b33;
  --navy-card: #111827;
  --blue: #3b82f6;
  --blue-dim: rgba(59,130,246,0.12);
  --blue-glow: rgba(59,130,246,0.25);
  --text: #f1f5f9;
  --text-dim: #64748b;
  --text-mid: #94a3b8;
  --border: rgba(255,255,255,0.07);
  --border-blue: rgba(59,130,246,0.25);
  position: fixed;
  inset: 0;
  overflow-y: auto;
  background: var(--navy);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  scroll-behavior: smooth;
}

.remy-landing * { margin: 0; padding: 0; box-sizing: border-box; }

/* NAV */
.remy-landing nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 60px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(10,15,30,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.remy-landing .nav-logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
}
.remy-landing .nav-logo-mark {
  width: 32px; height: 32px;
  background: var(--blue);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 600; color: #fff;
}
.remy-landing .nav-logo-text {
  font-size: 16px; font-weight: 600; color: var(--text);
  letter-spacing: 0.5px;
}
.remy-landing .nav-links {
  display: flex; align-items: center; gap: 36px;
  list-style: none;
}
.remy-landing .nav-links a {
  color: var(--text-mid); text-decoration: none;
  font-size: 14px; font-weight: 400;
  transition: color 0.2s;
}
.remy-landing .nav-links a:hover { color: var(--text); }
.remy-landing .nav-cta {
  background: var(--blue);
  border: none; color: #fff;
  padding: 10px 22px;
  font-family: 'Inter', sans-serif;
  font-size: 14px; font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.remy-landing .nav-cta:hover { background: #2563eb; transform: translateY(-1px); }

/* HERO */
.remy-landing .hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 120px 40px 80px;
  position: relative;
  overflow: hidden;
}
.remy-landing .hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 50%);
}
.remy-landing .hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
}
.remy-landing .hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--blue-dim);
  border: 1px solid var(--border-blue);
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 13px; color: #93c5fd;
  margin-bottom: 32px;
  animation: rl-fadeUp 0.6s 0.1s both;
}
.remy-landing .hero-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--blue);
  animation: rl-pulse 2s infinite;
}
.remy-landing .hero-title {
  font-size: clamp(44px, 7vw, 80px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -1.5px;
  color: var(--text);
  margin-bottom: 12px;
  animation: rl-fadeUp 0.6s 0.2s both;
}
.remy-landing .hero-title span { color: var(--blue); }
.remy-landing .hero-subtitle {
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 400;
  color: var(--text-mid);
  margin-bottom: 10px;
  animation: rl-fadeUp 0.6s 0.35s both;
  max-width: 500px;
}
.remy-landing .hero-hint {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 48px;
  animation: rl-fadeUp 0.6s 0.42s both;
}
.remy-landing .hero-actions {
  display: flex; gap: 12px; align-items: center;
  animation: rl-fadeUp 0.6s 0.5s both;
}
.remy-landing .btn-primary {
  background: var(--blue);
  border: none; color: #fff;
  padding: 14px 32px;
  font-family: 'Inter', sans-serif;
  font-size: 15px; font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.remy-landing .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 8px 24px var(--blue-glow); }
.remy-landing .btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-mid);
  padding: 14px 32px;
  font-family: 'Inter', sans-serif;
  font-size: 15px; font-weight: 400;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}
.remy-landing .btn-secondary:hover { border-color: var(--border-blue); color: var(--text); }
.remy-landing .hero-scroll {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: var(--text-dim); font-size: 12px;
  animation: rl-fadeUp 0.6s 0.8s both;
}
.remy-landing .scroll-line {
  width: 1px; height: 36px;
  background: linear-gradient(to bottom, var(--blue), transparent);
  animation: rl-scrollPulse 2s infinite;
}

/* FEATURES */
.remy-landing .features {
  padding: 80px 40px 60px;
  max-width: 1000px; margin: 0 auto;
}
.remy-landing .features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin-top: 48px;
}
.remy-landing .feature-card {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 24px;
  transition: border-color 0.2s, transform 0.2s;
}
.remy-landing .feature-card-highlight {
  border-color: var(--border-blue);
  background: var(--navy-3);
}
.remy-landing .feature-card:hover {
  border-color: var(--border-blue);
  transform: translateY(-2px);
}
.remy-landing .feature-icon {
  font-size: 22px;
  margin-bottom: 14px;
  display: block;
}
.remy-landing .feature-title {
  font-size: 15px; font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}
.remy-landing .feature-body {
  font-size: 13px; line-height: 1.7;
  color: var(--text-dim);
}

/* DEMO */
.remy-landing .demo {
  padding: 100px 40px;
  max-width: 860px; margin: 0 auto;
}
.remy-landing .section-label {
  font-size: 12px; font-weight: 500; letter-spacing: 2px;
  color: var(--blue); margin-bottom: 12px; text-align: center;
  text-transform: uppercase;
}
.remy-landing .section-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 600; text-align: center;
  margin-bottom: 56px; line-height: 1.2;
  letter-spacing: -0.5px;
}
.remy-landing .demo-window {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.08);
}
.remy-landing .demo-bar {
  background: var(--navy-2);
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.remy-landing .demo-dots { display: flex; gap: 6px; }
.remy-landing .demo-dot { width: 10px; height: 10px; border-radius: 50%; }
.remy-landing .demo-messages {
  padding: 24px;
  display: flex; flex-direction: column; gap: 14px;
  min-height: 280px;
}
.remy-landing .demo-msg {
  display: flex; gap: 10px; align-items: flex-end;
  opacity: 0;
  animation: rl-fadeUp 0.5s forwards;
}
.remy-landing .demo-msg.user { flex-direction: row-reverse; }
.remy-landing .demo-avatar {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; color: #fff;
  flex-shrink: 0;
}
.remy-landing .demo-bubble {
  padding: 12px 16px;
  font-size: 14px; line-height: 1.6;
  max-width: 72%;
  border-radius: 14px;
}
.remy-landing .demo-msg:not(.user) .demo-bubble {
  background: var(--navy-3);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  color: var(--text-mid);
}
.remy-landing .demo-msg.user .demo-bubble {
  background: var(--blue);
  border-bottom-right-radius: 4px;
  color: #fff;
}

/* PROGRAMS */
.remy-landing .programs {
  padding: 100px 40px;
  background: var(--navy-2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.remy-landing .programs-inner { max-width: 1000px; margin: 0 auto; }
.remy-landing .programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 56px;
}
.remy-landing .program-item {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  cursor: default;
  min-height: 100px;
}
.remy-landing .program-item:hover {
  border-color: var(--border-blue);
  background: var(--navy-3);
  transform: translateY(-2px);
}
.remy-landing .program-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.remy-landing .program-name {
  font-size: 13px; font-weight: 500;
  color: var(--text-mid); text-align: center;
  letter-spacing: 0.2px;
  line-height: 1.4;
}
.remy-landing .program-item:hover .program-name { color: var(--text); }
.remy-landing .programs-more {
  text-align: center; margin-top: 20px;
  font-size: 13px; color: var(--text-dim);
}

/* HOW IT WORKS */
.remy-landing .how {
  padding: 100px 40px;
  max-width: 860px; margin: 0 auto;
}
.remy-landing .steps {
  display: flex; flex-direction: column; gap: 0;
  margin-top: 56px;
  position: relative;
}
.remy-landing .steps::before {
  content: '';
  position: absolute;
  left: 23px; top: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, var(--blue), transparent);
}
.remy-landing .step {
  display: flex; gap: 28px; align-items: flex-start;
  padding: 36px 0;
  border-bottom: 1px solid var(--border);
}
.remy-landing .step:last-child { border-bottom: none; }
.remy-landing .step-num {
  width: 46px; height: 46px; flex-shrink: 0;
  border: 1px solid var(--border-blue);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 600; color: var(--blue);
  background: var(--navy-card);
  position: relative; z-index: 1;
}
.remy-landing .step-content h3 {
  font-size: 18px; font-weight: 600;
  margin-bottom: 8px; color: var(--text);
}
.remy-landing .step-content p {
  font-size: 14px; line-height: 1.7;
  color: var(--text-dim);
}

/* STUCK FEATURE */
.remy-landing .stuck {
  padding: 100px 40px;
  text-align: center;
  position: relative; overflow: hidden;
  background: var(--navy-2);
  border-top: 1px solid var(--border);
}
.remy-landing .stuck-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%);
}
.remy-landing .stuck-inner { max-width: 580px; margin: 0 auto; position: relative; }
.remy-landing .stuck-button-demo {
  display: inline-block;
  border: 1px solid var(--border-blue);
  color: var(--blue);
  background: var(--blue-dim);
  padding: 14px 36px;
  font-size: 14px; font-weight: 500;
  border-radius: 10px;
  margin: 36px 0;
  animation: rl-glowPulse 3s infinite;
}
.remy-landing .stuck-desc {
  font-size: 15px; line-height: 1.8; color: var(--text-dim);
}

/* PRICING */
.remy-landing .pricing {
  padding: 100px 40px;
  border-top: 1px solid var(--border);
}
.remy-landing .pricing-inner { max-width: 860px; margin: 0 auto; }
.remy-landing .pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 56px;
}
.remy-landing .pricing-card {
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px 28px;
  position: relative;
  transition: border-color 0.2s;
}
.remy-landing .pricing-card.featured {
  border-color: var(--border-blue);
  background: var(--navy-3);
}
.remy-landing .pricing-badge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  background: var(--blue);
  color: #fff; font-size: 11px; font-weight: 500;
  padding: 4px 16px;
  border-radius: 0 0 8px 8px;
  letter-spacing: 0.5px;
}
.remy-landing .pricing-tier {
  font-size: 12px; font-weight: 500; letter-spacing: 2px;
  color: var(--text-dim); margin-bottom: 20px;
  text-transform: uppercase;
}
.remy-landing .pricing-price {
  font-size: 52px; font-weight: 600; color: var(--text);
  line-height: 1; margin-bottom: 4px;
  letter-spacing: -1px;
}
.remy-landing .pricing-price span { font-size: 22px; color: var(--text-dim); font-weight: 400; }
.remy-landing .pricing-period {
  font-size: 13px; color: var(--text-dim);
  margin-bottom: 28px;
}
.remy-landing .pricing-features {
  list-style: none;
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 36px;
}
.remy-landing .pricing-features li {
  font-size: 14px; color: var(--text-dim);
  display: flex; align-items: center; gap: 10px;
}
.remy-landing .pricing-features li::before {
  content: '✓';
  color: var(--blue); font-size: 13px; font-weight: 600;
}

/* WAITLIST */
.remy-landing .waitlist {
  padding: 100px 40px;
  text-align: center;
  position: relative; overflow: hidden;
  background: var(--navy-2);
  border-top: 1px solid var(--border);
}
.remy-landing .waitlist-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%);
}
.remy-landing .waitlist-inner { max-width: 540px; margin: 0 auto; position: relative; }
.remy-landing .waitlist-count {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--blue-dim);
  border: 1px solid var(--border-blue);
  border-radius: 100px;
  padding: 6px 16px;
  margin-bottom: 28px;
  font-size: 13px; color: #93c5fd;
}
.remy-landing .waitlist-count-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--blue);
  animation: rl-pulse 2s infinite;
}
.remy-landing .waitlist-form {
  display: flex; gap: 8px;
  margin-top: 36px;
  max-width: 460px; margin-left: auto; margin-right: auto;
}
.remy-landing .waitlist-input {
  flex: 1;
  background: var(--navy-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 18px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.remy-landing .waitlist-input::placeholder { color: var(--text-dim); }
.remy-landing .waitlist-input:focus { border-color: var(--border-blue); }
.remy-landing .waitlist-submit {
  background: var(--blue);
  border: none; color: #fff;
  padding: 14px 24px;
  font-family: 'Inter', sans-serif;
  font-size: 14px; font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.remy-landing .waitlist-submit:hover { background: #2563eb; }
.remy-landing .waitlist-note {
  margin-top: 14px;
  font-size: 12px; color: var(--text-dim);
}
.remy-landing .waitlist-success {
  flex-direction: column; align-items: center; gap: 14px;
  margin-top: 36px;
}
.remy-landing .waitlist-success-icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--blue-dim);
  border: 1px solid var(--border-blue);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  animation: rl-fadeUp 0.5s both;
}
.remy-landing .waitlist-success p {
  font-size: 15px; color: var(--text-mid);
  animation: rl-fadeUp 0.5s 0.2s both;
}
.remy-landing .waitlist-success strong { color: var(--blue); }

/* FOOTER */
.remy-landing footer {
  padding: 48px 60px;
  border-top: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 0;
}
.remy-landing .footer-logo { display: flex; align-items: center; gap: 10px; }
.remy-landing .footer-copy { font-size: 13px; color: var(--text-dim); }
.remy-landing .footer-tagline { font-size: 14px; color: var(--text-dim); }

/* ANIMATIONS */
@keyframes rl-fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rl-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
@keyframes rl-scrollPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
@keyframes rl-glowPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(59,130,246,0); }
  50% { box-shadow: 0 0 30px rgba(59,130,246,0.2); }
}

/* DEMO SCREENSHOT */
.remy-landing .demo-msg.user .demo-bubble.demo-bubble-with-img {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.remy-landing .demo-screenshot-thumb {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  width: 180px;
  display: block;
}

/* REVEAL */
.remy-landing .rl-reveal {
  opacity: 0; transform: translateY(18px);
  transition: opacity 0.6s, transform 0.6s;
}
.remy-landing .rl-reveal.rl-visible { opacity: 1; transform: translateY(0); }

/* RESPONSIVE */
@media (max-width: 640px) {
  .remy-landing nav { padding: 16px 20px; }
  .remy-landing .nav-links { display: none; }
  .remy-landing .hero { padding: 100px 20px 60px; }
  .remy-landing .features { padding: 60px 20px 40px; }
  .remy-landing .features-grid { grid-template-columns: 1fr; margin-top: 32px; }
  .remy-landing footer { flex-direction: column; gap: 16px; text-align: center; padding: 40px 20px; }
  .remy-landing .waitlist-form { flex-direction: column; }
}
`;
