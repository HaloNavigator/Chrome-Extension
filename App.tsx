
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ExtensionPopup } from './components/ExtensionPopup';
import { SimulatedPage } from './components/SimulatedPage';
import { BrowserHeader } from './components/BrowserHeader';
import { OptionsDashboard } from './components/OptionsDashboard';
import { SqlGeneratorView } from './components/SqlGeneratorView';
import { CommandPalette } from './components/CommandPalette';
import { CodeBracketIcon, CommandIcon, ShieldCheckIcon } from './components/Icons';

export type TabStyleType = 'full' | 'border' | 'top-bar' | 'glow';
export type LabelPosition = 'left' | 'center' | 'right';

export interface NavigatorRule {
  id: string;
  pattern: string;
  color: string;
  label: string;
  styleType: TabStyleType;
  hideLabel: boolean;
  labelPosition: LabelPosition;
  strength: number;
}

export interface CommandMapping {
  code: string;
  path: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light';
  primaryColor: string;
  preset: string;
  fieldIdReveal?: boolean;
  mandatoryGhosting?: boolean;
}

export interface VaultEntry {
  id: string;
  name: string;
  timestamp: string;
  data: Record<string, string>;
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  type?: 'page' | 'settings' | 'sql';
}

const STORAGE_KEY = 'halo_navigator_rules';
const COMMANDS_KEY = 'halo_navigator_commands';
const THEME_CONFIG_KEY = 'halo_navigator_theme_config';
const VAULT_KEY = 'halo_navigator_vault';

