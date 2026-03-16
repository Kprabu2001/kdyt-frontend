// src/components/Faq.jsx
import { useState } from "react";
import { useI18n } from "../i18n/index.jsx";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{q}</span>
        <span className="faq-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      {open && <div className="faq-answer"><p>{a}</p></div>}
    </div>
  );
}

export default function Faq() {
  const { t } = useI18n();
  const faqs = [1,2,3,4,5,6,7,8].map(i => ({ q: t(`faq${i}_q`), a: t(`faq${i}_a`) }));
  return (
    <section className="faq-section" id="faq">
      <p className="section-eyebrow">{t("faq_eyebrow")}</p>
      <h2 className="section-title">{t("faq_title")}</h2>
      <div className="faq-list">
        {faqs.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}