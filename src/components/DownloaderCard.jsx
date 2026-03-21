// src/components/DownloaderCard.jsx
import UrlInput                             from "./UrlInput";
import VideoResult, { VideoResultSkeleton } from "./VideoResult";
import { IconX }                            from "./Icons";
import { useI18n }                          from "../i18n/index.jsx";

export default function DownloaderCard({
  url, loading, info, error, formatStates,
  inputRef,
  onUrlChange, onKeyDown, onPaste, onClear, onFetch, onDownload, onTrigger,
  onOpenTerms,
}) {
  const { t } = useI18n();
  return (
    <div className="input-card">
      <UrlInput
        url={url}
        loading={loading}
        inputRef={inputRef}
        onChange={onUrlChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onClear={onClear}
        onFetch={onFetch}
      />
      <p className="terms-notice">
        {t("terms_notice")}{" "}
        <button className="terms-notice-link" onClick={onOpenTerms}>
          {t("terms_link")}
        </button>
        .
      </p>
      {error && (
        <div className="error-banner" role="alert">
          <IconX /> {error}
        </div>
      )}
      {loading && !info && <VideoResultSkeleton />}
      <VideoResult
        info={info}
        formatStates={formatStates}
        error={error}
        onDownload={onDownload}
        onTrigger={onTrigger}
      />
    </div>
  );
}