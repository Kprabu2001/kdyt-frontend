// src/components/PlaylistQueue.jsx
import { useState, useEffect } from "react";
import { useI18n } from "../i18n/index.jsx";
import { fetchPlaylistInfo, extractPlaylistId, getTunnelUrl, startJob, pollJob } from "../services/api.js";
import Spinner from "./Spinner.jsx";
import { IconDownload, IconMusic, IconVideo, IconCheck, IconX } from "./Icons.jsx";
import { API_BASE } from "../constants/config";

const FORMAT_OPTIONS = [
  { value: "320kbps", label: "MP3 · 320kbps", type: "audio" },
  { value: "192kbps", label: "MP3 · 192kbps", type: "audio" },
  { value: "128kbps", label: "MP3 · 128kbps", type: "audio" },
  { value: "video",   label: "MP4 · Best",     type: "video" },
];

function StatusBadge({ status, error }) {
  if (status === "done")    return <span className="pl-status done"><IconCheck /> Done</span>;
  if (status === "error")   return <span className="pl-status error"><IconX /> {error || "Failed"}</span>;
  if (status === "working") return <span className="pl-status working"><Spinner size={12} /> Converting…</span>;
  if (status === "waiting") return <span className="pl-status waiting">Queued</span>;
  return null;
}

export default function PlaylistQueue({ playlistUrl, onCancel }) {
  const { t } = useI18n();
  const [videos,    setVideos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [format,    setFormat]    = useState("320kbps");
  const [running,   setRunning]   = useState(false);
  const [statuses,  setStatuses]  = useState({});  // videoId → { status, error }
  const [selectAll, setSelectAll] = useState(true);
  const [selected,  setSelected]  = useState({});

  const listId = extractPlaylistId(playlistUrl);

  useEffect(() => {
    if (!listId) { setError("Invalid playlist URL."); setLoading(false); return; }
    fetchPlaylistInfo(listId)
      .then(data => {
        setVideos(data.videos || []);
        const sel = {};
        (data.videos || []).forEach(v => { sel[v.video_id] = true; });
        setSelected(sel);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [listId]);

  const toggleSelect = (id) => setSelected(p => ({ ...p, [id]: !p[id] }));
  const toggleAll    = () => {
    const next = !selectAll;
    setSelectAll(next);
    const sel = {};
    videos.forEach(v => { sel[v.video_id] = next; });
    setSelected(sel);
  };

  const setStatus = (id, status, err = "") =>
    setStatuses(p => ({ ...p, [id]: { status, error: err } }));

  const downloadOne = async (video, fmt) => {
    const fmtOpt = FORMAT_OPTIONS.find(f => f.value === fmt);
    if (!fmtOpt) return;
    setStatus(video.video_id, "working");

    try {
      if (fmtOpt.type === "audio") {
        // Start audio job
        const jobId = await startJob(video.video_id, fmt, "audio");
        // Poll
        await new Promise((resolve, reject) => {
          const iv = setInterval(async () => {
            try {
              const data = await pollJob(jobId);
              if (data.status === "ready") {
                clearInterval(iv);
                // Download file
                const res = await fetch(`${API_BASE}/api/jobs/${jobId}/file`);
                if (!res.ok) { reject(new Error("Download failed")); return; }
                const disposition = res.headers.get("Content-Disposition") || "";
                const nameMatch   = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/i);
                const rawName     = nameMatch ? nameMatch[1].trim() : video.title;
                const filename    = rawName.includes(".") ? rawName : `${rawName}.mp3`;
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement("a");
                a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 10_000);
                resolve();
              } else if (data.status === "error") {
                clearInterval(iv);
                reject(new Error(data.error || "Conversion failed"));
              }
            } catch (e) { clearInterval(iv); reject(e); }
          }, 2000);
        });
      } else {
        // Video tunnel
        const tunnel = await getTunnelUrl(video.video_id, "22", "video");
        if (!tunnel.url) throw new Error("No download URL");
        const a = document.createElement("a");
        a.href = tunnel.url; a.download = `${video.title}.mp4`;
        a.target = "_blank"; a.rel = "noopener noreferrer";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
      setStatus(video.video_id, "done");
    } catch (e) {
      setStatus(video.video_id, "error", e.message?.slice(0, 60));
    }
  };

  const downloadAll = async () => {
    setRunning(true);
    const toDownload = videos.filter(v => selected[v.video_id]);
    for (const video of toDownload) {
      if (statuses[video.video_id]?.status === "done") continue;
      await downloadOne(video, format);
      await new Promise(r => setTimeout(r, 500)); // small delay between downloads
    }
    setRunning(false);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const doneCount     = Object.values(statuses).filter(s => s.status === "done").length;

  return (
    <div className="pl-wrapper">
      <div className="pl-header">
        <div className="pl-header-left">
          <h3 className="pl-title">Playlist · {videos.length} videos</h3>
          {videos.length > 0 && (
            <span className="pl-meta">{selectedCount} selected · {doneCount} done</span>
          )}
        </div>
        <button className="pl-cancel" onClick={onCancel} aria-label="Cancel"><IconX /></button>
      </div>

      {loading && (
        <div className="pl-loading"><Spinner size={24} /> Loading playlist…</div>
      )}

      {error && (
        <div className="pl-error"><IconX /> {error}</div>
      )}

      {!loading && !error && videos.length > 0 && (
        <>
          {/* Format + controls */}
          <div className="pl-controls">
            <select
              className="pl-format-select"
              value={format}
              onChange={e => setFormat(e.target.value)}
              disabled={running}
            >
              {FORMAT_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              className="pl-dl-all-btn"
              onClick={downloadAll}
              disabled={running || selectedCount === 0}
            >
              {running
                ? <><Spinner size={14} /> Downloading…</>
                : <><IconDownload /> Download {selectedCount}</>}
            </button>
          </div>

          {/* Select all */}
          <div className="pl-select-all">
            <label className="pl-checkbox-label">
              <input type="checkbox" checked={selectAll} onChange={toggleAll} />
              Select all
            </label>
          </div>

          {/* Video list */}
          <div className="pl-list">
            {videos.map((v, i) => {
              const st = statuses[v.video_id];
              return (
                <div key={v.video_id} className={`pl-item${selected[v.video_id] ? " selected" : ""}`}>
                  <label className="pl-checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!selected[v.video_id]}
                      onChange={() => toggleSelect(v.video_id)}
                      disabled={running}
                    />
                  </label>
                  <div className="pl-thumb-wrap">
                    {v.thumbnail
                      ? <img src={v.thumbnail} alt="" className="pl-thumb" loading="lazy" />
                      : <div className="pl-thumb-placeholder" />}
                    <span className="pl-index">{i + 1}</span>
                  </div>
                  <div className="pl-item-info">
                    <div className="pl-item-title" title={v.title}>{v.title}</div>
                    <div className="pl-item-meta">{v.channel}{v.duration ? ` · ${v.duration}` : ""}</div>
                  </div>
                  <div className="pl-item-status">
                    {st ? (
                      <StatusBadge status={st.status} error={st.error} />
                    ) : (
                      <button
                        className="pl-item-dl-btn"
                        onClick={() => downloadOne(v, format)}
                        disabled={running}
                        title="Download this video"
                      >
                        <IconDownload />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}