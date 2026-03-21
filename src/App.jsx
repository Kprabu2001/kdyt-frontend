// src/App.jsx
import { useState, useEffect } from "react";
import Navbar         from "./components/Navbar";
import DownloaderCard from "./components/DownloaderCard";
import StatsBar       from "./components/StatsBar";
import HowItWorks     from "./components/HowItWorks";
import FeaturesGrid   from "./components/FeaturesGrid";
import Faq            from "./components/Faq";
import Footer         from "./components/Footer";
import TermsOfService from "./components/Termsofservice";
import PlaylistQueue  from "./components/PlaylistQueue";
import { useDownloader } from "./hooks/useDownloader";
import { useI18n }       from "./i18n/index.jsx";
import { extractVideoId, extractPlaylistId, isPlaylistUrl } from "./services/api";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/sections.css";

export default function App() {
  const { t } = useI18n();
  const dl = useDownloader({});

  const [showTerms,     setShowTerms]     = useState(false);
  const [playlistId,    setPlaylistId]    = useState(null);
  const [playlistUrl,   setPlaylistUrl]   = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner,  setShowPwaBanner]  = useState(false);
  const [isIos,          setIsIos]          = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (ios && !isStandalone) {
      setIsIos(true);
      const timer = setTimeout(() => setShowPwaBanner(true), 3000);
      return () => clearTimeout(timer);
    }
    const handler = (e) => {
      e.preventDefault(); setDeferredPrompt(e); setShowPwaBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowPwaBanner(false); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null); setShowPwaBanner(false);
  };

  const handleFetch = () => {
    const raw = dl.url.trim();
    if (!raw) { dl.fetchInfo(); return; }

    // Playlist URL
    if (isPlaylistUrl(raw)) {
      const pid = extractPlaylistId(raw);
      if (pid) {
        setPlaylistId(pid);
        setPlaylistUrl(raw);
        return;
      }
    }

    // Shorts or regular video — extract ID and fetch
    const vid = extractVideoId(raw);
    if (vid) {
      dl.changeUrl(vid);           // strip to ID in input like Y2Mate
      setTimeout(() => dl.fetchInfo(), 0);
    } else {
      dl.fetchInfo();              // let backend validate
    }
  };

  const handleCancelPlaylist = () => {
    setPlaylistId(null);
    setPlaylistUrl(null);
    dl.clearAll();
  };

  return (
    <div className="app">
      <div className="ambient" aria-hidden="true" />
      <Navbar />

      <main className="hero">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot" aria-hidden="true" />
            {t("badge")}
          </div>

          <h1 className="headline">
            {t("headline_pre")} <span className="accent">YouTube</span> {t("headline_post")}
          </h1>

          <p className="subline">{t("subline")}</p>

          {playlistId ? (
            <div className="input-card" style={{ width: "100%", maxWidth: "740px" }}>
              <PlaylistQueue
                playlistUrl={playlistUrl}
                onCancel={handleCancelPlaylist}
              />
            </div>
          ) : (
            <DownloaderCard
              url={dl.url}
              loading={dl.loading}
              info={dl.info}
              error={dl.error}
              formatStates={dl.formatStates}
              inputRef={dl.inputRef}
              onUrlChange={dl.changeUrl}
              onKeyDown={(e) => { if (e.key === "Enter") handleFetch(); }}
              onPaste={dl.pasteFromClipboard}
              onClear={dl.clearAll}
              onFetch={handleFetch}
              onDownload={dl.handleDownload}
              onTrigger={dl.triggerDownload}
              onOpenTerms={() => setShowTerms(true)}
            />
          )}

          <StatsBar />
        </div>

        <div className="ornament-divider" aria-hidden="true"><span>✦</span></div>
        <HowItWorks />
        <div className="ornament-divider" aria-hidden="true"><span>✦</span></div>
        <FeaturesGrid />
        <div className="ornament-divider" aria-hidden="true"><span>✦</span></div>
        <Faq />

        <div className="disclaimer">
          <strong>⚖ {t("disclaimer")}</strong>
        </div>
      </main>

      <Footer />
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}

      {showPwaBanner && (
        <div className="pwa-banner">
          <div className="pwa-banner-text">
            {isIos ? (
              <><strong>Install KDYT</strong> — tap <span className="pwa-share-icon">⎋</span> then <strong>Add to Home Screen</strong>.</>
            ) : (
              <><strong>Install KDYT</strong> — add to your home screen for instant access.</>
            )}
          </div>
          {!isIos && <button className="pwa-install-btn" onClick={handleInstall}>Install</button>}
          <button className="pwa-dismiss-btn" onClick={() => setShowPwaBanner(false)} aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  );
}