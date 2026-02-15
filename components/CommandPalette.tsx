
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CommandMapping, ThemeConfig, VaultEntry } from '../App';
import { CommandIcon, GlobeIcon, SparklesIcon, XIcon, PlusIcon, LockIcon } from './Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandMapping[];
  onExecute: (path: string, openInNewTab: boolean) => void;
  themeConfig: ThemeConfig;
  vault: VaultEntry[];
}

const SYSTEM_COMMANDS = [
  { code: 'CAP', path: 'vault:capture', description: 'Capture: Secure Form to Vault' },
  { code: 'FILL', path: 'magic-fill', description: 'Magic Fill: Inject QA Data' },
  { code: 'PRETTY', path: 'format-sql', description: 'Pretty: Prettify SQL Code' },
];

const EASTER_EGGS = [
  { code: 'NT', path: 'effect:new-halo-tab', description: 'Quick New Halo Tab' },
  { code: 'HALO', path: 'effect:halo', description: 'Screen Spin' },
  { code: 'PARTY', path: 'effect:party', description: 'Confetti Burst' },
  { code: 'LOPAN', path: 'effect:lopan', description: 'David Lo Pan' },
  { code: 'MAIL', path: 'effect:checkisinthemail', description: 'The Jack Burton Protocol' },
  { code: 'THUNDER', path: 'effect:thunder', description: 'Thunder' },
  { code: 'RAIN', path: 'effect:rain', description: 'Rain' },
  { code: 'LIGHTNING', path: 'effect:lightning', description: 'Lightning' },
  { code: 'SIXDEMONBAG', path: 'effect:sixdemonbag', description: 'Six Demon Bag' },
  { code: 'DUESPAID', path: 'effect:duespaid', description: 'Dirty Tank Top Filter' },
  { code: 'HALONAVIGATOR', path: 'effect:navigator-matrix', description: 'Halo Navigator: Matrix Protocol' },
  { code: 'GHOST', path: 'effect:ghost', description: 'Ghost Mode (Blue Glow)' },
  { code: 'PORKCHOP', path: 'effect:trucker', description: 'The Porkchop Express' },
  { code: 'CLEAN', path: 'effect:clean', description: 'Clear All Effects' },
  { code: 'RETRO', path: 'effect:retro', description: '8-Bit Experience' },
  { code: 'HALOITSM', path: 'effect:halo-bless', description: 'Angelic Environment Blessing' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, commands, onExecute, themeConfig, vault
}) => {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isDarkMode = themeConfig.mode === 'dark';
  const accent = themeConfig.primaryColor;

  const paletteBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
  const itemSelectedBg = `${accent}30`;
  const footerBg = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDarkMode ? '#ffffff' : '#0f172a';
  const pathColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)';
  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.15)';

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const search = input.toLowerCase().trim();

    if (/^nt\s+/i.test(input)) {
        const subSearch = input.substring(3).toLowerCase().trim();
        const matches = commands.filter(c => 
            c.code.toLowerCase().includes(subSearch) || 
            c.path.toLowerCase().includes(subSearch)
        );
        
        return matches.map(c => ({
            code: `NT ${c.code.toUpperCase()}`,
            path: `effect:new-halo-tab:${c.path}`,
            description: `New Tab ➔ ${c.path.startsWith('/') ? c.path.substring(1) : c.path}`,
            type: 'effect'
        })).slice(0, 10);
    }

    if (/^cap\s+/i.test(input)) {
        const subSearch = input.substring(4).toLowerCase().trim();
        const matches = vault.filter(v => 
            v.name.toLowerCase().includes(subSearch)
        );
        
        return matches.map(v => ({
            code: `INJECT`,
            path: `vault:apply:${v.id}`,
            description: `Inject Vault ➔ ${v.name}`,
            type: 'vault-item'
        })).slice(0, 10);
    }

    const allOptions = [
      ...SYSTEM_COMMANDS.map(c => ({ ...c, type: 'system' })),
      ...commands.map(c => ({ ...c, type: 'command' })),
      ...EASTER_EGGS.map(e => ({ ...e, type: 'effect', description: e.description }))
    ];

    if (!search) return allOptions.slice(0, 10);

    return allOptions
      .map(item => {
        let score = 0;
        const code = item.code.toLowerCase();
        const path = (item.path || '').toLowerCase();

        if (code === search) score += 1000;
        else if (code.startsWith(search)) score += 500;
        else if (code.includes(search)) score += 100;
        
        if (path.startsWith(search) || path.startsWith('/' + search)) score += 50;
        else if (path.includes(search)) score += 20;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));
  }, [input, commands, vault]);

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
      const search = input.toLowerCase().trim();
      
      if (search === 'fill') {
        onExecute('magic-fill', false);
        onClose();
        return;
      } 
      
      if (search === 'cap') {
        onExecute('vault:capture', false);
        onClose();
        return;
      }

      if (search === 'pretty') {
        onExecute('format-sql', false);
        onClose();
        return;
      }

      const target = filteredCommands[selectedIndex];
      if (target) {
        onExecute(target.path, false);
        onClose();
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
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

        {/* Shortcut Guide Bar */}
        <div className="px-10 py-3 bg-black/5 border-b flex gap-4 overflow-x-auto no-scrollbar" style={{ borderColor: borderColor }}>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white">NT</kbd>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">New Tab</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white">NT </kbd>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Specific Module</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white">CAP</kbd>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Capture</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white">CAP </kbd>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Inject</span>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto no-scrollbar p-4 space-y-2">
          {filteredCommands.map((cmd, idx) => {
            const isSelected = selectedIndex === idx;
            const isEffect = (cmd.path || '').startsWith('effect:');
            const isVault = (cmd.path || '').startsWith('vault:');
            const isVaultApply = (cmd.path || '').startsWith('vault:apply:');
            const isFill = cmd.path === 'magic-fill';
            const isPretty = cmd.path === 'format-sql';
            const isNewTab = cmd.code.startsWith('NT');
            
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
                  {isVault || isVaultApply ? '🔒' : (isFill || isPretty) ? '✨' : isEffect ? (isNewTab ? '➕' : '✨') : `#${cmd.code.toUpperCase()}`}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-black uppercase tracking-wide flex items-center gap-2" style={{ color: textColor }}>
                     <span className="truncate">{(cmd as any).description || (cmd.path.startsWith('/') ? `Module: ${cmd.path.substring(1)}` : 'External Jump')}</span>
                     {!isEffect && !isVault && !isVaultApply && !isFill && !isPretty && cmd.path.includes('://') && <GlobeIcon className="w-3.5 h-3.5 opacity-60" />}
                  </div>
                  <div className="text-[11px] truncate font-mono mt-1 tracking-tight" style={{ color: pathColor }}>{cmd.path}</div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-3 animate-in slide-in-from-right-3 duration-300">
                     <kbd className="px-3 py-1 rounded-lg bg-black/60 text-[9px] font-black border border-white/20 text-white">ENTER</kbd>
                     {!isNewTab && !isVault && !isVaultApply && !isFill && !isPretty && (
                       <>
                         <span className="text-[10px] opacity-40 font-black" style={{ color: textColor }}>/</span>
                         <kbd className="px-3 py-1 rounded-lg bg-black/60 text-[9px] font-black border border-white/20 text-white">TAB</kbd>
                       </>
                     )}
                  </div>
                )}
              </div>
            );
          })}
          {filteredCommands.length === 0 && (
             <div className="py-12 text-center opacity-30 text-[12px] font-black uppercase tracking-widest">
                Protocol Not Found
             </div>
          )}
        </div>
        
        <div className="px-10 py-6 border-t font-black uppercase tracking-[0.15em] text-[10px]" style={{ backgroundColor: footerBg, borderColor: borderColor, color: textColor }}>
           <div className="flex justify-between mb-1.5">
              <span>ENTER ↵ OPEN / INJECT</span>
              <span>↗ NEW TAB (TAB)</span>
           </div>
           <div className="flex justify-between opacity-50">
              <span>CAP + SPACE + SEARCH</span>
              <span>NT + SPACE + SEARCH</span>
           </div>
        </div>
      </div>
    </div>
  );
};
