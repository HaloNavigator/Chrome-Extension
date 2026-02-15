import React from 'react';
import { NavigatorRule, CommandMapping, ThemeConfig } from '../App';

interface SimulatedPageProps {
  url: string;
  matchedRule: NavigatorRule | null;
  themeConfig: ThemeConfig;
  commands?: CommandMapping[];
  onNavigate?: (url: string) => void;
  onOpenNewTab?: (url: string) => void;
  formData: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

export const SimulatedPage: React.FC<SimulatedPageProps> = ({ 
  url, matchedRule, themeConfig, formData, onInputChange, onOpenNewTab 
}) => {
  const isDarkMode = themeConfig?.mode === 'dark';
  const accent = themeConfig.primaryColor;
  const isGhostingActive = themeConfig.mandatoryGhosting !== false;

  const FieldRevealBadge = ({ id, isCustom = false }: { id: string, isCustom?: boolean }) => {
    if (!themeConfig.fieldIdReveal || !isCustom) return null;
    
    const firstThree = id.substring(0, 3);
    const displayId = `CF_${firstThree}`;
    
    return (
      <span 
        onClick={(e) => {
          e.stopPropagation();
          onOpenNewTab?.(`/config/custom/fields?id=${firstThree}`);
        }}
        className="inline-flex items-center ml-2 px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-tight cursor-pointer transition-all hover:scale-110 active:scale-95"
        style={{ 
          backgroundColor: `${accent}15`, 
          color: accent, 
          border: `1px solid ${accent}40` 
        }}
        title={`Configure Custom Field ${firstThree}`}
      >
        {displayId}
      </span>
    );
  };

  const InputField = ({ 
    label, 
    value, 
    fieldId, 
    isMandatory = false, 
    isCustom = false, 
    type = 'dropdown',
    placeholder = 'Select a value...'
  }: { 
    label: string, 
    value: string, 
    fieldId: string, 
    isMandatory?: boolean, 
    isCustom?: boolean,
    type?: 'dropdown' | 'richtext' | 'datetime' | 'text',
    placeholder?: string
  }) => {
    // Precise empty check
    const cleanValue = (value || '').trim();
    const isActuallyEmpty = !cleanValue || 
                           cleanValue === '' || 
                           cleanValue === 'Not set' || 
                           cleanValue.toLowerCase() === (placeholder || '').toLowerCase() ||
                           (type === 'dropdown' && cleanValue.toLowerCase().startsWith('select a'));
    
    const showGhost = isGhostingActive && isMandatory && isActuallyEmpty;

    const baseClasses = `p-3 rounded-xl border transition-all text-[11px] group relative ${
      isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-slate-200'
    } ${showGhost ? 'halo-mandatory-ghost' : ''}`;

    return (
      <div className="space-y-1.5 w-full">
        <label className="text-[10px] font-semibold opacity-70 flex items-center tracking-tight">
          {label} {isMandatory && <span className="text-red-500 ml-0.5 font-bold">*</span>}
          <FieldRevealBadge id={fieldId} isCustom={isCustom} />
        </label>
        
        {type === 'text' && (
          <div className={`${baseClasses} min-h-[38px] flex items-center`}>
            <span className={isActuallyEmpty ? 'opacity-30' : 'opacity-90 font-medium'}>
              {value || placeholder}
            </span>
          </div>
        )}

        {type === 'dropdown' && (
          <div className={`${baseClasses} min-h-[38px] flex items-center justify-between`}>
            <span className={isActuallyEmpty ? 'opacity-30' : 'opacity-90 font-medium'}>
              {value || placeholder}
            </span>
            <div className="flex items-center gap-2 opacity-20">
               {value && <span className="text-[10px]">✕</span>}
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        )}

        {type === 'richtext' && (
          <div className={`${baseClasses} min-h-[140px] flex flex-col pt-2 shadow-sm`}>
            <div className="flex gap-4 border-b border-inherit pb-2 mb-2 opacity-20">
               {['B', 'I', 'U', '•', '1.', '🔗', '🖼️', '📊', '🙂', '+', '−', 'A', '<>'].map((tool, i) => <span key={i} className="text-[9px] font-black">{tool}</span>)}
            </div>
            <div className="flex-1">
                <span className={isActuallyEmpty ? 'opacity-30 italic' : 'opacity-80 whitespace-pre-line'}>
                {value || 'Enter details here...'}
                </span>
            </div>
          </div>
        )}

        {type === 'datetime' && (
          <div className="flex gap-2">
            <div className={`${baseClasses} flex-1 flex items-center gap-2 py-2`}>
              <div className="w-3.5 h-3.5 rounded border border-slate-400/20" />
              <span className="opacity-30">--/--/----</span>
            </div>
            <div className={`${baseClasses} w-32 flex items-center gap-2 py-2`}>
              <span className="opacity-30">--:--</span>
              <svg className="w-3.5 h-3.5 ml-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Environment Label positioning logic
  const getLabelPositionClasses = () => {
    if (!matchedRule) return "";
    const pos = matchedRule.labelPosition || 'right';
    if (pos === 'center') return "left-1/2 -translate-x-1/2";
    if (pos === 'left') return "left-12";
    return "right-12";
  };

  return (
    <div className={`flex-1 p-0 transition-all duration-500 flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f4f7fa]'}`}>
      
      {/* Professional Hanging Tab Label */}
      {matchedRule && !matchedRule.hideLabel && (
        <div 
          className={`absolute top-0 z-[60] px-6 py-1.5 rounded-b-[14px] border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] shadow-2xl transition-all duration-500 flex items-center justify-center ${getLabelPositionClasses()}`}
          style={{ 
            backgroundColor: matchedRule.color, 
            borderColor: matchedRule.color,
            boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 15px ${matchedRule.color}44`
          }}
        >
          <span 
            className="text-[11px] font-black uppercase tracking-[0.2em] text-[#121212] select-none"
            style={{ textShadow: '0 0.5px 0 rgba(255,255,255,0.1)' }}
          >
            {matchedRule.label || 'Connected'}
          </span>
        </div>
      )}

      <div className="z-10 w-full shrink-0">
          <div className="bg-[#f97316] text-white px-8 py-5 rounded-tr-[2rem] flex items-center justify-between shadow-lg">
             <div className="flex items-center gap-3">
                <span className="text-lg font-bold tracking-tight">Ticket details</span>
             </div>
          </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Category" 
                    value={formData['itil_ticket_type'] || "JML > Joiner"} 
                    fieldId="category" 
                    isMandatory={true} 
                  />
                  <InputField 
                    label="Ticket Type" 
                    value={formData['ticket_type'] || "Change Request"} 
                    fieldId="ticket_type" 
                    isMandatory={true} 
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField 
                    label="Change Type" 
                    value={formData['change_type']} 
                    fieldId="change_type" 
                    isMandatory={true} 
                    placeholder="Select a value..."
                  />
                  <InputField 
                    label="Risk" 
                    value={formData['risk']} 
                    fieldId="risk" 
                    isMandatory={true} 
                    placeholder="Select a value..."
                  />
                  <InputField 
                    label="Impact" 
                    value={formData['impact']} 
                    fieldId="impact" 
                    isMandatory={true} 
                    placeholder="Select a value..."
                  />
              </div>

              <InputField 
                label="Summary" 
                value={formData['uat_summary']} 
                fieldId="summary" 
                isMandatory={true} 
                type="text"
                placeholder=""
              />

              <div className="space-y-6">
                  <InputField 
                    label="Details" 
                    value={formData['details'] || `Team: $SECTION\nAssets: $ALLASSETS`}
                    fieldId="details" 
                    isMandatory={true} 
                    type="richtext"
                  />
                  
                  <InputField 
                    label="Change Plan" 
                    value={formData['change_plan']} 
                    fieldId="customfield_169" 
                    isMandatory={true} 
                    isCustom={true}
                    type="richtext"
                  />

                  <InputField 
                    label="Test Plan" 
                    value={formData['test_plan']} 
                    fieldId="customfield_170" 
                    isMandatory={true} 
                    isCustom={true}
                    type="richtext"
                  />
              </div>
          </div>
      </div>

      <div className="absolute bottom-8 right-8 z-50">
          <button className="bg-[#f97316] text-white px-10 py-3.5 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Submit
          </button>
      </div>

      <style>{`
        @keyframes haloMandatoryBreathSim {
          0% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.4); }
          100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .halo-mandatory-ghost {
          animation: haloMandatoryBreathSim 2.5s infinite ease-in-out !important;
          border-width: 2px !important;
          border-style: solid !important;
          border-color: #ef4444 !important;
          z-index: 5 !important;
        }
      `}</style>
    </div>
  );
};
