import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, SaveIcon, CommandIcon, HelpCircleIcon, GlobeIcon, SparklesIcon, MailIcon, CodeBracketIcon, ShieldCheckIcon, FileJsonIcon, LockIcon, PaletteIcon } from './Icons';
import { NavigatorRule, TabStyleType, LabelPosition, CommandMapping } from '../App';

interface ExtensionPopupProps {
  rules: NavigatorRule[];
  onAdd: (rule: NavigatorRule) => void;
  onRemove: (id: string) => void;
  onUpdate: (rule: NavigatorRule) => void;
  onSave: () => void;
  isDarkMode: boolean;
  commands: CommandMapping[];
  onUpdateCommands: (cmds: CommandMapping[]) => void;
  onOpenOptions?: () => void;
  onOpenSqlGen?: () => void;
  onMagicFill?: () => void;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({ 
  rules, onAdd, onRemove, onUpdate, onSave, isDarkMode, commands, onUpdateCommands, onOpenOptions, onOpenSqlGen, onMagicFill
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'shortcuts' | 'links' | 'tools' | 'help'>('rules');
  
  // Rule Form State
  const [newPattern, setNewPattern] = useState('');
  const [newColor, setNewColor] = useState('#00ff87');
  const [newLabel, setNewLabel] = useState('');
  const [newStyleType, setNewStyleType] = useState<TabStyleType>('full');
  const [newHideLabel, setNewHideLabel] = useState(false);
  const [newLabelPosition, setNewLabelPosition] = useState<LabelPosition>('right');
  const [newStrength, setNewStrength] = useState(5);
  const [patternError, setPatternError] = useState(false);

  // Edit Rule State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editStyle, setEditStyle] = useState<TabStyleType>('full');
  const [editHideLabel, setEditHideLabel] = useState(false);
  const [editLabelPosition, setEditLabelPosition] = useState<LabelPosition>('right');
  const [editStrength, setEditStrength] = useState(5);

  // Shortcuts State
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
    setEditStrength(rule.strength);
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
    setNewPattern(''); setNewLabel(''); setNewColor('#00ff87'); setPatternError(false); setNewHideLabel(false); setNewLabelPosition('right'); setNewStrength(5);
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

  const theme = {
    primary: '#264653',
    secondary: '#00ff87',
    input: 'bg-[#1a3039] border-white/10 text-white focus:border-[#00ff87]',
    card: 'rgba(255, 255, 255, 0.04)',
  };

  const showGlobalSave = activeTab === 'rules' || activeTab === 'shortcuts';

  return (
    <div className="flex flex-col h-full transition-colors duration-500 overflow-hidden" style={{ backgroundColor: theme.primary }}>
      <div className="flex items-center justify-between border-b border-white/10 pr-4">
        <div className="flex flex-1">
          <button onClick={() => setActiveTab('rules')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'rules' ? 'text-[#00ff87] border-b-2 border-[#00ff87] bg-white/5' : 'text-white/40 hover:text-white/60'}`}>Rules</button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'shortcuts' ? 'text-[#00ff87] border-b-2 border-[#00ff87] bg-white/5' : 'text-white/40 hover:text-white/60'}`}>Shortcuts</button>
          <button onClick={() => setActiveTab('links')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'links' ? 'text-[#00ff87] border-b-2 border-[#00ff87] bg-white/5' : 'text-white/40 hover:text-white/60'}`}>Links</button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'tools' ? 'text-[#00ff87] border-b-2 border-[#00ff87] bg-white/5' : 'text-white/40 hover:text-white/60'}`}>Tools</button>
          <button onClick={() => setActiveTab('help')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'help' ? 'text-[#00ff87] border-b-2 border-[#00ff87] bg-white/5' : 'text-white/40 hover:text-white/60'}`}>Help</button>
        </div>
        <button title="Settings Dashboard" className="p-2 ml-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#00ff87] transition-all" onClick={onOpenOptions}>
          <GlobeIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 flex-1 min-h-[500px] overflow-y-auto no-scrollbar pb-24">
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-5 rounded-3xl border transition-all space-y-4 ${theme.card} border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#00ff87] uppercase tracking-widest opacity-80">{editingId ? 'Edit Rule' : 'Environment Rules'}</span>
                {editingId && <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white"><XIcon className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">Label</label>
                  <input type="text" placeholder="e.g. Production" value={editingId ? editLabel : newLabel} onChange={(e) => editingId ? setEditLabel(e.target.value) : setNewLabel(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${theme.input}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">URL Pattern</label>
                  <input type="text" placeholder="e.g. /prod" value={editingId ? editPattern : newPattern} onChange={(e) => editingId ? setEditPattern(e.target.value) : setNewPattern(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${patternError ? 'border-red-500' : theme.input}`} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">Visual Style</label>
                  <select value={editingId ? editStyle : newStyleType} onChange={(e) => editingId ? setEditStyle(e.target.value as TabStyleType) : setNewStyleType(e.target.value as TabStyleType)} className={`text-xs font-bold p-2.5 border rounded-xl w-full ${theme.input}`}>
                    <option value="full">Full Background</option>
                    <option value="border">Colored Border</option>
                    <option value="top-bar">Accent Top Bar</option>
                    <option value="glow">Soft Glow</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">Color</label>
                  <input type="color" value={editingId ? editColor : newColor} onChange={(e) => editingId ? setEditColor(e.target.value) : setNewColor(e.target.value)} className="h-[38px] w-full bg-transparent cursor-pointer border border-white/10 rounded-xl p-1" />
                </div>
              </div>

