import React from 'react';

export default function SpriteCutter({ image, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-[#111] border border-white/10 p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-sm font-bold uppercase tracking-widest">Sprite Cutter</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-white text-xs">Close</button>
        </div>
        <div className="aspect-square bg-black/60 border border-white/5 flex items-center justify-center">
          {image ? (
            <img src={image} alt="Sprite" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-[#444] text-xs">Sprite Editor — available in SLA113 console</span>
          )}
        </div>
      </div>
    </div>
  );
}
