// src/hooks/useDownloader.js

import { useState, useRef, useEffect, useCallback } from "react";
import { fetchVideoInfo, startJob, pollJob } from "../services/api";
import { API_BASE } from "../constants/config";

const YOUTUBE_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
]);

function isValidYouTubeUrl(url) {
  try {
    const u = new URL(url);
    if (!YOUTUBE_HOSTS.has(u.hostname)) return false;
    // Regular watch, Shorts, embeds, youtu.be all valid
    return (
      u.pathname.startsWith("/watch") ||
      u.pathname.startsWith("/shorts/") ||
      u.pathname.startsWith("/embed/") ||
      u.hostname === "youtu.be"
    );
  } catch { return false; }
}

export function useDownloader({ onDownloaded } = {}) {
  const [url,          setUrl]          = useState("");
  const [loading,      setLoading]      = useState(false);
  const [info,         setInfo]         = useState(null);
  const [error,        setError]        = useState("");
  const [formatStates, setFormatStates] = useState({});

  const inputRef  = useRef(null);
  const pollRef   = useRef({});
  const abortRef  = useRef({});
  const jobIdRef  = useRef({});
  const infoRef   = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => () => {
    Object.values(pollRef.current).forEach(clearInterval);
    Object.values(abortRef.current).forEach(c => c?.abort());
  }, []);

  const _setFormat = useCallback((formatId, patch) => {
    setFormatStates(prev => ({
      ...prev,
      [formatId]: { ...(prev[formatId] || {}), ...patch },
    }));
  }, []);

  const _startFileDownload = useCallback((formatId, jobId, type) => {
    _setFormat(formatId, { phase: "downloading", dlProgress: 0, indeterminate: true });

    // Stream via fetch so we stay same-origin and get real download behaviour.
    // We use a streaming approach: pipe ReadableStream → StreamSaver or Blob.
    // For simplicity and reliability: fetch → collect → Blob → save.
    // This works cross-origin and gives us the filename from Content-Disposition.
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
        const mimeType      = res.headers.get("Content-Type") || "application/octet-stream";
        const mimeExt       = mimeType.includes("mp3") || mimeType.includes("mpeg") ? "mp3" : "mp4";
        const rawName       = nameMatch ? nameMatch[1].trim() : "download";
        const filename      = rawName.includes(".") ? rawName : `${rawName}.${mimeExt}`;

        const reader = res.body.getReader();
        const chunks = [];
        let received  = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength) {
            _setFormat(formatId, {
              indeterminate: false,
              dlProgress: Math.min(99, Math.round((received / contentLength) * 100)),
            });
          }
        }

        const blob    = new Blob(chunks, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        const a       = document.createElement("a");
        a.href        = blobUrl;
        a.download    = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

        _setFormat(formatId, { phase: "done", dlProgress: 100, indeterminate: false });
        delete jobIdRef.current[formatId];
        // Notify history — wrapped so any failure never affects the user
        try {
          if (onDownloaded && infoRef.current) {
            onDownloaded(infoRef.current, formatId, type);
          }
        } catch (_) {}

      } catch (err) {
        if (err.name === "AbortError") return;
        // Only show error if download hadn't completed yet
        const currentPhase = formatStates[formatId]?.phase;
        if (currentPhase !== "done") {
          _setFormat(formatId, { phase: "error" });
          setError(err.message || "Download failed.");
        }
      }
    })();
  }, [_setFormat]);

  const changeUrl = useCallback((v) => { setUrl(v); setError(""); }, []);

  const pasteFromClipboard = useCallback(async () => {
    try { changeUrl(await navigator.clipboard.readText()); }
    catch { inputRef.current?.focus(); }
  }, [changeUrl]);

  const clearAll = useCallback(() => {
    Object.values(pollRef.current).forEach(clearInterval);
    Object.values(abortRef.current).forEach(c => c?.abort());
    pollRef.current  = {};
    abortRef.current = {};
    jobIdRef.current = {};
    setUrl(""); setInfo(null); setError(""); setFormatStates({});
    inputRef.current?.focus();
  }, []);

  const fetchInfo = useCallback(async () => {
    if (!url.trim())             { setError("Please paste a YouTube URL."); return; }
    if (!isValidYouTubeUrl(url)) { setError("Only YouTube URLs are supported (videos, Shorts, playlists)."); return; }
    setLoading(true); setInfo(null); setError(""); setFormatStates({});
    try {
      const result = await fetchVideoInfo(url);
      setInfo(result);
      infoRef.current = result;
    }
    catch (e) { setError(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  }, [url]);

  const handleDownload = useCallback(async (formatId, type) => {
    const existing = formatStates[formatId];

    // If ready → user clicked Download Now → start actual file download
    if (existing?.phase === "ready" && jobIdRef.current[formatId]) {
      const { jobId: savedJobId, type: savedType } = jobIdRef.current[formatId];
      _startFileDownload(formatId, savedJobId, savedType);
      return;
    }
    // Already in progress or done — reopen modal only, no new job
    if (existing?.phase === "preparing" || existing?.phase === "downloading" || existing?.phase === "done") return;

    // Cancel any existing poll for this format
    if (pollRef.current[formatId])  clearInterval(pollRef.current[formatId]);
    if (abortRef.current[formatId]) abortRef.current[formatId].abort();

    _setFormat(formatId, { phase: "preparing", prepProgress: 5, dlProgress: 0 });
    setError("");

    // Start job
    let jobId;
    try {
      jobId = await startJob(url, formatId, type);
      jobIdRef.current[formatId] = { jobId, type };
    } catch (e) {
      _setFormat(formatId, { phase: "error" });
      setError(e.message);
      return;
    }

    // Poll until ready, then wait for user to click Download
    pollRef.current[formatId] = setInterval(async () => {
      try {
        const data = await pollJob(jobId);
        _setFormat(formatId, { prepProgress: data.progress ?? 0 });

        if (data.status === "ready") {
          clearInterval(pollRef.current[formatId]);
          delete pollRef.current[formatId];
          // Stop here — wait for user to click Download button in modal
          _setFormat(formatId, { phase: "ready", prepProgress: 100 });

        } else if (data.status === "error") {
          clearInterval(pollRef.current[formatId]);
          delete pollRef.current[formatId];
          _setFormat(formatId, { phase: "error" });
          setError(data.error || "Preparation failed.");
        }
      } catch {
        clearInterval(pollRef.current[formatId]);
        _setFormat(formatId, { phase: "error" });
        setError("Lost connection to server.");
      }
    }, 800);
  }, [url, formatStates, _setFormat, _startFileDownload]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") fetchInfo();
  }, [fetchInfo]);

  return {
    url, loading, info, error, formatStates,
    inputRef,
    changeUrl, pasteFromClipboard, clearAll,
    fetchInfo, handleDownload, handleKeyDown,
  };
}