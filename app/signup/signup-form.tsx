"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== passwordConfirmation) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Use a password with at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/documents`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace("/documents");
        router.refresh();
        return;
      }

      setConfirmationRequired(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmationRequired) {
    return (
      <div className="auth-success" role="status" aria-live="polite">
        <h3>Check your inbox</h3>
        <p>We sent a confirmation link to {email.trim()}. Follow it to finish creating your account.</p>
        <Link href="/login">Return to sign in</Link>
      </div>
    );
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field" htmlFor="signup-email">
          <span>Email</span>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="auth-field" htmlFor="signup-password">
          <span>Password</span>
          <div className="password-control">
            <input
              id="signup-password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="auth-field" htmlFor="signup-confirm-password">
          <span>Confirm password</span>
          <input
            id="signup-confirm-password"
            name="passwordConfirmation"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
        </label>

        {errorMessage ? <p className="auth-error" role="alert">{errorMessage}</p> : null}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}