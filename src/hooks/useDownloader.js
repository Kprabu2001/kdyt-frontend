// src/hooks/useDownloader.js
// Exact Y2Mate flow:
//   1. User pastes full URL (or bare video ID)
//   2. On Fetch → extract video ID → call /api/info?video_id=...
//   3. Video download → /api/tunnel?video_id=...&format_id=... → CDN URL → browser downloads
//   4. Audio download → /api/jobs?video_id=... → poll → stream MP3

import { useState, useRef, useEffect, useCallback } from "react";
import { extractVideoId, fetchVideoInfo, getTunnelUrl, startJob, pollJob } from "../services/api";
import { API_BASE } from "../constants/config";

const YOUTUBE_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
]);

function isValidInput(input) {
  if (!input) return false;
  // Bare 11-char video ID
  if (/^[0-9A-Za-z_-]{11}$/.test(input.trim())) return true;
  try {
    const u = new URL(input);
    return YOUTUBE_HOSTS.has(u.hostname);
  } catch { return false; }
}

function triggerDirectDownload(url, filename, ext) {
  const a  = document.createElement("a");
  a.href   = url;
  a.download = filename ? `${filename}.${ext}` : `download.${ext}`;
  a.target = "_blank";
  a.rel    = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function useDownloader({ onDownloaded } = {}) {
  const [url,          setUrl]          = useState("");
  const [videoId,      setVideoId]      = useState(null);   // extracted ID
  const [loading,      setLoading]      = useState(false);
  const [info,         setInfo]         = useState(null);
  const [error,        setError]        = useState("");
  const [formatStates, setFormatStates] = useState({});

  const inputRef  = useRef(null);
  const pollRef   = useRef({});
  const jobIdRef  = useRef({});
  const infoRef   = useRef(null);
  const videoIdRef = useRef(null);   // always up-to-date video ID

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => () => { Object.values(pollRef.current).forEach(clearInterval); }, []);

  const _setFormat = useCallback((formatId, patch) => {
    setFormatStates(prev => ({
      ...prev,
      [formatId]: { ...(prev[formatId] || {}), ...patch },
    }));
  }, []);

  // ── Audio: stream finished job file ──────────────────────────────
  const _downloadAudioFile = useCallback((formatId) => {
    _setFormat(formatId, { phase: "downloading", dlProgress: 0, indeterminate: true });
    const { jobId } = jobIdRef.current[formatId] || {};
    if (!jobId) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}/file`);
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || "Download failed.");
        }
        const contentLength = Number(res.headers.get("Content-Length")) || null;
        const disposition   = res.headers.get("Content-Disposition") || "";
        const nameMatch     = disposition.match(/filename[^;=]*=["']?([^";]+)["']?/i);
        const rawName       = nameMatch ? nameMatch[1].trim() : "audio";
        const filename      = rawName.includes(".") ? rawName : `${rawName}.mp3`;

        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength)
            _setFormat(formatId, {
              indeterminate: false,
              dlProgress: Math.min(99, Math.round((received / contentLength) * 100)),
            });
        }
        const blob    = new Blob(chunks, { type: "audio/mpeg" });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

        _setFormat(formatId, { phase: "done", dlProgress: 100, indeterminate: false });
        delete jobIdRef.current[formatId];
        try { if (onDownloaded && infoRef.current) onDownloaded(infoRef.current, formatId, "audio"); } catch (_) {}
      } catch (err) {
        _setFormat(formatId, { phase: "error" });
        setError(err.message || "Download failed.");
      }
    })();
  }, [_setFormat, onDownloaded]);

  // ── Audio: create job + poll ──────────────────────────────────────
  const _startAudioJob = useCallback(async (formatId) => {
    if (pollRef.current[formatId]) clearInterval(pollRef.current[formatId]);
    _setFormat(formatId, { phase: "preparing", prepProgress: 5 });
    setError("");

    const vid = videoIdRef.current;
    if (!vid) { _setFormat(formatId, { phase: "error" }); setError("No video loaded."); return; }

    let jobId;
    try {
      jobId = await startJob(vid, formatId, "audio");
      jobIdRef.current[formatId] = { jobId };
    } catch (e) {
      _setFormat(formatId, { phase: "error" });
      setError(e.message);
      return;
    }

    pollRef.current[formatId] = setInterval(async () => {
      try {
        const data = await pollJob(jobId);
        _setFormat(formatId, { prepProgress: data.progress ?? 0 });
        if (data.status === "ready") {
          clearInterval(pollRef.current[formatId]);
          delete pollRef.current[formatId];
          _setFormat(formatId, { phase: "ready", prepProgress: 100 });
        } else if (data.status === "error") {
          clearInterval(pollRef.current[formatId]);
          delete pollRef.current[formatId];
          _setFormat(formatId, { phase: "error" });
          setError(data.error || "Conversion failed.");
        }
      } catch {
        clearInterval(pollRef.current[formatId]);
        _setFormat(formatId, { phase: "error" });
        setError("Lost connection to server.");
      }
    }, 2000);
  }, [_setFormat]);

  // ── Main download handler ─────────────────────────────────────────
  const handleDownload = useCallback(async (formatId, type) => {
    const existing = formatStates[formatId];

    if (type === "audio" && existing?.phase === "ready") {
      _downloadAudioFile(formatId);
      return;
    }
    if (["resolving","preparing","downloading","done"].includes(existing?.phase)) return;
    if (pollRef.current[formatId]) clearInterval(pollRef.current[formatId]);
    setError("");

    const vid = videoIdRef.current;
    if (!vid) { setError("No video loaded."); return; }

    // ── VIDEO: tunnel → direct CDN ───────────────────────────────
    if (type === "video") {
      _setFormat(formatId, { phase: "resolving" });
      try {
        const tunnel = await getTunnelUrl(vid, formatId, "video");
        if (tunnel.type === "direct" || tunnel.type === "split") {
          _setFormat(formatId, { phase: "downloading", indeterminate: true });
          triggerDirectDownload(tunnel.url, tunnel.filename, "mp4");
          setTimeout(() => {
            _setFormat(formatId, { phase: "done" });
            try { if (onDownloaded && infoRef.current) onDownloaded(infoRef.current, formatId, "video"); } catch (_) {}
          }, 1500);
        }
      } catch (e) {
        _setFormat(formatId, { phase: "error" });
        setError(e.message || "Failed to resolve download link.");
      }
      return;
    }

    // ── AUDIO: job system ─────────────────────────────────────────
    await _startAudioJob(formatId);
  }, [formatStates, _setFormat, _startAudioJob, _downloadAudioFile, onDownloaded]);

  const changeUrl = useCallback((v) => {
    setUrl(v);
    setError("");
    // Extract and store video ID as user types
    const vid = extractVideoId(v.trim());
    setVideoId(vid);
    videoIdRef.current = vid;
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      changeUrl(text);
    } catch { inputRef.current?.focus(); }
  }, [changeUrl]);

  const clearAll = useCallback(() => {
    Object.values(pollRef.current).forEach(clearInterval);
    pollRef.current  = {};
    jobIdRef.current = {};
    videoIdRef.current = null;
    setUrl(""); setVideoId(null); setInfo(null); setError(""); setFormatStates({});
    inputRef.current?.focus();
  }, []);

  const fetchInfo = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Please paste a YouTube URL."); return; }
    if (!isValidInput(trimmed)) { setError("Only YouTube URLs are supported."); return; }

    const vid = extractVideoId(trimmed);
    if (!vid) { setError("Could not extract video ID from that URL."); return; }

    // Update video ID state
    setVideoId(vid);
    videoIdRef.current = vid;

    setLoading(true); setInfo(null); setError(""); setFormatStates({});
    try {
      const result = await fetchVideoInfo(vid);   // send video_id only
      setInfo(result);
      infoRef.current = result;
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown   = useCallback((e) => { if (e.key === "Enter") fetchInfo(); }, [fetchInfo]);
  const triggerDownload = handleDownload;

  return {
    url, loading, info, error, formatStates, videoId, inputRef,
    changeUrl, pasteFromClipboard, clearAll,
    fetchInfo, handleDownload, triggerDownload, handleKeyDown,
  };
}