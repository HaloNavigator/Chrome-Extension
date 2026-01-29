import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ExtensionPopup } from './components/ExtensionPopup';
import { SimulatedPage } from './components/SimulatedPage';
import { BrowserHeader } from './components/BrowserHeader';
import { OptionsDashboard } from './components/OptionsDashboard';
import { SqlGeneratorView } from './components/SqlGeneratorView';
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

export interface Tab {
  id: string;
  url: string;
  title: string;
  type?: 'page' | 'settings' | 'sql';
}

const STORAGE_KEY = 'halo_navigator_rules';
const COMMANDS_KEY = 'halo_navigator_commands';
const THEME_KEY = 'halo_navigator_theme';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const [rules, setRules] = useState<NavigatorRule[]>([
    { id: '1', pattern: 'tenant.haloitsm.com', color: '#ef4444', label: 'Prod', styleType: 'full', hideLabel: false, labelPosition: 'right', strength: 5 },
    { id: '2', pattern: 'dev.haloitsm.com', color: '#22c55e', label: 'Dev', styleType: 'border', hideLabel: false, labelPosition: 'left', strength: 8 },
    { id: '3', pattern: 'uat.haloitsm.com', color: '#3b82f6', label: 'UAT', styleType: 'top-bar', hideLabel: false, labelPosition: 'center', strength: 4 },
  ]);

  const [commands, setCommands] = useState<CommandMapping[]>(DEFAULT_COMMANDS);
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(true);

  useEffect(() => {
    const savedRules = localStorage.getItem(STORAGE_KEY);
    if (savedRules) setRules(JSON.parse(savedRules));
    const savedCommands = localStorage.getItem(COMMANDS_KEY);
    if (savedCommands) setCommands(JSON.parse(savedCommands));
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  const saveSettings = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    localStorage.setItem(COMMANDS_KEY, JSON.stringify(commands));
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    
    const notification = document.createElement('div');
    notification.className = "fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-50 animate-bounce";
    notification.innerText = "Applied & Saved!";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }, [rules, commands, isDarkMode]);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);

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
    const notification = document.createElement('div');
    notification.className = "fixed bottom-12 right-12 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-2xl z-[999] animate-bounce flex items-center gap-3";
    notification.innerHTML = "<span>✨ Main Form Area Filled (Sidebar Ignored)</span>";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  return (
    <div className={`h-screen flex flex-col items-center p-4 md:p-6 lg:p-8 transition-colors duration-500 font-sans ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="mb-4 text-center max-w-2xl shrink-0">
        <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-3 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <img src="images/HN48.png" className="w-8 h-8 shadow-xl rounded-lg" alt="Logo" />
          <h1>Halo Navigator</h1>
        </div>
        <p className={`text-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Professional environment visualization for HaloITSM.
        </p>
      </div>

      <div className="relative w-full max-w-[1800px] flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className={`flex-1 flex flex-col rounded-[2.5rem] shadow-2xl border transition-all duration-500 overflow-hidden min-h-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
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
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {activeTab.type === 'settings' ? (
              <OptionsDashboard 
                rules={rules}
                commands={commands}
                onUpdateRules={setRules}
                onUpdateCommands={setCommands}
                onSave={saveSettings}
              />
            ) : activeTab.type === 'sql' ? (
              <SqlGeneratorView />
            ) : (
              <SimulatedPage 
                url={activeTab.url} 
                matchedRule={matchedRule} 
                isDarkMode={isDarkMode}
                commands={commands}
                onNavigate={updateActiveTabUrl}
                onOpenNewTab={(url) => addTab(url, 'Module Redirect')}
              />
            )}
          </div>
          
          <div className={`border-t px-8 py-2 flex items-center gap-8 justify-center text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <div className="flex items-center gap-1.5">
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
                isDarkMode={isDarkMode}
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