import { useState, useEffect, useCallback } from "react";
import { seed } from "./data/seed.js";
import { loadDb, saveDb, isAvailable } from "./lib/storage.js";
import { buildAlerts } from "./lib/derive.js";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
import { CURRENCIES, currencySymbol } from "./lib/currency.js";

import {
  IconToday,
  IconClients,
  IconSchedule,
  IconDocs,
  IconInvoices,
  IconBilling,
  IconPayments,
  IconMileage,
  IconOnCall,
  IconFormStudio,
  IconLabor,
  IconPostpartum,
  IconBackup,
  IconSettings,
  IconHome,
  IconSign,
  IconLogOut,
  IconMore,
  IconGrid,
  IconMenu,
  IconClose,
  IconChevronRight
} from "./components/icons.jsx";

import LoginPage from "./components/auth/LoginPage.jsx";
import Today from "./components/doula/Today.jsx";
import OnCall from "./components/doula/OnCall.jsx";
import Clients from "./components/doula/Clients.jsx";
import Schedule from "./components/doula/Schedule.jsx";
import Docs from "./components/doula/Docs.jsx";
import Invoices from "./components/doula/Invoices.jsx";
import BillingTracker from "./components/doula/BillingTracker.jsx";
import FormStudio from "./components/doula/FormStudio.jsx";
import BirthLog from "./components/doula/BirthLog.jsx";
import Postpartum from "./components/doula/Postpartum.jsx";
import Money from "./components/doula/Money.jsx";
import Backup from "./components/doula/Backup.jsx";
import Mileage from "./components/doula/Mileage.jsx";
import Settings from "./components/doula/Settings.jsx";
import { TransitionPanel } from "./components/motion/MotionPrimitives.jsx";

import PortalHome from "./components/portal/PortalHome.jsx";
import PortalForms from "./components/portal/PortalForms.jsx";
import PortalBook from "./components/portal/PortalBook.jsx";
import CareCard from "./components/portal/CareCard.jsx";

const DOULA_SECTIONS = [
  {
    title: "Practice",
    items: [
      { key: "today", label: "Today", icon: IconToday },
      { key: "clients", label: "Clients", icon: IconClients },
      { key: "schedule", label: "Schedule", icon: IconSchedule },
      { key: "docs", label: "Documents", icon: IconDocs },
    ],
  },
  {
    title: "Financial",
    items: [
      { key: "invoices", label: "Invoices", icon: IconInvoices },
      { key: "billing", label: "Billing tracker", icon: IconBilling },
      { key: "money", label: "Payments", icon: IconPayments },
      { key: "mileage", label: "Mileage", icon: IconMileage },
    ],
  },
  {
    title: "Care & Clinical",
    items: [
      { key: "oncall", label: "On-call board", icon: IconOnCall },
      { key: "formstudio", label: "Form Studio", icon: IconFormStudio },
      { key: "labor", label: "Birth log", icon: IconLabor },
      { key: "postpartum", label: "Postpartum", icon: IconPostpartum },
      { key: "backup", label: "Backup cover", icon: IconBackup },
    ],
  },
  {
    title: "System",
    items: [
      { key: "settings", label: "Settings", icon: IconSettings },
    ],
  },
];

const DOULA_NAV = DOULA_SECTIONS.flatMap((s) => s.items.map((i) => [i.key, i.label]));

const CLIENT_NAV_ITEMS = [
  { key: "p-home", label: "My care", icon: IconHome },
  { key: "p-forms", label: "My forms", icon: IconSign },
  { key: "p-book", label: "Book a visit", icon: IconSchedule },
  { key: "p-card", label: "Care team card", icon: IconLabor },
];

const CLIENT_NAV = CLIENT_NAV_ITEMS.map((i) => [i.key, i.label]);

// All modules accessible via the hamburger drawer
const DOULA_MORE_MODULES = [
  { key: "today", label: "Today", icon: IconToday, desc: "Daily schedule & active alerts" },
  { key: "clients", label: "Clients CRM", icon: IconClients, desc: "Client roster & magic links" },
  { key: "schedule", label: "Schedule", icon: IconSchedule, desc: "Calendar & slot booking" },
  { key: "docs", label: "Documents", icon: IconDocs, desc: "Fillable forms & signatures" },
  { key: "invoices", label: "Invoices", icon: IconInvoices, desc: "Create & send payment links" },
  { key: "billing", label: "Billing Tracker", icon: IconBilling, desc: "Medicaid & insurance claims" },
  { key: "oncall", label: "On-Call Board", icon: IconOnCall, desc: "Labor radius & active alerts" },
  { key: "formstudio", label: "Form Studio", icon: IconFormStudio, desc: "Custom form templates" },
  { key: "labor", label: "Birth Log", icon: IconLabor, desc: "Real-time contractions & notes" },
  { key: "postpartum", label: "Postpartum", icon: IconPostpartum, desc: "Weekly checks & feeding" },
  { key: "money", label: "Payments", icon: IconPayments, desc: "Installments & milestones" },
  { key: "backup", label: "Backup Cover", icon: IconBackup, desc: "Doula coverage & handoffs" },
  { key: "mileage", label: "Mileage", icon: IconMileage, desc: "Trip & tax expense log" },
  { key: "settings", label: "Settings", icon: IconSettings, desc: "Practice info & backups" },
];

