import { useState, useMemo, useEffect } from "react";
import { LEGAL_POLICIES } from "../../data/legalPolicies.js";
import { PageHead, Card } from "../ui.jsx";
import { IconDocs, IconSign, IconCheck, IconClose } from "../icons.jsx";

export default function LegalCenter({ initialSlug = "privacy", onBack, onOpenDsar }) {
  const [activeSlug, setActiveSlug] = useState(initialSlug in LEGAL_POLICIES ? initialSlug : "privacy");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSlug && initialSlug in LEGAL_POLICIES) {
      setActiveSlug(initialSlug);
    }
  }, [initialSlug]);

  const policy = LEGAL_POLICIES[activeSlug] || LEGAL_POLICIES.privacy;

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return policy.sections;
    const q = searchTerm.toLowerCase();
    return policy.sections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [policy, searchTerm]);

  const handleCopyText = async () => {
    try {
      const fullText = `${policy.title}\n${policy.subtitle}\nLast Updated: ${policy.lastUpdated}\n\n` +
        policy.sections.map((s) => `${s.title}\n\n${s.content}`).join("\n\n---\n\n");
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback */
    }
  };

  const handleOpenCookieBanner = () => {
    window.dispatchEvent(new CustomEvent("msc:open-cookie-banner"));
  };

  return (
    <div className="legal-center-container">
      {/* Top Banner Navigation */}
      <header className="legal-center-header">
        <div>
          <div className="trust-badge">
            <span style={{ fontSize: "16px" }}>🛡️</span> MaternalSupportCo Trust & Compliance Hub
          </div>
          <h1 className="legal-title">{policy.title}</h1>
          <p className="legal-subtitle">{policy.subtitle}</p>
        </div>

        <div className="legal-actions-bar">
          {onBack && (
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Back to App
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={handleCopyText}>
            {copied ? "✓ Copied Full Text" : "Copy Policy Text"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Print / PDF
          </button>
        </div>
      </header>

      {/* Main Grid: Sidebar + Document Content */}
      <div className="legal-layout-grid">
        {/* Sidebar Nav */}
        <nav className="legal-sidebar" aria-label="Legal documents">
          <div className="legal-search-box">
            <input
              type="search"
              className="neu-input"
              placeholder="Search policies & clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", fontSize: "13px" }}
            />
          </div>

          <div className="legal-nav-group">
            <div className="legal-nav-header">Core Compliance Documents</div>
            {Object.values(LEGAL_POLICIES).map((p) => (
              <button
                type="button"
                key={p.id}
                className={`legal-nav-item ${activeSlug === p.id ? "active" : ""}`}
                onClick={() => {
                  setActiveSlug(p.id);
                  setSearchTerm("");
                }}
              >
                <span className="doc-icon">📄</span>
                <span className="doc-label">{p.title}</span>
              </button>
            ))}
          </div>

          <div className="legal-nav-group" style={{ marginTop: "24px" }}>
            <div className="legal-nav-header">Interactive Governance Tools</div>
            <button
              type="button"
              className="legal-nav-item"
              onClick={onOpenDsar || (() => (window.location.hash = "#/data-request"))}
            >
              <span className="doc-icon">📦</span>
              <span className="doc-label">Data Request (DSAR) Portal</span>
            </button>
            <button type="button" className="legal-nav-item" onClick={handleOpenCookieBanner}>
              <span className="doc-icon">🍪</span>
              <span className="doc-label">Cookie & Privacy Settings</span>
            </button>
          </div>

          <div className="legal-sidebar-meta">
            <small>
              Last Platform Audit: <strong>September 2026</strong>
              <br />
              Frameworks: <strong>GDPR · DPDPA · CCPA · HIPAA/HBNR</strong>
            </small>
          </div>
        </nav>

        {/* Content Viewer */}
        <main className="legal-content-main neu-card" tabIndex={-1}>
          <div className="policy-meta-ribbon">
            <span>Effective Date: <strong>{policy.lastUpdated}</strong></span>
            <span>·</span>
            <span>Version: <strong>2026.2 (Enterprise Verified)</strong></span>
            <span>·</span>
            <span className="badge-ok">Full Statutory Disclosure</span>
          </div>

          {filteredSections.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--c-sub)" }}>
              No clauses matched "<strong>{searchTerm}</strong>". Try another keyword.
            </div>
          )}

          <div className="policy-sections-list">
            {filteredSections.map((sec) => (
              <article key={sec.id} className="policy-section-block" id={sec.id}>
                <h2 className="policy-sec-title">{sec.title}</h2>
                <div className="policy-sec-body">
                  {sec.content.split("\n\n").map((para, i) => (
                    <p key={i} style={{ margin: "0 0 14px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
