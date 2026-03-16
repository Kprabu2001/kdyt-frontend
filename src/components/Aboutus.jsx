// src/components/Aboutus.jsx
import { useI18n } from "../i18n/index.jsx";

export default function AboutUs({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t("about_title")}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <h3>{t("about_who_h")}</h3>
          <p>{t("about_who_p")}</p>
          <h3>{t("about_offer_h")}</h3>
          <p>{t("about_offer_p")}</p>
          <h3>{t("about_values_h")}</h3>
          <ul>
            <li>{t("about_val1")}</li>
            <li>{t("about_val2")}</li>
            <li>{t("about_val3")}</li>
            <li>{t("about_val4")}</li>
          </ul>
          <h3>{t("about_legal_h")}</h3>
          <p>{t("about_legal_p")}</p>
          <h3>{t("about_contact_h")}</h3>
          <p>{t("about_contact_p")}</p>
        </div>
      </div>
    </div>
  );
}