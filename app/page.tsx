import { Suspense } from "react";
import Link from "next/link";

import { LandingNavigation } from "@/app/landing-navigation";
import { MochiMascot } from "@/app/mochi-mascot";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    number: "01",
    icon: "▤",
    title: "Your documents, together",
    description: "Bring PDFs, Word documents and text files into one private, organized space.",
  },
  {
    number: "02",
    icon: "⌕",
    title: "Ask anything",
    description: "Ask questions in your own words and find the details that matter.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Answers you can trust",
    description: "Explore the document passages and page references behind each answer.",
  },
];

const steps = [
  { number: "01", title: "Upload", description: "Add your documents to your private knowledge space." },
  { number: "02", title: "Ask", description: "Ask Mochi anything about the information you saved." },
  { number: "03", title: "Discover", description: "Get contextual answers with document references." },
];

export default function HomePage() {
  return (
    <Suspense fallback={<LandingFallback />}>
      <LandingContent />
    </Suspense>
  );
}

function LandingFallback() {
  return (
    <main className="landing-page landing-loading">
      <MochiMascot />
      <p>Preparing your knowledge space…</p>
    </main>
  );
}

async function LandingContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  return (
    <main className="landing-page">
      <header className="landing-header">
        <LandingNavigation isAuthenticated={isAuthenticated} />
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> YOUR PERSONAL AI KNOWLEDGE ASSISTANT</p>
          <h1 id="landing-title">Meet <span>Mochi.</span></h1>
          <p className="landing-hero-lead">Your knowledge deserves more than folders and forgotten files.</p>
          <p className="landing-hero-description">
            Bring your documents together, ask anything and let Mochi help you find the answers that matter.
          </p>
          <div className="landing-hero-actions">
            {isAuthenticated ? (
              <>
                <Link className="landing-button" href="/chat">Meet Mochi <span aria-hidden="true">↗</span></Link>
                <Link className="landing-secondary-link" href="/documents">Browse My Documents</Link>
              </>
            ) : (
              <>
                <Link className="landing-button" href="/signup">Get started <span aria-hidden="true">↗</span></Link>
                <Link className="landing-secondary-link" href="/login">I already have an account</Link>
              </>
            )}
          </div>
          <p className="landing-privacy"><span aria-hidden="true">◈</span> Your documents stay yours. Your knowledge stays private.</p>
        </div>

        <div className="landing-hero-art" aria-label="Mochi, your AI knowledge assistant">
          <div className="landing-orbit landing-orbit-outer" />
          <div className="landing-orbit landing-orbit-inner" />
          <span className="landing-spark landing-spark-one" aria-hidden="true">✳</span>
          <span className="landing-spark landing-spark-two" aria-hidden="true">✧</span>
          <span className="landing-spark landing-spark-three" aria-hidden="true">·</span>
          <div className="landing-mochi">
            <MochiMascot size="hero" title="Mochi, your friendly AI assistant" />
          </div>
          <div className="landing-art-caption">
            <span className="landing-caption-dot" />
            <span><strong>MOCHI</strong><small>Here to help you remember</small></span>
          </div>
        </div>
      </section>

      <div className="landing-trust-line" aria-hidden="true">
        <span>YOUR FILES</span><i /><span>YOUR QUESTIONS</span><i /><span>GROUNDED ANSWERS</span>
      </div>

      <section className="landing-features landing-section" id="features" aria-labelledby="features-title">
        <div className="landing-section-heading">
          <p className="landing-eyebrow"><span /> A LITTLE MORE CLARITY</p>
          <h2 id="features-title">Everything you need.<br /><em>Nothing you don’t.</em></h2>
        </div>
        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature" key={feature.number}>
              <div className="landing-feature-top">
                <span className="landing-feature-icon" aria-hidden="true">{feature.icon}</span>
                <span className="landing-feature-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how landing-section" id="how-it-works" aria-labelledby="how-title">
        <div className="landing-how-intro">
          <p className="landing-eyebrow"><span /> SIMPLE BY NATURE</p>
          <h2 id="how-title">From files to<br /><em>“found it.”</em></h2>
          <p>A calmer way to make the most of what you already know.</p>
        </div>
        <ol className="landing-steps">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="landing-step-number">{step.number}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
              <span className="landing-step-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-about landing-section" id="about" aria-labelledby="about-title">
        <MochiMascot size="welcome" />
        <div>
          <p className="landing-eyebrow"><span /> MEET YOUR KNOWLEDGE COMPANION</p>
          <h2 id="about-title">A little Mochi.<br /><em>A lot more “aha.”</em></h2>
          <p>Mochi helps you make connections across your own documents, so the things you need are never far away.</p>
        </div>
      </section>

      <section className="landing-final-cta" aria-labelledby="final-cta-title">
        <MochiMascot size="navbar" />
        <p className="landing-eyebrow"><span /> YOUR NEXT GOOD QUESTION STARTS HERE</p>
        <h2 id="final-cta-title">Ready to meet Mochi?</h2>
        <p>Your documents have stories to tell. Let’s discover them together.</p>
        <Link className="landing-button" href={isAuthenticated ? "/chat" : "/signup"}>
          {isAuthenticated ? "Open Assistant" : "Get started"} <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className="landing-footer">
        <Link className="wordmark landing-wordmark" href="/" aria-label="Knowledge Space home">
          <MochiMascot size="favicon" />
        </Link>
        <span>© {new Date().getFullYear()} Knowledge Space</span>
        {isAuthenticated ? (
          <nav aria-label="Workspace links">
            <Link href="/documents">My Documents</Link>
            <Link href="/chat">Assistant</Link>
          </nav>
        ) : <span className="landing-footer-note">Your knowledge, close at hand.</span>}
      </footer>
    </main>
  );
}
