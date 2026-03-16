// src/components/DmcaPolicy.jsx

export default function DmcaPolicy({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">DMCA Policy</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-date">Last updated: January 1, 2026</p>

          <h3>Our Position</h3>
          <p>KDYT respects intellectual property rights and expects users to do the same. KDYT is a technical tool — we do not host, store, or distribute any video or audio content. All content is fetched directly from YouTube's public servers.</p>

          <h3>No Content Storage</h3>
          <p>KDYT does not store any video or audio files on its servers. Downloads go directly from YouTube's servers to the user's device. We have no ability to remove content from YouTube — any such requests must be directed to YouTube directly.</p>

          <h3>DMCA Takedown Requests</h3>
          <p>If you believe your copyrighted work is being infringed through our service, please note:</p>
          <ul>
            <li>We do not host content — we cannot remove videos from YouTube</li>
            <li>For content removal from YouTube, contact: <strong>copyright@youtube.com</strong></li>
            <li>For concerns about our tool itself, contact us below</li>
          </ul>

          <h3>Filing a Notice</h3>
          <p>If you have a valid DMCA concern specifically about our service (not YouTube's content), your notice must include:</p>
          <ul>
            <li>Your full legal name and contact information</li>
            <li>Identification of the copyrighted work claimed to be infringed</li>
            <li>A description of the alleged infringement</li>
            <li>A statement of good faith belief that the use is not authorized</li>
            <li>A statement that the information is accurate under penalty of perjury</li>
            <li>Your physical or electronic signature</li>
          </ul>

          <h3>Counter-Notices</h3>
          <p>If you believe content was removed in error, you may file a counter-notice with the same information listed above plus a statement consenting to jurisdiction.</p>

          <h3>Repeat Infringers</h3>
          <p>KDYT will terminate access for users who are repeat infringers of intellectual property rights.</p>

          <h3>Contact for DMCA</h3>
          <p>Send DMCA notices to our contact form. We will respond within 48 hours.</p>
        </div>
      </div>
    </div>
  );
}