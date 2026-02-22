import React, { useState, useMemo } from 'react';
import { NavigatorRule, CommandMapping, TabStyleType, LabelPosition, ThemeConfig, CustomAction } from '../App';
import { TrashIcon, EditIcon, PlusIcon, GlobeIcon, CommandIcon, SaveIcon, XIcon, SunIcon, MoonIcon, PaletteIcon, CodeBracketIcon, SparklesIcon, FileJsonIcon, SearchIcon, DownloadIcon, UploadIcon, HelpCircleIcon, ShieldCheckIcon } from './Icons';
import { GlobalFeatures } from './GlobalFeatures';

const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; accent: string }> = ({ checked, onChange, accent }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? '' : 'bg-slate-700/50'}`}
    style={{ backgroundColor: checked ? accent : undefined }}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

interface OptionsDashboardProps {
  rules: NavigatorRule[];
  commands: CommandMapping[];
  actions: CustomAction[];
  themeConfig: ThemeConfig;
  onUpdateRules: (rules: NavigatorRule[]) => void;
  onUpdateCommands: (cmds: CommandMapping[]) => void;
  onUpdateActions: (actions: CustomAction[]) => void;
  onUpdateTheme: (config: ThemeConfig) => void;
  onSave: () => void;
  onOpenSqlGen?: () => void;
  onMagicFill?: () => void;
  onFormatSql?: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OptionsDashboard: React.FC<OptionsDashboardProps> = ({
  rules, commands, actions, themeConfig, onUpdateRules, onUpdateCommands, onUpdateActions, onUpdateTheme, onSave, onOpenSqlGen, onMagicFill, onFormatSql, onExport, onImport
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCmdCode, setEditingCmdCode] = useState<string | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [shortcutSearch, setShortcutSearch] = useState('');
  
  const isDarkMode = themeConfig.mode === 'dark';
  const accent = themeConfig.primaryColor;

  // Rule Form State
  const [label, setLabel] = useState('');
  const [labelColor, setLabelColor] = useState('#ffffff');
  const [pattern, setPattern] = useState('');
  const [style, setStyle] = useState<TabStyleType>('full');
  const [color, setColor] = useState(accent);
  const [strength, setStrength] = useState(0); 
  const [hideLabel, setHideLabel] = useState(false);
  const [labelPosition, setLabelPosition] = useState<LabelPosition>('right');

  // Shortcut State
  const [cmdCode, setCmdCode] = useState('');
  const [cmdPath, setCmdPath] = useState('');

  // Action Form State
  const [actionType, setActionType] = useState<'button' | 'group'>('button');
  const [actionShortcut, setActionShortcut] = useState('');
  const [actionName, setActionName] = useState('');
  const [actionElementId, setActionElementId] = useState('');

  const handleCreateRule = () => {
    if (!pattern.trim()) return;
    const newRule: NavigatorRule = {
      id: Date.now().toString(),
      label: label || 'Env',
      labelColor,
      pattern,
      styleType: style,
      color,
      strength,
      hideLabel,
      labelPosition
    };
    onUpdateRules([...rules, newRule]);
    resetRuleForm();
  };

  const handleUpdateRule = () => {
    if (!editingId) return;
    onUpdateRules(rules.map(r => r.id === editingId ? {
      ...r, label, labelColor, pattern, styleType: style, color, strength, hideLabel, labelPosition
    } : r));
    resetRuleForm();
  };

  const startEdit = (rule: NavigatorRule) => {
    setEditingId(rule.id);
    setLabel(rule.label);
    setLabelColor(rule.labelColor || '#ffffff');
    setPattern(rule.pattern);
    setStyle(rule.styleType);
    setColor(rule.color);
    setStrength(rule.strength ?? 0);
    setHideLabel(rule.hideLabel);
    setLabelPosition(rule.labelPosition || 'right');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetRuleForm = () => {
    setEditingId(null); setLabel(''); setLabelColor('#ffffff'); setPattern(''); setStyle('full'); setColor(accent); setStrength(0); setHideLabel(false); setLabelPosition('right');
  };

  const startEditCmd = (cmd: CommandMapping) => {
    setEditingCmdCode(cmd.code);
    setCmdCode(cmd.code.toUpperCase());
    setCmdPath(cmd.path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCmd = () => {
    const code = cmdCode.trim().toLowerCase();
    const path = cmdPath.trim();
    if (!code || !path) return;

    if (editingCmdCode) {
      onUpdateCommands(commands.map(c => c.code === editingCmdCode ? { code, path } : c));
      setEditingCmdCode(null);
    } else {
      if (commands.find(c => c.code === code)) return;
      onUpdateCommands([...commands, { code, path }]);
    }
    setCmdCode(''); setCmdPath('');
  };

  const startEditAction = (a: CustomAction) => {
    setEditingActionId(a.id);
    setActionType(a.type);
    setActionShortcut(a.shortcut.replace('#', ''));
    setActionName(a.name);
    setActionElementId(a.elementId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddAction = () => {
    const shortcutStr = actionShortcut.startsWith('#') ? actionShortcut : `#${actionShortcut}`;
    if (!actionName || !actionElementId || !actionShortcut) return;

    if (editingActionId) {
        onUpdateActions(actions.map(a => a.id === editingActionId ? {
            ...a, type: actionType, shortcut: shortcutStr, name: actionName, elementId: actionElementId
        } : a));
        setEditingActionId(null);
    } else {
        const newAction: CustomAction = {
            id: Date.now().toString(),
            type: actionType,
            shortcut: shortcutStr,
            name: actionName,
            elementId: actionElementId
        };
        onUpdateActions([...actions, newAction]);
    }
    setActionShortcut(''); setActionName(''); setActionElementId('');
  };

  const filteredShortcuts = useMemo(() => {
    const search = shortcutSearch.toLowerCase().trim();
    return [...commands]
      .filter(c => c.code.toLowerCase().includes(search) || c.path.toLowerCase().includes(search))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [commands, shortcutSearch]);

  const Kbd = ({ children }: { children?: React.ReactNode }) => (
    <kbd className="px-1.5 py-0.5 rounded bg-black/40 text-[9px] font-black border border-white/10 text-white uppercase mx-1">{children}</kbd>
  );

  return (
    <div className={`flex-1 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'} text-inherit p-6 md:p-10 lg:p-12 overflow-y-auto no-scrollbar`}>
      <div className="max-w-7xl ml-0 mr-auto space-y-10 pb-20">
        <div className="flex items-center justify-between border-b pb-8" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0' }}>
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center bg-black/20 overflow-hidden ring-1 ring-white/10">
                <img src="images/HN128.png" className="w-10 h-10 object-contain" alt="Logo" />
              </div>
              <h2 className={`text-xl font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Navigator Hub</h2>
           </div>
           <div className="flex gap-4">
              <button onClick={onSave} className="px-8 py-3.5 rounded-full font-black uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-105 active:scale-95 text-[11px]" style={{ backgroundColor: accent, color: '#0f172a' }}>Deploy Settings</button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2" style={{ color: accent }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                Environment Visualisation
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Label</label>
                    <input value={label} onChange={e => setLabel(e.target.value)} type="text" className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="e.g. Production" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">URL Pattern</label>
                    <input value={pattern} onChange={e => setPattern(e.target.value)} type="text" className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="tenant.haloitsm.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Colour</label>
                    <div className="relative group h-[42px]">
                      <input value={color} onChange={e => setColor(e.target.value)} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full h-full rounded-2xl border-none ring-1 ring-white/10 flex items-center px-4 gap-3 bg-black/20">
                         <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                         <span className="text-[10px] font-mono opacity-50 uppercase">{color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Text Label Colour</label>
                    <div className="relative group h-[42px]">
                      <input value={labelColor} onChange={e => setLabelColor(e.target.value)} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="w-full h-full rounded-2xl border-none ring-1 ring-white/10 flex items-center px-4 gap-3 bg-black/20">
                         <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: labelColor }} />
                         <span className="text-[10px] font-mono opacity-50 uppercase">{labelColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 p-5 rounded-3xl bg-black/20 ring-1 ring-white/5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase opacity-60">Style Width (Strength)</span>
                    <span className="text-xs font-black" style={{ color: accent }}>{strength}</span>
                  </div>
                  <input type="range" min="0" max="10" value={strength} onChange={e => setStrength(parseInt(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700/50" style={{ accentColor: accent }} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Style</label>
                    <select value={style} onChange={e => setStyle(e.target.value as TabStyleType)} className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none appearance-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`}><option value="full">Ambient</option><option value="border">Frame</option><option value="top-bar">Bar</option><option value="glow">Glow</option></select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Label Position</label>
                    <select value={labelPosition} onChange={e => setLabelPosition(e.target.value as LabelPosition)} className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none appearance-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`}>
                      <option value="right">Right</option>
                      <option value="center">Centre</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50">Hide Label</label>
                  <div className="mt-1 ml-1">
                    <Toggle checked={hideLabel} onChange={val => setHideLabel(val)} accent={accent} />
                  </div>
                </div>

                <button onClick={editingId ? handleUpdateRule : handleCreateRule} className="w-full py-4 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#0f172a' }}>{editingId ? 'Update Existing Rule' : 'Register New Environment'}</button>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest px-4 opacity-50">Active Rules</span>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {rules.map(rule => (
                  <div key={rule.id} className={`p-4 border rounded-[1.8rem] flex items-center gap-5 group transition-all ${editingId === rule.id ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} style={{ borderColor: editingId === rule.id ? accent : undefined }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative shadow-inner ring-1 ring-white/10 text-[8px] font-black uppercase overflow-hidden" style={{ backgroundColor: rule.color, color: rule.labelColor || '#121212' }}>
                      {rule.label.substring(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm tracking-tight">{rule.label}</h4>
                      <p className="font-mono text-[10px] opacity-30 truncate">{rule.pattern}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 transition-all">
                      <button onClick={() => startEdit(rule)} className="p-2.5 rounded-xl hover:bg-black/20 text-indigo-400" title="Edit Rule"><EditIcon className="w-4 h-4" /></button>
                      <button onClick={() => onUpdateRules(rules.filter(r => r.id !== rule.id))} className="p-2.5 rounded-xl hover:text-red-500 hover:bg-black/20" title="Delete Rule"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <GlobalFeatures themeConfig={themeConfig} onUpdateTheme={onUpdateTheme} />

            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2" style={{ color: accent }}>
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                 Jump Settings
               </h3>
               <div className="grid grid-cols-[100px_1fr] gap-5 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Code</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-black opacity-40">#</span>
                      <input value={cmdCode} onChange={e => setCmdCode(e.target.value)} type="text" className={`rounded-2xl pl-7 p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="AS" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase ml-1 opacity-50">Path/URL</label>
                    <input value={cmdPath} onChange={e => setCmdPath(e.target.value)} type="text" className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="e.g. /assets" />
                  </div>
               </div>
               <button onClick={handleAddCmd} className="w-full py-4 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#0f172a' }}>{editingCmdCode ? 'Update Jump' : 'Register Jump'}</button>
               <div className="mt-10 space-y-4">
                 <div className="flex items-center justify-between px-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Registered Jumps</span>
                    <div className="relative group">
                       <SearchIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                       <input 
                        type="text" 
                        placeholder="Contextual search..." 
                        value={shortcutSearch}
                        onChange={(e) => setShortcutSearch(e.target.value)}
                        className={`text-[11px] pl-10 pr-4 py-2 rounded-full border-none focus:ring-1 ring-accent outline-none transition-all w-56 ${isDarkMode ? 'bg-black/30' : 'bg-slate-100'}`} 
                       />
                    </div>
                 </div>
                 <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                   {filteredShortcuts.map((cmd, i) => (
                     <div key={i} className={`flex items-center gap-5 p-4 border rounded-[1.5rem] group transition-all ${editingCmdCode === cmd.code ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} style={{ borderColor: editingCmdCode === cmd.code ? accent : undefined }}>
                       <div className="min-w-[50px] flex-shrink-0 flex items-center justify-center font-black text-xs tracking-wider" style={{ color: accent }}>#{cmd.code.toUpperCase()}</div>
                       <p className="flex-1 text-[11px] truncate opacity-40 font-mono tracking-tight">{cmd.path}</p>
                       <div className="flex items-center gap-1 opacity-100 transition-all">
                          <button onClick={() => startEditCmd(cmd)} className="p-2 rounded-xl hover:bg-black/20 text-indigo-400" title="Edit Jump"><EditIcon className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onUpdateCommands(commands.filter((c) => c.code !== cmd.code))} className="p-2 rounded-xl hover:text-red-500 hover:bg-black/20" title="Delete Jump"><TrashIcon className="w-3.5 h-3.5" /></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2" style={{ color: accent }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                Custom Actions
              </h3>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50">Type</label>
                  <select value={actionType} onChange={e => setActionType(e.target.value as 'button' | 'group')} className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none appearance-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`}>
                    <option value="button">Action Button</option>
                    <option value="group">Action Group</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase ml-1 opacity-50">Shortcut #</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-black opacity-40">#</span>
                    <input value={actionShortcut} onChange={e => setActionShortcut(e.target.value)} type="text" className={`rounded-2xl pl-7 p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="1" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-6">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50">Friendly Name</label>
                <input value={actionName} onChange={e => setActionName(e.target.value)} type="text" className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'}`} placeholder="e.g. Update Ticket" />
              </div>
              <div className="space-y-1.5 mb-6">
                <label className="text-[10px] font-black uppercase ml-1 opacity-50">
                  {actionType === 'button' ? 'Action Button Number' : 'HTML Element ID'}
                </label>
                <input 
                  value={actionElementId} 
                  onChange={e => setActionElementId(e.target.value)} 
                  type="text" 
                  className={`rounded-2xl p-3 text-xs w-full focus:ring-1 ring-accent outline-none border-none ${isDarkMode ? 'bg-black/30 text-white' : 'bg-slate-50'} font-mono`} 
                  placeholder={actionType === 'button' ? "e.g. 1" : "e.g. action-group-id"} 
                />
                {actionType === 'button' && (
                  <p className="text-[9px] opacity-40 ml-2 mt-1 italic">
                    Will be prefixed with <span className="font-mono">action-button-</span> automatically
                  </p>
                )}
              </div>
              <button onClick={handleAddAction} className="w-full py-4 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all hover:brightness-110" style={{ backgroundColor: accent, color: '#0f172a' }}>{editingActionId ? 'Update Action' : 'Register Action'}</button>
              
              <div className="mt-10 space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest px-4 opacity-50">Registered Actions</span>
                 <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                   {actions.map((a) => (
                     <div key={a.id} className={`flex items-center gap-5 p-4 border rounded-[1.5rem] group transition-all ${editingActionId === a.id ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} style={{ borderColor: editingActionId === a.id ? accent : undefined }}>
                        <div className="min-w-[50px] flex-shrink-0 flex items-center justify-center font-black text-xs tracking-wider" style={{ color: accent }}>{a.shortcut}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xs tracking-tight">{a.name} <span className="text-[8px] opacity-40 ml-1 uppercase">{a.type}</span></h4>
                          <p className="font-mono text-[9px] opacity-30 truncate">
                            ID: {a.type === 'button' && !a.elementId.startsWith('action-button-') ? `action-button-${a.elementId}` : a.elementId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 transition-all">
                          <button onClick={() => startEditAction(a)} className="p-2 rounded-xl hover:bg-black/20 text-indigo-400" title="Edit Action"><EditIcon className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onUpdateActions(actions.filter(act => act.id !== a.id))} className="p-2 rounded-xl hover:text-red-500 hover:bg-black/20" title="Delete Action"><TrashIcon className="w-3.5 h-3.5" /></button>
                        </div>
                     </div>
                   ))}
                   {actions.length === 0 && (
                     <div className="py-12 text-center opacity-30 text-[11px] font-black uppercase tracking-widest">No custom actions defined</div>
                   )}
                 </div>
              </div>
            </div>

            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2" style={{ color: accent }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                Maintenance & Backup
              </h3>
              <div className="grid grid-cols-2 gap-5">
                 <button 
                  onClick={onExport}
                  className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-black/20 border border-white/5 hover:bg-black/30 transition-all group"
                 >
                    <DownloadIcon className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Export Hub Data</span>
                 </button>
                 <div className="relative h-full">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={onImport}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-black/20 border border-white/5 group h-full">
                        <UploadIcon className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Restore Configuration</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};