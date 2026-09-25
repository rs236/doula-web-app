import { useState } from "react";
import { motion } from "motion/react";
import { IconCheck, IconCopy } from "./icons.jsx";
import { AnimatedGroup, SPRINGS } from "./motion/MotionPrimitives.jsx";

/* High-craft shared presentation components */

export const PageHead = ({ eyebrow, title, sub, action }) => (
  <div className="pagehead">
    <div className="pagehead-main">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {action && <div className="pagehead-action">{action}</div>}
  </div>
);

export const Card = ({ title, count, action, children, className = "", spotlight = false }) => (
  <section className={`card ${spotlight ? "card-spotlight" : ""} ${className}`.trim()}>
    {(title || action || count !== undefined) && (
      <div className="cardtop">
        <div className="cardtop-title">
          {title && <h2>{title}</h2>}
          {count !== undefined && <span className="count">{count}</span>}
        </div>
        {action && <div className="cardtop-action">{action}</div>}
      </div>
    )}
    {children}
  </section>
);

export const MetricCard = ({ title, value, sub, icon: Icon, variant = "default", badge }) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={SPRINGS.tactile}
      className={`metric-card metric-${variant}`}
    >
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-wrap">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-footer">
        {badge && <span className="metric-badge">{badge}</span>}
        {sub && <span className="metric-sub">{sub}</span>}
      </div>
    </motion.div>
  );
};

export const MetricRibbon = ({ children, cols = 3 }) => (
  <AnimatedGroup className={`metric-ribbon cols-${cols}`} stagger={0.06}>
    {children}
  </AnimatedGroup>
);

export const StatusBadge = ({ status = "lead", label }) => {
  const s = String(status).toLowerCase();
  const displayLabel = label || s.toUpperCase();
  let variant = "default";
  if (["active", "paid", "signed", "completed"].includes(s)) variant = "ok";
  else if (["pending", "submitted", "sent"].includes(s)) variant = "warn";
  else if (["denied", "expired", "bad"].includes(s)) variant = "bad";

  return (
    <span className={`tag tag-${variant}`}>
      <span className="tag-dot" />
      {displayLabel}
    </span>
  );
};

export const CopyButton = ({ text, label = "Copy link", copiedLabel = "Copied!", className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={SPRINGS.tactile}
      className={`copy-btn ${copied ? "copied" : ""} ${className}`.trim()}
      onClick={handleCopy}
      title={copied ? "Copied to clipboard!" : `Copy: ${text}`}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      <span>{copied ? copiedLabel : label}</span>
    </motion.button>
  );
};

export const Empty = ({ children, icon: Icon, action }) => (
  <div className="empty">
    {Icon && (
      <div className="empty-icon-wrap">
        <Icon size={32} />
      </div>
    )}
    <div className="empty-content">{children}</div>
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export const KV = ({ k, v, highlight = false }) => (
  <div className={`kv ${highlight ? "kv-highlight" : ""}`}>
    <span>{k}</span>
    <b>{v || "—"}</b>
  </div>
);

export const Field = ({ label, hint, required, children, className = "" }) => (
  <div className={`fld ${className}`.trim()}>
    {label && (
      <label>
        {label}
        {required && <span className="req">*</span>}
      </label>
    )}
    {children}
    {hint && <span className="fld-hint">{hint}</span>}
  </div>
);

export const Stat = ({ label, value, sub, icon: Icon }) => (
  <div className="stat">
    {Icon && (
      <div className="stat-icon">
        <Icon size={18} />
      </div>
    )}
    <div className="stat-body">
      <b>{value}</b>
      <span>{label}</span>
      {sub && <small className="stat-sub">{sub}</small>}
    </div>
  </div>
);
