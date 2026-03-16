// src/constants/config.js
// Single source of truth for static data & environment-driven config.
// Nothing imported from React — this is pure JS data.

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const MODES = {
  VIDEO: "video",
  AUDIO: "audio",
};

export const STATS = [
  { num: "4K",      label: "Max quality" },
  { num: "320kbps", label: "MP3 bitrate" },
  { num: "No",       label: "Signup needed" },
  { num: "Free",    label: "Always"      },
];

export const HOW_STEPS = [
  {
    n:     "01",
    title: "Copy the URL",
    desc:  "Open YouTube, find your video, copy the link from the address bar or share button.",
  },
  {
    n:     "02",
    title: "Paste & Fetch",
    desc:  "Paste the link into KDYT and click Fetch. All available formats load in seconds.",
  },
  {
    n:     "03",
    title: "Pick & Download",
    desc:  "Choose your preferred resolution or MP3 bitrate and click to download instantly.",
  },
];

export const FEATURES = [
  { icon: "🎬", title: "MP4 up to 4K / 60fps",  desc: "All resolutions from 360p to 4K UHD with the original frame rate preserved." },
  { icon: "🎵", title: "MP3 up to 320 kbps",    desc: "Extract audio at 128, 192 or 320 kbps — perfect for music and podcasts." },
  { icon: "⚡", title: "Lightning fast",          desc: "Parallel server processing. Most downloads start in under 3 seconds." },
  { icon: "🔒", title: "Private by design",       desc: "We never log URLs or store files. Everything is streamed and wiped immediately." },
  { icon: "📱", title: "Works on any device",     desc: "Fully responsive — iOS, Android, desktop, tablet. No app install needed." },
  { icon: "🆓", title: "Completely free",         desc: "No daily caps, no watermarks, no account required. Just paste and download." },
];