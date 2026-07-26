export const publicCSS = String.raw`
:root{
  --bg:#050505; --surface:#0a0a0d; --line:rgba(245,245,247,0.09); --line-strong:rgba(245,245,247,0.16);
  --text:#f2f2f4; --muted:#8c8c95; --gold:#e8b923; --pink:#e6007a; --blue:#007aff;
}
*{box-sizing:border-box;} html{scroll-behavior:smooth;}
body{margin:0;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
a{color:inherit;text-decoration:none;}
.mono{font-family:'JetBrains Mono',monospace;}

.eyebrow{
  font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;
  color:var(--gold);display:flex;align-items:center;gap:10px;
}
.eyebrow::before{content:'';width:14px;height:1px;background:var(--gold);display:inline-block;}

.wrap{max-width:960px;margin:0 auto;padding:0 28px;position:relative;}

.hero{padding:120px 28px 60px;}
.hero h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(36px,6vw,64px);line-height:0.98;margin:20px 0 20px;}
.hero p{font-size:17px;line-height:1.65;color:#c7c7cd;max-width:600px;margin:0 0 20px;}

.section{padding:80px 28px;border-top:1px solid var(--line);}
.section h2{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:clamp(28px,4vw,42px);line-height:1.05;margin:14px 0 0;max-width:680px;}
.section p{color:#c7c7cd;line-height:1.7;font-size:16px;max-width:620px;margin:20px 0 0;}

.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:40px;}
.btn{font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:0.05em;text-transform:uppercase;padding:15px 26px;border-radius:2px;display:inline-flex;align-items:center;gap:8px;transition:transform .18s ease,box-shadow .18s ease;}
.btn-primary{background:var(--gold);color:#0a0a0a;font-weight:600;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,185,35,0.25);}
.btn-ghost{border:1px solid var(--line-strong);color:var(--text);}
.btn-ghost:hover{border-color:var(--pink);color:var(--pink);}

footer{padding:60px 28px 40px;border-top:1px solid var(--line);}
.footer-inner{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.copy{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);margin-top:24px;}

::selection{background:var(--pink);color:#fff;}
a:focus-visible,button:focus-visible{outline:2px solid var(--blue);outline-offset:3px;}
`;
