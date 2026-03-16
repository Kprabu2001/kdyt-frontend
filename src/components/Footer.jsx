// src/components/Footer.jsx

import { useState } from "react";
import PrivacyPolicy  from "./Privacypolicy";
import TermsOfService from "./Termsofservice";
import DmcaPolicy     from "./Dmcapolicy.jsx";
import AboutUs        from "./Aboutus.jsx";
import Contact        from "./Contact.jsx";
import { useI18n }   from "../i18n/index.jsx";

export default function Footer() {
  const [modal, setModal] = useState(null);
  const { t } = useI18n();

  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="footer-logo-mark">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="flg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff6b00"/>
                    <stop offset="100%" stopColor="#ff8c00"/>
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#flg)"/>
                <path d="M20 10 L20 24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                <path d="M13 19 L20 26 L27 19" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 30 L28 30" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="footer-logo-wordmark">
              <div><span className="footer-logo-kd">KD</span><span className="footer-logo-yt">YT</span></div>
              <span className="footer-logo-tagline">{t("footer_tagline")}</span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <button className="footer-link-btn" onClick={() => setModal("about")}>{t("footer_about")}</button>
            <button className="footer-link-btn" onClick={() => setModal("contact")}>{t("footer_contact")}</button>
            <button className="footer-link-btn" onClick={() => setModal("privacy")}>{t("footer_privacy")}</button>
            <button className="footer-link-btn" onClick={() => setModal("terms")}>{t("footer_terms")}</button>

          </nav>

          <div className="footer-copy">{t("footer_copy")}</div>
        </div>
      </footer>

      {modal === "about"   && <AboutUs       onClose={() => setModal(null)} />}
      {modal === "contact" && <Contact       onClose={() => setModal(null)} />}
      {modal === "privacy" && <PrivacyPolicy  onClose={() => setModal(null)} />}
      {modal === "terms"   && <TermsOfService onClose={() => setModal(null)} />}
      {modal === "dmca"    && <DmcaPolicy     onClose={() => setModal(null)} />}
    </>
  );
}