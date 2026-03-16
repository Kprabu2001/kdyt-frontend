// src/components/FeaturesGrid.jsx
import { useI18n } from "../i18n/index.jsx";

const FEAT_SVGS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" stroke="none" opacity="0.25"/><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/><line x1="9" y1="6" x2="15" y2="6"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
];

export default function FeaturesGrid() {
  const { t } = useI18n();

  const features = [1,2,3,4,5,6].map(i => ({
    title: t(`feat${i}_title`),
    desc:  t(`feat${i}_desc`),
  }));

  return (
    <section className="features-section">
      <div className="features-header">
        <p className="section-eyebrow">{t("feat_eyebrow")}</p>
        <h2 className="section-title">{t("feat_title")}</h2>
        <p className="features-subtitle">{t("feat_subtitle")}</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="feat-icon-wrap">
              <div className="feat-icon-bg" />
              <div className="feat-icon-svg">{FEAT_SVGS[i]}</div>
            </div>
            <div className="feat-body">
              <h4 className="feat-title">{f.title}</h4>
              <p className="feat-desc">{f.desc}</p>
            </div>
            <div className="feat-card-line" />
          </div>
        ))}
      </div>
    </section>
  );
}