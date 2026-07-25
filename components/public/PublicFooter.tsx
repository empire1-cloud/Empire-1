import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer>
      <div className="wrap footer-inner">
        <Link href="/" className="pub-mark" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/empire1_logo.jpeg"
            alt="Empire-1"
            style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 4 }}
          />
          <div
            className="pub-wordmark"
            style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
          >
            EMPIRE <span style={{ color: 'var(--pink)' }}>1</span>
          </div>
        </Link>
      </div>
      <div className="wrap copy">© 2026 EMPIRE 1 · founder@empire1.cloud</div>
    </footer>
  );
}
