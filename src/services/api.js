// src/services/api.js
// Exact Y2Mate flow:
//   1. Frontend extracts video ID from URL
//   2. All API calls send video_id (not full URL)
//   3. Backend uses video ID directly with InnerTube

import { API_BASE } from "../constants/config";

// ── Extract video ID from any YouTube URL ─────────────────────────
export function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([0-9A-Za-z_-]{11})/,
    /youtu\.be\/([0-9A-Za-z_-]{11})/,
    /shorts\/([0-9A-Za-z_-]{11})/,
    /embed\/([0-9A-Za-z_-]{11})/,
    /^([0-9A-Za-z_-]{11})$/,   // bare ID pasted directly
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Info: send only video_id ──────────────────────────────────────
export async function fetchVideoInfo(videoId) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/info?video_id=${encodeURIComponent(videoId)}`);
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) {
      const m = Math.ceil((Number(res.headers.get("Retry-After")) || 900) / 60);
      throw new Error(`Too many requests. Please wait ${m} minute${m !== 1 ? "s" : ""}.`);
    }
    throw new Error(data.detail || "Failed to fetch video info.");
  }
  return data;
}

// ── Tunnel: send video_id + format_id ────────────────────────────
export async function getTunnelUrl(videoId, formatId, type) {
  const params = new URLSearchParams({ video_id: videoId, format_id: formatId, type });
  let res;
  try {
    res = await fetch(`${API_BASE}/api/tunnel?${params}`);
  } catch {
    throw new Error("Cannot reach the server.");
  }
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) {
      const m = Math.ceil((Number(res.headers.get("Retry-After")) || 900) / 60);
      throw new Error(`Too many requests. Please wait ${m} minute${m !== 1 ? "s" : ""}.`);
    }
    throw new Error(data.detail || "Failed to resolve download URL.");
  }
  return data;
}

// ── Jobs: audio only, send video_id ──────────────────────────────
export async function startJob(videoId, formatId, type) {
  const params = new URLSearchParams({ video_id: videoId, format_id: formatId, type });
  let res;
  try {
    res = await fetch(`${API_BASE}/api/jobs?${params}`, { method: "POST" });
  } catch {
    throw new Error("Cannot reach the server.");
  }
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 429) {
      const m = Math.ceil((Number(res.headers.get("Retry-After")) || 60) / 60);
      throw new Error(`Download limit reached. Wait ${m} minute${m !== 1 ? "s" : ""}.`);
    }
    throw new Error(data.detail || "Failed to start audio job.");
  }
  return data.job_id;
}

export async function pollJob(jobId) {
  const res  = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Job not found.");
  return data;
}

export async function downloadJobFile(jobId, { onProgress, onDone, onError }) {
  (async () => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/jobs/${jobId}/file`);
    } catch {
      onError(new Error("Cannot reach the server.")); return;
    }
    if (!res.ok) {
      try { const d = await res.json(); onError(new Error(d.detail || "Download failed.")); }
      catch { onError(new Error("Download failed.")); }
      return;
    }
    const contentLength = Number(res.headers.get("Content-Length")) || null;
    const disposition   = res.headers.get("Content-Disposition") || "";
    const nameMatch     = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/i);
    const rawName       = nameMatch ? nameMatch[1].trim() : "audio";
    const filename      = rawName.includes(".") ? rawName : `${rawName}.mp3`;
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress(contentLength ? Math.min(99, Math.round((received / contentLength) * 100)) : null);
      }
    } catch { onError(new Error("Download interrupted.")); return; }
    const blob    = new Blob(chunks, { type: "audio/mpeg" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    onDone();
  })();
}