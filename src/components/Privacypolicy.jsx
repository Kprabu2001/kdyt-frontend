// src/components/Privacypolicy.jsx
import { useI18n } from "../i18n/index.jsx";

export default function PrivacyPolicy({ onClose }) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t("privacy_title")}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-date">{t("privacy_date")}</p>
          <h3>{t("privacy_1_h")}</h3>
          <p>{t("privacy_1_p")}</p>
          <ul>
            <li>{t("privacy_1_l1")}</li>
            <li>{t("privacy_1_l2")}</li>
            <li>{t("privacy_1_l3")}</li>
          </ul>
          <h3>{t("privacy_2_h")}</h3>
          <p>{t("privacy_2_p")}</p>
          <ul>
            <li>{t("privacy_2_l1")}</li>
            <li>{t("privacy_2_l2")}</li>
            <li>{t("privacy_2_l3")}</li>
          </ul>
          <h3>{t("privacy_3_h")}</h3>
          <p>{t("privacy_3_p")}</p>
          <h3>{t("privacy_4_h")}</h3>
          <p>{t("privacy_4_p")}</p>
          <h3>{t("privacy_5_h")}</h3>
          <p>{t("privacy_5_p")}</p>
        </div>
      </div>
    </div>
  );
}