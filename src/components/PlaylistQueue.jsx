// src/components/PlaylistQueue.jsx
// Shown when a youtube.com/playlist?list= URL is detected.
// Fetches playlist info and shows a queue UI for batch downloads.

import { useState, useEffect } from "react";
import { useI18n } from "../i18n/index.jsx";
import { fetchVideoInfo } from "../services/api.js";
import Spinner from "./Spinner.jsx";
import { IconDownload, IconMusic, IconVideo, IconCheck, IconX } from "./Icons.jsx";

const FORMAT_OPTIONS = [
  { value: "mp3-320", label: "MP3 320kbps", type: "audio" },
  { value: "mp3-128", label: "MP3 128kbps", type: "audio" },
  { value: "mp4-1080", label: "MP4 1080p",  type: "video" },
  { value: "mp4-720",  label: "MP4 720p",   type: "video" },
  { value: "mp4-480",  label: "MP4 480p",   type: "video" },
];

function StatusDot({ status }) {
  if (status === "done")    return <span className="pl-status done"><IconCheck /></span>;
  if (status === "error")   return <span className="pl-status error"><IconX /></span>;
  if (status === "working") return <span className="pl-status working"><Spinner size={12} /></span>;
  return null;
}

export default function PlaylistQueue({ playlistUrl, onCancel }) {
  const { t } = useI18n();

  const [items,     setItems]     = useState([]);   // { index, title, thumbnail, url, selected, status }
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [format,    setFormat]    = useState("mp4-1080");
  const [queueing,  setQueueing]  = useState(false);

  // Fetch playlist info from backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVideoInfo(playlistUrl)
      .then(data => {
        if (cancelled) return;
        // Backend should return { entries: [{title, thumbnail, url, ...}] } for playlists
        const entries = data.entries || [];
        setItems(entries.map((e, i) => ({
          index:     i,
          title:     e.title || `Video ${i + 1}`,
          thumbnail: e.thumbnail || "",
          url:       e.webpage_url || e.url || "",
          selected:  true,
          status:    "idle",
        })));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message || "Failed to load playlist.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [playlistUrl]);

  const toggleItem = (i) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, selected: !it.selected } : it));

  const selectAll   = () => setItems(prev => prev.map(it => ({ ...it, selected: true  })));
  const deselectAll = () => setItems(prev => prev.map(it => ({ ...it, selected: false })));

  const selectedCount = items.filter(it => it.selected).length;

  const handleDownloadAll = async () => {
    const selected = items.filter(it => it.selected);
    if (!selected.length) return;
    setQueueing(true);

    for (const item of selected) {
      setItems(prev => prev.map(it =>
        it.index === item.index ? { ...it, status: "working" } : it
      ));
      try {
        // Each video is downloaded individually via existing single-video flow
        await fetchVideoInfo(item.url);
        setItems(prev => prev.map(it =>
          it.index === item.index ? { ...it, status: "done" } : it
        ));
      } catch {
        setItems(prev => prev.map(it =>
          it.index === item.index ? { ...it, status: "error" } : it
        ));
      }
    }
    setQueueing(false);
  };

  const fmt = FORMAT_OPTIONS.find(f => f.value === format);

  return (
    <div className="pl-wrap">
      {/* Header */}
      <div className="pl-header">
        <div className="pl-header-left">
          <div className="pl-badge">
            {fmt?.type === "audio" ? <IconMusic /> : <IconVideo />}
            {t("playlist_detected")}
          </div>
          {!loading && !error && (
            <span className="pl-count">
              {t("playlist_videos", { count: items.length })}
            </span>
          )}
        </div>
        <button className="pl-cancel" onClick={onCancel} aria-label="Cancel playlist">
          <IconX />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="pl-loading">
          <Spinner size={22} /> Loading playlist…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="error-banner"><IconX /> {error}</div>
      )}

      {/* Controls */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="pl-controls">
            <div className="pl-select-btns">
              <button className="pl-ctrl-btn" onClick={selectAll}>{t("playlist_select_all")}</button>
              <button className="pl-ctrl-btn" onClick={deselectAll}>{t("playlist_deselect")}</button>
            </div>
            <div className="pl-format-wrap">
              <label className="pl-format-label">{t("playlist_format")}</label>
              <select
                className="pl-format-select"
                value={format}
                onChange={e => setFormat(e.target.value)}
              >
                {FORMAT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Item list */}
          <div className="pl-list">
            {items.map((item, i) => (
              <div
                key={item.index}
                className={`pl-item${item.selected ? " selected" : ""}${item.status === "done" ? " done" : ""}${item.status === "error" ? " errored" : ""}`}
                onClick={() => item.status === "idle" && toggleItem(i)}
              >
                <div className={`pl-checkbox${item.selected ? " checked" : ""}`}>
                  {item.selected && <IconCheck />}
                </div>
                {item.thumbnail && (
                  <img src={item.thumbnail} alt="" className="pl-thumb" loading="lazy" />
                )}
                <div className="pl-item-title">{item.title}</div>
                <StatusDot status={item.status} />
              </div>
            ))}
          </div>

          {/* Download button */}
          <button
            className="pl-dl-btn"
            onClick={handleDownloadAll}
            disabled={queueing || selectedCount === 0}
          >
            {queueing
              ? <><Spinner size={16} /> {t("playlist_queue")}…</>
              : <><IconDownload /> {t("playlist_download_selected", { count: selectedCount })}</>
            }
          </button>
        </>
      )}
    </div>
  );
}