// src/i18n/index.jsx — single file, all i18n in one place
import { createContext, useContext, useState, useCallback } from "react";
import en from "./en.js";
import hi from "./hi.js";
import ta from "./ta.js";

const LANGS     = { en, hi, ta };
const SUPPORTED = ["en", "hi", "ta"];
const LANG_KEY  = "kdyt_lang_v3";

// Remove only OLD keys (keep v3 for persistence)
localStorage.removeItem("kdyt_lang");
localStorage.removeItem("kdyt_lang_v2");

// Read saved language; default to English
function getSavedLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (_) {}
  return "en";
}

const I18nContext = createContext({ lang: "en", setLang: () => {}, t: k => k, langs: SUPPORTED });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getSavedLang);

  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem(LANG_KEY, code); } catch (_) {}
  }, []);

  const t = useCallback((key, vars = {}) => {
    let str = LANGS[lang]?.[key] ?? LANGS.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, v);
    });
    return str;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, langs: SUPPORTED }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}