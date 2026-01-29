import React, { useState } from 'react';
import { NavigatorRule, CommandMapping, TabStyleType, LabelPosition } from '../App';
import { TrashIcon, EditIcon, PlusIcon, GlobeIcon, CommandIcon, SaveIcon, XIcon } from './Icons';

interface OptionsDashboardProps {
  rules: NavigatorRule[];
  commands: CommandMapping[];
  onUpdateRules: (rules: NavigatorRule[]) => void;
  onUpdateCommands: (cmds: CommandMapping[]) => void;
  onSave: () => void;
}

export const OptionsDashboard: React.FC<OptionsDashboardProps> = ({
  rules, commands, onUpdateRules, onUpdateCommands, onSave
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCmdCode, setEditingCmdCode] = useState<string | null>(null);
  
  // Rule Form State
  const [label, setLabel] = useState('');
  const [pattern, setPattern] = useState('');
  const [style, setStyle] = useState<TabStyleType>('full');
  const [color, setColor] = useState('#00ff87');
  const [strength, setStrength] = useState(5);
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
    setStrength(rule.strength);
    setHideLabel(rule.hideLabel);
    setLabelPosition(rule.labelPosition || 'right');
  };

  const resetRuleForm = () => {
    setEditingId(null);
    setLabel('');
    setPattern('');
    setStyle('full');
    setColor('#00ff87');
    setStrength(5);
    setHideLabel(false);
    setLabelPosition('right');
  };

  const handleAddCmd = () => {
    if (!cmdCode || !cmdPath) return;
    onUpdateCommands([...commands, { code: cmdCode.toLowerCase(), path: cmdPath }]);
    setCmdCode('');
    setCmdPath('');
  };

  const startEditCmd = (cmd: CommandMapping) => {
    setEditingCmdCode(cmd.code);
    setCmdCode(cmd.code.toUpperCase());
    setCmdPath(cmd.path);
  };

  const handleUpdateCmd = () => {
    if (!cmdCode || !cmdPath || !editingCmdCode) return;
    onUpdateCommands(commands.map(c => 
      c.code === editingCmdCode ? { code: cmdCode.toLowerCase(), path: cmdPath } : c
    ));
    cancelEditCmd();
  };

  const cancelEditCmd = () => {
    setEditingCmdCode(null);
    setCmdCode('');
    setCmdPath('');
  };

  const removeRule = (id: string) => onUpdateRules(rules.filter(r => r.id !== id));
  const removeCmd = (code: string) => onUpdateCommands(commands.filter(c => c.code !== code));

  return (
    <div className="flex-1 bg-[#1a2c33] text-white p-4 md:p-6 lg:p-10 overflow-y-auto font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center flex flex-col items-center">
          <img src="images/HN128.png" className="w-12 h-12 mb-3 rounded-xl shadow-2xl" alt="Halo Navigator" />
          <h2 className="text-base font-black uppercase tracking-[0.3em] opacity-90">Halo Navigator Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          <div className="space-y-6">
            {/* Rule Management */}
            <div className="bg-white/5 border border-white/10 rounded-[1.2rem] p-5 md:p-6 shadow-2xl">
              <h3 className="text-[#00ff87] text-[8px] font-black uppercase tracking-widest mb-4 opacity-60">Rule Management</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/30 uppercase ml-1">Label</label>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} type="text" placeholder="Prod" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00ff87]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/30 uppercase ml-1">Pattern</label>
                    <input value={pattern} onChange={(e) => setPattern(e.target.value)} type="text" placeholder="/prod" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00ff87]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-white/30 uppercase ml-1">Style</label>
                    <select value={style} onChange={(e) => setStyle(e.target.value as TabStyleType)} className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00ff87]">
                      <option value="full">Full Overlay</option>
                      <option value="border">Colored Frame</option>
                      <option value="top-bar">Accent Bar</option>
                      <option value="glow">Vignette Glow</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-white/30 uppercase ml-1">Color</label>
                    <div className="relative">
                      <input value={color} onChange={(e) => setColor(e.target.value)} type="color" className="w-full h-[36px] bg-transparent cursor-pointer border-none p-0 overflow-hidden" />
                      <div className="absolute inset-0 pointer-events-none rounded-lg border border-white/10" />
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase text-white/40">Effect Strength</span>
                    <span className="text-[#00ff87] font-black text-[10px]">{strength}</span>
                  </div>
                  <input type="range" min="0" max="10" value={strength} onChange={(e) => setStrength(parseInt(e.target.value))} className="w-full accent-[#00ff87] h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center bg-black/10 p-3 rounded-lg">
                   <div className="flex items-center gap-2">
                      <input id="sim-hide-label" type="checkbox" checked={hideLabel} onChange={(e) => setHideLabel(e.target.checked)} className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 accent-[#00ff87]" />
                      <label htmlFor="sim-hide-label" className="text-[9px] font-bold text-white/50 uppercase cursor-pointer">Hide Label</label>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase">Pos:</span>
                      <select value={labelPosition} onChange={(e) => setLabelPosition(e.target.value as LabelPosition)} className="flex-1 bg-black/20 border border-white/5 rounded p-1.5 text-[9px] font-black uppercase focus:outline-none">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                   </div>
                </div>

                <div className="flex gap-2">
                   {editingId ? (
                     <>
                        <button onClick={resetRuleForm} className="flex-1 bg-white/5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                        <button onClick={handleUpdateRule} className="flex-[2] bg-[#00ff87] text-[#1a2c33] py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#00ff87]/10 transition-all">Update Rule</button>
                     </>
                   ) : (
                     <button onClick={handleCreateRule} className="w-full bg-[#00ff87] text-[#1a2c33] py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#00ff87]/10 flex items-center justify-center gap-2 transition-all">
                       <PlusIcon className="w-4 h-4" /> Register Rule
                     </button>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
               {rules.map(rule => (
                 <div key={rule.id} className={`bg-white/5 border rounded-[1rem] p-4 flex items-center gap-4 group transition-all min-w-0 ${editingId === rule.id ? 'border-[#00ff87] ring-1 ring-[#00ff87]/20' : 'border-white/5 hover:border-[#00ff87]/20'}`}>
                    <div className="w-6 h-6 rounded-md shadow-lg flex-shrink-0" style={{ backgroundColor: rule.color }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs truncate">{rule.label} <span className="text-[8px] text-white/20 uppercase ml-2">{rule.styleType}</span></h4>
                      <p className="font-mono text-[9px] text-white/30 truncate">{rule.pattern}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                      <button onClick={() => startEdit(rule)} className="p-2 text-white/40 hover:text-[#00ff87] bg-white/5 rounded-md hover:bg-white/10"><EditIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeRule(rule.id)} className="p-2 text-white/40 hover:text-red-400 bg-white/5 rounded-md hover:bg-white/10"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[1.2rem] p-5 md:p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#00ff87] text-[8px] font-black uppercase tracking-widest opacity-60">
                  {editingCmdCode ? `Edit Shortcut: #${editingCmdCode.toUpperCase()}` : 'Navigator Shortcuts'}
                </h3>
                {editingCmdCode && (
                  <button onClick={cancelEditCmd} className="text-white/20 hover:text-white"><XIcon className="w-3 h-3" /></button>
                )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-[65px_1fr] gap-2">
                   <div className="relative">
                     <span className="absolute left-2.5 top-2.5 text-[#00ff87] font-black">#</span>
                     <input value={cmdCode} onChange={(e) => setCmdCode(e.target.value)} type="text" placeholder="KB" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 pl-7 text-xs focus:outline-none focus:border-[#00ff87]" />
                   </div>
                   <input value={cmdPath} onChange={(e) => setCmdPath(e.target.value)} type="text" placeholder="/kb" className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00ff87]" />
                </div>
                <div className="flex gap-2">
                  {editingCmdCode && (
                    <button onClick={cancelEditCmd} className="flex-1 bg-white/5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                  )}
                  <button onClick={editingCmdCode ? handleUpdateCmd : handleAddCmd} className={`${editingCmdCode ? 'flex-[2]' : 'w-full'} bg-[#00ff87] text-[#1a2c33] py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all`}>
                    {editingCmdCode ? 'Update Shortcut' : 'Add Shortcut'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {commands.map(cmd => {
                const isAbs = cmd.path.includes('://');
                return (
                  <div key={cmd.code} className={`flex items-center gap-3 p-3 rounded-lg border group transition-all min-w-0 ${editingCmdCode === cmd.code ? 'bg-[#00ff87]/5 border-[#00ff87]/40' : 'bg-black/10 border-white/5 hover:border-[#00ff87]/20'}`}>
                    <div className={`w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center font-black text-[9px] ${isAbs ? 'bg-indigo-500/10 text-indigo-400' : 'bg-[#00ff87]/10 text-[#00ff87]'}`}>#{cmd.code.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-mono truncate ${isAbs ? 'text-indigo-300/40' : 'text-white/30'}`}>{cmd.path}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-all">
                      <button onClick={() => startEditCmd(cmd)} className="p-2 text-white/40 hover:text-[#00ff87] bg-white/5 rounded-md hover:bg-white/10"><EditIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => removeCmd(cmd.code)} className="p-2 text-white/40 hover:text-red-400 bg-white/5 rounded-md hover:bg-white/10"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[280px] px-4 z-[200]">
        <button onClick={onSave} className="w-full h-12 bg-[#00ff87] text-[#1a2c33] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_8px_25px_rgba(0,255,135,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px]">
           <SaveIcon className="w-4 h-4" /> Deploy All Settings
        </button>
      </div>
    </div>
  );
};