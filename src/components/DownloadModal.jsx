// src/components/DownloadModal.jsx

import { useEffect } from "react";
import { IconDownload, IconX, IconCheck } from "./Icons";

const PHASES = ["preparing", "ready", "downloading", "done"];

function StepDots({ phase }) {
  const idx = PHASES.indexOf(phase);
  return (
    <div className="dm-stepper">
      {PHASES.map((s, i) => (
        <div key={s} className="dm-step">
          <div className={[
            "dm-step-dot",
            i < idx   ? "past"   : "",
            i === idx  ? "active" : "",
          ].filter(Boolean).join(" ")}>
            {i < idx && <IconCheck />}
            {i === idx && <span className="dm-step-num">{i + 1}</span>}
            {i > idx  && <span className="dm-step-num">{i + 1}</span>}
          </div>
          {i < PHASES.length - 1 && (
            <div className={`dm-step-line${i < idx ? " past" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function PhaseLabel({ phase }) {
  const labels = {
    preparing:   "Preparing file",
    ready:       "Ready to download",
    downloading: "Downloading",
    done:        "Complete",
  };
  return (
    <div className="dm-phase-labels">
      {PHASES.map((p, i) => (
        <span key={p} className={`dm-phase-label${p === phase ? " active" : ""}`}>
          {labels[p]}
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
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const isPreparing   = phase === "preparing";
  const isReady       = phase === "ready";
  const isDownloading = phase === "downloading";
  const isDone        = phase === "done";
  const isError       = phase === "error";

  const progress = isPreparing ? prepProgress : isDownloading ? dlProgress : isDone ? 100 : 0;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dm-box" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="dm-header">
          <div className="dm-header-left">
            <div className={`dm-type-badge ${type}`}>
              {type === "audio" ? "MP3" : "MP4"}
            </div>
            <div>
              <div className="dm-title">{type === "audio" ? "Audio Download" : "Video Download"}</div>
              <div className="dm-subtitle">{label} quality</div>
            </div>
          </div>
          <button className="dm-close" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* ── Stepper ── */}
        {!isError && (
          <div className="dm-stepper-wrap">
            <StepDots phase={phase} />
            <PhaseLabel phase={phase} />
          </div>
        )}

        {/* ── Content ── */}
        <div className="dm-content">

          {/* PREPARING */}
          {isPreparing && (
            <div className="dm-state">
              <div className="dm-state-icon preparing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <p className="dm-state-title">Preparing your file…</p>
              <p className="dm-state-sub">Please wait while we process and merge your download.</p>
              <div className="dm-progress-block">
                <div className="dm-progress-track">
                  <div className="dm-progress-fill" style={{ width: `${prepProgress}%` }} />
                  <span className="dm-progress-label">{prepProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* READY */}
          {isReady && (
            <div className="dm-state dm-state-ready">
              <div className="dm-ready-glow" />
              <div className="dm-state-icon ready">
                <IconDownload />
              </div>
              <p className="dm-state-title">Your file is ready!</p>
              <p className="dm-state-sub">Click the button below to start downloading.</p>
              <button className="dm-dl-btn" onClick={onDownload}>
                <IconDownload />
                Download Now
              </button>
            </div>
          )}

          {/* DOWNLOADING */}
          {isDownloading && (
            <div className="dm-state">
              <div className="dm-state-icon downloading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <p className="dm-state-title">
                {indeterminate ? "Downloading…" : `Downloading… ${dlProgress}%`}
              </p>
              <p className="dm-state-sub">Your file is being saved to your device.</p>
              <div className="dm-progress-block">
                <div className={`dm-progress-track${indeterminate ? " indeterminate" : ""}`}>
                  <div className="dm-progress-fill" style={indeterminate ? {} : { width: `${dlProgress}%` }} />
                  {!indeterminate && <span className="dm-progress-label">{dlProgress}%</span>}
                </div>
              </div>
            </div>
          )}

          {/* DONE */}
          {isDone && (
            <div className="dm-state dm-state-done">
              <div className="dm-done-ring">
                <div className="dm-state-icon done"><IconCheck /></div>
              </div>
              <p className="dm-state-title">Download complete!</p>
              <p className="dm-state-sub">Your file has been saved. Check your Downloads folder.</p>
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