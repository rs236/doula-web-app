import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";
import { CURRENCIES } from "../../lib/currency.js";
import {
  IconLock,
  IconMail,
  IconEye,
  IconEyeOff,
  IconBolt,
  IconClients,
  IconCheck,
  IconSparkles,
} from "../icons.jsx";

export default function LoginPage({
  onDoulaAuthSuccess,
  onClientPortalLogin,
  onExploreDemoDoula,
  onExploreDemoClient,
  clients = [],
  currentCurrency = "USD",
  onSelectCurrency,
}) {
  const [activeTab, setActiveTab] = useState("doula-login"); // "doula-login" | "doula-signup" | "client-portal"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [doulaName, setDoulaName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency || "USD");

  // Client portal field
  const [clientToken, setClientToken] = useState("");

  // Forgot password toggle
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const clearFeedback = () => {
    setError(null);
    setMessage(null);
  };

  /* Doula Sign In Handler */
  const handleDoulaSignIn = async (e) => {
    e?.preventDefault();
    clearFeedback();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) throw signInErr;
        onDoulaAuthSuccess(data.user, rememberMe);
      } else {
        // Local preview fallback without live Supabase
        const dummyUser = {
          id: "local-doula-" + Date.now(),
          email: email.trim(),
          user_metadata: {
            full_name: doulaName || "Sage Doula",
            business_name: practiceName || "Maternal Support Practice",
          },
        };
        onDoulaAuthSuccess(dummyUser, rememberMe);
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* Doula Sign Up Handler */
  const handleDoulaSignUp = async (e) => {
    e?.preventDefault();
    clearFeedback();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: doulaName.trim() || "Doula Caregiver",
              business_name: practiceName.trim() || "Sage Doula Care",
              currency: selectedCurrency,
            },
          },
        });
        if (signUpErr) throw signUpErr;
        if (data?.session) {
          onDoulaAuthSuccess(data.user, rememberMe);
        } else {
          setMessage(
            "Account created! Please check your email inbox to confirm your account, then sign in."
          );
          setActiveTab("doula-login");
        }
      } else {
        // Local simulation
        const dummyUser = {
          id: "local-doula-" + Date.now(),
          email: email.trim(),
          user_metadata: {
            full_name: doulaName.trim() || "Doula Caregiver",
            business_name: practiceName.trim() || "Sage Doula Care",
            currency: selectedCurrency,
          },
        };
        if (onSelectCurrency) onSelectCurrency(selectedCurrency);
        onDoulaAuthSuccess(dummyUser, rememberMe);
      }
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Client Portal Magic Access (Strict Cryptographic Token Only) */
  const handleClientAccess = (e) => {
    e?.preventDefault();
    clearFeedback();

    const query = clientToken.trim().toLowerCase();
    if (!query || query.length < 8) {
      setError("Please enter your private client access token.");
      return;
    }

    const match = clients.find(
      (c) =>
        (c.access_token && c.access_token.toLowerCase() === query) ||
        (c.accessToken && c.accessToken.toLowerCase() === query)
    );

    if (match) {
      onClientPortalLogin(match);
    } else {
      setError(
        "Invalid access token. Please check the secret portal link provided by your doula."
      );
    }
  };

  /* Forgot Password Handler */
  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    clearFeedback();
    if (!forgotEmail.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim());
        if (resetErr) throw resetErr;
        setMessage("Password reset instructions have been sent to your email.");
      } else {
        setMessage("Password reset instructions sent! (Demo mode simulated).");
      }
      setShowForgot(false);
    } catch (err) {
      setError(err.message || "Unable to send reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas">
      {/* Background soft ambient accents */}
      <div className="login-ambient login-ambient-1" />
      <div className="login-ambient login-ambient-2" />

      <motion.div
        className="login-card-container"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-brand-badge">
            <span className="brand-dot" />
            <span>MaternalSupportCo Practice OS</span>
          </div>
          <h1 className="login-title">Care & Clinical Workspace</h1>
          <p className="login-subtitle">
            Private management suite for doulas, midwives, and expectant families.
          </p>
        </div>

        {/* Live / Demo Mode Badge */}
        {!isSupabaseConfigured && (
          <div className="login-mode-banner">
            <div className="login-mode-tag">
              <IconSparkles size={13} />
              <span>Instant Cloud & Local Ready</span>
            </div>
            <p>
              Supabase live auth keys can be linked in <code>.env</code> / Vercel. You can sign in
              instantly with 1-Click Demo or your credentials!
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={"login-tab " + (activeTab === "doula-login" ? "active" : "")}
            onClick={() => {
              setActiveTab("doula-login");
              clearFeedback();
            }}
          >
            Doula Sign In
          </button>
          <button
            type="button"
            className={"login-tab " + (activeTab === "doula-signup" ? "active" : "")}
            onClick={() => {
              setActiveTab("doula-signup");
              clearFeedback();
            }}
          >
            Create Practice
          </button>
          <button
            type="button"
            className={"login-tab " + (activeTab === "client-portal" ? "active" : "")}
            onClick={() => {
              setActiveTab("client-portal");
              clearFeedback();
            }}
          >
            Client Portal
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="login-alert error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
          {message && (
            <motion.div
              className="login-alert success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab 1: Doula Sign In */}
        {activeTab === "doula-login" && (
          <motion.div
            key="tab-login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="login-tab-content"
          >
            <form onSubmit={handleDoulaSignIn} className="login-form">
              <div className="login-field">
                <label>Email Address</label>
                <div className="neu-input-wrap">
                  <IconMail size={16} className="neu-input-icon" />
                  <input
                    type="email"
                    placeholder="doula@maternalsupport.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-field-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="login-link-btn"
                    onClick={() => setShowForgot(!showForgot)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="neu-input-wrap">
                  <IconLock size={16} className="neu-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="neu-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Forgot password drop-down */}
              {showForgot && (
                <div className="login-forgot-panel">
                  <p>Enter your email to receive password reset instructions:</p>
                  <div className="neu-input-wrap">
                    <IconMail size={15} className="neu-input-icon" />
                    <input
                      type="email"
                      placeholder="doula@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <button
                      type="button"
                      className="neu-pill-action"
                      disabled={loading}
                      onClick={handleForgotPassword}
                    >
                      Send Reset
                    </button>
                  </div>
                </div>
              )}

              <div className="login-options-row">
                <label className="neu-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In to Workspace"}
              </button>
            </form>

            <div className="login-divider">
              <span>OR EXPLORE INSTANTLY</span>
            </div>

            {/* 1-Click Demo Login */}
            <button
              type="button"
              className="login-demo-btn doula-demo"
              onClick={onExploreDemoDoula}
            >
              <div className="demo-btn-icon">
                <IconBolt size={18} />
              </div>
              <div className="demo-btn-text">
                <b>⚡ 1-Click Doula Demo Login</b>
                <span>Open full workspace with 14 clinical modules & sample clients</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* Tab 2: Create Practice Account */}
        {activeTab === "doula-signup" && (
          <motion.div
            key="tab-signup"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="login-tab-content"
          >
            <form onSubmit={handleDoulaSignUp} className="login-form">
              <div className="login-field">
                <label>Your Full Name</label>
                <div className="neu-input-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Maya Thorne, CD(DONA)"
                    value={doulaName}
                    onChange={(e) => setDoulaName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label>Practice / Studio Name</label>
                <div className="neu-input-wrap">
                  <input
                    type="text"
                    placeholder="e.g. Sage Birth & Postpartum Care"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field-grid">
                <div className="login-field">
                  <label>Primary Email</label>
                  <div className="neu-input-wrap">
                    <IconMail size={15} className="neu-input-icon" />
                    <input
                      type="email"
                      placeholder="care@sagebirth.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label>Default Currency</label>
                  <div className="neu-input-wrap">
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="neu-select"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) — {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="login-field">
                <label>Create Password</label>
                <div className="neu-input-wrap">
                  <IconLock size={15} className="neu-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="neu-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? "Creating Practice..." : "Register Practice Workspace"}
              </button>
            </form>

            <div className="login-footer-hint">
              <span>Already registered?</span>{" "}
              <button
                type="button"
                className="login-link-btn"
                onClick={() => {
                  setActiveTab("doula-login");
                  clearFeedback();
                }}
              >
                Sign in to your practice
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Client Portal Access */}
        {activeTab === "client-portal" && (
          <motion.div
            key="tab-portal"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="login-tab-content"
          >
            <div className="client-portal-intro">
              <div className="client-portal-icon">
                <IconClients size={20} />
              </div>
              <div>
                <b>Expecting Parent & Family Access</b>
                <p>
                  Access your personal Care Team card, birth plan forms, emergency numbers, and visit
                  calendar.
                </p>
              </div>
            </div>

            <form onSubmit={handleClientAccess} className="login-form">
              <div className="login-field">
                <label>Private Client Access Token</label>
                <div className="neu-input-wrap">
                  <input
                    type="text"
                    placeholder="e.g. tok_2a8f9c1b... (from your welcome link)"
                    value={clientToken}
                    onChange={(e) => setClientToken(e.target.value)}
                    required
                  />
                </div>
                <span className="login-field-help">
                  Found in your confidential onboarding email or WhatsApp invite from your doula.
                </span>
              </div>

              <button type="submit" className="login-submit-btn">
                Open My Care Portal
              </button>
            </form>

            <div className="login-divider">
              <span>OR PREVIEW DEMO CLIENT PORTAL</span>
            </div>

            {/* 1-Click Client Demo */}
            <button
              type="button"
              className="login-demo-btn client-demo"
              onClick={onExploreDemoClient}
            >
              <div className="demo-btn-icon">
                <IconCheck size={18} />
              </div>
              <div className="demo-btn-text">
                <b>⚡ 1-Click Client Demo (Maya Lin)</b>
                <span>View real-time Care Card, birth preferences & visit scheduling</span>
              </div>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
