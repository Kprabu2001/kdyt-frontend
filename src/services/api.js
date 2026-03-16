// src/services/api.js

import { API_BASE } from "../constants/config";

// ── Info ──────────────────────────────────────────────────────────
export async function fetchVideoInfo(url) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/info?url=${encodeURIComponent(url)}`);
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

// ── Job API ───────────────────────────────────────────────────────

/**
 * POST /api/jobs  — tells backend to start preparing the file.
 * Returns job_id string.
 */
export async function startJob(url, formatId, type) {
  const params = new URLSearchParams({ url, format_id: formatId, type });
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
    throw new Error(data.detail || "Failed to start download.");
  }
  return data.job_id;
}

/**
 * GET /api/jobs/{id}  — poll preparation status.
 * Returns { status, progress, error, filesize }
 */
export async function pollJob(jobId) {
  const res  = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Job not found.");
  return data;
}

/**
 * Trigger browser download of the ready file via fetch() + Blob.
 * Uses real Content-Length for progress since file is pre-built.
 */
export async function downloadJobFile(jobId, { onProgress, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/jobs/${jobId}/file`, {
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      onError(new Error("Cannot reach the server."));
      return;
    }

    if (!res.ok) {
      try { const d = await res.json(); onError(new Error(d.detail || "Download failed.")); }
      catch { onError(new Error("Download failed.")); }
      return;
    }

    const mimeType      = res.headers.get("Content-Type") || "application/octet-stream";
    const contentLength = Number(res.headers.get("Content-Length")) || null;
    const disposition   = res.headers.get("Content-Disposition") || "";
    const nameMatch     = disposition.match(/filename[^;=\n]*=["']?([^"'\n;]+)["']?/i);
    const mimeExt       = mimeType.includes("mp3") || mimeType.includes("mpeg") ? "mp3" : "mp4";
    const rawName       = nameMatch ? nameMatch[1].trim() : "download";
    const filename      = rawName.includes(".") ? rawName : `${rawName}.${mimeExt}`;

    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress(contentLength
          ? Math.min(99, Math.round((received / contentLength) * 100))
          : null
        );
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      onError(new Error("Download interrupted."));
      return;
    }

    const blob    = new Blob(chunks, { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = blobUrl;
    a.download    = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    onDone();
  })();

  return controller;
}