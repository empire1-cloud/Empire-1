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
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Link href="/services" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Services</Link>
          <Link href="/services/scan" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free Scan</Link>
          <Link href="/services/results" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proof</Link>
          <Link href="/services/intake" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Project Intake</Link>
          <Link href="/enterprise" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Enterprise</Link>
        </div>
      </div>
      <div className="wrap copy">© 2026 EMPIRE 1 · founder@empire1.cloud</div>
    </footer>
  );
}
