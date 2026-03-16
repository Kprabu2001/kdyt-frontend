// src/components/Navbar.jsx

import { useState, useEffect } from "react";
import { IconShield, IconZap } from "./Icons";
import { useI18n } from "../i18n/index.jsx";
import LangSwitcher from "./LangSwitcher.jsx";

function Logo() {
  return (
    <a
      href="/"
      className="logo"
      aria-label="KDYT — Go to homepage"
      onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
    >
      <div className="logo-mark">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff6b00"/>
              <stop offset="100%" stopColor="#ff8c00"/>
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#lg)"/>
          <path d="M20 10 L20 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
          <path d="M13 19 L20 26 L27 19" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 30 L28 30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="logo-wordmark">
        <div className="logo-name-row">
          <span className="logo-kd">KD</span><span className="logo-yt">YT</span>
        </div>
        <span className="logo-tagline">Free Downloader</span>
      </div>
    </a>
  );
}

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64"  y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar() {
  const { t } = useI18n();
  const [dark, setDark]       = useState(() => localStorage.getItem("kdyt_theme") === "dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("kdyt_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 640) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Logo />

        <div className="nav-pills">
          <span className="nav-pill"><IconShield /> {t("nav_private")}</span>
          <span className="nav-pill"><IconZap /> {t("nav_instant")}</span>
        </div>

        <div className="nav-right">
          <LangSwitcher />
          <button
            className="theme-toggle"
            onClick={() => setDark(d => !d)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <IconSun /> : <IconMoon />}
          </button>

          <button
            className={`hamburger${mobileOpen ? " open" : ""}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          <a className="mobile-menu-item" href="#how">How it works</a>
          <a className="mobile-menu-item" href="#features">Features</a>
          <a className="mobile-menu-item" href="#faq">FAQ</a>
        </div>
      )}
    </nav>
  );
}