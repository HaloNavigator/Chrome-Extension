import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, SaveIcon, CommandIcon, HelpCircleIcon, GlobeIcon, SparklesIcon, MailIcon, CodeBracketIcon, ShieldCheckIcon, FileJsonIcon, LockIcon, PaletteIcon, SunIcon, MoonIcon, SettingsIcon, SearchIcon, DownloadIcon, UploadIcon } from './Icons';
import { NavigatorRule, TabStyleType, LabelPosition, CommandMapping, ThemeConfig, VaultEntry, CustomAction } from '../App';

const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; accent: string }> = ({ checked, onChange, accent }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${checked ? '' : 'bg-slate-700/50'}`}
    style={{ backgroundColor: checked ? accent : undefined }}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

interface ExtensionPopupProps {
  rules: NavigatorRule[];
  onAdd: (rule: NavigatorRule) => void;
  onRemove: (id: string) => void;
  onUpdate: (rule: NavigatorRule) => void;
  onSave: () => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (config: ThemeConfig) => void;
  commands: CommandMapping[];
  onUpdateCommands: (cmds: CommandMapping[]) => void;
  actions: CustomAction[];
  onUpdateActions: (actions: CustomAction[]) => void;
  vault: VaultEntry[];
  onSaveVault: (name: string) => void;
  onUpdateVaultName: (id: string, name: string) => void;
  onApplyVault: (entry: VaultEntry) => void;
  onDeleteVault: (id: string) => void;
  onOpenOptions?: () => void;
  onOpenSqlGen?: () => void;
  onMagicFill?: () => void;
  onFormatSql?: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({ 
  rules, onAdd, onRemove, onUpdate, onSave, themeConfig, onUpdateTheme, commands, onUpdateCommands, 
  actions, onUpdateActions, vault, onSaveVault, onUpdateVaultName, onApplyVault, onDeleteVault, 
  onOpenOptions, onOpenSqlGen, onMagicFill, onFormatSql, onExport, onImport
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'shortcuts' | 'actions' | 'vault' | 'appearance' | 'tools' | 'links' | 'help'>('rules');
  const isDarkMode = themeConfig.mode === 'dark';

  const themeStyles = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    card: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
    text: isDarkMode ? '#ffffff' : '#1e293b',
    textMuted: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.5)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)',
    input: isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-slate-100 border-slate-200',
    accent: themeConfig.primaryColor
  };

  // Rule Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ruleLabel, setRuleLabel] = useState('');
  const [ruleLabelColor, setRuleLabelColor] = useState('#ffffff');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleStyle, setRuleStyle] = useState<TabStyleType>('full');
  const [ruleColor, setRuleColor] = useState(themeStyles.accent);
  const [ruleStrength, setRuleStrength] = useState(0);
  const [ruleHideLabel, setRuleHideLabel] = useState(false);
  const [ruleLabelPosition, setRuleLabelPosition] = useState<LabelPosition>('right');

  const resetRuleForm = () => {
    setEditingId(null); setRuleLabel(''); setRuleLabelColor('#ffffff'); setRulePattern(''); setRuleStyle('full'); setRuleColor(themeStyles.accent); setRuleStrength(0); setRuleHideLabel(false); setRuleLabelPosition('right');
  };

  const handleCreateRule = () => {
    if (!rulePattern.trim()) return;
    onAdd({
      id: Date.now().toString(),
      label: ruleLabel || 'Env',
      labelColor: ruleLabelColor,
      pattern: rulePattern,
      styleType: ruleStyle,
      color: ruleColor,
      strength: ruleStrength,
      hideLabel: ruleHideLabel,
      labelPosition: ruleLabelPosition
    });
    resetRuleForm();
  };

  const handleUpdateRule = () => {
    if (!editingId) return;
    onUpdate({
      id: editingId,
      label: ruleLabel,
      labelColor: ruleLabelColor,
      pattern: rulePattern,
      styleType: ruleStyle,
      color: ruleColor,
      strength: ruleStrength,
      hideLabel: ruleHideLabel,
      labelPosition: ruleLabelPosition
    });
    resetRuleForm();
  };

  const startEditRule = (rule: NavigatorRule) => {
    setEditingId(rule.id);
    setRuleLabel(rule.label);
    setRuleLabelColor(rule.labelColor || '#ffffff');
    setRulePattern(rule.pattern);
    setRuleStyle(rule.styleType);
    setRuleColor(rule.color);
    setRuleStrength(rule.strength || 0);
    setRuleHideLabel(rule.hideLabel);
    setRuleLabelPosition(rule.labelPosition || 'right');
  };

  const [newActionType, setNewActionType] = useState<'button' | 'group'>('button');
  const [newActionId, setNewActionId] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const [newActionShortcut, setNewActionShortcut] = useState('');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  
  // Search states for filtering lists
  const [jumpSearch, setJumpSearch] = useState('');
  const [actionSearch, setActionSearch] = useState('');

  const filteredCommands = useMemo(() => {
    return commands.filter(c => 
      c.code.toLowerCase().includes(jumpSearch.toLowerCase()) || 
      c.path.toLowerCase().includes(jumpSearch.toLowerCase())
    );
  }, [commands, jumpSearch]);

  const filteredActions = useMemo(() => {
    return actions.filter(a => 
      a.name.toLowerCase().includes(actionSearch.toLowerCase()) || 
      a.shortcut.toLowerCase().includes(actionSearch.toLowerCase()) ||
      a.elementId.toLowerCase().includes(actionSearch.toLowerCase())
    );
  }, [actions, actionSearch]);

  const resetActionForm = () => {
    setNewActionType('button'); setNewActionId(''); setNewActionName(''); setNewActionShortcut(''); setEditingActionId(null);
  };

  const handleAddAction = () => {
    if (!newActionId || !newActionName || !newActionShortcut) return;
    const shortcutStr = newActionShortcut.startsWith('#') ? newActionShortcut : `#${newActionShortcut}`;
    const newAction: CustomAction = {
        id: Date.now().toString(),
        elementId: newActionId,
        name: newActionName,
        shortcut: shortcutStr,
        type: newActionType
    };
    onUpdateActions([...actions, newAction]);
    resetActionForm();
  };

  const startEditAction = (a: CustomAction) => {
    setEditingActionId(a.id);
    setNewActionType(a.type);
    setNewActionId(a.elementId);
    setNewActionName(a.name);
    setNewActionShortcut(a.shortcut.replace('#', ''));
  };

  const handleUpdateAction = () => {
    if (!editingActionId) return;
    const shortcutStr = newActionShortcut.startsWith('#') ? newActionShortcut : `#${newActionShortcut}`;
    onUpdateActions(actions.map(a => a.id === editingActionId ? {
        ...a, type: newActionType, elementId: newActionId, name: newActionName, shortcut: shortcutStr
    } : a));
    resetActionForm();
  };

  const removeAction = (id: string) => {
    onUpdateActions(actions.filter(a => a.id !== id));
  };

  const HelpBlock = ({ icon: Icon, title, children }: { icon: any, title: string, children?: React.ReactNode }) => (
    <div className="p-6 rounded-[2rem] border bg-black/10 border-white/5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: themeStyles.accent }}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-[11px] font-black uppercase tracking-widest">{title}</h4>
      </div>
      <div className="text-[11px] leading-relaxed opacity-60 font-medium">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full transition-all duration-500 overflow-hidden" style={{ backgroundColor: themeStyles.bg, color: themeStyles.text }}>
      <style>{`
        .btn-hover-effect:hover {
            border-color: ${themeStyles.accent} !important;
            transform: translateY(-2px);
        }
        .import-btn-wrapper-sim:hover .btn-hover-effect {
            border-color: ${themeStyles.accent} !important;
            transform: translateY(-2px);
        }
        .tab-btn-sim:hover {
            border-color: ${themeStyles.accent};
        }
      `}</style>
      <div className="flex items-center justify-between border-b px-2" style={{ borderColor: themeStyles.border }}>
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('rules')} className={`flex-1 min-w-[65px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'rules' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'rules' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'rules' ? themeStyles.accent : 'transparent' }}>Rules</button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'shortcuts' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'shortcuts' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'shortcuts' ? themeStyles.accent : 'transparent' }}>Jumps</button>
          <button onClick={() => setActiveTab('actions')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'actions' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'actions' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'actions' ? themeStyles.accent : 'transparent' }}>Actions</button>
          <button onClick={() => setActiveTab('vault')} className={`flex-1 min-w-[65px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'vault' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'vault' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'vault' ? themeStyles.accent : 'transparent' }}>Vault</button>
          <button onClick={() => setActiveTab('appearance')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'appearance' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'appearance' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'appearance' ? themeStyles.accent : 'transparent' }}>Theme</button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'tools' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'tools' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'tools' ? themeStyles.accent : 'transparent' }}>Tools</button>
        </div>
        <div className="flex items-center gap-1.5 ml-2 pr-2">
          <button onClick={onOpenOptions} className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all shrink-0" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Hub</button>
          <button onClick={() => setActiveTab('help')} className={`p-1.5 rounded-lg border transition-all ${activeTab === 'help' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`} style={{ borderColor: activeTab === 'help' ? themeStyles.accent : themeStyles.border, color: activeTab === 'help' ? themeStyles.accent : themeStyles.text }}>
            <HelpCircleIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 min-h-[500px] overflow-y-auto no-scrollbar pb-12">
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className={`p-6 rounded-[2rem] border transition-all space-y-6 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Environment Rules</span>
                    {editingId && <button onClick={resetRuleForm} className="opacity-40 hover:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Label</label>
                        <input value={ruleLabel} onChange={e => setRuleLabel(e.target.value)} type="text" className={`rounded-xl p-2.5 text-xs w-full focus:ring-1 ring-accent outline-none border ${themeStyles.input} text-inherit`} placeholder="e.g. Prod" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Pattern</label>
                        <input value={rulePattern} onChange={e => setRulePattern(e.target.value)} type="text" className={`rounded-xl p-2.5 text-xs w-full focus:ring-1 ring-accent outline-none border ${themeStyles.input} text-inherit`} placeholder="tenant.haloitsm.com" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Style</label>
                        <select value={ruleStyle} onChange={e => setRuleStyle(e.target.value as TabStyleType)} className={`rounded-xl p-2.5 text-xs w-full focus:ring-1 ring-accent outline-none border appearance-none ${themeStyles.input} text-inherit`}>
                            <option value="full">Ambient</option>
                            <option value="border">Frame</option>
                            <option value="top-bar">Bar</option>
                            <option value="glow">Glow</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Rule Colour</label>
                        <div className="relative group h-[38px]">
                            <input value={ruleColor} onChange={e => setRuleColor(e.target.value)} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className={`w-full h-full rounded-xl border flex items-center px-3 gap-2 ${themeStyles.input}`}>
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ruleColor }} />
                                <span className="text-[9px] font-mono opacity-50 uppercase">{ruleColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Text Label Colour</label>
                        <div className="relative group h-[38px]">
                            <input value={ruleLabelColor} onChange={e => setRuleLabelColor(e.target.value)} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className={`w-full h-full rounded-xl border flex items-center px-3 gap-2 ${themeStyles.input}`}>
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ruleLabelColor }} />
                                <span className="text-[9px] font-mono opacity-50 uppercase">{ruleLabelColor}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase ml-1 opacity-50">Label Position</label>
                        <select value={ruleLabelPosition} onChange={e => setRuleLabelPosition(e.target.value as LabelPosition)} className={`rounded-xl p-2.5 text-xs w-full focus:ring-1 ring-accent outline-none border appearance-none ${themeStyles.input} text-inherit`}>
                            <option value="right">Right</option>
                            <option value="center">Centre</option>
                            <option value="left">Left</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2 p-4 rounded-2xl bg-black/20 border border-white/5">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black uppercase opacity-40">Style Width (Strength)</span>
                        <span className="text-[10px] font-black" style={{ color: themeStyles.accent }}>{ruleStrength}</span>
                    </div>
                    <input type="range" min="0" max="10" value={ruleStrength} onChange={e => setRuleStrength(parseInt(e.target.value))} className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-slate-700/50" style={{ accentColor: themeStyles.accent }} />
                </div>

                <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Hide Label</span>
                    </div>
                    <Toggle checked={ruleHideLabel} onChange={val => setRuleHideLabel(val)} accent={themeStyles.accent} />
                </div>

                <div className="flex gap-3">
                    <button onClick={editingId ? handleUpdateRule : handleCreateRule} className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>
                        {editingId ? 'Update Rule' : 'Add Rule'}
                    </button>
                    <button onClick={onSave} className="flex-1 bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                        Save
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2">Active Rules</span>
                {rules.map(rule => (
                    <div key={rule.id} className="flex items-center gap-4 p-4 border rounded-[1.5rem] bg-white/5 group hover:border-inherit transition-all tab-btn-sim" style={{ borderColor: themeStyles.border }}>
                        <div className="w-8 h-8 rounded-xl shadow-inner flex-shrink-0 flex items-center justify-center text-[7px] font-black uppercase overflow-hidden" style={{ backgroundColor: rule.color, color: rule.labelColor || '#121212' }}>
                            {rule.label.substring(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black truncate">{rule.label}</p>
                            <p className="text-[9px] truncate opacity-40 font-mono">{rule.pattern}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => startEditRule(rule)} className="p-2 hover:bg-white/5 rounded-lg transition-all text-indigo-400"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => onRemove(rule.id)} className="p-2 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: themeStyles.accent }}>Jump Settings</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-3">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Code</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-xs font-black" style={{ color: themeStyles.accent }}>#</span>
                            <input type="text" placeholder="AS" className={`text-xs pl-6 p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Path</label>
                        <input type="text" placeholder="/assets" className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex-[2] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>
                        Add
                    </button>
                    <button onClick={onSave} className="flex-1 bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                        <CheckIcon className="w-4 h-4" /> Save
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-black uppercase tracking-widest block opacity-40">Registered Jumps</span>
                    <div className="relative flex items-center">
                        <SearchIcon className="absolute left-2 w-3 h-3 opacity-30" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={jumpSearch}
                            onChange={(e) => setJumpSearch(e.target.value)}
                            className={`text-[9px] pl-7 pr-3 py-1.5 rounded-full border focus:outline-none w-32 ${themeStyles.input}`} 
                        />
                    </div>
                </div>
                {filteredCommands.map(c => (
                    <div key={c.code} className={`flex items-center gap-4 p-4 border rounded-[1.5rem] bg-white/5 group transition-all tab-btn-sim`} style={{ borderColor: themeStyles.border }}>
                        <div className="min-w-[50px] flex-shrink-0 flex items-center font-black text-[11px] text-white">#{c.code.toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] truncate font-mono opacity-40">{c.path}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 transition-all">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-all" title="Edit Jump"><EditIcon className="w-4 h-4" /></button>
                            <button className="p-2 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all" title="Delete Jump"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: themeStyles.accent }}>{editingActionId ? 'Edit Action' : 'Action Settings'}</span>
                        {editingActionId && <button onClick={resetActionForm} className="opacity-40 hover:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>}
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-3">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Shortcut #</label>
                            <div className="relative">
                                <span className="absolute left-2.5 top-2.5 text-xs font-black" style={{ color: themeStyles.accent }}>#</span>
                                <input type="text" placeholder="1" value={newActionShortcut} onChange={(e) => setNewActionShortcut(e.target.value)} className={`text-xs pl-6 p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Type</label>
                            <select value={newActionType} onChange={(e) => setNewActionType(e.target.value as 'button' | 'group')} className={`text-xs font-bold p-2.5 border rounded-xl w-full ${themeStyles.input} text-inherit`}>
                                <option value="button">Action Button</option>
                                <option value="group">Action Group</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Friendly Name</label>
                        <input type="text" placeholder="e.g. Update Ticket" value={newActionName} onChange={(e) => setNewActionName(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>
                            {newActionType === 'button' ? 'Action Button Number' : 'HTML Element ID'}
                        </label>
                        <input 
                            type="text" 
                            placeholder={newActionType === 'button' ? "e.g. 1" : "e.g. action-group-id"} 
                            value={newActionId} 
                            onChange={(e) => setNewActionId(e.target.value)} 
                            className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit font-mono`} 
                        />
                        {newActionType === 'button' && (
                            <p className="text-[8px] opacity-40 ml-1 mt-0.5 italic">
                                Prefixed with <span className="font-mono">action-button-</span>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={editingActionId ? handleUpdateAction : handleAddAction} className="flex-[2] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>
                            {editingActionId ? 'Update' : 'Add'}
                        </button>
                        <button onClick={onSave} className="flex-1 bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                            <CheckIcon className="w-4 h-4" /> Save
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest block opacity-40">Registered Actions</span>
                        <div className="relative flex items-center">
                            <SearchIcon className="absolute left-2 w-3 h-3 opacity-30" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={actionSearch}
                                onChange={(e) => setActionSearch(e.target.value)}
                                className={`text-[9px] pl-7 pr-3 py-1.5 rounded-full border focus:outline-none w-32 ${themeStyles.input}`} 
                            />
                        </div>
                    </div>
                    {filteredActions.map(a => (
                        <div key={a.id} className={`flex items-center gap-4 p-4 border rounded-[1.5rem] bg-white/5 transition-all tab-btn-sim ${editingActionId === a.id ? 'ring-2 border-accent shadow-lg scale-[1.02] bg-accent/5' : ''}`} style={{ borderColor: editingActionId === a.id ? themeStyles.accent : themeStyles.border }}>
                            <div className="min-w-[40px] flex-shrink-0 flex items-center font-black text-[11px]" style={{ color: themeStyles.accent }}>{a.shortcut}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-[12px] font-black truncate">{a.name}</p>
                                    <span className="text-[7px] bg-black/40 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border" style={{ color: themeStyles.accent, borderColor: `${themeStyles.accent}20` }}>{a.type}</span>
                                </div>
                                <p className="text-[9px] truncate font-mono opacity-40">
                                    ID: {a.type === 'button' && !a.elementId.startsWith('action-button-') ? `action-button-${a.elementId}` : a.elementId}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 transition-all">
                                <button onClick={() => startEditAction(a)} className="p-2 hover:bg-white/5 rounded-lg transition-all" title="Edit Action"><EditIcon className="w-4 h-4" /></button>
                                <button onClick={() => removeAction(a.id)} className="p-2 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all" title="Delete Action"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {filteredActions.length === 0 && (
                        <div className="py-12 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">No matching actions</div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-[2rem] border transition-all space-y-4 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Data Vault</span>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => onSaveVault('')}
                  className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2" 
                  style={{ backgroundColor: themeStyles.accent, color: '#000' }}
                >
                  <SaveIcon className="w-4 h-4" /> Capture Current Form
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2">Stored Snapshots</span>
              {vault.map(entry => (
                <div key={entry.id} className="p-4 border rounded-[1.5rem] bg-white/5 group transition-all space-y-3" style={{ borderColor: themeStyles.border }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <input 
                        value={entry.name} 
                        onChange={(e) => onUpdateVaultName(entry.id, e.target.value)}
                        className="bg-transparent border-none p-0 text-[12px] font-black w-full focus:outline-none focus:ring-0"
                      />
                      <p className="text-[8px] opacity-30 mt-0.5 uppercase tracking-tighter">{entry.timestamp}</p>
                    </div>
                    <button onClick={() => onDeleteVault(entry.id)} className="p-1.5 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><TrashIcon className="w-3.5 h-3.5" /></button>
                  </div>
                  <button 
                    onClick={() => onApplyVault(entry)}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Inject Snapshot
                  </button>
                </div>
              ))}
              {vault.length === 0 && (
                <div className="py-12 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Vault is empty</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-[2rem] border transition-all space-y-6 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Visual Interface</span>
              </div>

              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Interface Mode</span>
                  <span className="text-[9px] opacity-40 mt-0.5 font-medium">{isDarkMode ? 'Dark Protocol' : 'Light Protocol'}</span>
                </div>
                <button 
                  onClick={() => onUpdateTheme({ ...themeConfig, mode: isDarkMode ? 'light' : 'dark' })}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
                  style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)', color: themeStyles.accent }}
                >
                  {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
              </div>

              <div className="h-px bg-white/5 mx-1" />

              <div className="space-y-3">
                <label className="text-[8px] font-black uppercase ml-1 opacity-50">Accent Colour</label>
                <div className="flex gap-3">
                  <div className="relative flex-1 h-[48px]">
                    <input 
                      value={themeConfig.primaryColor} 
                      onChange={e => onUpdateTheme({ ...themeConfig, primaryColor: e.target.value })} 
                      type="color" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className={`w-full h-full rounded-2xl border flex items-center px-4 gap-3 ${themeStyles.input}`}>
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: themeConfig.primaryColor }} />
                      <span className="text-[10px] font-mono opacity-50 uppercase">{themeConfig.primaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5 mx-1" />

              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Favicon Tinting</span>
                  <span className="text-[9px] opacity-40 mt-0.5 font-medium">Add colored dot to tab icons</span>
                </div>
                <Toggle checked={themeConfig.faviconTinting !== false} onChange={(v) => onUpdateTheme({ ...themeConfig, faviconTinting: v })} accent={themeStyles.accent} />
              </div>

              <button onClick={onSave} className="w-full bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                Apply & Save Theme
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest block opacity-40 px-2">Presets</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Halo', color: '#00ff87' },
                  { name: 'Cyber', color: '#f0abfc' },
                  { name: 'Classic', color: '#6366f1' },
                  { name: 'Amber', color: '#f59e0b' },
                  { name: 'Ruby', color: '#ef4444' },
                  { name: 'Slate', color: '#94a3b8' }
                ].map(p => (
                  <button 
                    key={p.name}
                    onClick={() => onUpdateTheme({ ...themeConfig, primaryColor: p.color, preset: p.name.toLowerCase() })}
                    className="p-3 rounded-2xl border bg-white/5 hover:border-inherit transition-all flex flex-col items-center gap-2"
                    style={{ borderColor: themeConfig.primaryColor === p.color ? themeStyles.accent : themeStyles.border }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-5 rounded-[2rem] border bg-white/5 space-y-4" style={{ borderColor: themeStyles.border }}>
                <div className="flex justify-between items-center px-2">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>Mandatory Ghosting</span>
                      <span className="text-[9px] opacity-40 mt-0.5 font-medium">Highlight empty required fields</span>
                   </div>
                   <Toggle checked={themeConfig.mandatoryGhosting || false} onChange={(v) => onUpdateTheme({ ...themeConfig, mandatoryGhosting: v })} accent="#ef4444" />
                </div>
                <div className="h-px bg-white/5 mx-2" />
                <div className="flex justify-between items-center px-2">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Action Reveal</span>
                      <span className="text-[9px] opacity-40 mt-0.5 font-medium">Show action IDs on buttons</span>
                   </div>
                   <Toggle checked={themeConfig.actionReveal || false} onChange={(v) => onUpdateTheme({ ...themeConfig, actionReveal: v })} accent={themeStyles.accent} />
                </div>
                <div className="h-px bg-white/5 mx-2" />
                <div className="flex justify-between items-center px-2">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Field Reveal</span>
                      <span className="text-[9px] opacity-40 mt-0.5 font-medium">Show technical IDs on labels</span>
                   </div>
                   <Toggle checked={themeConfig.fieldIdReveal || false} onChange={(v) => onUpdateTheme({ ...themeConfig, fieldIdReveal: v })} accent={themeStyles.accent} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onExport}
                  className="btn-hover-effect flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-white/5 border border-white/5 transition-all group"
                  style={{ borderColor: themeStyles.border }}
                >
                   <DownloadIcon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Export Hub</span>
                </button>
                <div className="import-btn-wrapper-sim relative group h-full">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={onImport}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="btn-hover-effect flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-white/5 border border-white/5 transition-all h-full" style={{ borderColor: themeStyles.border }}>
                        <UploadIcon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Import Hub</span>
                    </div>
                </div>
             </div>

             <div className="space-y-3">
                <button onClick={onOpenSqlGen} className="btn-hover-effect w-full p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-start gap-1 transition-all" style={{ borderColor: themeStyles.border }}>
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Launch SQL Hub</span>
                    <span className="text-[9px] opacity-40 font-medium">Advanced report query builder</span>
                </button>
                <button onClick={onMagicFill} className="btn-hover-effect w-full p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-start gap-1 transition-all" style={{ borderColor: themeStyles.border }}>
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Smart Fill Form</span>
                    <span className="text-[9px] opacity-40 font-medium">Inject QA data into current module</span>
                </button>
                <button onClick={onFormatSql} className="btn-hover-effect w-full p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-start gap-1 transition-all" style={{ borderColor: themeStyles.border }}>
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeStyles.accent }}>Prettify SQL</span>
                    <span className="text-[9px] opacity-40 font-medium">Format report code with indentation</span>
                </button>
             </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            <div className="text-center py-6">
              <h3 className="text-lg font-black uppercase tracking-[0.2em]" style={{ color: themeStyles.accent }}>Navigator Core Manual</h3>
              <p className="text-[10px] opacity-40 font-bold uppercase mt-1">Operational Guidelines v2.5</p>
            </div>

            <HelpBlock icon={CommandIcon} title="Terminal Protocols">
              Access the terminal with <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white uppercase mx-1">#</kbd> (Shift+3). Use these precise protocols for automation:
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white"># [CODE]</span> <div><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white uppercase mx-1">Enter</kbd><kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white uppercase mx-1">Tab</kbd></div></div>
                   <p className="text-[9px] opacity-50">Jumps to a module (Enter = Current Tab, Tab = New Browser Tab).</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white"># [NUMBER]</span> <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white uppercase mx-1">Enter</kbd></div>
                   <p className="text-[9px] opacity-50">Executes a <b>Custom Action</b> by HTML ID (e.g., #1 to click button).</p>
                </div>
              </div>
            </HelpBlock>
          </div>
        )}
      </div>
    </div>
  );
};