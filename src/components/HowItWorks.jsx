// src/components/HowItWorks.jsx
import { useI18n } from "../i18n/index.jsx";

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      n: "01",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="40" height="32" rx="4" fill="var(--orange-bg)" stroke="var(--orange)" strokeWidth="1.5"/>
          <rect x="4" y="8" width="40" height="10" rx="4" fill="var(--orange)" opacity="0.15"/>
          <circle cx="12" cy="13" r="2" fill="var(--orange)" opacity="0.6"/>
          <circle cx="19" cy="13" r="2" fill="var(--orange)" opacity="0.4"/>
          <circle cx="26" cy="13" r="2" fill="var(--orange)" opacity="0.2"/>
          <rect x="30" y="10" width="10" height="6" rx="2" fill="var(--orange)" opacity="0.3"/>
          <rect x="14" y="22" width="20" height="13" rx="3" fill="var(--orange)" opacity="0.2"/>
          <polygon points="21,25 21,32 29,28.5" fill="var(--orange)" opacity="0.8"/>
          <path d="M38 30 L42 26 M42 26 L38 22 M42 26 H34" stroke="var(--orange)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
        </svg>
      ),
      title: t("how_step1_title"),
      desc:  t("how_step1_desc"),
    },
    {
      n: "02",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="16" width="30" height="10" rx="5" fill="var(--orange-bg)" stroke="var(--orange)" strokeWidth="1.5"/>
          <circle cx="10" cy="21" r="2" fill="var(--orange)" opacity="0.5"/>
          <rect x="15" y="19" width="12" height="2" rx="1" fill="var(--orange)" opacity="0.4"/>
          <line x1="29" y1="19" x2="29" y2="23" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="36" y="16" width="9" height="10" rx="5" fill="var(--orange)"/>
          <path d="M39 21 L42 21 M40.5 19.5 L42 21 L40.5 22.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18" cy="34" r="2.5" fill="var(--orange)" opacity="0.8"/>
          <circle cx="24" cy="34" r="2.5" fill="var(--orange)" opacity="0.5"/>
          <circle cx="30" cy="34" r="2.5" fill="var(--orange)" opacity="0.25"/>
          <path d="M8 32 L9 29 L10 32 L13 33 L10 34 L9 37 L8 34 L5 33 Z" fill="var(--orange)" opacity="0.4"/>
        </svg>
      ),
      title: t("how_step2_title"),
      desc:  t("how_step2_desc"),
    },
    {
      n: "03",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="18" height="9" rx="4" fill="var(--orange)" opacity="0.9"/>
          <rect x="26" y="8" width="18" height="9" rx="4" fill="var(--orange-bg)" stroke="var(--orange)" strokeWidth="1.2"/>
          <rect x="4" y="21" width="18" height="9" rx="4" fill="var(--orange-bg)" stroke="var(--orange)" strokeWidth="1.2"/>
          <rect x="26" y="21" width="18" height="9" rx="4" fill="var(--orange-bg)" stroke="var(--orange)" strokeWidth="1.2"/>
          <rect x="8" y="11" width="10" height="3" rx="1.5" fill="#fff" opacity="0.9"/>
          <rect x="30" y="11" width="10" height="3" rx="1.5" fill="var(--orange)" opacity="0.4"/>
          <rect x="8" y="24" width="10" height="3" rx="1.5" fill="var(--orange)" opacity="0.4"/>
          <rect x="30" y="24" width="10" height="3" rx="1.5" fill="var(--orange)" opacity="0.4"/>
          <circle cx="24" cy="38" r="7" fill="var(--orange)"/>
          <path d="M24 34 L24 40 M21 38 L24 41 L27 38" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: t("how_step3_title"),
      desc:  t("how_step3_desc"),
    },
  ];

  return (
    <section className="how-section" id="how-it-works">
      <p className="section-eyebrow">{t("how_eyebrow")}</p>
      <h2 className="section-title">{t("how_title")}</h2>
      <div className="how-steps-visual">
        {steps.map((step, i) => (
          <div key={step.n} className="how-step-visual">
            {i < steps.length - 1 && (
              <div className="how-connector">
                <svg viewBox="0 0 60 16" fill="none" preserveAspectRatio="none">
                  <path d="M0 8 Q15 2 30 8 Q45 14 60 8" stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.4"/>
                  <polygon points="54,5 60,8 54,11" fill="var(--orange)" opacity="0.4"/>
                </svg>
              </div>
            )}
            <div className="how-step-card">
              <div className="how-step-badge">{step.n}</div>
              <div className="how-step-illustration">{step.icon}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}