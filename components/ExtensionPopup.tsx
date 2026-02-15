
import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon, SaveIcon, CommandIcon, HelpCircleIcon, GlobeIcon, SparklesIcon, MailIcon, CodeBracketIcon, ShieldCheckIcon, FileJsonIcon, LockIcon, PaletteIcon, SunIcon, MoonIcon, SettingsIcon, SearchIcon, DownloadIcon, UploadIcon } from './Icons';
import { NavigatorRule, TabStyleType, LabelPosition, CommandMapping, ThemeConfig, VaultEntry } from '../App';

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
  vault, onSaveVault, onUpdateVaultName, onApplyVault, onDeleteVault, onOpenOptions, onOpenSqlGen, onMagicFill, onFormatSql, onExport, onImport
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'shortcuts' | 'vault' | 'appearance' | 'tools' | 'links' | 'help'>('rules');
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
  const [shortcutSearch, setShortcutSearch] = useState('');
  
  const [vaultName, setVaultName] = useState('');
  const [renamingVaultId, setRenamingVaultId] = useState<string | null>(null);
  const [tempVaultName, setTempVaultName] = useState('');

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

  const handleStartRenaming = (entry: VaultEntry) => {
    setRenamingVaultId(entry.id);
    setTempVaultName(entry.name);
  };

  const handleSaveRename = () => {
    if (renamingVaultId && tempVaultName.trim()) {
      onUpdateVaultName(renamingVaultId, tempVaultName);
    }
    setRenamingVaultId(null);
  };

  const filteredShortcuts = useMemo(() => {
    const search = shortcutSearch.toLowerCase().trim();
    return [...commands]
      .filter(c => c.code.toLowerCase().includes(search) || c.path.toLowerCase().includes(search))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [commands, shortcutSearch]);

  const Kbd = ({ children }: { children?: React.ReactNode }) => (
    <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[9px] font-black text-white shadow-sm mx-1 uppercase">{children}</kbd>
  );

  const themePresets = [
    { name: 'halo', color: '#00ff87' },
    { name: 'midnight', color: '#818cf8' },
    { name: 'ember', color: '#f59e0b' },
    { name: 'frost', color: '#06b6d4' }
  ];

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
      <div className="flex items-center justify-between border-b px-2" style={{ borderColor: themeStyles.border }}>
        <div className="flex flex-1 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('rules')} className={`flex-1 min-w-[65px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'rules' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'rules' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'rules' ? themeStyles.accent : 'transparent' }}>Rules</button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'shortcuts' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'shortcuts' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'shortcuts' ? themeStyles.accent : 'transparent' }}>Jumps</button>
          <button onClick={() => setActiveTab('vault')} className={`flex-1 min-w-[65px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'vault' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'vault' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'vault' ? themeStyles.accent : 'transparent' }}>Vault</button>
          <button onClick={() => setActiveTab('appearance')} className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'appearance' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'appearance' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'appearance' ? themeStyles.accent : 'transparent' }}>Theme</button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 min-w-[65px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'tools' ? 'border-b-2' : 'opacity-40 hover:opacity-60'}`} style={{ color: activeTab === 'tools' ? themeStyles.accent : themeStyles.text, borderBottomColor: activeTab === 'tools' ? themeStyles.accent : 'transparent' }}>Tools</button>
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
            <div className={`p-5 rounded-3xl border transition-all space-y-4 shadow-2xl`} style={{ backgroundColor: themeStyles.card, borderColor: themeStyles.border }}>
               <button onClick={onSave} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl" style={{ backgroundColor: themeStyles.accent, color: '#000' }}>Save Rules</button>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="p-6 rounded-[2rem] border bg-black/5" style={{ borderColor: themeStyles.border }}>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-6" style={{ color: themeStyles.accent }}>Utility Tools</div>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={onExport} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border border-white/5 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                        <DownloadIcon className="w-4 h-4 text-emerald-400" /> Export
                      </button>
                      <div className="relative">
                        <input type="file" id="popup-import-file" accept=".json" onChange={onImport} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button className="w-full h-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl border border-white/5 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                          <UploadIcon className="w-4 h-4 text-emerald-400" /> Import
                        </button>
                      </div>
                   </div>
                   {/* ... rest of the tools ... */}
                </div>
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
              Access the terminal with <Kbd>#</Kbd> (Shift+3). Use these precise protocols for automation:
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white"># [CODE]</span> <div className="flex gap-1"><Kbd>Enter</Kbd><Kbd>Tab</Kbd></div></div>
                   <p className="text-[9px] opacity-50">Jumps to a module (Enter = Current Tab, Tab = New Browser Tab).</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white">NT [SEARCH]</span> <Kbd>Enter</Kbd></div>
                   <p className="text-[9px] opacity-50">Force-opens a module in a brand new <b>Halo Internal Tab</b>.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white">FILL</span> <Kbd>Enter</Kbd></div>
                   <p className="text-[9px] opacity-50">Runs the <b>Smart Fill</b> protocol to populate all mandatory form data.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white">PRETTY</span> <Kbd>Enter</Kbd></div>
                   <p className="text-[9px] opacity-50">Instantly formats and prettifies code in the SQL Report Editor.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white">CAP</span> <Kbd>Enter</Kbd></div>
                   <p className="text-[9px] opacity-50">Snapshots current form state to your local <b>Vault</b>.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black text-white">CAP [SEARCH]</span> <Kbd>Enter</Kbd></div>
                   <p className="text-[9px] opacity-50">Finds a snapshot by name and <b>force-injects</b> it into the page.</p>
                </div>
              </div>
            </HelpBlock>

            <HelpBlock icon={PaletteIcon} title="Visual HUD Interface">
              Customize how environments appear. Use <b style={{ color: themeStyles.accent }}>Ambient</b> for subtle immersion, <b style={{ color: themeStyles.accent }}>Frame</b> for high-visibility borders, or <b style={{ color: themeStyles.accent }}>Glow</b> for HUD-style edge lighting. The <b>Hanging Tab</b> shows your current context clearly.
            </HelpBlock>

            <HelpBlock icon={LockIcon} title="Form Data Vault">
              The Vault allows you to capture current form states (including rich text fields) and force-inject them into other tabs or future sessions. Use <Kbd>CAP</Kbd> in the palette for instant capturing.
            </HelpBlock>

            <HelpBlock icon={SparklesIcon} title="QA Automation Tools">
              The <b>Smart Fill</b> feature rapidly populates mandatory fields with valid testing data. Combine this with <b>Mandatory Ghosting</b> to visually pulse highlight any remaining required inputs that need attention.
            </HelpBlock>

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Questions or feedback?</p>
              <a href="mailto:halonavigator@gmail.com" className="text-[10px] font-bold mt-2 inline-block hover:opacity-70 transition-opacity" style={{ color: themeStyles.accent }}>halonavigator@gmail.com</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
