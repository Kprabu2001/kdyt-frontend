// src/components/FormatBadge.jsx
// A single download quality option button (e.g. "1080p", "320 kbps").

import Spinner from "./Spinner";
import { IconVideo, IconMusic } from "./Icons";

export default function FormatBadge({ label, size, type, loading, onClick }) {
  return (
    <button
      className={`format-badge ${type}`}
      onClick={onClick}
      disabled={loading}
      aria-label={`Download ${label} ${type === "audio" ? "audio" : "video"}`}
    >
      {loading
        ? <Spinner size={14} />
        : type === "audio" ? <IconMusic /> : <IconVideo />
      }
      <span>{label}</span>
      {size && <span className="fmt-size">{size}</span>}
    </button>
  );
}
