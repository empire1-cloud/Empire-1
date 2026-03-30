'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  name?: string;
  hp?: number;
  maxHp?: number;
}

const JOEY_GAME = {
  title: "THE_HOOD_TROPHY909",
  subtitle: "Graduation Game - 18th Birthday",
  player: {
    name: "THE_HOOD_TROPHY909 (Joey)",
    description: "5'8, baby face, wide frame, big chest, thin waist, short black hair, gold chains",
    color: '#FFD700'
  },
  characters: [
    { name: "Bryan", role: "Medic", ride: "Pickup Truck", color: "#4ADE80" },
    { name: "LIL MOR", role: "Gunner", ride: "87 Monte Carlo", color: "#F472B6" },
    { name: "PANCHO", role: "Recon", ride: "2025 Tahoe", color: "#60A5FA" }
  ],
  enemies: [
    { name: "'C ONE WANNABE 1", type: "COVID Zombie", location: "Muscoy, CA", color: "#22C55E" },
    { name: "Werewolf", type: "Boss", location: "Full Moon", color: "#A855F7" },
    { name: "Enemy Soldier", type: "Military", color: "#EF4444" }
  ],
  vehicles: [
    "87 Silver El Camino",
    "87 Black Monte Carlo", 
    "Black Lowrider Bike",
    "OFF ROAD Vehicle",
    "PANCHO's 2025 Tahoe"
  ],
  weapons: ["RAVE GUN", "PURPLE BAT", "M4", "Sniper", "Shotgun"],
  maps: [
    "Puro Paisa Ranch",
    "Downtown SB - Motel District",
    "Muscoy Swamps",
    "San Bernardino Streets"
  ],
  soundtrack: [
    "MC Breed - AINT NO FUTURE",
    "Wu-Tang - Protect Ya Neck",
    "Biggie - Juicy",
    "2Pac - California Love"
  ],
  tributes: [
    { name: "BIG MONDO", relation: "Grandfather", message: "FLY HIGH 🌟" },
    { name: "LIL MONDO (POPS)", relation: "Uncle", message: "FLY HIGH 🌟" }
  ]
};

