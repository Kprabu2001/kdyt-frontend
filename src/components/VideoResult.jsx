// src/components/VideoResult.jsx

import { useState } from "react";
import DownloadModal         from "./DownloadModal";
import Spinner               from "./Spinner";
import { IconCheck, IconDownload, IconMusic, IconVideo } from "./Icons";
import { useI18n }           from "../i18n/index.jsx";

function DownloadRow({ label, size, type, state, onClick, t }) {
  const phase  = state?.phase || "idle";
  const isBusy = phase === "preparing" || phase === "downloading";
  const isDone = phase === "done";

  return (
    <div className={`dl-row ${type}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="dl-row-left">
        <span className={`dl-tag ${type}`}>{type === "audio" ? "MP3" : "MP4"}</span>
        <span className="dl-row-quality">{label}</span>
        {size && <span className="dl-row-size">{size}</span>}
      </div>
      <button
        className={`dl-row-btn${isDone ? " done" : ""}`}
        disabled={isBusy}
        aria-label={`Download ${label}`}
        onClick={e => { e.stopPropagation(); onClick(); }}
      >
        {isBusy ? <><Spinner size={13} /> {t("working")}</> :
         isDone  ? <><IconCheck /> {t("done")}</>           :
                   <><IconDownload /> {t("download")}</>}
      </button>
    </div>
  );
}

export function VideoResultSkeleton() {
  return (
    <div className="result-card result-skeleton">
      <div className="result-top">
        <div className="skeleton-thumb" />
        <div className="result-meta">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-sub" />
          <div className="skeleton-line skeleton-sub2" />
        </div>
      </div>
      <div className="formats-section">
        <div className="skeleton-line skeleton-label" />
        <div className="formats-grid">
          <div className="skeleton-badge" />
          <div className="skeleton-badge" />
          <div className="skeleton-badge" />
        </div>
      </div>
    </div>
  );
}

export default function VideoResult({ info, formatStates, onDownload, error }) {
  const { t }               = useI18n();
  const [modal, setModal]   = useState(null);

  if (!info) return null;

  const openModal = (formatId, label, type) => {
    setModal({ formatId, label, type });
    onDownload(formatId, type);
  };

  const closeModal = () => setModal(null);

  const activeState     = modal ? (formatStates[modal.formatId] || {}) : {};
  const phase           = activeState.phase || "idle";
  const handleDownloadNow = () => { if (modal) onDownload(modal.formatId, modal.type); };

  return (
    <>
      <div className="result-card">
        <div className="result-top">
          <div className="thumb-wrap">
            <img src={info.thumbnail} alt="thumbnail" className="thumb" loading="lazy" />
            <span className="duration-chip">{info.duration}</span>
          </div>
          <div className="result-meta">
            <div className="result-title">{info.title}</div>
            <div className="result-channel">
              <span className="channel-dot" />
              {info.channel}
              <span className="result-views">{info.views} views</span>
            </div>
          </div>
        </div>

        <div className="format-section">
          <div className="format-section-header audio"><IconMusic /> {t("music")}</div>
          {(info.audio_formats || []).map(f => (
            <DownloadRow
              key={f.format_id}
              label={f.quality}
              size={f.filesize}
              type="audio"
              state={formatStates[f.format_id]}
              t={t}
              onClick={() => openModal(f.format_id, f.quality, "audio")}
            />
          ))}
        </div>

        <div className="format-section">
          <div className="format-section-header video"><IconVideo /> {t("video")}</div>
          {(info.video_formats || []).map(f => (
            <DownloadRow
              key={f.format_id}
              label={f.quality}
              size={f.filesize}
              type="video"
              state={formatStates[f.format_id]}
              t={t}
              onClick={() => openModal(f.format_id, f.quality, "video")}
            />
          ))}
        </div>
      </div>

      {modal && (
        <DownloadModal
          open={true}
          phase={phase}
          label={modal.label}
          type={modal.type}
          prepProgress={activeState.prepProgress ?? 0}
          dlProgress={activeState.dlProgress ?? 0}
          indeterminate={activeState.indeterminate ?? false}
          errorMsg={error}
          onDownload={handleDownloadNow}
          onClose={closeModal}
        />
      )}
    </>
  );
}