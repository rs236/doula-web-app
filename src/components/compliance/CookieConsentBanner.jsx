import { useState, useEffect } from "react";
import { IconCheck, IconClose, IconSettings } from "../icons.jsx";

const STORAGE_KEY = "msc_cookie_consent_v1";

export function getStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredConsent(consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent("msc:consent-updated", { detail: consent }));
    return true;
  } catch {
    return false;
  }
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });
  const [gpcActive, setGpcActive] = useState(false);

  useEffect(() => {
    // Detect Global Privacy Control (GPC)
    const isGpc =
      typeof navigator !== "undefined" &&
      (navigator.globalPrivacyControl === true || navigator.globalPrivacyControl === "1");
    if (isGpc) {
      setGpcActive(true);
    }

    const existing = getStoredConsent();
    if (!existing) {
      // Prior-consent: If GPC is active, default non-essentials to false
      if (isGpc) {
        setPreferences((p) => ({ ...p, functional: true, analytics: false, marketing: false }));
      }
      setVisible(true);
    } else {
      setPreferences(existing);
    }

    const handleReopen = () => {
      setVisible(true);
      setShowDetails(true);
    };
    window.addEventListener("msc:open-cookie-banner", handleReopen);
    return () => window.removeEventListener("msc:open-cookie-banner", handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const all = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: !gpcActive, // Honor GPC even on accept all
      timestamp: new Date().toISOString(),
      gpc: gpcActive,
    };
    saveStoredConsent(all);
    setPreferences(all);
    setVisible(false);
  };

  const handleDeclineNonEssential = () => {
    const minimal = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      gpc: gpcActive,
    };
    saveStoredConsent(minimal);
    setPreferences(minimal);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const custom = {
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
      gpc: gpcActive,
    };
    saveStoredConsent(custom);
    setVisible(false);
  };

  if (!visible) {
    return (
      <button
        type="button"
        className="cookie-reopen-trigger"
        onClick={() => {
          setVisible(true);
          setShowDetails(true);
        }}
        title="Privacy & Cookie Preferences"
        aria-label="Privacy & Cookie Preferences"
      >
        <span style={{ fontSize: "14px", marginRight: "6px" }}>🍪</span> Privacy Settings
      </button>
    );
  }

  return (
    <aside
      className="cookie-banner-overlay"
      role="region"
      aria-label="Privacy and Cookie Consent"
      aria-live="polite"
    >
      <div className="cookie-banner-modal neu-card">
        <div className="cookie-banner-header">
          <div className="cookie-banner-title">
            <span style={{ fontSize: "20px" }}>🛡️</span>
            <h3>Privacy & Data Preferences</h3>
          </div>
          <button
            type="button"
            className="icon-btn-subtle"
            onClick={() => setVisible(false)}
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <p className="cookie-banner-desc">
          MaternalSupportCo Hub operates on a <strong>zero-tracking-by-default</strong> model. We use local
          storage strictly to run your workspace and protect sensitive birth records. We never sell your personal
          or health data.
        </p>

        {gpcActive && (
          <div className="gpc-badge">
            <IconCheck /> <strong>Global Privacy Control (GPC) Active:</strong> Non-essential tracking is
            automatically disabled per your browser's privacy signal.
          </div>
        )}

        {showDetails && (
          <div className="cookie-categories">
            <div className="cookie-category-item">
              <div className="cat-meta">
                <strong>Essential & Workspace Storage</strong>
                <span>Required for workspace operation, offline cache, and secure login. Cannot be disabled.</span>
              </div>
              <input type="checkbox" checked disabled readOnly aria-label="Essential storage enabled" />
            </div>

            <div className="cookie-category-item">
              <div className="cat-meta">
                <strong>Functional Preferences</strong>
                <span>Remembers your preferred currency, active client filters, and UI display options.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                aria-label="Functional preferences toggle"
              />
            </div>

            <div className="cookie-category-item">
              <div className="cat-meta">
                <strong>Performance & Diagnostics</strong>
                <span>Anonymous error reporting and load latency monitoring to improve software reliability.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                aria-label="Performance diagnostics toggle"
              />
            </div>

            <div className="cookie-category-item">
              <div className="cat-meta">
                <strong>Marketing & Third-Party Beacons</strong>
                <span>None active. We do not use third-party behavioral advertising pixels.</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                disabled={gpcActive}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                aria-label="Marketing beacons toggle"
              />
            </div>
          </div>
        )}

        <div className="cookie-banner-actions">
          {!showDetails ? (
            <>
              <button type="button" className="btn-secondary" onClick={() => setShowDetails(true)}>
                Customize Preferences
              </button>
              <button type="button" className="btn-secondary" onClick={handleDeclineNonEssential}>
                Reject Non-Essential
              </button>
              <button type="button" className="primary" onClick={handleAcceptAll}>
                Accept All
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-secondary" onClick={() => setShowDetails(false)}>
                Back
              </button>
              <button type="button" className="primary" onClick={handleSaveCustom}>
                Save Preferences
              </button>
            </>
          )}
        </div>

        <div className="cookie-banner-footer-links">
          <a href="#/legal/privacy">Privacy Policy</a>
          <span>·</span>
          <a href="#/legal/health-hipaa">Health Data Notice</a>
          <span>·</span>
          <a href="#/data-request">DSAR Portal</a>
        </div>
      </div>
    </aside>
  );
}