const validTab = (role, tab) =>
  (role === "doula" ? DOULA_NAV : CLIENT_NAV).some(([k]) => k === tab);

export default function App() {
  const [db, setDb] = useState(null);
  const [storageOk, setStorageOk] = useState(true);
  const [role, setRole] = useState("doula");
  const [tab, setTab] = useState("today");
  const [portalClient, setPortalClient] = useState(null);
  const [openClient, setOpenClient] = useState(null);
  const [openForm, setOpenForm] = useState(null);
  const [toast, setToast] = useState(null);

  // Mobile navigation drawer state
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Auth session state (supports Supabase + persistent demo/local sessions)
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("msc_session");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [authSkipped, setAuthSkipped] = useState(false);

  /* Initialize DB & Auth */
  useEffect(() => {
    const ok = isAvailable();
    setStorageOk(ok);
    const initialDb = (ok && loadDb()) || seed();
    setDb(initialDb);

    // Parse URL hash for magic token portal route: #/portal/:token
    const rawHash = window.location.hash.replace("#/", "");
    if (rawHash.startsWith("portal/")) {
      const token = rawHash.split("/")[1];
      const match = initialDb.clients.find(
        (c) => (c.access_token && c.access_token === token) || (c.accessToken && c.accessToken === token)
      );
      if (match) {
        setPortalClient(match.id);
      }
      setRole("client");
      setTab("p-home");
      setAuthSkipped(true);
    } else if (rawHash.startsWith("book")) {
      setRole("client");
      setTab("p-book");
      setAuthSkipped(true);
    } else if (validTab("doula", rawHash)) {
      setTab(rawHash);
    } else if (validTab("client", rawHash)) {
      setRole("client");
      setTab(rawHash);
    }

    // Check Supabase Auth
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setAuthChecked(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthChecked(true);
    }
  }, []);

  /* Persist changes to storage */
  useEffect(() => {
    if (db) saveDb(db);
  }, [db]);

  /* Synchronize URL hash with active view */
  useEffect(() => {
    if (!db) return;
    if (role === "client" && portalClient) {
      const c = db.clients.find((x) => x.id === portalClient);
      const token = c?.access_token || c?.accessToken || portalClient;
      if (tab === "p-home") {
        window.location.hash = `/portal/${token}`;
        return;
      }
    }
    window.location.hash = "/" + tab;
  }, [tab, role, portalClient, db]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#/", "");
      if (h.startsWith("portal/")) {
        const token = h.split("/")[1];
        if (db) {
          const match = db.clients.find(
            (c) => (c.access_token && c.access_token === token) || (c.accessToken && c.accessToken === token)
          );
          if (match) setPortalClient(match.id);
        }
        setRole("client");
        setTab("p-home");
        return;
      }
      if (h && h !== tab) {
        if (validTab("client", h)) {
          setRole("client");
          setTab(h);
        } else if (validTab("doula", h)) {
          // Block unauthenticated clients from escalating into doula modules via URL hash
          if (!session?.user && role === "client") {
            window.location.hash = "/p-home";
            setRole("client");
            setTab("p-home");
            setToast("Access restricted: Doula credentials required");
            return;
          }
          setRole("doula");
          setTab(h);
        }
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [tab, db, session, role]);

  /* Toast dismiss */
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  /* Default the portal to the first client once data exists */
  useEffect(() => {
    if (db && !portalClient && db.clients[0]) setPortalClient(db.clients[0].id);
  }, [db, portalClient]);

  const up = useCallback((fn) => {
    setDb((d) => {
      const patch = typeof fn === "function" ? fn(d) : fn;
      return { ...d, ...patch };
    });
  }, []);

  const switchRole = (next) => {
    if (next === "doula" && !session?.user) {
      setToast("Doula login required to enter practice workspace");
      return;
    }
    setRole(next);
    setOpenClient(null);
    setOpenForm(null);
    setMobileMoreOpen(false);
    setTab(next === "doula" ? "today" : "p-home");
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("msc_session");
    } catch (e) {}
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setAuthSkipped(false);
    setRole("doula");
    setTab("today");
    setToast("Signed out successfully");
  };

  if (!db || !authChecked) {
    return (
      <div className="msc">
        <div className="boot">Opening your practice…</div>
      </div>
    );
  }

  // Show LoginPage if doula is not authenticated and hasn't chosen local preview
  const isDoulaUnauthenticated = role === "doula" && !session && !authSkipped;
  if (isDoulaUnauthenticated) {
    return (
      <div className="msc">
        <LoginPage
          clients={db.clients || []}
          currentCurrency={db.currency || "USD"}
          onSelectCurrency={(c) => up({ currency: c })}
          onDoulaAuthSuccess={(user, remember) => {
            setSession({ user });
            if (remember) {
              try {
                localStorage.setItem("msc_session", JSON.stringify({ user }));
              } catch (e) {}
            }
            setToast(`Welcome back, ${user.user_metadata?.full_name || user.email}!`);
          }}
          onExploreDemoDoula={() => {
            const demoUser = {
              id: "demo-doula",
              email: "doula@maternalsupport.co",
              user_metadata: {
                full_name: "Maya Thorne, CD",
                business_name: "Sage Birth & Postpartum",
              },
            };
            setSession({ user: demoUser });
            try {
              localStorage.setItem("msc_session", JSON.stringify({ user: demoUser }));
            } catch (e) {}
            setToast("Logged in as Sage Doula Demo");
          }}
          onExploreDemoClient={() => {
            setRole("client");
            if (db.clients && db.clients[0]) {
              setPortalClient(db.clients[0].id);
            }
            setTab("p-home");
            setAuthSkipped(true);
            setToast("Viewing Maya Lin's Client Care Portal");
          }}
          onClientPortalLogin={(matchedClient) => {
            setRole("client");
            setPortalClient(matchedClient.id);
            setTab("p-home");
            setAuthSkipped(true);
            setToast(`Welcome to your Care Portal, ${matchedClient.name}!`);
          }}
        />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    );
  }

  const alerts = buildAlerts(db);
  const client = db.clients.find((c) => c.id === portalClient) || db.clients[0];
  const openClientFromAlert = (id) => {
    setOpenClient(id);
    setTab("clients");
  };

  const isMoreTabActive = [
    "invoices",
    "billing",
    "money",
    "mileage",
    "oncall",
    "formstudio",
    "labor",
    "postpartum",
    "backup",
    "settings",
  ].includes(tab);

  return (
    <div className="msc app-root">
      {/* App Header Bar */}
      <header className="top app-header">
        <div className="brand">
          <button
            type="button"
            className="hamburger-btn"
            aria-label="Open menu"
            title="Open all modules menu"
            onClick={() => setMobileMoreOpen(true)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
          <div className="mark-badge">
            <span className="mark-dot"></span>
          </div>
          <div className="brand-text">
            <div className="bname">MaternalSupportCo</div>
            <div className="btag">Practice workspace</div>
          </div>
        </div>

        <div className="rolebar">
          {session?.user && (
            <div className="user-pill desktop-only">
              <span className="user-dot"></span>
              <span className="user-email">{session.user.email}</span>
            </div>
          )}

          {role === "client" && client && (
            session?.user ? (
              <div className="client-picker-wrap">
                <select
                  className="mini client-select"
                  aria-label="Preview client portal as"
                  value={client.id}
                  onChange={(e) => {
                    setPortalClient(e.target.value);
                    setOpenForm(null);
                  }}
                >
                  {db.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      Preview: {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="top-account-badge" title="Authenticated Patient Portal">
                <span className="top-account-dot"></span>
                <span>Patient Care Space: {client.name}</span>
              </div>
            )
          )}

          {role === "doula" && (
            <div className="currency-pill-wrap desktop-only" title="Practice Currency (Click to switch)">
              <span className="currency-pill-symbol">{currencySymbol(db.currency || "USD")}</span>
              <select
                className="mini currency-select"
                aria-label="Practice currency"
                value={db.currency || "USD"}
                onChange={(e) => {
                  const nextCur = e.target.value;
                  up({ currency: nextCur });
                  setToast(`Practice currency switched to ${nextCur}`);
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          )}

          {session?.user && (
            <div className="seg app-seg">
              <button
                type="button"
                className={role === "doula" ? "on" : ""}
                onClick={() => switchRole("doula")}
              >
                Doula
              </button>
              <button
                type="button"
                className={role === "client" ? "on" : ""}
                onClick={() => switchRole("client")}
              >
                Client
              </button>
            </div>
          )}

          {session?.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                className="top-account-badge desktop-only"
                title={session.user.email}
              >
                <span className="top-account-dot"></span>
                <span>
                  {session.user.user_metadata?.business_name ||
                    session.user.user_metadata?.full_name ||
                    session.user.email?.split("@")[0] ||
                    "Connected"}
                </span>
              </div>
              <button
                type="button"
                className="ghost icon-btn desktop-only"
                title="Sign out of practice"
                onClick={handleSignOut}
              >
                <IconLogOut size={13} style={{ marginRight: 4 }} />
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ghost icon-btn desktop-only"
              title="Sign out to Login"
              onClick={handleSignOut}
            >
              <IconLogOut size={13} style={{ marginRight: 4 }} />
              {role === "client" ? "Exit Portal" : "Sign Out"}
            </button>
          )}
        </div>
      </header>

      {!storageOk && (
        <div className="storagewarn">
          This browser is blocking local storage, so nothing you enter will survive a refresh. Turn off private
          browsing or allow site data.
        </div>
      )}

      <div className="shell app-body">
        {/* Desktop Sidebar Rail */}
        <nav className="rail desktop-rail" aria-label="Sections">
          {role === "doula" ? (
            DOULA_SECTIONS.map((sec) => (
              <div key={sec.title} className="rail-group">
                <div className="rail-section-label">{sec.title}</div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      className={"navitem" + (isActive ? " active" : "")}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => {
                        setTab(item.key);
                        if (item.key === "clients") setOpenClient(null);
                      }}
                    >
                      <div className="navitem-main">
                        <Icon size={16} className="navitem-icon" />
                        <span>{item.label}</span>
                      </div>
                      {item.key === "today" && alerts.length > 0 && (
                        <span className="dot">{alerts.length}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="rail-group">
              <div className="rail-section-label">Client Portal</div>
              {CLIENT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    className={"navitem" + (isActive ? " active" : "")}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setTab(item.key)}
                  >
                    <div className="navitem-main">
                      <Icon size={16} className="navitem-icon" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Main Content Area */}
        <main className="canvas app-canvas">
          <TransitionPanel activeKey={`${role}-${tab}`}>
            {/* Module 1: CRM */}
            {role === "doula" && tab === "clients" && (
              <Clients
                db={db}
                up={up}
                open={openClient}
                setOpen={setOpenClient}
                toast={setToast}
                setTab={setTab}
              />
            )}

            {/* Module 2: Booking */}
            {role === "doula" && tab === "schedule" && (
              <Schedule db={db} up={up} toast={setToast} />
            )}

            {/* Module 3: Document Library */}
            {role === "doula" && tab === "docs" && (
              <Docs db={db} up={up} toast={setToast} />
            )}

            {/* Module 4: Invoicing */}
            {role === "doula" && tab === "invoices" && (
              <Invoices db={db} up={up} toast={setToast} />
            )}

            {/* Module 5: Billing Tracker */}
            {role === "doula" && tab === "billing" && (
              <BillingTracker db={db} up={up} toast={setToast} />
            )}

            {/* Practice Management Supporting Views */}
            {role === "doula" && tab === "today" && (
              <Today db={db} alerts={alerts} onOpen={openClientFromAlert} />
            )}
            {role === "doula" && tab === "oncall" && (
              <OnCall db={db} up={up} onOpen={openClientFromAlert} />
            )}
            {role === "doula" && tab === "formstudio" && (
              <FormStudio db={db} up={up} toast={setToast} />
            )}
            {role === "doula" && tab === "labor" && (
              <BirthLog db={db} up={up} toast={setToast} />
            )}
            {role === "doula" && tab === "postpartum" && (
              <Postpartum db={db} up={up} toast={setToast} />
            )}
            {role === "doula" && tab === "money" && (
              <Money db={db} up={up} />
            )}
            {role === "doula" && tab === "backup" && (
              <Backup db={db} up={up} toast={setToast} />
            )}
            {role === "doula" && tab === "mileage" && (
              <Mileage db={db} up={up} />
            )}
            {role === "doula" && tab === "settings" && (
              <Settings db={db} up={up} toast={setToast} onReset={() => setDb(seed())} />
            )}

            {/* Client Portal Views */}
            {role === "client" && client && tab === "p-home" && (
              <PortalHome db={db} c={client} go={setTab} />
            )}
            {role === "client" && client && tab === "p-forms" && (
              <PortalForms
                db={db}
                up={up}
                c={client}
                openForm={openForm}
                setOpenForm={setOpenForm}
                toast={setToast}
              />
            )}
            {role === "client" && client && tab === "p-book" && (
              <PortalBook db={db} up={up} c={client} toast={setToast} />
            )}
            {role === "client" && client && tab === "p-card" && (
              <CareCard db={db} c={client} />
            )}
          </TransitionPanel>
        </main>
      </div>

      {/* ====================================================================
          Native Mobile Bottom App Tabbar (Fixed on mobile / tablets)
          ==================================================================== */}
      <nav className="mobile-tabbar" aria-label="Mobile Navigation">
        {role === "doula" ? (
          <>
            <button
              type="button"
              className={"mobile-tab " + (tab === "today" ? "active" : "")}
              onClick={() => {
                setTab("today");
                setMobileMoreOpen(false);
              }}
            >
              <div className="mobile-tab-icon-wrap">
                <IconToday size={20} />
                {alerts.length > 0 && <span className="mobile-badge-dot"></span>}
              </div>
              <span>Today</span>
            </button>

            <button
              type="button"
              className={"mobile-tab " + (tab === "clients" ? "active" : "")}
              onClick={() => {
                setTab("clients");
                setOpenClient(null);
                setMobileMoreOpen(false);
              }}
            >
              <div className="mobile-tab-icon-wrap">
                <IconClients size={20} />
              </div>
              <span>Clients</span>
            </button>

            <button
              type="button"
              className={"mobile-tab " + (tab === "schedule" ? "active" : "")}
              onClick={() => {
                setTab("schedule");
                setMobileMoreOpen(false);
              }}
            >
              <div className="mobile-tab-icon-wrap">
                <IconSchedule size={20} />
              </div>
              <span>Schedule</span>
            </button>

            <button
              type="button"
              className={"mobile-tab " + (tab === "docs" ? "active" : "")}
              onClick={() => {
                setTab("docs");
                setMobileMoreOpen(false);
              }}
            >
              <div className="mobile-tab-icon-wrap">
                <IconDocs size={20} />
              </div>
              <span>Docs</span>
            </button>

            <button
              type="button"
              className={"mobile-tab " + (isMoreTabActive || mobileMoreOpen ? "active" : "")}
              onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
            >
              <div className="mobile-tab-icon-wrap">
                <IconGrid size={20} />
              </div>
              <span>More</span>
            </button>
          </>
        ) : (
          CLIENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={"mobile-tab " + (isActive ? "active" : "")}
                onClick={() => setTab(item.key)}
              >
                <div className="mobile-tab-icon-wrap">
                  <Icon size={20} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* ====================================================================
          Mobile "More" Slide-Up App Drawer
          ==================================================================== */}
      {mobileMoreOpen && (
        <div
          className="mobile-sheet-backdrop"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div
            className="mobile-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-sheet-handle"></div>

            <div className="mobile-sheet-head">
              <h3>All Modules</h3>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setMobileMoreOpen(false)}
              >
                <IconClose size={18} />
              </button>
            </div>

            <div className="mobile-sheet-currency">
              <span className="mobile-sheet-currency-label">Practice Currency:</span>
              <select
                className="mini currency-select"
                aria-label="Practice currency"
                value={db.currency || "USD"}
                onChange={(e) => {
                  const nextCur = e.target.value;
                  up({ currency: nextCur });
                  setToast(`Practice currency switched to ${nextCur}`);
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mobile-sheet-grid">
              {(role === "doula" ? DOULA_MORE_MODULES : CLIENT_NAV_ITEMS).map((m) => {
                const Icon = m.icon;
                const isCurrent = tab === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={"mobile-sheet-item " + (isCurrent ? "current" : "")}
                    onClick={() => {
                      setTab(m.key);
                      setMobileMoreOpen(false);
                      if (m.key === "clients") setOpenClient(null);
                    }}
                  >
                    <div className="sheet-item-icon">
                      <Icon size={20} />
                    </div>
                    <div className="sheet-item-text">
                      <b>{m.label}</b>
                      <span>{m.desc || "Personal care space"}</span>
                    </div>
                    <IconChevronRight size={16} className="sheet-item-arrow" />
                  </button>
                );
              })}
            </div>

            <div className="mobile-sheet-foot">
              <button
                type="button"
                className="ghost wide danger-outline"
                onClick={() => {
                  handleSignOut();
                  setMobileMoreOpen(false);
                }}
              >
                <IconLogOut size={14} style={{ marginRight: 6 }} />
                {session?.user
                  ? `Sign Out (${session.user.email})`
                  : role === "client"
                  ? "Exit Client Portal"
                  : "Sign Out to Login"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
