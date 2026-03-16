// src/components/ModeTabs.jsx
// Video / Audio mode switcher tabs.

import { MODES } from "../constants/config";
import { IconVideo, IconMusic } from "./Icons";

export default function ModeTabs({ mode, onChange }) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="Download mode">
      <button
        role="tab"
        aria-selected={mode === MODES.VIDEO}
        className={`mode-tab ${mode === MODES.VIDEO ? "active" : ""}`}
        onClick={() => onChange(MODES.VIDEO)}
      >
        <IconVideo /> MP4 Video
      </button>

      <button
        role="tab"
        aria-selected={mode === MODES.AUDIO}
        className={`mode-tab ${mode === MODES.AUDIO ? "active" : ""}`}
        onClick={() => onChange(MODES.AUDIO)}
      >
        <IconMusic /> MP3 Audio
      </button>
    </div>
  );
}
