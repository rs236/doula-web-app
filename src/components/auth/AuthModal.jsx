import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";
import { Card, Field } from "../ui.jsx";

export default function AuthModal({ onAuthSuccess, onSkipToLocal }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured) {
      if (onSkipToLocal) {
        onSkipToLocal();
        return;
      }
      setError("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
      return;
    }

    if (!email.trim() || (!password.trim() && mode !== "forgot")) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              business_name: businessName.trim() || "My Doula Practice",
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data?.session) {
          if (onAuthSuccess) onAuthSuccess(data.user);
        } else {
          setMessage("Account created! Please check your email inbox to confirm your account.");
        }
      } else if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (resetError) throw resetError;
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-dot"></span>
          <h1>MaternalSupportCo Hub</h1>
          <p className="auth-sub">Doula Practice Management Workspace</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="auth-notice">
            <b>Local Preview Mode</b>
            <p>
              Supabase credentials not yet detected in <code>.env</code>. You can explore the full workspace in local preview, or add your Supabase project keys to connect live data.
            </p>
            {onSkipToLocal && (
              <button type="button" className="ghost wide" onClick={onSkipToLocal}>
                Continue in Local Preview
              </button>
            )}
          </div>
        )}

        <div className="auth-tabs">
          <button
            type="button"
            className={"auth-tab " + (mode === "login" ? "active" : "")}
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
          >
            Doula Sign In
          </button>
          <button
            type="button"
            className={"auth-tab " + (mode === "signup" ? "active" : "")}
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
          >
            Create Practice Account
          </button>
        </div>

        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <Field label="Practice / Business Name">
              <input
                type="text"
                placeholder="e.g. Sage Birth & Postpartum"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </Field>
          )}

          <Field label="Email Address">
            <input
              type="email"
              placeholder="doula@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          {mode !== "forgot" && (
            <Field label="Password">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
          )}

          <button type="submit" className="primary wide" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In to Workspace"
              : mode === "signup"
              ? "Create My Doula Account"
              : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-foot">
          {mode === "login" ? (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setMode("forgot");
                setError(null);
              }}
            >
              Forgot your password?
            </button>
          ) : (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
