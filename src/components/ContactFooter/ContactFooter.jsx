import React, { useState } from 'react';
import './ContactFooter.css';

export default function ContactFooter() {
  const [copied, setCopied] = useState(false);
  const email = 'shourya.upadhyay@foundry.dev';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="contact-footer-section" id="contact">

      <div className="contact-header font-mono">
        <div className="contact-badge">
          <span className="badge-num">004 /</span> GET IN TOUCH
        </div>
        <div className="contact-status">
          <span className="status-dot" aria-hidden="true" />
          AVAILABLE FOR SELECT COLLABORATIONS
        </div>
      </div>

      <div className="contact-main">
        <h2 className="contact-headline">
          LET&apos;S BUILD SOMETHING <span className="headline-highlight">EXTRAORDINARY.</span>
        </h2>

        <div className="contact-action-row">
          <button
            className={`email-copy-pill ${copied ? 'is-copied' : ''}`}
            onClick={handleCopyEmail}
            data-cursor="COPY"
            aria-label="Copy email address"
          >
            <span className="email-text">{email}</span>
            <span className="copy-badge">{copied ? '✓ COPIED' : 'COPY EMAIL'}</span>
          </button>
        </div>

        <div className="social-links-row">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-pill"
            data-cursor="LINK"
            aria-label="GitHub profile"
          >
            GITHUB ↗
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-pill"
            data-cursor="LINK"
            aria-label="LinkedIn profile"
          >
            LINKEDIN ↗
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-pill"
            data-cursor="LINK"
            aria-label="Twitter profile"
          >
            TWITTER / X ↗
          </a>
        </div>
      </div>

      <div className="contact-bottom-bar font-mono">
        <span>© 2026 SHOURYA UPADHYAY // FOUNDRY</span>
        <span>DESIGNED &amp; ENGINEERED WITH PRECISION</span>
      </div>

    </footer>
  );
}
