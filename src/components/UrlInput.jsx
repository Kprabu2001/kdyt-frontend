// src/components/UrlInput.jsx
import Spinner from "./Spinner";
import { IconDownload, IconPaste, IconX } from "./Icons";
import { useI18n } from "../i18n/index.jsx";

export default function UrlInput({ url, loading, inputRef, onChange, onKeyDown, onPaste, onClear, onFetch }) {
  const { t } = useI18n();
  return (
    <div className="input-row">
      <div className="input-wrap">
        <input
          ref={inputRef}
          type="url"
          className="url-input"
          value={url}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("placeholder")}
          spellCheck={false}
          autoComplete="off"
          aria-label="YouTube URL"
        />
        {url && (
          <button className="input-clear" onClick={onClear} title="Clear" aria-label="Clear URL">
            <IconX />
          </button>
        )}
      </div>
      <button className="paste-btn" onClick={onPaste} title="Paste from clipboard">
        <IconPaste /> {t("paste")}
      </button>
      <button className="fetch-btn" onClick={onFetch} disabled={loading} aria-busy={loading}>
        {loading ? <><Spinner size={18} /> {t("fetching")}</> : <><IconDownload /> {t("fetch")}</>}
      </button>
    </div>
  );
}