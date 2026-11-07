import type { ReactNode } from "react";
import Link from "next/link";
import { MochiMascot } from "@/app/mochi-mascot";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Personal AI Knowledge Assistant">
        <Link className="wordmark auth-wordmark" href="/" aria-label="Knowledge Space home">
          <MochiMascot />
        </Link>
        <div className="auth-story-copy">
          <p className="eyebrow">PRIVATE BY DESIGN</p>
          <h1>A quieter home for everything you want to remember.</h1>
          <p>Your private documents stay tied to your account, from sign-in through storage.</p>
        </div>
        <span className="auth-story-index">KNOWLEDGE WORKSPACE / 03B</span>
      </section>

      <section className="auth-form-region" aria-labelledby="auth-title">
        <div className="auth-form-content">
          <p className="section-label">{eyebrow}</p>
          <h2 id="auth-title">{title}</h2>
          <p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthLoading() {
  return (
    <main className="auth-loading" role="status" aria-live="polite">
      Checking your session…
    </main>
  );
}