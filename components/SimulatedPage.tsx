
import React, { useState, useEffect, useRef } from 'react';
import { NavigatorRule, CommandMapping } from '../App';
import { GlobeIcon, ShieldCheckIcon, LockIcon, CommandIcon } from './Icons';

interface SimulatedPageProps {
  url: string;
  matchedRule: NavigatorRule | null;
  isDarkMode: boolean;
  commands?: CommandMapping[];
  onNavigate?: (url: string) => void;
  onOpenNewTab?: (url: string) => void;
}

export const SimulatedPage: React.FC<SimulatedPageProps> = ({ 
  url, matchedRule, isDarkMode, commands = [], onNavigate, onOpenNewTab 
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const [paletteInput, setPaletteInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger palette on '#' key (Shift + 3) if not already typing in a field
      if (e.key === '#' && !showPalette && matchedRule) {
        e.preventDefault();
        setShowPalette(true);
        setPaletteInput('');
      } else if (e.key === 'Escape' && showPalette) {
        setShowPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPalette, matchedRule]);

  useEffect(() => {
    if (showPalette && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showPalette]);

  const getTargetUrl = (input: string): string | null => {
    const cleanInput = input.trim().toLowerCase();
    const cmd = commands.find(c => c.code === cleanInput);
    
    if (cmd) {
      // 1. Support Absolute URLs (e.g. jump to prod)
      if (cmd.path.toLowerCase().startsWith('http://') || cmd.path.toLowerCase().startsWith('https://')) {
        return cmd.path;
      }

      // 2. Support Relative Module Redirects
      if (matchedRule) {
        const lowerUrl = url.toLowerCase();
        const lowerPattern = matchedRule.pattern.toLowerCase();
        const patternIndex = lowerUrl.indexOf(lowerPattern);
        
        let envBase = url.split('/')[0];
        if (patternIndex !== -1) {
          envBase = url.substring(0, patternIndex + matchedRule.pattern.length);
        }
        
        const cleanPath = cmd.path.startsWith('/') ? cmd.path : `/${cmd.path}`;
        const cleanBase = envBase.endsWith('/') ? envBase.slice(0, -1) : envBase;
        return `${cleanBase}${cleanPath}`;
      }
    }
    return null;
  };

  const handlePaletteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = getTargetUrl(paletteInput);
    if (target && onNavigate) {
      onNavigate(target);
    }
    setShowPalette(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const target = getTargetUrl(paletteInput);
      if (target) {
        e.preventDefault();
        if (onOpenNewTab) onOpenNewTab(target);
        setShowPalette(false);
      }
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    if (!matchedRule) return {};
    const strength = matchedRule.strength ?? 5;
    
    // Intensity of 0 effectively hides the effect
    if (strength === 0) return {};

    switch (matchedRule.styleType) {
      case 'full':
        const opacity = Math.min(Math.max(strength * 7, 10), 70);
        return { 
          backgroundColor: `${matchedRule.color}${opacity.toString(16).padStart(2, '0')}`, 
          boxShadow: `inset 0 0 ${strength * 40}px ${matchedRule.color}22`,
          borderColor: `${matchedRule.color}66`,
          borderWidth: '1px'
        };
      case 'glow':
        return { 
          boxShadow: `inset 0 0 ${strength * 20}px ${matchedRule.color}88, inset 0 0 ${strength * 8}px ${matchedRule.color}aa, 0 0 ${strength * 6}px ${matchedRule.color}33`,
          borderColor: matchedRule.color,
          borderWidth: strength > 7 ? '3px' : '2px'
        };
      case 'border':
        const borderWidth = Math.max(4, strength * 4);
        return { border: `${borderWidth}px solid ${matchedRule.color}`, borderTop: '0' };
      case 'top-bar':
        const barHeight = Math.max(4, strength * 3);
        return { borderTop: `${barHeight}px solid ${matchedRule.color}` };
      default:
        return {}; 
    }
  };

  const getLabelPositionStyle = (): React.CSSProperties => {
    if (!matchedRule) return {};
    const pos = matchedRule.labelPosition || 'right';
    switch (pos) {
      case 'left': return { left: '40px', right: 'auto' };
      case 'center': return { left: '50%', right: 'auto', transform: 'translateX(-50%)' };
      default: return { right: '40px', left: 'auto' };
    }
  };

  return (
    <div 
      className={`flex-1 p-8 md:p-12 transition-all duration-700 flex flex-col relative overflow-hidden ${
        isDarkMode ? (matchedRule?.styleType === 'full' && (matchedRule.strength ?? 5) > 0 ? '' : 'bg-[#0f172a]') : (matchedRule?.styleType === 'full' && (matchedRule.strength ?? 5) > 0 ? '' : 'bg-white')
      }`}
      style={getContainerStyle()}
    >
      {/* Palette Overlay */}
      {showPalette && (
        <div className="absolute inset-0 z-[100] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <form 
            onSubmit={handlePaletteSubmit}
            className="w-full max-w-lg bg-[#264653] border-2 border-[#00ff87]/30 shadow-2xl rounded-2xl p-1 animate-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl font-black text-[#00ff87] opacity-60">#</span>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Jump to environment or module..."
                value={paletteInput}
                onChange={(e) => setPaletteInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white text-lg font-bold placeholder:text-white/20"
              />
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest flex flex-col items-center">
                  <span>ENTER</span>
                  <span className="text-[7px] opacity-40">GO</span>
                </div>
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest flex flex-col items-center">
                  <span>TAB</span>
                  <span className="text-[7px] opacity-40">NEW TAB</span>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 p-3 flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {commands.map(c => {
                const isAbsolute = c.path.includes('://');
                return (
                  <div key={c.code} className={`px-2 py-1 rounded border text-[9px] font-black uppercase flex items-center gap-1.5 ${
                    isAbsolute ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-black/20 border-white/5 text-[#00ff87]'
                  }`}>
                    #{c.code} 
                    <span className={`font-normal lowercase max-w-[120px] truncate ${isAbsolute ? 'text-indigo-300/40' : 'text-white/20'}`}>
                      {c.path}
                    </span>
                    {isAbsolute && <GlobeIcon className="w-2.5 h-2.5 opacity-40" />}
                  </div>
                );
              })}
            </div>
          </form>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
            Press ESC to cancel
          </div>
        </div>
      )}

      {matchedRule && (matchedRule.strength ?? 5) > 0 && (
        <div className="absolute top-0 left-0 right-0 h-2 z-30 transition-all duration-500 shadow-lg" style={{ backgroundColor: matchedRule.color }} />
      )}

      <div className={`absolute top-0 right-0 p-8 transition-opacity duration-500 pointer-events-none ${isDarkMode ? 'opacity-[0.05] text-[#00ff87]' : 'opacity-[0.03] text-[#264653]'}`}>
        <GlobeIcon className="w-96 h-96" />
      </div>

      <div className="z-10 w-full">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl bg-[#264653]">
                 <img src="images/HN48.png" className="w-8 h-8" alt="H" />
              </div>
              <div>
                <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>HaloITSM</h2>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Portal Simulation</p>
              </div>
           </div>
           
           {matchedRule && !matchedRule.hideLabel && (
             <div 
               className="absolute top-0 px-5 py-2 rounded-b-xl border-x border-b text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700 z-50"
               style={{ 
                 ...getLabelPositionStyle(),
                 borderColor: `${matchedRule.color}66`, 
                 backgroundColor: matchedRule.color,
                 color: '#fff'
               }}
             >
               <div className="relative flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
               </div>
               ENV: {matchedRule.label || matchedRule.pattern}
             </div>
           )}
        </div>

        <div className="max-w-4xl space-y-8">
          <div className={`border-2 rounded-[2.5rem] shadow-2xl p-10 space-y-8 ${isDarkMode ? 'bg-[#0f172a]/60 border-white/5' : 'bg-white border-slate-100'}`}>
             <div className="flex items-center justify-between border-b-2 pb-6 border-white/5">
                <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Dashboard View</h3>
                <div className="flex gap-2 items-center">
                  <span className="bg-[#00ff87]/10 text-[#00ff87] text-[9px] font-black px-2 py-1 rounded">HOTKEY: #</span>
                </div>
             </div>
             <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <LockIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                       <div className="h-4 rounded-full w-full bg-white/5"></div>
                       <div className="h-3 rounded-full w-3/4 opacity-40 bg-white/10"></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
