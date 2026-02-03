
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ExtensionPopup } from './components/ExtensionPopup';
import { SimulatedPage } from './components/SimulatedPage';
import { BrowserHeader } from './components/BrowserHeader';
import { OptionsDashboard } from './components/OptionsDashboard';
import { SqlGeneratorView } from './components/SqlGeneratorView';
import { CommandPalette } from './components/CommandPalette';
import { CodeBracketIcon, CommandIcon } from './components/Icons';

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

export interface Tab {
  id: string;
  url: string;
  title: string;
  type?: 'page' | 'settings' | 'sql';
}

const STORAGE_KEY = 'halo_navigator_rules';
const COMMANDS_KEY = 'halo_navigator_commands';
const THEME_CONFIG_KEY = 'halo_navigator_theme_config';

const DEFAULT_COMMANDS: CommandMapping[] = [
  { code: 'prod', path: 'https://tenant.haloitsm.com' },
  { code: 'dev', path: 'https://dev.haloitsm.com' },
  { code: 'uat', path: 'https://uat.haloitsm.com' },
  { code: 'as', path: '/assets' },
  { code: 'con', path: '/config' },
  { code: 'tic', path: '/tickets' },
  { code: 'home', path: '/home' }
];

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
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);

  // Lifted Form Data State for Magic Fill
  const [formData, setFormData] = useState<Record<string, string>>({
    'itil_ticket_type': 'Change Request',
    'ticket_type': 'Change Request',
    'change_type': '', 
    'risk': '',
    'impact': '',
    'uat_summary': '', 
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
      ctx.fillStyle = '#00ff87';
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
  }, [activeEffect]);

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
    
    const notification = document.createElement('div');
    notification.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-bounce";
    notification.innerText = "Applied & Saved!";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, [rules, commands, themeConfig]);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);
  const isDarkMode = themeConfig.mode === 'dark';

  const matchedRule = useMemo(() => {
    if (activeTab.type === 'settings' || activeTab.type === 'sql') return null;
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
      'change_plan': '1. Quiesce connections.\n2. Apply patches.\n3. Restart services.',
      'test_plan': '1. Check endpoint health.\n2. Run automated test suite.\n3. User acceptance sign-off.',
      'backout_plan': '1. Revert to snapshot SN-2025-01-A.\n2. Verify legacy state.\n3. Notify stakeholders.'
    });

    const notification = document.createElement('div');
    notification.className = "fixed bottom-12 right-12 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-2xl z-[999] animate-bounce flex items-center gap-3";
    notification.innerHTML = "<span>✨ Smart Fill Executed Successfully</span>";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handlePaletteExecute = (path: string, openInNewTab: boolean) => {
    if (path === 'magic-fill') {
      handleMagicFill();
      return;
    }

    if (path.startsWith('effect:')) {
      const effectName = path.replace('effect:', '');
      if (effectName === 'clean') {
        setActiveEffect(null);
      } else {
        setActiveEffect(effectName);
        if (effectName === 'halo-bless') {
          playAngelicChord();
          const n = document.createElement('div');
          n.className = "fixed top-12 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-8 py-4 rounded-full font-black shadow-[0_0_30px_rgba(251,191,36,0.6)] z-[1000000] animate-bounce text-sm";
          n.innerText = "✨ Blessing this environment for 100% uptime.";
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 5000);
        }
        setTimeout(() => setActiveEffect(null), 10000);
      }
      return;
    }

    let finalUrl = path;
    if (!path.includes('://')) {
      finalUrl = `tenant.haloitsm.com${path}`;
    }

    if (openInNewTab) {
      addTab(finalUrl, 'Module Redirect');
    } else {
      updateActiveTabUrl(finalUrl);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`h-screen flex flex-col items-center p-4 md:p-6 lg:p-8 transition-all duration-500 font-sans ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} ${activeEffect === 'retro' ? 'retro-filter' : ''} ${activeEffect === 'halo-bless' ? 'halo-bless-active' : ''}`}>
      <style>{`
        .retro-filter {
          filter: contrast(120%) grayscale(20%) brightness(110%);
          image-rendering: pixelated;
        }
        .halo-bless-active {
          box-shadow: inset 0 0 100px 20px rgba(251, 191, 36, 0.4);
          animation: haloPulse 3s infinite ease-in-out;
        }
        @keyframes haloPulse {
          0%, 100% { box-shadow: inset 0 0 80px 10px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: inset 0 0 120px 40px rgba(251, 191, 36, 0.5); }
        }
        .party-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99999;
          background: linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1));
          animation: rainbowBg 2s linear infinite;
        }
        @keyframes rainbowBg {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .flip-active {
          transform: rotate(360deg);
          transition: transform 1s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        }
        .confetti {
          position: fixed;
          top: -10px;
          width: 10px;
          height: 10px;
          background-color: #f00;
          animation: confettiFall 3s linear forwards;
          z-index: 100000;
        }
        @keyframes confettiFall {
          to { transform: translateY(100vh) rotate(360deg); }
        }
      `}</style>

      {activeEffect === 'party' && (
        <div className="party-overlay">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                animationDelay: `${Math.random() * 2}s`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`
            }} />
          ))}
        </div>
      )}

      {activeEffect === 'navigator-matrix' && (
        <canvas ref={matrixCanvasRef} className="fixed inset-0 z-[99999] pointer-events-none opacity-40" />
      )}
      
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        commands={commands}
        onExecute={handlePaletteExecute}
        themeConfig={themeConfig}
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
        <div className={`flex-1 flex flex-col rounded-[2.5rem] shadow-2xl border transition-all duration-500 overflow-hidden min-h-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} ${activeEffect === 'ghost' ? 'opacity-30' : ''}`}>
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
                commands={commands}
                themeConfig={themeConfig}
                onUpdateRules={setRules}
                onUpdateCommands={setCommands}
                onUpdateTheme={setThemeConfig}
                onSave={saveSettings}
                onOpenSqlGen={() => addTab('halo-navigator://sql', 'SQL Query Generator', 'sql')}
                onMagicFill={handleMagicFill}
              />
            ) : activeTab.type === 'sql' ? (
              <SqlGeneratorView themeConfig={themeConfig} />
            ) : (
              <SimulatedPage 
                url={activeTab.url} 
                matchedRule={matchedRule} 
                themeConfig={themeConfig} 
                commands={commands}
                onNavigate={updateActiveTabUrl}
                onOpenNewTab={(url) => addTab(url, 'Module Redirect')}
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}
          </div>
          
          <div className={`border-t px-8 py-2 flex items-center gap-8 justify-center text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => setIsPaletteOpen(true)}>
              <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500 font-black">#</span>
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
            <div className={`flex-1 flex flex-col rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border overflow-hidden transition-all duration-500 min-h-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 ring-4 ring-[#00ff87]/5' : 'bg-white border-slate-200 ring-4 ring-[#00ff87]/10'}`}>
              <ExtensionPopup 
                rules={rules} 
                onAdd={addRule} 
                onRemove={removeRule}
                onUpdate={updateRule}
                onSave={saveSettings}
                themeConfig={themeConfig}
                onUpdateTheme={setThemeConfig}
                commands={commands}
                onUpdateCommands={updateCommands}
                onOpenOptions={() => addTab('halo-navigator://settings', 'Halo Navigator Dashboard', 'settings')}
                onOpenSqlGen={() => addTab('halo-navigator://sql', 'SQL Query Generator', 'sql')}
                onMagicFill={handleMagicFill}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
