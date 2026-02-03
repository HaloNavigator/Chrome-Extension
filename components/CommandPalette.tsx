
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CommandMapping, ThemeConfig } from '../App';
import { CommandIcon, GlobeIcon, SparklesIcon, XIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandMapping[];
  onExecute: (path: string, openInNewTab: boolean) => void;
  themeConfig: ThemeConfig;
}

const EASTER_EGGS = [
  { code: 'PARTY', path: 'effect:party', description: 'Confetti Burst' },
  { code: 'GHOST', path: 'effect:ghost', description: 'Transparency Mode' },
  { code: 'FLIP', path: 'effect:flip', description: 'Barrel Roll' },
  { code: 'RETRO', path: 'effect:retro', description: '8-Bit Experience' },
  { code: 'HALOITSM', path: 'effect:halo-bless', description: 'Angelic Environment Blessing' },
  { code: 'HALONAVIGATOR', path: 'effect:navigator-matrix', description: 'Matrix Interface HUD' },
  { code: 'CLEAN', path: 'effect:clean', description: 'Clear All Effects' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, commands, onExecute, themeConfig 
}) => {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isDarkMode = themeConfig.mode === 'dark';
  const accent = themeConfig.primaryColor;

  // Refined Glass Morphism with higher contrast
  const paletteBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const itemSelectedBg = `${accent}30`;
  const footerBg = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDarkMode ? '#ffffff' : '#0f172a';
  const pathColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)';

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const search = input.toLowerCase().trim();
    const allOptions = [
      ...commands.map(c => ({ ...c, type: 'command' })),
      ...EASTER_EGGS.map(e => ({ ...e, type: 'effect', description: e.description }))
    ];

    if (!search) return allOptions.slice(0, 10);

    return allOptions
      .map(item => {
        let score = 0;
        const code = item.code.toLowerCase();
        const path = item.path.toLowerCase();

        if (code === search) score += 1000;
        else if (code.startsWith(search)) score += 500;
        else if (code.includes(search)) score += 100;
        
        if (path.startsWith(search) || path.startsWith('/' + search)) score += 50;
        else if (path.includes(search)) score += 20;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));
  }, [input, commands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        onExecute(target.path, true);
        onClose();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.toLowerCase() === 'fill') {
        onExecute('magic-fill', false);
        onClose();
      } else {
        const target = filteredCommands[selectedIndex];
        if (target) {
          onExecute(target.path, false);
          onClose();
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-xl rounded-[2.5rem] border overflow-hidden transition-all duration-300"
        style={{ 
          backgroundColor: paletteBg,
          borderColor: borderColor,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: `0 30px 100px rgba(0, 0, 0, 0.6), 0 0 60px -10px ${accent}66`
        }}
      >
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: accent }} />

        <div className="flex items-center px-10 py-8 border-b" style={{ borderColor: borderColor }}>
          <div className="mr-8">
             <span className="text-3xl font-black italic tracking-tighter" style={{ color: accent }}>#</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search Protocol..."
            className="flex-1 bg-transparent border-none outline-none text-2xl font-black tracking-tight placeholder:opacity-40"
            style={{ color: textColor }}
          />
          <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 transition-opacity">
            <XIcon className="w-6 h-6" style={{ color: textColor }} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto no-scrollbar p-4 space-y-2">
          {input.toLowerCase() === 'fill' && (
             <div 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onExecute('magic-fill', false); onClose(); }}
              className="mx-2 px-8 py-6 rounded-3xl flex items-center gap-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
             >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                   <div className="text-[12px] font-black uppercase tracking-widest">Protocol: Magic Fill</div>
                   <div className="text-[11px] opacity-90 font-medium">Inject automated telemetry data</div>
                </div>
                <kbd className="px-4 py-1.5 rounded-xl bg-black/50 text-[10px] font-black border border-white/20 text-white">ENTER</kbd>
             </div>
          )}

          {filteredCommands.map((cmd, idx) => {
            const isSelected = selectedIndex === idx;
            const isEffect = cmd.path.startsWith('effect:');
            
            return (
              <div
                key={`${cmd.code}-${idx}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onExecute(cmd.path, e.metaKey || e.ctrlKey); onClose(); }}
                className="group px-8 py-5 rounded-[1.8rem] flex items-center gap-6 cursor-pointer transition-all duration-150 border active:scale-[0.985]"
                style={{ 
                   backgroundColor: isSelected ? itemSelectedBg : 'transparent',
                   borderColor: isSelected ? `${accent}77` : 'transparent',
                }}
              >
                <div 
                  className={`min-w-[64px] flex items-center justify-center font-black text-sm tracking-[0.1em] transition-all duration-200 ${isSelected ? 'scale-110' : 'opacity-80'}`}
                  style={{ color: isSelected ? accent : textColor }}
                >
                  {isEffect ? '✨' : `#${cmd.code.toUpperCase()}`}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-black uppercase tracking-wide flex items-center gap-2" style={{ color: textColor }}>
                     <span className="truncate">{isEffect ? (cmd as any).description : (cmd.path.startsWith('/') ? `Module: ${cmd.path.substring(1)}` : 'External Jump')}</span>
                     {!isEffect && cmd.path.includes('://') && <GlobeIcon className="w-3.5 h-3.5 opacity-60" />}
                  </div>
                  <div className="text-[11px] truncate font-mono mt-1 tracking-tight" style={{ color: pathColor }}>{cmd.path}</div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-3 animate-in slide-in-from-right-3 duration-300">
                     <kbd className="px-3 py-1 rounded-lg bg-black/60 text-[9px] font-black border border-white/20 text-white">ENTER</kbd>
                     <span className="text-[10px] opacity-40 font-black" style={{ color: textColor }}>/</span>
                     <kbd className="px-3 py-1 rounded-lg bg-black/60 text-[9px] font-black border border-white/20 text-white">TAB</kbd>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="px-10 py-6 border-t font-black uppercase tracking-[0.15em] text-[10px]" style={{ backgroundColor: footerBg, borderColor: borderColor, color: textColor }}>
           <div className="flex justify-between mb-1.5">
              <span>ENTER ↵ OPEN</span>
              <span>↗ NEW TAB</span>
           </div>
           <div className="flex justify-between opacity-50">
              <span>CLICK OPEN</span>
              <span>CTRL/⌘+CLICK NEW TAB</span>
           </div>
        </div>
      </div>
    </div>
  );
};
