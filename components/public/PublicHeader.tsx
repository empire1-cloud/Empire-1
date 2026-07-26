'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/revenue-os', label: 'Revenue OS' },
  { href: '/ecosystem', label: 'Ecosystem' },
  { href: '/hic', label: 'HIC' },
  { href: '/cultura', label: 'Cultura' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/licensing', label: 'Licensing' },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        .pub-header{position:sticky;top:0;z-index:20;background:rgba(5,5,5,0.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
        .pub-header-inner{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;max-width:960px;margin:0 auto;}
        .pub-mark{display:flex;align-items:center;gap:12px;}
        .pub-mark img{width:34px;height:34px;object-fit:contain;border-radius:4px;}
        .pub-wordmark{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:18px;letter-spacing:0.08em;text-transform:uppercase;}
        .pub-wordmark span{color:var(--pink);}
        .pub-nav{display:flex;gap:26px;}
        .pub-nav a{font-family:'JetBrains Mono',monospace;font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);transition:color .2s;}
        .pub-nav a:hover{color:var(--text);}
        .pub-hamburger{display:none;background:none;border:none;color:var(--text);cursor:pointer;padding:8px;}
        .pub-hamburger svg{width:24px;height:24px;}
        @media(max-width:700px){
          .pub-nav{display:none;}
          .pub-hamburger{display:block;}
        }
        .pub-mobile-menu{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,5,5,0.97);z-index:30;flex-direction:column;align-items:center;justify-content:center;gap:32px;}
        .pub-mobile-menu.open{display:flex;}
        .pub-mobile-menu a{font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);transition:color .2s;}
        .pub-mobile-menu a:hover{color:var(--text);}
        .pub-mobile-close{position:absolute;top:20px;right:28px;background:none;border:none;color:var(--text);cursor:pointer;padding:8px;}
        .pub-mobile-close svg{width:24px;height:24px;}
      `}</style>
      <header className="pub-header">
        <div className="pub-header-inner">
          <Link href="/" className="pub-mark">
            <img src="/empire1_logo.jpeg" alt="Empire-1" />
            <div className="pub-wordmark">EMPIRE <span>1</span></div>
          </Link>
          <nav className="pub-nav">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </nav>
          <button
            className="pub-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      <div className={`pub-mobile-menu${mobileOpen ? ' open' : ''}`}>
        <button
          className="pub-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
