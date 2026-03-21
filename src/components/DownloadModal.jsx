// src/components/DownloadModal.jsx
import { useEffect } from "react";
import { IconDownload, IconX, IconCheck } from "./Icons";

const VIDEO_PHASES = ["resolving", "downloading", "done"];
const AUDIO_PHASES = ["preparing",  "ready", "downloading", "done"];

const PHASE_LABELS = {
  resolving:   "Getting link",
  preparing:   "Converting",
  ready:       "Ready",
  downloading: "Downloading",
  done:        "Done",
};

function Stepper({ phase, isAudio }) {
  const phases = isAudio ? AUDIO_PHASES : VIDEO_PHASES;
  const idx    = phases.indexOf(phase);
  return (
    <div className="dm-stepper">
      {phases.map((p, i) => (
        <div key={p} className="dm-step">
          <div className={["dm-step-dot", i < idx ? "past" : "", i === idx ? "active" : ""].filter(Boolean).join(" ")}>
            {i < idx  ? <IconCheck /> : <span className="dm-step-num">{i + 1}</span>}
          </div>
          {i < phases.length - 1 && <div className={`dm-step-line${i < idx ? " past" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

function StepLabels({ phase, isAudio }) {
  const phases = isAudio ? AUDIO_PHASES : VIDEO_PHASES;
  return (
    <div className="dm-phase-labels">
      {phases.map(p => (
        <span key={p} className={`dm-phase-label${p === phase ? " active" : ""}`}>
          {PHASE_LABELS[p]}
        </span>
      ))}
    </div>
  );
}

export default function DownloadModal({
  open, phase, label, type,
  prepProgress, dlProgress, indeterminate,
  errorMsg, onDownload, onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const isAudio       = type === "audio";
  const isResolving   = phase === "resolving";
  const isPreparing   = phase === "preparing";
  const isReady       = phase === "ready";
  const isDownloading = phase === "downloading";
  const isDone        = phase === "done";
  const isError       = phase === "error";

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dm-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="dm-header">
          <div className="dm-header-left">
            <div className={`dm-type-badge ${type}`}>{isAudio ? "MP3" : "MP4"}</div>
            <div>
              <div className="dm-title">{isAudio ? "Audio Download" : "Video Download"}</div>
              <div className="dm-subtitle">{label} quality</div>
            </div>
          </div>
          <button className="dm-close" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>

        {/* Stepper */}
        {!isError && (
          <div className="dm-stepper-wrap">
            <Stepper phase={phase} isAudio={isAudio} />
            <StepLabels phase={phase} isAudio={isAudio} />
          </div>
        )}

        {/* Content */}
        <div className="dm-content">

          {/* RESOLVING */}
          {isResolving && (
            <div className="dm-state">
              <div className="dm-state-icon preparing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <p className="dm-state-title">Resolving download link…</p>
              <p className="dm-state-sub">Fetching direct CDN URL from YouTube. Usually under 2 seconds.</p>
              <div className="dm-progress-block">
                <div className="dm-progress-track indeterminate"><div className="dm-progress-fill" /></div>
              </div>
            </div>
          )}

          {/* PREPARING (audio) */}
          {isPreparing && (
            <div className="dm-state">
              <div className="dm-state-icon preparing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p className="dm-state-title">Converting to MP3…</p>
              <p className="dm-state-sub">Fetching audio stream and transcoding with ffmpeg.</p>
              <div className="dm-progress-block">
                <div className="dm-progress-track">
                  <div className="dm-progress-fill" style={{ width: `${prepProgress}%` }} />
                  <span className="dm-progress-label">{prepProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* READY (audio) */}
          {isReady && (
            <div className="dm-state dm-state-ready">
              <div className="dm-ready-glow" />
              <div className="dm-state-icon ready"><IconDownload /></div>
              <p className="dm-state-title">Your MP3 is ready!</p>
              <p className="dm-state-sub">Click below to save it to your device.</p>
              <button className="dm-dl-btn" onClick={onDownload}>
                <IconDownload /> Download Now
              </button>
            </div>
          )}

          {/* DOWNLOADING */}
          {isDownloading && (
            <div className="dm-state">
              <div className="dm-state-icon downloading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              {isAudio ? (
                <>
                  <p className="dm-state-title">{indeterminate ? "Downloading…" : `Downloading… ${dlProgress}%`}</p>
                  <p className="dm-state-sub">Saving MP3 to your device.</p>
                  <div className="dm-progress-block">
                    <div className={`dm-progress-track${indeterminate ? " indeterminate" : ""}`}>
                      <div className="dm-progress-fill" style={indeterminate ? {} : { width: `${dlProgress}%` }} />
                      {!indeterminate && <span className="dm-progress-label">{dlProgress}%</span>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="dm-state-title">Download started!</p>
                  <p className="dm-state-sub">Your browser is downloading directly from YouTube's CDN. Check your downloads bar.</p>
                  <div className="dm-tunnel-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Direct CDN · Zero server middleman · No cookies
                  </div>
                </>
              )}
            </div>
          )}

          {/* DONE */}
          {isDone && (
            <div className="dm-state dm-state-done">
              <div className="dm-done-ring">
                <div className="dm-state-icon done"><IconCheck /></div>
              </div>
              <p className="dm-state-title">Download complete!</p>
              <p className="dm-state-sub">Check your Downloads folder.</p>
              <button className="dm-close-btn" onClick={onClose}>Close</button>
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="dm-state dm-state-error">
              <div className="dm-state-icon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="dm-state-title">Something went wrong</p>
              <p className="dm-state-sub">{errorMsg || "Please try again."}</p>
              <button className="dm-close-btn" onClick={onClose}>Close</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
