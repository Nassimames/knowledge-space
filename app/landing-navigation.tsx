"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { MochiMascot } from "@/app/mochi-mascot";

export function LandingNavigation({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <Link className="wordmark landing-wordmark" href="/" aria-label="Knowledge Space home">
        <MochiMascot />
        <span className="landing-wordmark-name">Knowledge Space</span>
      </Link>

      <nav className="landing-nav" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#about">About</a>
      </nav>

      <div className="landing-header-actions">
        {isAuthenticated ? (
          <>
            <Link className="landing-signin" href="/documents">My Documents</Link>
            <Link className="landing-button landing-button-small" href="/chat">Open Assistant <span aria-hidden="true">↗</span></Link>
          </>
        ) : (
          <>
            <Link className="landing-signin" href="/login">Sign in</Link>
            <Link className="landing-button landing-button-small" href="/signup">Get started <span aria-hidden="true">↗</span></Link>
          </>
        )}
      </div>

      <button
        className={`landing-menu-toggle${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="landing-mobile-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen ? (
        <nav className="landing-mobile-menu" id="landing-mobile-menu" aria-label="Mobile navigation">
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <span className="landing-mobile-menu-divider" />
          {isAuthenticated ? (
            <>
              <Link href="/documents" onClick={closeMenu}>My Documents</Link>
              <Link className="landing-button" href="/chat" onClick={closeMenu}>Open Assistant <span aria-hidden="true">↗</span></Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu}>Sign in</Link>
              <Link className="landing-button" href="/signup" onClick={closeMenu}>Get started <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </nav>
      ) : null}
    </>
  );
}
