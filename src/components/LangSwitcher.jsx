// src/components/LangSwitcher.jsx

import { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n/index.jsx";

const LANG_META = {
  en: { flag: "🌐", label: "English" },
  hi: { flag: "🇮🇳", label: "हिन्दी" },
  ta: { flag: "🇮🇳", label: "தமிழ்"  },
};

export default function LangSwitcher() {
  const { lang, setLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANG_META[lang];

  return (
    <div className="lang-dropdown" ref={ref}>
      {/* Trigger button */}
      <button
        className={`lang-trigger${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current.flag}</span>
        <span className="lang-trigger-label">{current.label}</span>
        <svg
          className="lang-chevron"
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="lang-menu" role="listbox">
          {langs.map(code => (
            <button
              key={code}
              className={`lang-option${lang === code ? " active" : ""}`}
              role="option"
              aria-selected={lang === code}
              onClick={() => { setLang(code); setOpen(false); }}
            >
              <span>{LANG_META[code].flag}</span>
              <span>{LANG_META[code].label}</span>
              {lang === code && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ marginLeft: "auto", color: "var(--orange)" }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}