const DEFAULT_COMMANDS: CommandMapping[] = [
  { code: 'as', path: '/assets' },
  { code: 'con', path: '/config' },
  { code: 'dev', path: 'https://dev.haloitsm.com' },
  { code: 'home', path: '/home' },
  { code: 'prod', path: 'https://tenant.haloitsm.com' },
  { code: 'tic', path: '/tickets' },
  { code: 'uat', path: 'https://uat.haloitsm.com' }
].sort((a, b) => a.code.localeCompare(b.code));

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 't1', url: 'tenant.haloitsm.com/production', title: 'HaloITSM Production', type: 'page' },
    { id: 't2', url: 'google.com', title: 'Google Search', type: 'page' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('t1');
  
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'dark',
    primaryColor: '#00ff87',
    preset: 'halo',
    fieldIdReveal: false,
    mandatoryGhosting: false 
  });
  
  const [rules, setRules] = useState<NavigatorRule[]>([
    { id: '1', pattern: 'tenant.haloitsm.com', color: '#ef4444', label: 'Prod', styleType: 'full', hideLabel: false, labelPosition: 'right', strength: 5 },
    { id: '2', pattern: 'dev.haloitsm.com', color: '#22c55e', label: 'Dev', styleType: 'border', hideLabel: false, labelPosition: 'left', strength: 8 },
    { id: '3', pattern: 'uat.haloitsm.com', color: '#f59e0b', label: 'UAT', styleType: 'top-bar', hideLabel: false, labelPosition: 'center', strength: 4 },
  ]);

  const [commands, setCommands] = useState<CommandMapping[]>(DEFAULT_COMMANDS);
  const [vault, setVault] = useState<VaultEntry[]>([]);
  
  const sortedCommands = useMemo(() => 
    [...commands].sort((a, b) => a.code.localeCompare(b.code)), 
  [commands]);

  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [idleBeams, setIdleBeams] = useState(false);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);

  // Lifted Form Data State for Magic Fill
  const [formData, setFormData] = useState<Record<string, string>>({
    'itil_ticket_type': 'Change Request',
    'ticket_type': 'Change Request',
    'change_type': '', 
    'risk': '',
    'impact': '',
    'uat_summary': '', 
    'details': '',
    'change_plan': '',
    'test_plan': '',
    'backout_plan': ''
  });

  useEffect(() => {
    const savedRules = localStorage.getItem(STORAGE_KEY);
    if (savedRules) setRules(JSON.parse(savedRules));
    const savedCommands = localStorage.getItem(COMMANDS_KEY);
    if (savedCommands) setCommands(JSON.parse(savedCommands));
    const savedTheme = localStorage.getItem(THEME_CONFIG_KEY);
    if (savedTheme) setThemeConfig(JSON.parse(savedTheme));
    const savedVault = localStorage.getItem(VAULT_KEY);
    if (savedVault) setVault(JSON.parse(savedVault));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '#' || (e.key === '3' && e.shiftKey)) {
        const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
        if (!isInput) {
           e.preventDefault();
           setIsPaletteOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rain Effect Logic (Matrix-like Rain drops)
  useEffect(() => {
    if (activeEffect !== 'rain' || !rainCanvasRef.current) return;
    
    const canvas = rainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const dropsCount = 120;
    const rain: any[] = [];
    for(let i=0; i<dropsCount; i++) {
        rain.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 15 + 10,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    let animationId: number;
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Use theme accent color for rain
        ctx.strokeStyle = themeConfig.primaryColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        rain.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.speed * 0.1), p.y + p.length);
            ctx.stroke();
            
            p.y += p.speed;
            p.x += p.speed * 0.1; // slight slant
            
            if(p.y > canvas.height) {
                p.y = -p.length;
                p.x = Math.random() * canvas.width;
            }
        });
        ctx.globalAlpha = 1.0;
        animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeEffect, themeConfig.primaryColor]);

  // Clean up Beams if effect ends
  useEffect(() => {
    if (activeEffect !== 'lopan') {
        setIdleBeams(false);
    }
  }, [activeEffect]);

  // Matrix Effect Logic
  useEffect(() => {
    if (activeEffect !== 'navigator-matrix' || !matrixCanvasRef.current) return;
    
    const canvas = matrixCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = ['INC-', 'CHG-', 'SQL', 'SELECT', 'WHERE', 'RTID', 'CF_', 'ID:', '0', '1'];
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    let animationId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Use theme accent color for matrix
      ctx.fillStyle = themeConfig.primaryColor;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [activeEffect, themeConfig.primaryColor]);

  const showBanner = (text: string) => {
    setBannerText(text);
    setTimeout(() => setBannerText(null), 3500);
  };

  const playAngelicChord = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const frequencies = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5 (Fmaj7)
    
    frequencies.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 5);
    });
  };

  const saveSettings = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    localStorage.setItem(COMMANDS_KEY, JSON.stringify(commands));
    localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(themeConfig));
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
    
    const notification = document.createElement('div');
    notification.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-bounce";
    notification.innerText = "Applied & Saved!";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, [rules, commands, themeConfig, vault]);

  const exportData = useCallback(() => {
    const data = { rules, commands, themeConfig, vault, exportedAt: new Date().toISOString(), version: "1.1" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halo-navigator-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rules, commands, themeConfig, vault]);

  const importData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.rules) setRules(data.rules);
        if (data.commands) setCommands(data.commands);
        if (data.themeConfig) setThemeConfig(data.themeConfig);
        if (data.vault) setVault(data.vault);
        
        const n = document.createElement('div');
        n.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-bounce";
        n.innerText = "Data Restored Successfully!";
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
      } catch (err) { alert("Failed to import data: Invalid JSON format."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const isDarkMode = themeConfig.mode === 'dark';

  const matchedRule = useMemo(() => {
    if (activeTab.type === 'settings' || activeTab.type === 'sql' || activeTab.url === 'newtab') return null;
    return rules.find(rule => activeTab.url.toLowerCase().includes(rule.pattern.toLowerCase())) || null;
  }, [activeTab.url, activeTab.type, rules]);

  const addRule = (rule: NavigatorRule) => setRules([...rules, rule]);
  const removeRule = (id: string) => setRules(rules.filter(r => r.id !== id));
  const updateRule = (updatedRule: NavigatorRule) => {
    setRules(rules.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const updateCommands = (newCommands: CommandMapping[]) => setCommands(newCommands);
  const updateActiveTabUrl = (newUrl: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: newUrl } : t));
  };

  const addTab = useCallback((url: string = 'newtab', title: string = 'New Tab', type: 'page' | 'settings' | 'sql' = 'page') => {
    const newId = Math.random().toString(36).substr(2, 5);
    setTabs(prev => [...prev, { id: newId, url: url, title: title, type: type }]);
    setActiveTabId(newId);
    return newId;
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev;
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
      return newTabs;
    });
  }, [activeTabId]);

  const handleMagicFill = () => {
    setFormData({
      'itil_ticket_type': 'Change Request',
      'ticket_type': 'Change Request',
      'change_type': 'Standard Maintenance', 
      'risk': 'Low (Calculated)',
      'impact': 'Minor / Departmental',
      'uat_summary': 'Magic Fill: All regression tests passed in sandbox environment. Verified by automated suite.',
      'details': '1. Quiesce connections.\n2. Apply patches.\n3. Restart services.\n4. Close change.',
      'change_plan': '1. Stop application pool.\n2. Apply configuration delta.\n3. Restart application pool.\n4. Verification health check.',
      'test_plan': '1. Check endpoint health.\n2. Run automated test suite.\n3. User acceptance sign-off.',
      'backout_plan': '1. Revert to snapshot SN-2025-01-A.\n2. Verified by backout state.\n3. Notify stakeholders.'
    });
    showBanner("Smart Fill Executed");
  };

  const handleFormatSql = () => {
    // Simulator doesn't have a real monaco instance, just show banner
    showBanner("SQL Prettified");
  };

  const handleSaveToVault = (name: string) => {
    const snapshotName = name || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const entry: VaultEntry = {
      id: Date.now().toString(),
      name: snapshotName,
      timestamp: new Date().toLocaleString(),
      data: { ...formData }
    };
    const newVault = [entry, ...vault];
    setVault(newVault);
    localStorage.setItem(VAULT_KEY, JSON.stringify(newVault));
    showBanner(`Vault Secured: ${snapshotName}`);
  };

  const handleUpdateVaultName = (id: string, newName: string) => {
    const newVault = vault.map(v => v.id === id ? { ...v, name: newName } : v);
    setVault(newVault);
    localStorage.setItem(VAULT_KEY, JSON.stringify(newVault));
  };

  const handleApplyVault = (entry: VaultEntry) => {
    setFormData(entry.data);
    showBanner(`Injected: ${entry.name}`);
  };

  const handleDeleteVault = (id: string) => {
    const newVault = vault.filter(v => v.id !== id);
    setVault(newVault);
    localStorage.setItem(VAULT_KEY, JSON.stringify(newVault));
  };

  const handlePaletteExecute = (path: string, openInNewTab: boolean) => {
    if (path === 'magic-fill') { handleMagicFill(); return; }
    if (path === 'format-sql') { handleFormatSql(); return; }
    if (path === 'vault:capture') { handleSaveToVault(''); return; }
    if (path.startsWith('vault:apply:')) {
      const entryId = path.replace('vault:apply:', '');
      const entry = vault.find(v => v.id === entryId);
      if (entry) handleApplyVault(entry);
      return;
    }

    if (path.startsWith('effect:')) {
      const effectName = path.replace('effect:', '');
      if (effectName === 'clean') { setActiveEffect(null); return; }
      
      const isLopan = effectName === 'lopan';
      const isThunder = effectName === 'thunder';
      const isLightning = effectName === 'lightning';
      const isSixDemon = effectName === 'sixdemonbag';
      const isJackBurton = effectName === 'checkisinthemail';
      const isDuesPaid = effectName === 'duespaid';

      setActiveEffect(effectName === 'halo' ? 'flip' : effectName);
      
      if (isJackBurton) { 
        showBanner("Yessir, the check is in the mail."); 
      }

      if (isDuesPaid) {
        showBanner("It's all in the reflexes");
      }

      if (isSixDemon) {
          setTimeout(() => {
              const n = document.createElement('div');
              n.id = "halo-sixdemon-toast";
              n.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl z-[1000000] border-4 border-indigo-300 animate-bounce";
              n.innerHTML = "<div class='text-center'><div class='text-4xl mb-2'>🏺</div><div class='text-lg uppercase tracking-widest'>Six Demon Bag</div><div class='text-xs opacity-80 mt-1'>Wind, Fire, all that kind of thing!</div></div>";
              document.body.appendChild(n);
              setTimeout(() => n.remove(), 10000); 
          }, 100);
      }
      
      if (effectName === 'halo-bless') { playAngelicChord(); }
      
      if (isLopan) {
          setIdleBeams(true); 
      }

      if (isLightning) {
          // Lightning Storm sequence: exactly 3 seconds
          const sequence = [100, 300, 100, 500, 100, 200, 100, 400, 100, 600];
          let accumulated = 0;
          sequence.forEach((delay, idx) => {
              accumulated += delay;
              if (accumulated > 3000) return;
              setTimeout(() => {
                  const l = document.createElement('div');
                  l.className = "fixed inset-0 bg-white z-[1000000] pointer-events-none flash-anim";
                  document.body.appendChild(l);
                  setTimeout(() => l.remove(), 80);
              }, accumulated);
          });
      }

      // Cleanup duration logic
      const duration = (isThunder || isLightning) ? 3000 : 10000; 
      setTimeout(() => setActiveEffect(null), duration);
      return;
    }

    let finalUrl = path;
    if (!path.includes('://')) finalUrl = `tenant.haloitsm.com${path.startsWith('/') ? '' : '/'}${path}`;
    if (openInNewTab) addTab(finalUrl, 'Module Redirect');
    else updateActiveTabUrl(finalUrl);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`h-screen flex flex-col items-center p-4 md:p-6 lg:p-8 transition-all duration-500 font-sans ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} ${activeEffect === 'duespaid' ? 'dues-active' : ''} ${activeEffect === 'lopan' ? 'lopan-active' : ''} ${activeEffect === 'thunder' ? 'thunder-active' : ''} ${activeEffect === 'checkisinthemail' ? 'jack-burton-active' : ''}`}>
      <style>{`
        .dues-active { filter: contrast(0.9) sepia(0.2) brightness(0.9); font-family: 'Courier New', monospace !important; }
        .dues-active * { font-family: inherit !important; }
        .lopan-active { box-shadow: inset 0 0 150px ${themeConfig.primaryColor}; background: rgba(0, 255, 135, 0.08); transition: all 1s; }
        .thunder-active { animation: shake 0.3s infinite; }
        .jack-burton-active { filter: sepia(0.3) contrast(1.1) brightness(0.95); transition: filter 1s ease-in-out; }
        @keyframes shake { 
          0% { transform: translate(5px, 5px) rotate(0deg); } 
          10% { transform: translate(-5px, -8px) rotate(-1deg); } 
          20% { transform: translate(-10px, 0px) rotate(1deg); } 
          30% { transform: translate(10px, 8px) rotate(0deg); } 
          40% { transform: translate(5px, -5px) rotate(1deg); } 
          50% { transform: translate(-5px, 8px) rotate(-1deg); } 
          60% { transform: translate(-10px, 5px) rotate(0deg); } 
          70% { transform: translate(10px, 5px) rotate(-1deg); } 
          80% { transform: translate(-5px, -5px) rotate(1deg); } 
          90% { transform: translate(5px, 8px) rotate(0deg); } 
          100% { transform: translate(5px, -8px) rotate(-1deg); } 
        }
        .flash-anim { animation: lightningFlash 0.1s ease-out forwards; }
        @keyframes lightningFlash { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .lopan-beam { 
          position: fixed; top: 0; width: 80px; height: 100vh; 
          background: linear-gradient(to bottom, ${themeConfig.primaryColor}, transparent); 
          filter: blur(40px); opacity: 0.6; z-index: 100000; 
          animation: beamPulse 1.5s infinite ease-in-out; 
        }
        @keyframes beamPulse { 0%, 100% { opacity: 0.3; transform: scaleX(1); } 50% { opacity: 0.8; transform: scaleX(1.2); } }
        .porkchop-banner { 
          position: fixed; top: 0; left: 0; right: 0; background: #b91c1c; color: white; 
          font-family: 'Impact', sans-serif; text-transform: uppercase; padding: 12px; 
          text-align: center; font-size: 14px; letter-spacing: 0.3em; z-index: 2147483647; 
          border-bottom: 4px solid black; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
      `}</style>

      {activeEffect === 'checkisinthemail' && (
        <div className="porkchop-banner">
          Porkchop Express — Hauling Solutions
        </div>
      )}

      {activeEffect === 'rain' && (
        <canvas ref={rainCanvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />
      )}
      {activeEffect === 'navigator-matrix' && (
        <canvas ref={matrixCanvasRef} className="fixed inset-0 pointer-events-none z-[9999]" style={{ opacity: 0.4 }} />
      )}
      {idleBeams && (
          <>
            <div className="lopan-beam" style={{ left: '15%' }} />
            <div className="lopan-beam" style={{ right: '15%' }} />
          </>
      )}

      {bannerText && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100001] pointer-events-none banner-in">
          <div 
            className={`px-8 py-4 rounded-[2rem] border-2 shadow-2xl flex items-center gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#1e293b] border-opacity-50' : 'bg-white border-opacity-50'}`}
            style={{ borderColor: themeConfig.primaryColor, boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px ${themeConfig.primaryColor}33` }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse" style={{ backgroundColor: `${themeConfig.primaryColor}15`, color: themeConfig.primaryColor }}>
               <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bannerText}</span>
          </div>
        </div>
      )}

      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        commands={sortedCommands}
        onExecute={handlePaletteExecute}
        themeConfig={themeConfig}
        vault={vault}
      />

      <div className="mb-4 text-center max-w-2xl shrink-0">
        <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-3 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <img src="images/HN48.png" className="w-8 h-8 shadow-xl rounded-lg" alt="Logo" />
          <h1 style={{ color: !isDarkMode ? '#1e293b' : 'white' }}>Halo Navigator</h1>
        </div>
        <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Professional environment visualization for HaloITSM.
        </p>
      </div>

      <div className={`relative w-full max-w-[1800px] flex-1 flex flex-col lg:flex-row gap-6 min-h-0 ${activeEffect === 'flip' ? 'flip-active' : ''}`}>
        <div className={`flex-1 flex flex-col rounded-[2.5rem] shadow-2xl border transition-all duration-500 overflow-hidden min-h-0 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-slate-200'} ${activeEffect === 'ghost' ? 'ghost-active' : ''}`}>
          <BrowserHeader 
            tabs={tabs}
            activeTabId={activeTabId}
            onSetActiveTab={setActiveTabId}
            onAddTab={() => addTab()}
            onCloseTab={closeTab}
            onUrlChange={updateActiveTabUrl}
            onExtensionClick={() => setIsExtensionOpen(!isExtensionOpen)}
            isExtensionOpen={isExtensionOpen}
            rules={rules}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setThemeConfig(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }))}
            themeConfig={themeConfig}
          />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {activeTab.type === 'settings' ? (
              <OptionsDashboard 
                rules={rules}
                commands={sortedCommands}
                themeConfig={themeConfig}
                onUpdateRules={setRules}
                onUpdateCommands={setCommands}
                onUpdateTheme={setThemeConfig}
                onSave={saveSettings}
                onOpenSqlGen={() => addTab('halo-navigator://sql', 'SQL Query Generator', 'sql')}
                onMagicFill={handleMagicFill}
                onFormatSql={handleFormatSql}
                onExport={exportData}
                onImport={importData}
              />
            ) : activeTab.type === 'sql' ? (
              <SqlGeneratorView themeConfig={themeConfig} />
            ) : (
              <SimulatedPage 
                url={activeTab.url} 
                matchedRule={matchedRule} 
                themeConfig={themeConfig} 
                commands={sortedCommands}
                onNavigate={updateActiveTabUrl}
                onOpenNewTab={(url) => addTab(url, 'Module Redirect')}
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}
          </div>
          
          <div className={`border-t px-8 py-2 flex items-center gap-8 justify-center text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => setIsPaletteOpen(true)}>
              <span className="bg-[#1e293b] dark:bg-[#1a1f2e] px-1.5 py-0.5 rounded text-indigo-500 font-black">#</span>
              <span>Navigator Palette</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CommandIcon className="w-3.5 h-3.5" />
              <span>TAB <span className="font-normal lowercase text-[8px]">New Tab</span></span>
            </div>
          </div>
        </div>

        {isExtensionOpen && (
          <div className="w-full lg:w-[480px] flex flex-col min-h-0 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className={`flex-1 flex flex-col rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border overflow-hidden transition-all duration-500 min-h-0 ${isDarkMode ? 'bg-[#0f172a] border-white/5 ring-4 ring-[#00ff87]/5' : 'bg-white border-slate-200 ring-4 ring-[#00ff87]/10'}`}>
              <ExtensionPopup 
                rules={rules} 
                onAdd={addRule} 
                onRemove={removeRule}
                onUpdate={updateRule}
                onSave={saveSettings}
                themeConfig={themeConfig}
                onUpdateTheme={setThemeConfig}
                commands={sortedCommands}
                onUpdateCommands={updateCommands}
                vault={vault}
                onSaveVault={handleSaveToVault}
                onUpdateVaultName={handleUpdateVaultName}
                onApplyVault={handleApplyVault}
                onDeleteVault={handleDeleteVault}
                onOpenOptions={() => addTab('halo-navigator://settings', 'Halo Navigator Hub', 'settings')}
                onOpenSqlGen={() => addTab('halo-navigator://sql', 'SQL Query Generator', 'sql')}
                onMagicFill={handleMagicFill}
                onFormatSql={handleFormatSql}
                onExport={exportData}
                onImport={importData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
