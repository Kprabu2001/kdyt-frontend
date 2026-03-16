// src/components/Termsofservice.jsx
import { useI18n } from "../i18n/index.jsx";

export default function TermsOfService({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t("terms_modal_title")}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-date">{t("terms_date")}</p>
          <h3>{t("terms_1_h")}</h3>
          <p>{t("terms_1_p")}</p>
          <h3>{t("terms_2_h")}</h3>
          <p>{t("terms_2_p")}</p>
          <h3>{t("terms_3_h")}</h3>
          <p>{t("terms_3_p")}</p>
          <h3>{t("terms_4_h")}</h3>
          <p>{t("terms_4_p")}</p>
          <h3>{t("terms_5_h")}</h3>
          <p>{t("terms_5_p")}</p>
        </div>
      </div>
    </div>
  );
}