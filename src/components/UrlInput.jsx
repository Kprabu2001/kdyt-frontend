// src/components/UrlInput.jsx
// Y2Mate style: strips URL to video ID immediately on paste
import Spinner from "./Spinner";
import { IconDownload, IconPaste, IconX } from "./Icons";
import { useI18n } from "../i18n/index.jsx";
import { extractVideoId } from "../services/api";

export default function UrlInput({ url, loading, inputRef, onChange, onKeyDown, onPaste, onClear, onFetch }) {
  const { t } = useI18n();

  const handleChange = (val) => {
    const id = extractVideoId(val.trim());
    onChange(id || val);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text") || "";
    const id   = extractVideoId(text.trim());
    // Keep full URL if it's a playlist (has ?list=)
    if (text.includes("list=") || text.includes("/playlist")) {
      onChange(text.trim());
    } else {
      onChange(id || text.trim());
    }
  };

  return (
    <div className="input-row">
      <div className="input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="url-input"
          value={url}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          placeholder={t("placeholder")}
          spellCheck={false}
          autoComplete="off"
          aria-label="YouTube URL or video ID"
        />
        {url && (
          <button className="input-clear" onClick={onClear} title="Clear" aria-label="Clear">
            <IconX />
          </button>
        )}
      </div>
      <button className="paste-btn" onClick={onPaste} title="Paste from clipboard">
        <IconPaste /> {t("paste")}
      </button>
      <button className="fetch-btn" onClick={onFetch} disabled={loading} aria-busy={loading}>
        {loading
          ? <><Spinner size={18} /> {t("fetching")}</>
          : <><IconDownload /> {t("fetch")}</>}
      </button>
    </div>
  );
}