              <div className="bg-black/20 p-3 rounded-2xl space-y-2 border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-white/40 uppercase">Intensity: <span className="text-[#00ff87] ml-1">{editingId ? editStrength : newStrength}</span></span>
                </div>
                <input type="range" min="0" max="10" value={editingId ? editStrength : newStrength} onChange={(e) => editingId ? setEditStrength(parseInt(e.target.value)) : setNewStrength(parseInt(e.target.value))} className="w-full accent-[#00ff87] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center bg-black/10 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <input id="pop-hide-label" type="checkbox" checked={editingId ? editHideLabel : newHideLabel} onChange={(e) => editingId ? setEditHideLabel(e.target.checked) : setNewHideLabel(e.target.checked)} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 accent-[#00ff87]" />
                  <label htmlFor="pop-hide-label" className="text-[9px] font-bold text-white/50 uppercase cursor-pointer">Hide Label</label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-white/30 uppercase">Pos:</span>
                  <select value={editingId ? editLabelPosition : newLabelPosition} onChange={(e) => editingId ? setEditLabelPosition(e.target.value as LabelPosition) : setNewLabelPosition(e.target.value as LabelPosition)} className="flex-1 bg-black/20 border border-white/5 rounded p-1.5 text-[9px] font-black uppercase focus:outline-none">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <button onClick={editingId ? handleUpdateRule : handleAddRule} className="w-full bg-[#00ff87] text-[#264653] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl shadow-[#00ff87]/20">
                {editingId ? <SaveIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />} {editingId ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 block">Active Rules</span>
              {rules.map(rule => (
                <div key={rule.id} className={`flex items-center gap-4 p-4 border rounded-[1.5rem] bg-white/5 border-white/10 group hover:border-[#00ff87]/30 transition-all ${editingId === rule.id ? 'ring-2 ring-[#00ff87]' : ''}`}>
                  <div className="w-8 h-8 rounded-xl shadow-inner flex-shrink-0" style={{ backgroundColor: rule.color }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-black truncate text-white">{rule.label || 'Env'}</p>
                      <span className="text-[7px] bg-black/40 text-[#00ff87] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-[#00ff87]/20">{rule.styleType}</span>
                      {rule.hideLabel && <span className="text-[7px] bg-red-500/20 text-red-400 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-red-500/20">Hidden</span>}
                      {!rule.hideLabel && rule.labelPosition !== 'right' && <span className="text-[7px] bg-indigo-500/20 text-indigo-400 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-indigo-500/20">{rule.labelPosition}</span>}
                    </div>
                    <p className="text-[10px] text-white/30 truncate font-mono opacity-80">{rule.pattern}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEditing(rule)} className="p-2 text-white/40 hover:text-[#00ff87] hover:bg-white/5 rounded-lg transition-all"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onRemove(rule.id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-5 rounded-3xl border transition-all space-y-4 ${theme.card} border-white/10 shadow-2xl`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#00ff87] uppercase tracking-widest opacity-80">{editingCmdCode ? `Edit Shortcut: #${editingCmdCode.toUpperCase()}` : 'Shortcut Settings'}</span>
                {editingCmdCode && <button onClick={cancelEditCommand} className="text-white/40 hover:text-white"><XIcon className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">Code</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-[#00ff87] text-xs font-black">#</span>
                    <input type="text" placeholder="AS" value={newCmdCode} onChange={(e) => setNewCmdCode(e.target.value)} className={`text-xs pl-6 p-2.5 border rounded-xl focus:outline-none w-full ${theme.input}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/30 uppercase ml-1">Path/URL</label>
                  <input type="text" placeholder="e.g. /assets" value={newCmdPath} onChange={(e) => setNewCmdPath(e.target.value)} className={`text-xs p-2.5 border rounded-xl focus:outline-none w-full ${theme.input}`} />
                </div>
              </div>
              <div className="flex gap-2">
                {editingCmdCode && (
                  <button onClick={cancelEditCommand} className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase hover:bg-white/10 transition-all">Cancel</button>
                )}
                <button onClick={editingCmdCode ? handleUpdateCommand : handleAddCommand} className={`${editingCmdCode ? 'flex-[2]' : 'w-full'} bg-[#00ff87] text-[#264653] text-[10px] font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl shadow-[#00ff87]/20`}>
                  {editingCmdCode ? 'Update Shortcut' : 'Register Shortcut'}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 block mb-2">Registered Shortcuts</span>
              {commands.map(cmd => {
                const isAbs = cmd.path.includes('://');
                return (
                  <div key={cmd.code} className={`flex items-center gap-4 p-4 border rounded-2xl bg-white/5 border-white/10 group transition-all min-w-0 ${editingCmdCode === cmd.code ? 'ring-2 ring-[#00ff87]' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[10px] ${isAbs ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-[#00ff87]/10 text-[#00ff87] border border-[#00ff87]/20'}`}>#{cmd.code.toUpperCase()}</div>
                    <p className={`flex-1 text-[11px] truncate font-mono ${isAbs ? 'text-indigo-300/60' : 'text-white/40'}`}>{cmd.path}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => startEditingCommand(cmd)} className="p-2 text-white/40 hover:text-[#00ff87] hover:bg-white/5 rounded-lg transition-all"><EditIcon className="w-4 h-4" /></button>
                      <button onClick={() => removeCommand(cmd.code)} className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-in fade-in duration-300 text-white pb-12">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#00ff87]/10 flex items-center justify-center text-[#00ff87] mx-auto mb-2 border border-[#00ff87]/20">
                <HelpCircleIcon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest">Help & Guide</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Master your Halo environment</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><PaletteIcon className="w-4 h-4" /></div>
                   <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">Tab Visuals (Rules)</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">Define rules that match URLs (e.g. <b>tenant.haloitsm.com</b>). When a match occurs, the tab will glow or change color so you never accidentally work in Prod!</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400"><PaletteIcon className="w-4 h-4" /></div>
                   <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">Palette Hotkeys (#)</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">Press the <b className="text-amber-500">#</b> key anywhere in a Halo portal to open the jump palette. Type a code (like <b>#prod</b> or <b>#as</b>) and hit <b className="text-amber-500">ENTER</b> to navigate instantly.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400"><CodeBracketIcon className="w-4 h-4" /></div>
                   <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">SQL Reporting Hub</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">Use the SQL Generator in the Tools tab to build complex HaloITSM reports without needing to know the schema. It automatically detects table relationships and generates valid queries.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400"><SparklesIcon className="w-4 h-4" /></div>
                   <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">Magic Form Filler</h3>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">QA your ticket workflows instantly. Use the <b className="text-[#00ff87]">Magic Fill</b> tool to populate all visible fields with realistic test data in a single click.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2">
              <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Halo Navigator v1.1.0</p>
              <button onClick={() => setActiveTab('links')} className="text-[#00ff87] text-[10px] font-black uppercase hover:underline">View Useful Links</button>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <span className="text-[10px] font-black text-[#00ff87] uppercase tracking-widest opacity-80 px-2">HaloITSM Resources</span>
            <div className="space-y-3 pb-8">
              <a href="https://support.haloservicedesk.com/portal/" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-[#00ff87]/10 flex items-center justify-center text-[#00ff87] group-hover:scale-110 transition-transform"><GlobeIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Halo Support</p><p className="text-[10px] text-white/30 truncate">support.haloservicedesk.com</p></div>
              </a>
              <a href="https://community.haloitsm.com/" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-[#00ff87]/10 flex items-center justify-center text-[#00ff87] group-hover:scale-110 transition-transform"><GlobeIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Halo Community</p><p className="text-[10px] text-white/30 truncate">community.haloitsm.com</p></div>
              </a>
              <a href="https://discord.com/channels/1050832376185495562" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-[#00ff87]/10 flex items-center justify-center text-[#00ff87] group-hover:scale-110 transition-transform"><GlobeIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Halo Admin Hangout</p><p className="text-[10px] text-white/30 truncate">discord.com/haloitsm</p></div>
              </a>
              <a href="https://usehalo.com/haloitsm/roadmap/" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><SparklesIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Product Roadmap</p><p className="text-[10px] text-white/30 truncate">usehalo.com/roadmap</p></div>
              </a>
              <a href="https://haloreleases.remmy.dev/" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform"><FileJsonIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Halo Release Notes</p><p className="text-[10px] text-white/30 truncate">haloreleases.remmy.dev</p></div>
              </a>
              <a href="https://status.haloitsm.com/" target="_blank" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><ShieldCheckIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">System Status</p><p className="text-[10px] text-white/30 truncate">status.haloitsm.com</p></div>
              </a>
              <a href="mailto:halonavigator@gmail.com" className="flex items-center gap-4 p-4 border rounded-3xl bg-white/5 border-white/10 hover:border-[#00ff87]/30 hover:bg-white/10 transition-all no-underline group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><MailIcon className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-white">Contact Support</p><p className="text-[10px] text-white/30 truncate">halonavigator@gmail.com</p></div>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-[#00ff87]/10 flex items-center justify-center"><CodeBracketIcon className="w-6 h-6 text-[#00ff87]" /></div>
                   <div><h4 className="text-sm font-black text-white">SQL Query Generator</h4><p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Reporting Hub</p></div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">Visual schema explorer for generating advanced HaloITSM SQL queries with automated join detection.</p>
                <button onClick={onOpenSqlGen} className="w-full py-4 rounded-2xl bg-[#00ff87] text-[#264653] font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#00ff87]/20">Launch SQL Generator</button>
             </div>

             <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center"><SparklesIcon className="w-6 h-6 text-indigo-400" /></div>
                   <div><h4 className="text-sm font-black text-white">Smart Form Filler</h4><p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">QA Tool</p></div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">Populate current form fields with context-aware mock data for rapid testing.</p>
                <button onClick={onMagicFill} className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"><SparklesIcon className="w-5 h-5" /> Magic Fill Form</button>
             </div>
          </div>
        )}
      </div>

      {showGlobalSave && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#264653] to-transparent pointer-events-none">
          <button onClick={onSave} className="w-full bg-[#00ff87] text-[#264653] text-sm font-black py-4 rounded-[2rem] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#00ff87]/40 uppercase tracking-[0.2em] pointer-events-auto">
            <SaveIcon className="w-5 h-5" /> Save & Apply All
          </button>
        </div>
      )}
    </div>
  );
};