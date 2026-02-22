import React from 'react';
import { ThemeConfig } from '../App';
import { Toggle } from './Toggle'; // Assuming Toggle is in a separate file

interface GlobalFeaturesProps {
  themeConfig: ThemeConfig;
  onUpdateTheme: (config: ThemeConfig) => void;
}

export const GlobalFeatures: React.FC<GlobalFeaturesProps> = ({ themeConfig, onUpdateTheme }) => {
  const isDarkMode = themeConfig.mode === 'dark';
  const accent = themeConfig.primaryColor;

  return (
    <div className={`border rounded-[2.5rem] p-8 shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
      <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2" style={{ color: accent }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
        Global Features
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest">Field ID Reveal</span>
            <span className="text-[9px] opacity-40 mt-0.5 font-medium">Show technical IDs on labels</span>
          </div>
          <Toggle checked={themeConfig.fieldIdReveal || false} onChange={(v) => onUpdateTheme({ ...themeConfig, fieldIdReveal: v })} accent={accent} />
        </div>
        <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest">Action Reveal</span>
            <span className="text-[9px] opacity-40 mt-0.5 font-medium">Show action IDs on buttons</span>
          </div>
          <Toggle checked={themeConfig.actionReveal || false} onChange={(v) => onUpdateTheme({ ...themeConfig, actionReveal: v })} accent={accent} />
        </div>
        <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest">Favicon Tinting</span>
            <span className="text-[9px] opacity-40 mt-0.5 font-medium">Add colored dot to tab icons</span>
          </div>
          <Toggle checked={themeConfig.faviconTinting !== false} onChange={(v) => onUpdateTheme({ ...themeConfig, faviconTinting: v })} accent={accent} />
        </div>
        <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>Mandatory Ghosting</span>
            <span className="text-[9px] opacity-40 mt-0.5 font-medium">Highlight empty required fields</span>
          </div>
          <Toggle checked={themeConfig.mandatoryGhosting || false} onChange={(v) => onUpdateTheme({ ...themeConfig, mandatoryGhosting: v })} accent="#ef4444" />
        </div>
      </div>
    </div>
  );
};
