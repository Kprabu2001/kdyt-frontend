// src/components/Contact.jsx

import { useState } from "react";

export default function Contact({ onClose }) {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const goToFaq = () => {
    onClose();
    setTimeout(() => {
      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    // Simulate submit — replace with your real form endpoint (Formspree, EmailJS, etc.)
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Contact Us</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {sent ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ marginBottom: "8px" }}>Message sent!</h3>
              <p>Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
              <button className="cf-submit-btn" style={{ marginTop: "20px" }} onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="modal-date">We typically respond within 1–2 business days.</p>

              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">Name <span className="cf-req">*</span></label>
                  <input
                    className="cf-input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    autoComplete="given-name"
                  />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Email <span className="cf-req">*</span></label>
                  <input
                    className="cf-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label">Subject</label>
                <input
                  className="cf-input"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                />
              </div>

              <div className="cf-field">
                <label className="cf-label">Message <span className="cf-req">*</span></label>
                <textarea
                  className="cf-input cf-textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write something…"
                  rows={5}
                />
              </div>

              <button
                className="cf-submit-btn"
                onClick={handleSubmit}
                disabled={loading || !form.name.trim() || !form.email.trim() || !form.message.trim()}
              >
                {loading ? "Sending…" : "Submit"}
              </button>

              <p className="cf-faq-note">
                Before writing, check our{" "}
                <button className="terms-notice-link" onClick={goToFaq}>FAQ</button>
                {" "}— most questions are already answered there.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}