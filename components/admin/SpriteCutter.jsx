'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * SpriteCutter — canvas-based sprite sheet slicer.
 * Upload a sprite sheet, set rows/cols, preview the grid, download individual frames or a zip.
 */
export default function SpriteCutter({ image: initialImage, onClose }) {
  const [imageSrc, setImageSrc] = useState(initialImage || null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [sprites, setSprites] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [sliced, setSliced] = useState(false);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const imgRef = useRef(null);

  // Draw grid preview on the canvas whenever image/rows/cols change
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const cellW = img.naturalWidth / cols;
    const cellH = img.naturalHeight / rows;

    ctx.strokeStyle = 'rgba(255, 20, 147, 0.8)';
    ctx.lineWidth = Math.max(1, Math.min(img.naturalWidth, img.naturalHeight) / 200);

    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, img.naturalHeight);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(img.naturalWidth, r * cellH);
      ctx.stroke();
    }

    // Frame numbers
    ctx.fillStyle = 'rgba(255, 20, 147, 0.9)';
    ctx.font = `bold ${Math.max(10, cellW / 6)}px monospace`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillText(`${r * cols + c}`, c * cellW + 4, r * cellH + cellH / 6 + 4);
      }
    }
  }, [cols, rows]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawGrid();
      setSliced(false);
      setSprites([]);
      setSelectedIdx(null);
    };
    img.src = imageSrc;
  }, [imageSrc, drawGrid]);

  useEffect(() => {
    if (imgRef.current?.complete) drawGrid();
  }, [drawGrid]);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target.result);
    reader.readAsDataURL(file);
  }

  function sliceSprites() {
    const img = imgRef.current;
    if (!img) return;

    const cellW = Math.floor(img.naturalWidth / cols);
    const cellH = Math.floor(img.naturalHeight / rows);
    const cut = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offscreen = document.createElement('canvas');
        offscreen.width = cellW;
        offscreen.height = cellH;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(img, c * cellW, r * cellH, cellW, cellH, 0, 0, cellW, cellH);
        cut.push({
          index: r * cols + c,
          row: r,
          col: c,
          dataUrl: offscreen.toDataURL('image/png'),
          width: cellW,
          height: cellH,
        });
      }
    }

    setSprites(cut);
    setSliced(true);
    setSelectedIdx(null);
  }

  function downloadSprite(sprite) {
    const a = document.createElement('a');
    a.href = sprite.dataUrl;
    a.download = `sprite_${String(sprite.index).padStart(3, '0')}_r${sprite.row}c${sprite.col}.png`;
    a.click();
  }

  async function downloadAll() {
    // Sequential download with a small delay so browsers don't block
    for (const sprite of sprites) {
      downloadSprite(sprite);
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white text-sm font-bold uppercase tracking-widest">Sprite Cutter</h2>
            <p className="text-[#737373] text-xs mt-0.5">Upload a sprite sheet · set grid · slice frames</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-xs uppercase tracking-wider transition-colors">
            Close ×
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Left: controls */}
          <div className="lg:w-64 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col gap-5">
            {/* Upload */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#737373] mb-2">Sprite Sheet</label>
              <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#ff1493]/50 transition-colors text-center">
                <span className="text-[11px] text-[#555]">{imageSrc ? 'Replace image' : 'Click to upload'}</span>
                <span className="text-[10px] text-[#333] mt-1">PNG, JPG, GIF</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Grid controls */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#737373] mb-2">Columns</label>
              <input
                type="number"
                min={1}
                max={64}
                value={cols}
                onChange={(e) => { setCols(Math.max(1, parseInt(e.target.value) || 1)); setSliced(false); }}
                className="w-full bg-black/60 border border-white/10 text-white text-sm px-3 py-2 rounded focus:border-[#ff1493]/50 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#737373] mb-2">Rows</label>
              <input
                type="number"
                min={1}
                max={64}
                value={rows}
                onChange={(e) => { setRows(Math.max(1, parseInt(e.target.value) || 1)); setSliced(false); }}
                className="w-full bg-black/60 border border-white/10 text-white text-sm px-3 py-2 rounded focus:border-[#ff1493]/50 outline-none"
              />
            </div>

            {imageSrc && (
              <div className="text-[10px] text-[#555] space-y-1">
                <div>{cols * rows} total frames</div>
                {imgRef.current && (
                  <div>
                    {Math.floor(imgRef.current.naturalWidth / cols)} × {Math.floor(imgRef.current.naturalHeight / rows)} px/frame
                  </div>
                )}
              </div>
            )}

            <button
              onClick={sliceSprites}
              disabled={!imageSrc}
              className="w-full py-2.5 bg-[#ff1493] text-black text-[11px] font-bold uppercase tracking-widest rounded hover:bg-[#d4107a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Slice Frames
            </button>

            {sliced && sprites.length > 0 && (
              <button
                onClick={downloadAll}
                className="w-full py-2.5 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded hover:bg-white/5 transition-colors"
              >
                Download All ({sprites.length})
              </button>
            )}
          </div>

          {/* Right: preview */}
          <div className="flex-1 p-6 overflow-auto">
            {!imageSrc ? (
              <div className="flex items-center justify-center h-64 text-[#333] text-sm">
                Upload a sprite sheet to get started
              </div>
            ) : !sliced ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#737373] mb-3">Grid Preview</p>
                <canvas
                  ref={canvasRef}
                  className="max-w-full border border-white/10 rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-[#737373]">
                    {sprites.length} frames sliced
                    {selectedIdx !== null ? ` · frame ${selectedIdx} selected` : ''}
                  </p>
                  {selectedIdx !== null && (
                    <button
                      onClick={() => downloadSprite(sprites[selectedIdx])}
                      className="text-[10px] text-[#ff1493] hover:underline"
                    >
                      Download frame {selectedIdx}
                    </button>
                  )}
                </div>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {sprites.map((s) => (
                    <div
                      key={s.index}
                      onClick={() => setSelectedIdx(s.index === selectedIdx ? null : s.index)}
                      className={`relative cursor-pointer border rounded overflow-hidden transition-all ${
                        s.index === selectedIdx
                          ? 'border-[#ff1493] shadow-[0_0_8px_rgba(255,20,147,0.4)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={s.dataUrl}
                        alt={`Frame ${s.index}`}
                        className="w-full h-auto block"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-mono text-white/60 bg-black/50">
                        {s.index}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
