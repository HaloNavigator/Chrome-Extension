
import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, SaveIcon, CommandIcon, HelpCircleIcon, GlobeIcon, SparklesIcon, MailIcon, CodeBracketIcon, ShieldCheckIcon, FileJsonIcon, LockIcon, PaletteIcon, SunIcon, MoonIcon, SettingsIcon } from './Icons';
import { NavigatorRule, TabStyleType, LabelPosition, CommandMapping, ThemeConfig } from '../App';

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
  onOpenOptions?: () => void;
  onOpenSqlGen?: () => void;
  onMagicFill?: () => void;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({ 
  rules, onAdd, onRemove, onUpdate, onSave, themeConfig, onUpdateTheme, commands, onUpdateCommands, onOpenOptions, onOpenSqlGen, onMagicFill
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'shortcuts' | 'appearance' | 'tools' | 'links' | 'help'>('rules');
  const isDarkMode = themeConfig.mode === 'dark';

  const themeStyles = {
    bg: isDarkMode ? '#264653' : '#f8fafc',
    card: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
    text: isDarkMode ? '#ffffff' : '#1e293b',
    textMuted: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.5)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)',
    input: isDarkMode ? 'bg-[#1a3039] border-white/10' : 'bg-slate-100 border-slate-200',
    accent: themeConfig.primaryColor
  };

  const [newPattern, setNewPattern] = useState('');
  const [newColor, setNewColor] = useState(themeConfig.primaryColor);
  const [newLabel, setNewLabel] = useState('');
  const [newStyleType, setNewStyleType] = useState<TabStyleType>('full');
  const [newHideLabel, setNewHideLabel] = useState(false);
  const [newLabelPosition, setNewLabelPosition] = useState<LabelPosition>('right');
  const [newStrength, setNewStrength] = useState(0); 
  const [patternError, setPatternError] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editStyle, setEditStyle] = useState<TabStyleType>('full');
  const [editHideLabel, setEditHideLabel] = useState(false);
  const [editLabelPosition, setEditLabelPosition] = useState<LabelPosition>('right');
  const [editStrength, setEditStrength] = useState(0);

  const [newCmdCode, setNewCmdCode] = useState('');
  const [newCmdPath, setNewCmdPath] = useState('');
  const [editingCmdCode, setEditingCmdCode] = useState<string | null>(null);

  const handleAddRule = () => {
    if (!newPattern.trim()) { setPatternError(true); return; }
    onAdd({
      id: Date.now().toString(),
      pattern: newPattern.trim(),
      color: newColor,
      label: newLabel.trim() || newPattern.split('/')[0] || 'Env',
      styleType: newStyleType,
      hideLabel: newHideLabel,
      labelPosition: newLabelPosition,
      strength: newStrength
    });
    resetForm();
  };

  const startEditing = (rule: NavigatorRule) => {
    setEditingId(rule.id);
    setEditLabel(rule.label);
    setEditPattern(rule.pattern);
    setEditColor(rule.color);
    setEditStyle(rule.styleType);
    setEditHideLabel(rule.hideLabel);
    setEditLabelPosition(rule.labelPosition);
    setEditStrength(rule.strength ?? 0);
  };

  const handleUpdateRule = () => {
    if (!editPattern.trim()) return;
    onUpdate({
      id: editingId!,
      pattern: editPattern,
      label: editLabel,
      color: editColor,
      styleType: editStyle,
      hideLabel: editHideLabel,
      labelPosition: editLabelPosition,
      strength: editStrength
    });
    setEditingId(null);
  };

  const resetForm = () => {
    setNewPattern(''); setNewLabel(''); setNewColor(themeConfig.primaryColor); setPatternError(false); setNewHideLabel(false); setNewLabelPosition('right'); setNewStrength(0);
  };

  const handleAddCommand = () => {
    if (!newCmdCode || !newCmdPath) return;
    onUpdateCommands([...commands, { code: newCmdCode.toLowerCase(), path: newCmdPath }]);
    setNewCmdCode(''); setNewCmdPath('');
  };

  const startEditingCommand = (cmd: CommandMapping) => {
    setEditingCmdCode(cmd.code);
    setNewCmdCode(cmd.code.toUpperCase());
    setNewCmdPath(cmd.path);
  };

  const handleUpdateCommand = () => {
    if (!newCmdCode || !newCmdPath || !editingCmdCode) return;
    const updated = commands.map(c => 
      c.code === editingCmdCode ? { code: newCmdCode.toLowerCase(), path: newCmdPath } : c
    );
    onUpdateCommands(updated);
    cancelEditCommand();
  };

  const cancelEditCommand = () => {
    setEditingCmdCode(null);
    setNewCmdCode('');
    setNewCmdPath('');
  };

  const removeCommand = (code: string) => {
    onUpdateCommands(commands.filter(c => c.code !== code));
  };

  // Fixed Kbd component props to use optional children to satisfy TypeScript erroneous "missing" check at call sites
  const Kbd = ({ children }: { children?: React.ReactNode }) => (
    <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[9px] font-black text-white shadow-sm">{children}</kbd>
  );

  const themePresets = [
    { name: 'halo', color: '#00ff87' },
    { name: 'midnight', color: '#818cf8' },
    { name: 'ember', color: '#f59e0b' },
    { name: 'frost', color: '#06b6d4' }
  ];

  return (
    <div className="flex flex-col h-full transition-all duration-500 overflow-hidden" style={{ backgroundColor: themeStyles.bg, color: themeStyles.text }}>
      <div className="flex items-center justify-between border-b px-2" style={{ borderColor: themeStyles.border }}>
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('rules')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'rules' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'rules' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'rules' ? themeStyles.accent : 'transparent' }}>Rules</button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'shortcuts' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'shortcuts' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'shortcuts' ? themeStyles.accent : 'transparent' }}>Shortcuts</button>
          <button onClick={() => setActiveTab('appearance')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'appearance' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'appearance' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'appearance' ? themeStyles.accent : 'transparent' }}>Theme</button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'tools' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'tools' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'tools' ? themeStyles.accent : 'transparent' }}>Tools</button>
          <button onClick={() => setActiveTab('links')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'links' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'links' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'links' ? themeStyles.accent : 'transparent' }}>Links</button>
          <button onClick={() => setActiveTab('help')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'help' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'help' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'help' ? themeStyles.accent : 'transparent' }}>Help</button>
        </div>
        <button onClick={onOpenOptions} className="px-3 py-1.5 mr-2 rounded-lg border text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all shrink-0" style={{ borderColor: themeStyles.border, color: themeStyles.text }}>Dashboard</button>
      </div>

      <div className="p-6 flex-1 min-h-[500px] overflow-y-auto no-scrollbar pb-12">
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: themeStyles.accent }}>{editingId ? 'Edit Rule' : 'Environment Rules'}</span>
                {editingId && <button onClick={() => setEditingId(null)} className="opacity-40 hover:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Label</label>
                  <input type="text" placeholder="e.g. Production" value={editingId ? editLabel : newLabel} onChange={(e) => editingId ? setEditLabel(e.target.value) : setNewLabel(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>URL Pattern</label>
                  <input type="text" placeholder="e.g. paypointdev.haloitsm.com" value={editingId ? editPattern : newPattern} onChange={(e) => editingId ? setEditPattern(e.target.value) : setNewPattern(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${patternError ? 'border-red-500' : themeStyles.input} text-inherit`} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Visual Style</label>
                  <select value={editingId ? editStyle : newStyleType} onChange={(e) => editingId ? setEditStyle(e.target.value as TabStyleType) : setNewStyleType(e.target.value as TabStyleType)} className={`text-xs font-bold p-2.5 border rounded-xl w-full ${themeStyles.input} text-inherit`}>
                    <option value="full">Full Background</option>
                    <option value="border">Coloured Border</option>
                    <option value="top-bar">Accent Top Bar</option>
                    <option value="glow">Soft Glow</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Rule Colour</label>
                  <input type="color" value={editingId ? editColor : newColor} onChange={(e) => editingId ? setEditColor(e.target.value) : setNewColor(e.target.value)} className="h-[38px] w-full bg-transparent cursor-pointer border rounded-xl p-1" style={{ borderColor: themeStyles.border }} />
                </div>
              </div>

              <div className="space-y-3 p-3 rounded-2xl border bg-black/5" style={{ borderColor: themeStyles.border }}>
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[8px] font-black uppercase" style={{ color: themeStyles.textMuted }}>Style Width (Strength)</label>
                    <span className="text-[10px] font-black" style={{ color: themeStyles.accent }}>{editingId ? editStrength : newStrength}</span>
                  </div>
                  <input type="range" min="0" max="10" value={editingId ? editStrength : newStrength} onChange={(e) => editingId ? setEditStrength(parseInt(e.target.value)) : setNewStrength(parseInt(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700" style={{ accentColor: themeStyles.accent }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase" style={{ color: themeStyles.textMuted }}>Hide Label</label>
                    <div className="mt-1">
                      <Toggle 
                        checked={editingId ? editHideLabel : newHideLabel} 
                        onChange={(val) => editingId ? setEditHideLabel(val) : setNewHideLabel(val)} 
                        accent={themeStyles.accent} 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase" style={{ color: themeStyles.textMuted }}>Label Pos</label>
                    <select value={editingId ? editLabelPosition : newLabelPosition} onChange={(e) => editingId ? setEditLabelPosition(e.target.value as LabelPosition) : setNewLabelPosition(e.target.value as LabelPosition)} className={`text-[10px] font-bold p-1.5 border rounded-lg w-full ${themeStyles.input} text-inherit`}>
                      <option value="right">Right</option>
                      <option value="center">Centre</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={editingId ? handleUpdateRule : handleAddRule} className="flex-[2] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>
                  {editingId ? 'Update Rule' : 'Create Rule'}
                </button>
                <button onClick={onSave} title="Apply and Save" className="flex-1 bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                   <CheckIcon className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 block opacity-40">Active Rules</span>
              {rules.map(rule => (
                <div key={rule.id} className={`flex items-center gap-4 p-4 border rounded-[1.5rem] bg-white/5 group hover:border-inherit transition-all ${editingId === rule.id ? 'ring-2 border-accent shadow-lg scale-[1.02] bg-accent/5' : ''}`} style={{ borderColor: editingId === rule.id ? themeStyles.accent : themeStyles.border }}>
                  <div className="w-8 h-8 rounded-xl shadow-inner flex-shrink-0 flex items-center justify-center relative" style={{ backgroundColor: rule.color }}>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-black truncate">{rule.label || 'Env'}</p>
                      <span className="text-[7px] bg-black/40 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border" style={{ color: themeStyles.accent, borderColor: `${themeStyles.accent}20` }}>{rule.styleType}</span>
                    </div>
                    <p className="text-[10px] truncate font-mono opacity-30">{rule.pattern}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 transition-all">
                    <button onClick={() => startEditing(rule)} className="p-2 hover:bg-white/5 rounded-lg transition-all" title="Edit Rule"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onRemove(rule.id)} className="p-2 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all" title="Delete Rule"><TrashIcon className="w-4 h-4" /></button>
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
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: themeStyles.accent }}>{editingCmdCode ? `Edit Shortcut` : 'Shortcut Settings'}</span>
                {editingCmdCode && <button onClick={cancelEditCommand} className="opacity-40 hover:opacity-100"><XIcon className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Code</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-xs font-black" style={{ color: themeStyles.accent }}>#</span>
                    <input type="text" placeholder="AS" value={newCmdCode} onChange={(e) => setNewCmdCode(e.target.value)} className={`text-xs pl-6 p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase ml-1" style={{ color: themeStyles.textMuted }}>Path/URL</label>
                  <input type="text" placeholder="e.g. /assets" value={newCmdPath} onChange={(e) => setNewCmdPath(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${themeStyles.input} text-inherit`} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={editingCmdCode ? handleUpdateCommand : handleAddCommand} className="flex-[2] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>
                  {editingCmdCode ? 'Update Shortcut' : 'Register Shortcut'}
                </button>
                <button onClick={onSave} className="flex-1 bg-white/10 hover:bg-white/20 text-inherit text-[10px] font-black py-4 rounded-2xl border flex items-center justify-center gap-2 uppercase tracking-widest" style={{ borderColor: themeStyles.border }}>
                   <CheckIcon className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 block opacity-40">Registered Shortcuts</span>
              {commands.map(cmd => {
                const isAbs = cmd.path.includes('://');
                return (
                  <div key={cmd.code} className={`flex items-center gap-4 p-4 border rounded-2xl bg-white/5 group transition-all min-w-0 ${editingCmdCode === cmd.code ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-lg' : ''}`} style={{ borderColor: editingCmdCode === cmd.code ? themeStyles.accent : themeStyles.border }}>
                    <div className={`min-w-[40px] flex-shrink-0 flex items-center justify-center font-black text-[11px] whitespace-nowrap`} style={{ color: isAbs ? '#818cf8' : themeStyles.accent }}>#{cmd.code.toUpperCase()}</div>
                    <p className={`flex-1 text-[11px] truncate font-mono opacity-40`}>{cmd.path}</p>
                    <div className="flex items-center gap-1 opacity-100 transition-all">
                      <button onClick={() => startEditingCommand(cmd)} className="p-2 hover:bg-white/5 rounded-lg transition-all" title="Edit Shortcut"><EditIcon className="w-4 h-4" /></button>
                      <button onClick={() => removeCommand(cmd.code)} className="p-2 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all" title="Delete Shortcut"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-6 rounded-[2rem] border bg-black/5" style={{ borderColor: themeStyles.border }}>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-6" style={{ color: themeStyles.accent }}>Personalise Interface</div>
               
               <div className="flex justify-between items-center mb-8 px-2">
                  <span className="text-[10px] font-black uppercase opacity-60">Interface Mode</span>
                  <button 
                    onClick={() => onUpdateTheme({ ...themeConfig, mode: themeConfig.mode === 'dark' ? 'light' : 'dark' })} 
                    className="p-4 rounded-2xl bg-black/10 hover:bg-black/20 transition-all border border-white/5"
                  >
                    {isDarkMode ? <MoonIcon className="w-8 h-8 text-indigo-300" /> : <SunIcon className="w-8 h-8 text-amber-400" />}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-6">
                  {themePresets.map(p => (
                    <div 
                      key={p.name} 
                      onClick={() => onUpdateTheme({...themeConfig, preset: p.name, primaryColor: p.color})} 
                      className={`p-4 rounded-2xl border bg-black/5 flex items-center gap-3 cursor-pointer transition-all hover:border-accent ${themeConfig.preset === p.name ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-white/5'}`}
                      style={{ borderColor: themeConfig.preset === p.name ? themeConfig.primaryColor : undefined, backgroundColor: themeConfig.preset === p.name ? `${themeConfig.primaryColor}15` : undefined }}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{p.name}</span>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between items-center p-3 rounded-2xl bg-black/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase opacity-60">Accent Colour</span>
                  <div className="flex items-center gap-3">
                    <input type="text" value={themeConfig.primaryColor} onChange={(e) => onUpdateTheme({...themeConfig, primaryColor: e.target.value, preset: 'custom'})} className={`text-[10px] font-mono p-1.5 rounded-lg border focus:outline-none w-20 ${themeStyles.input}`} />
                    <input type="color" value={themeConfig.primaryColor} onChange={(e) => onUpdateTheme({...themeConfig, primaryColor: e.target.value, preset: 'custom'})} className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
                  </div>
               </div>
               
               <button onClick={onSave} className="w-full mt-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>Apply Changes</button>
             </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-6 rounded-[2rem] border bg-black/5" style={{ borderColor: themeStyles.border }}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-6" style={{ color: themeStyles.accent }}>Utility Tools</div>
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl border border-white/5 bg-black/5 space-y-4">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-[10px] font-black uppercase" style={{ color: '#ef4444' }}>Mandatory Ghosting</h4>
                            <p className="text-[9px] opacity-40 mt-0.5">Pulse highlight empty required fields.</p>
                         </div>
                         <Toggle 
                           checked={themeConfig.mandatoryGhosting !== false} 
                           onChange={(val) => onUpdateTheme({ ...themeConfig, mandatoryGhosting: val })} 
                           accent={'#ef4444'} 
                         />
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                         <div>
                            <h4 className="text-[10px] font-black uppercase" style={{ color: themeConfig.primaryColor }}>Custom Field Reveal</h4>
                            <p className="text-[9px] opacity-40 mt-0.5">Show technical IDs for custom fields.</p>
                         </div>
                         <Toggle 
                           checked={themeConfig.fieldIdReveal === true} 
                           onChange={(val) => onUpdateTheme({ ...themeConfig, fieldIdReveal: val })} 
                           accent={themeConfig.primaryColor} 
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <button onClick={onOpenSqlGen} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border border-white/5 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all">
                        <FileJsonIcon className="w-4 h-4 text-indigo-400" /> Launch SQL Hub
                      </button>
                      <button onClick={onMagicFill} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border border-white/5 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                        <SparklesIcon className="w-4 h-4 text-emerald-400" /> Run Smart Fill
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 mb-3 block opacity-40">Halo Resources</span>
              <div className="space-y-2">
                <a href="https://support.haloservicedesk.com/portal/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0,255,135,0.1)', color: themeStyles.accent }}>S</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Halo Support</h4>
                    <p className="text-[9px] opacity-40 truncate">support.haloservicedesk.com</p>
                  </div>
                </a>
                <a href="https://community.haloitsm.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0,255,135,0.1)', color: themeStyles.accent }}>C</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Halo Community</h4>
                    <p className="text-[9px] opacity-40 truncate">community.haloitsm.com</p>
                  </div>
                </a>
                <a href="https://discord.com/channels/1050832376185495562" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(0,255,135,0.1)', color: themeStyles.accent }}>D</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Admin Hangout</h4>
                    <p className="text-[9px] opacity-40 truncate">discord.com/haloitsm</p>
                  </div>
                </a>
                <a href="https://usehalo.com/haloitsm/roadmap/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>R</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Product Roadmap</h4>
                    <p className="text-[9px] opacity-40 truncate">usehalo.com/roadmap</p>
                  </div>
                </a>
                <a href="https://haloreleases.remmy.dev/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>RN</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Halo Release Notes</h4>
                    <p className="text-[9px] opacity-40 truncate">haloreleases.remmy.dev</p>
                  </div>
                </a>
                <a href="https://status.haloitsm.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>ST</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">System Status</h4>
                    <p className="text-[9px] opacity-40 truncate">status.haloitsm.com</p>
                  </div>
                </a>
                <a href="mailto:halonavigator@gmail.com" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 hover:bg-white/10 transition-all border-white/5 group no-underline text-inherit">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>M</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black">Contact Support</h4>
                    <p className="text-[9px] opacity-40 truncate">halonavigator@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-8 animate-in fade-in duration-300 pb-10">
             <div className="p-6 rounded-[2rem] border bg-black/5" style={{ borderColor: themeStyles.border }}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                   <GlobeIcon className="w-3.5 h-3.5" /> Quick Start Guide
                </div>
                <div className="space-y-4">
                   <div className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-black shrink-0" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>1</div>
                      <p className="text-[11px] opacity-70 leading-relaxed">Navigate to your <b>HaloITSM</b> instance in Chrome.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-black shrink-0" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>2</div>
                      <p className="text-[11px] opacity-70 leading-relaxed">Open the <b>Rules</b> tab and enter a unique URL pattern (e.g. <i>paypointdev.haloitsm.com</i>).</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-black shrink-0" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>3</div>
                      <p className="text-[11px] opacity-70 leading-relaxed">Set your preferred <b>Visual Style</b> and click <b>Save</b>. The active tab will immediately update.</p>
                   </div>
                </div>
             </div>

             <div className="p-6 rounded-[2rem] border bg-black/5" style={{ borderColor: themeStyles.border }}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2" style={{ color: themeStyles.accent }}>
                   <CommandIcon className="w-3.5 h-3.5" /> Navigation Palette
                </div>
                <p className="text-[11px] opacity-70 leading-relaxed mb-4">
                   Press <Kbd>#</Kbd> on any Halo page to summon the quick navigation terminal.
                </p>
                <div className="bg-black/20 rounded-2xl p-4 space-y-3">
                   <div className="flex justify-between items-center">
                      <Kbd>Enter</Kbd>
                      <span className="text-[10px] font-medium opacity-60">Open in current tab</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <Kbd>Tab</Kbd>
                      <span className="text-[10px] font-medium opacity-60">Open in new tab</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
