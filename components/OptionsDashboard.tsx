import React, { useState } from 'react';
import { NavigatorRule, CommandMapping, TabStyleType, LabelPosition, ThemeConfig } from '../App';
import { TrashIcon, EditIcon, PlusIcon, GlobeIcon, CommandIcon, SaveIcon, XIcon, SunIcon, MoonIcon, PaletteIcon, CodeBracketIcon, SparklesIcon, FileJsonIcon } from './Icons';

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
  themeConfig: ThemeConfig;
  onUpdateRules: (rules: NavigatorRule[]) => void;
  onUpdateCommands: (cmds: CommandMapping[]) => void;
  onUpdateTheme: (config: ThemeConfig) => void;
  onSave: () => void;
  onOpenSqlGen?: () => void;
  onMagicFill?: () => void;
}

export const OptionsDashboard: React.FC<OptionsDashboardProps> = ({
  rules, commands, themeConfig, onUpdateRules, onUpdateCommands, onUpdateTheme, onSave, onOpenSqlGen, onMagicFill
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCmdCode, setEditingCmdCode] = useState<string | null>(null);
  
  const isDarkMode = themeConfig.mode === 'dark';
  const accent = themeConfig.primaryColor;

  // Rule Form State
  const [label, setLabel] = useState('');
  const [pattern, setPattern] = useState('');
  const [style, setStyle] = useState<TabStyleType>('full');
  const [color, setColor] = useState(accent);
  const [strength, setStrength] = useState(0); 
  const [hideLabel, setHideLabel] = useState(false);
  const [labelPosition, setLabelPosition] = useState<LabelPosition>('right');

  // Shortcut State
  const [cmdCode, setCmdCode] = useState('');
  const [cmdPath, setCmdPath] = useState('');

  const handleCreateRule = () => {
    if (!pattern.trim()) return;
    const newRule: NavigatorRule = {
      id: Date.now().toString(),
      label: label || 'Env',
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
      ...r, label, pattern, styleType: style, color, strength, hideLabel, labelPosition
    } : r));
    resetRuleForm();
  };

  const startEdit = (rule: NavigatorRule) => {
    setEditingId(rule.id);
    setLabel(rule.label);
    setPattern(rule.pattern);
    setStyle(rule.styleType);
    setColor(rule.color);
    setStrength(rule.strength ?? 0);
    setHideLabel(rule.hideLabel);
    setLabelPosition(rule.labelPosition || 'right');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetRuleForm = () => {
    setEditingId(null); setLabel(''); setPattern(''); setStyle('full'); setColor(accent); setStrength(0); setHideLabel(false); setLabelPosition('right');
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

  return (
    <div className={`flex-1 ${isDarkMode ? 'bg-[#1a2c33]' : 'bg-slate-50'} text-inherit p-6 md:p-10 overflow-y-auto no-scrollbar`}>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <img src="images/HN128.png" className="w-14 h-14 rounded-2xl shadow-xl" alt="Logo" />
              <h2 className={`text-lg font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Navigator Dashboard</h2>
           </div>
           <button onClick={onSave} className="px-8 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: accent, color: '#000' }}>Deploy Settings</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60" style={{ color: accent }}>Environment Visualisation</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Label</label>
                    <input value={label} onChange={e => setLabel(e.target.value)} type="text" className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`} placeholder="Label" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">URL Pattern</label>
                    <input value={pattern} onChange={e => setPattern(e.target.value)} type="text" className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`} placeholder="URL Pattern" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Style</label>
                    <select value={style} onChange={e => setStyle(e.target.value as TabStyleType)} className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`}><option value="full">Ambient</option><option value="border">Frame</option><option value="top-bar">Bar</option><option value="glow">Glow</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Colour</label>
                    <input value={color} onChange={e => setColor(e.target.value)} type="color" className="w-full h-[40px] rounded-xl cursor-pointer" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black uppercase opacity-60">Style Width (Strength)</span>
                    <span className="text-[11px] font-black" style={{ color: accent }}>{strength}</span>
                  </div>
                  <input type="range" min="0" max="10" value={strength} onChange={e => setStrength(parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700/50" style={{ accentColor: accent }} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Hide Label</label>
                    <div className="mt-2 ml-1">
                      <Toggle checked={hideLabel} onChange={val => setHideLabel(val)} accent={accent} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Label Position</label>
                    <select value={labelPosition} onChange={e => setLabelPosition(e.target.value as LabelPosition)} className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`}>
                      <option value="right">Right</option>
                      <option value="center">Centre</option>
                      <option value="left">Left</option>
                    </select>
                  </div>
                </div>

                <button onClick={editingId ? handleUpdateRule : handleCreateRule} className="w-full py-4 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all" style={{ backgroundColor: accent, color: '#000' }}>{editingId ? 'Update Existing Rule' : 'Register New Environment'}</button>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 opacity-50">Active Rules</span>
              {rules.map(rule => (
                <div key={rule.id} className={`p-4 border rounded-2xl flex items-center gap-4 group transition-all ${editingId === rule.id ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-lg' : 'hover:bg-white/5'}`} style={{ borderColor: editingId === rule.id ? accent : 'rgba(255,255,255,0.05)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center relative shadow-inner" style={{ backgroundColor: rule.color }}>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm">{rule.label}</h4>
                    <p className="font-mono text-[9px] opacity-30 truncate">{rule.pattern}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 transition-all">
                    <button onClick={() => startEdit(rule)} className="p-2 rounded-lg hover:bg-black/10" title="Edit Rule"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={() => onUpdateRules(rules.filter(r => r.id !== rule.id))} className="p-2 rounded-lg hover:text-red-500" title="Delete Rule"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60" style={{ color: accent }}>Jump Shortcuts</h3>
               <div className="grid grid-cols-[80px_1fr] gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Code</label>
                    <input value={cmdCode} onChange={e => setCmdCode(e.target.value)} type="text" className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`} placeholder="Code" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase ml-1 opacity-50">Path/URL</label>
                    <input value={cmdPath} onChange={e => setCmdPath(e.target.value)} type="text" className={`rounded-xl p-3 text-xs w-full ${isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50'}`} placeholder="Path/URL" />
                  </div>
               </div>
               <button onClick={handleAddCmd} className="w-full py-4 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all" style={{ backgroundColor: accent, color: '#000' }}>{editingCmdCode ? 'Update Shortcut' : 'Register Shortcut'}</button>
               <div className="mt-6 space-y-3">
                 <span className="text-[10px] font-black uppercase tracking-widest px-2 opacity-50">Stored Shortcuts</span>
                 {commands.map((cmd, i) => (
                   <div key={i} className={`flex items-center gap-4 p-3 border rounded-xl group transition-all ${editingCmdCode === cmd.code ? 'ring-2 border-accent scale-[1.02] bg-accent/5 shadow-lg' : 'hover:bg-white/5'}`} style={{ borderColor: editingCmdCode === cmd.code ? accent : 'rgba(255,255,255,0.05)' }}>
                     <div className="min-w-[40px] flex-shrink-0 flex items-center justify-center font-black text-[11px] whitespace-nowrap" style={{ color: accent }}>#{cmd.code.toUpperCase()}</div>
                     <p className="flex-1 text-[11px] truncate opacity-40 font-mono">{cmd.path}</p>
                     <div className="flex items-center gap-1 opacity-100 transition-all">
                        <button onClick={() => startEditCmd(cmd)} className="p-2 hover:text-indigo-400" title="Edit Shortcut"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={() => onUpdateCommands(commands.filter((_, idx) => idx !== i))} className="p-2 hover:text-red-500" title="Delete Shortcut"><TrashIcon className="w-4 h-4" /></button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className={`card p-8 border rounded-[2.5rem] shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="card-title">Personalisation</div>
              <div className="flex justify-between items-center p-6 rounded-3xl bg-black/10">
                 <span className="text-[11px] font-black uppercase opacity-60">Interface Mode</span>
                 <button 
                  onClick={() => onUpdateTheme({ ...themeConfig, mode: themeConfig.mode === 'dark' ? 'light' : 'dark' })} 
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:scale-110 transition-transform shadow-xl"
                 >
                   {isDarkMode ? <MoonIcon className="w-10 h-10 text-indigo-300" /> : <SunIcon className="w-10 h-10 text-amber-400" />}
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};