export default function JoeyGame() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [currentScreen, setCurrentScreen] = useState<'main' | 'characters' | 'vehicles' | 'weapons' | 'maps' | 'tribute'>('main');
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [showFullMoon, setShowFullMoon] = useState(false);
  const [joeySpeech, setJoeySpeech] = useState<string | null>(null);
  const [enemySpeech, setEnemySpeech] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<{[key: string]: boolean}>({});

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        if (keysRef.current['ArrowUp'] || keysRef.current['w']) newY = Math.max(20, prev.y - 10);
        if (keysRef.current['ArrowDown'] || keysRef.current['s']) newY = Math.min(580, newY + 10);
        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) newX = Math.max(20, prev.x - 10);
        if (keysRef.current['ArrowRight'] || keysRef.current['d']) newX = Math.min(780, newX + 10);
        return { x: newX, y: newY };
      });

      if (Math.random() < 0.05) {
        setEnemies(prev => {
          const side = Math.floor(Math.random() * 4);
          let newEnemy: GameObject;
          switch(side) {
            case 0: newEnemy = { x: Math.random() * 800, y: -30, width: 40, height: 60, type: "'C ONE WANNABE 1", hp: 30 }; break;
            case 1: newEnemy = { x: Math.random() * 800, y: 630, width: 40, height: 60, type: "'C ONE WANNABE 1", hp: 30 }; break;
            case 2: newEnemy = { x: -30, y: Math.random() * 600, width: 40, height: 60, type: "'C ONE WANNABE 1", hp: 30 }; break;
            default: newEnemy = { x: 830, y: Math.random() * 600, width: 40, height: 60, type: "'C ONE WANNABE 1", hp: 30 }; break;
          }
          return [...prev.slice(-10), newEnemy];
        });
      }

      setEnemies(prev => prev.map(e => {
        const dx = playerPos.x - e.x;
        const dy = playerPos.y - e.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 50 && Math.random() < 0.1) {
          setHealth(h => Math.max(0, h - 5));
        }
        return { ...e, x: e.x + (dx/dist) * 2, y: e.y + (dy/dist) * 2 };
      }).filter(e => e.hp && e.hp > 0));
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, playerPos]);

  // Joey's voice lines
  const JOEY_VOICES = [
    "We sell treats, just not ours! 😂",
    "C1 WANNABE get out the way!",
    "This my graduation party! 🎓",
    "Gold chains stay gleaming! 🔱",
    "San Bernardino! Let's go! 🌴",
    "My grandpa would be proud!",
    "LIL MONDO we miss you! 🙏",
    "Full moon nights! 🌕 Werewolf coming!"
  ];

  // Enemy voice lines
  const ENEMY_VOICES = [
    "C1 WANNABE 1 from Muscoy! 🧟",
    "We want that purolife!",
    "Brainsss... and treats! 🧠",
    "COVID AINT DEAD YET!"
  ];

  // Random speech every few seconds
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const speechInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        const voice = JOEY_VOICES[Math.floor(Math.random() * JOEY_VOICES.length)];
        setJoeySpeech(voice);
        setTimeout(() => setJoeySpeech(null), 2500);
      } else if (Math.random() < 0.2 && enemies.length > 0) {
        const voice = ENEMY_VOICES[Math.floor(Math.random() * ENEMY_VOICES.length)];
        setEnemySpeech(voice);
        setTimeout(() => setEnemySpeech(null), 2500);
      }
    }, 3000);

    return () => clearInterval(speechInterval);
  }, [gameState, enemies.length]);

  useEffect(() => {
    if (health <= 0 && gameState === 'playing') {
      setGameState('gameover');
    }
  }, [health, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keysRef.current[e.key] = true;
      // Attack with spacebar
      if (e.key === ' ' && gameState === 'playing') {
        setEnemies(prev => {
          let hit = false;
          const updated = prev.map(e => {
            const dx = playerPos.x - e.x;
            const dy = playerPos.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 80) {
              hit = true;
              return { ...e, hp: (e.hp || 30) - 30 };
            }
            return e;
          });
          if (hit) {
            setScore(s => s + 100);
            const voice = JOEY_VOICES[Math.floor(Math.random() * JOEY_VOICES.length)];
            setJoeySpeech("BOOM! C1 WANNABE DOWN! 🔥");
            setTimeout(() => setJoeySpeech(null), 1500);
          }
          return updated.filter(e => (e.hp || 0) > 0);
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, playerPos]);

  const startGame = () => {
    console.log("Starting game...");
    setGameState('playing');
    setPlayerPos({ x: 400, y: 300 });
    setEnemies([]);
    setScore(0);
    setHealth(100);
    setShowFullMoon(true);
    setTimeout(() => setShowFullMoon(false), 5000);
    setJoeySpeech("We sell treats, just not ours! 😂");
    setTimeout(() => setJoeySpeech(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-red-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 p-4 border-b-4 border-yellow-500">
        <h1 className="text-4xl font-black text-center text-yellow-400 tracking-wider">
          🎮 {JOEY_GAME.title} 🎮
        </h1>
        <p className="text-center text-yellow-200">18th Birthday / Graduation Tribute</p>
      </div>

      {gameState === 'menu' && (
        <div className="p-8">
          {/* Main Menu */}
          {currentScreen === 'main' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MenuButton label="🎮 PLAY" onClick={startGame} color="bg-green-600" />
                <MenuButton label="👥 Characters" onClick={() => setCurrentScreen('characters')} color="bg-blue-600" />
                <MenuButton label="🚗 Vehicles" onClick={() => setCurrentScreen('vehicles')} color="bg-purple-600" />
                <MenuButton label="🔫 Weapons" onClick={() => setCurrentScreen('weapons')} color="bg-red-600" />
                <MenuButton label="🗺️ Maps" onClick={() => setCurrentScreen('maps')} color="bg-orange-600" />
                <MenuButton label="🙏 Tribute" onClick={() => setCurrentScreen('tribute')} color="bg-pink-600" />
                <MenuButton label="🎵 Music" onClick={() => setCurrentScreen('main')} color="bg-yellow-600" />
              </div>

              {/* Player Card */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 rounded-lg text-black">
                <h2 className="text-2xl font-bold">{JOEY_GAME.player.name}</h2>
                <p>{JOEY_GAME.player.description}</p>
                <div className="mt-2 text-lg font-bold">GOLDEN CHAINS: 🔱 + ⚔️</div>
              </div>
            </div>
          )}

          {/* Characters Screen */}
          {currentScreen === 'characters' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setCurrentScreen('main')} className="mb-4 text-yellow-400">← Back</button>
              <h2 className="text-3xl font-bold mb-6">👥 CREW</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {JOEY_GAME.characters.map((char, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg border-2" style={{ borderColor: char.color }}>
                    <h3 className="text-xl font-bold">{char.name}</h3>
                    <p className="text-gray-300">Role: {char.role}</p>
                    <p className="text-sm text-gray-400">Ride: {char.ride}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles Screen */}
          {currentScreen === 'vehicles' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setCurrentScreen('main')} className="mb-4 text-yellow-400">← Back</button>
              <h2 className="text-3xl font-bold mb-6">🚗 RIDES</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {JOEY_GAME.vehicles.map((v, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg border-2 border-purple-500">
                    <h3 className="text-lg font-bold">{v}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weapons Screen */}
          {currentScreen === 'weapons' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setCurrentScreen('main')} className="mb-4 text-yellow-400">← Back</button>
              <h2 className="text-3xl font-bold mb-6">🔫 ARMORY</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {JOEY_GAME.weapons.map((w, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg border-2 border-red-500">
                    <h3 className="text-lg font-bold">{w}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maps Screen */}
          {currentScreen === 'maps' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setCurrentScreen('main')} className="mb-4 text-yellow-400">← Back</button>
              <h2 className="text-3xl font-bold mb-6">🗺️ SAN BERNARDINO</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {JOEY_GAME.maps.map((m, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg border-2 border-orange-500">
                    <h3 className="text-lg font-bold">{m}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tribute Screen */}
          {currentScreen === 'tribute' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setCurrentScreen('main')} className="mb-4 text-yellow-400">← Back</button>
              <h2 className="text-3xl font-bold mb-6 text-center">🙏 FLY HIGH 🌟</h2>
              {JOEY_GAME.tributes.map((t, i) => (
                <div key={i} className="bg-gradient-to-r from-pink-900 to-purple-900 p-6 rounded-lg mb-4 text-center">
                  <h3 className="text-2xl font-bold">{t.name}</h3>
                  <p className="text-pink-200">{t.relation}</p>
                  <p className="text-3xl mt-2">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playing Game */}
      {gameState === 'playing' && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-yellow-400 font-bold">SCORE: {score}</div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">HP:</span>
              <div className="w-32 h-4 bg-gray-700 rounded">
                <div className="h-full bg-red-500 transition-all" style={{ width: `${health}%` }} />
              </div>
            </div>
          </div>
          
          <div className="relative bg-gradient-to-b from-purple-900 via-red-900 to-black rounded-lg overflow-hidden" style={{ width: 800, height: 600, margin: '0 auto' }}>
            {/* Downtown SB - Motel District Background */}
            <div className="absolute inset-0 opacity-40">
              {/* Motels */}
              <div className="absolute top-8 left-8 text-6xl">🏨</div>
              <div className="absolute top-8 right-16 text-6xl">🏨</div>
              <div className="absolute top-8 left-1/3 text-6xl">🏢</div>
              <div className="absolute bottom-32 right-8 text-6xl">🏪</div>
              {/* Neon signs */}
              <div className="absolute top-20 left-1/4 text-4xl animate-pulse">💜</div>
              <div className="absolute top-32 right-1/4 text-4xl animate-pulse">💚</div>
              {/* Street lights */}
              <div className="absolute top-1/2 left-10 text-3xl">💡</div>
              <div className="absolute top-1/2 right-10 text-3xl">💡</div>
              <div className="absolute bottom-40 left-1/3 text-3xl">💡</div>
              {/* Palm trees */}
              <div className="absolute top-1/3 left-8 text-4xl">🌴</div>
              <div className="absolute top-1/4 right-8 text-4xl">🌴</div>
              <div className="absolute bottom-20 right-1/4 text-4xl">🌴</div>
              {/* Cars */}
              <div className="absolute bottom-8 left-20 text-3xl">🚗</div>
              <div className="absolute bottom-8 right-32 text-3xl">🚙</div>
              {/* Street walker silhouettes */}
              <div className="absolute bottom-32 left-1/4 text-2xl opacity-60">💃</div>
              <div className="absolute bottom-48 right-1/3 text-2xl opacity-60">💃</div>
            </div>

            {/* Full Moon */}
            {showFullMoon && (
              <div className="absolute top-4 right-4 w-24 h-24 bg-yellow-100 rounded-full shadow-lg animate-pulse" />
            )}

            {/* Enemies */}
            {enemies.map((e, i) => (
              <div
                key={i}
                className="absolute flex items-center justify-center text-2xl"
                style={{ left: e.x, top: e.y, width: e.width, height: e.height }}
              >
                🧟
              </div>
            ))}

            {/* Player */}
            <div
              className="absolute flex flex-col items-center justify-center text-3xl transition-all"
              style={{ left: playerPos.x, top: playerPos.y, width: 40, height: 60 }}
            >
              {/* Speech Bubble for Joey */}
              {joeySpeech && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap animate-bounce z-50">
                  🎤 {joeySpeech}
                </div>
              )}
              <span>🎓</span>
            </div>

            {/* Enemy Speech */}
            {enemySpeech && enemies.length > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold animate-pulse z-40">
                🧟 {enemySpeech}
              </div>
            )}

            {/* Controls hint */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-400">
              WASD/Arrows: Move | SPACE: Attack | Survive C1 WANNABE 1!
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="text-center p-8">
          <h2 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h2>
          <p className="text-2xl mb-6">Final Score: {score}</p>
          <div className="flex justify-center gap-4">
            <button onClick={startGame} className="bg-green-600 px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-500">
              PLAY AGAIN
            </button>
            <button onClick={() => { setGameState('menu'); setCurrentScreen('main'); }} className="bg-yellow-600 px-8 py-4 rounded-lg text-xl font-bold">
              MAIN MENU
            </button>
          </div>
          <div className="mt-8 text-pink-400 text-2xl">🙏 FLY HIGH 🌟 BIG MONDO & LIL MONDO</div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-black/50 p-4 mt-8 text-center">
        <p className="text-yellow-400">SAN BERNARDINO • SOUTHERN CALIFORNIA • PURO PAISA</p>
        <p className="text-sm text-gray-400">Made for Joey's 18th Birthday 🎓🇺🇸</p>
      </div>
    </div>
  );
}

function MenuButton({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      className={`${color} hover:brightness-125 p-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 cursor-pointer select-none active:scale-95`}
    >
      {label}
    </button>
  );
}
