// src/components/ProgressBar.jsx
// Progress bar — supports real 0-100 value and indeterminate (animated sweep).

export default function ProgressBar({ progress, indeterminate }) {
  return (
    <div
      className={`progress-track${indeterminate ? " indeterminate" : ""}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={indeterminate ? "Downloading…" : `${Math.round(progress)}%`}
    >
      <div
        className="progress-fill"
        style={indeterminate ? {} : { width: `${progress}%` }}
      />
    </div>
  );
}