import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  PuzzlePieceIcon, 
  XIcon, 
  PlusIcon, 
  MoonIcon, 
  SunIcon,
  GlobeIcon 
} from './Icons';
import { NavigatorRule, Tab, ThemeConfig } from '../App';

interface BrowserHeaderProps {
  tabs: Tab[];
  activeTabId: string;
  onSetActiveTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onUrlChange: (url: string) => void;
  onExtensionClick: () => void;
  isExtensionOpen: boolean;
  rules: NavigatorRule[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeConfig: ThemeConfig;
}

/**
 * Calculates a high-contrast text color based on the background hex.
 */
function getContrastColor(hexColor: string): 'text-white' | 'text-slate-900' {
  if (!hexColor || hexColor === 'transparent') return 'text-slate-900';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'text-slate-900' : 'text-white';
}

/**
 * Returns a Google S2 Favicon URL for a given domain/URL.
 */
function getFaviconUrl(url: string): string | null {
  if (!url || url === 'newtab') return null;
  
  try {
    // Ensure we have a valid URL for parsing
    const cleanUrl = url.includes('://') ? url : `https://${url}`;
    const hostname = new URL(cleanUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch (e) {
    return null;
  }
}

/**
 * A sub-component to handle favicon loading with a dynamic status badge.
 */
const TabFavicon: React.FC<{ 
  url: string; 
  matchedRule?: NavigatorRule;
  isActive: boolean;
  isDarkMode: boolean;
  themeConfig: ThemeConfig;
}> = ({ url, matchedRule, isActive, isDarkMode, themeConfig }) => {
  const faviconUrl = getFaviconUrl(url);
  const [hasError, setHasError] = React.useState(false);

  const renderIcon = () => {
    if (!faviconUrl || hasError) {
      return (
        <GlobeIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
          matchedRule ? 'opacity-100' : 'opacity-40'
        } ${isActive && !matchedRule ? (isDarkMode ? 'text-slate-100' : 'text-slate-900') : ''}`} 
        style={matchedRule ? { color: matchedRule.color } : {}}
        />
      );
    }
    return (
      <img 
        src={faviconUrl} 
        alt="" 
        className="w-3.5 h-3.5 flex-shrink-0 rounded-sm shadow-sm"
        onError={() => setHasError(true)}
      />
    );
  };

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      {renderIcon()}
      {matchedRule && themeConfig.faviconTinting !== false && (
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-800 shadow-sm transition-all duration-300 z-20"
          style={{ backgroundColor: matchedRule.color }}
          title={`Status: ${matchedRule.label}`}
        />
      )}
    </div>
  );
};

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({ 
  tabs,
  activeTabId,
  onSetActiveTab,
  onAddTab,
  onCloseTab,
  onUrlChange, 
  onExtensionClick, 
  isExtensionOpen, 
  rules,
  isDarkMode,
  toggleDarkMode,
  themeConfig
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const activeMatchedRule = rules.find(rule => activeTab.url.toLowerCase().includes(rule.pattern.toLowerCase())) || null;

  return (
    <div className={`border-b p-2 flex flex-col gap-2 select-none transition-colors duration-500 ${isDarkMode ? 'bg-[#1a1f2e] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
      {/* Tabs Area */}
      <div className="flex items-end gap-0.5 px-2 pt-1 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const matchedRule = rules.find(rule => tab.url.toLowerCase().includes(rule.pattern.toLowerCase())) || null;
          const isActive = tab.id === activeTabId;
          
          let contrastClass = (isDarkMode ? 'text-slate-400' : 'text-slate-500');
          let tabStyle: React.CSSProperties = {};

          if (matchedRule) {
            const strength = matchedRule.strength ?? 4; 
            if (isActive) {
              switch (matchedRule.styleType) {
                case 'full':
                  contrastClass = getContrastColor(matchedRule.color);
                  tabStyle = { 
                    backgroundColor: matchedRule.color,
                    borderColor: matchedRule.color,
                    opacity: strength > 0 ? 1 : 0, 
                    boxShadow: strength > 0 ? `0 -2px 10px ${matchedRule.color}40` : 'none'
                  };
                  break;
                case 'border':
                  contrastClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
                  tabStyle = { 
                    backgroundColor: isDarkMode ? '#0f172a' : 'white',
                    border: strength > 0 ? `${strength}px solid ${matchedRule.color}` : 'none',
                  };
                  break;
                case 'top-bar':
                  contrastClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
                  tabStyle = { 
                    backgroundColor: isDarkMode ? '#0f172a' : 'white',
                    borderTop: strength > 0 ? `${strength}px solid ${matchedRule.color}` : 'none',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    borderTopColor: matchedRule.color
                  };
                  break;
                case 'glow':
                  contrastClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
                  tabStyle = { 
                    backgroundColor: isDarkMode ? '#0f172a' : 'white',
                    boxShadow: strength > 0 ? `inset 0 0 ${strength * 4}px ${matchedRule.color}80` : 'none'
                  };
                  break;
                default:
                  tabStyle = { backgroundColor: matchedRule.color };
              }
            } else {
              contrastClass = isDarkMode ? 'text-slate-300' : 'text-slate-700';
              tabStyle = { 
                backgroundColor: strength > 0 ? `${matchedRule.color}15` : 'transparent',
                borderBottom: strength > 0 ? `3px solid ${matchedRule.color}` : 'none'
              };
            }
          } else if (isActive) {
            tabStyle = { backgroundColor: isDarkMode ? '#0f172a' : 'white' };
            contrastClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
          }

          return (
            <div 
              key={tab.id}
              onClick={() => onSetActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg text-[10px] font-bold flex items-center gap-2 transition-all duration-300 relative min-w-[130px] max-w-[200px] cursor-pointer border-t border-x ${
                isActive 
                  ? `z-10 translate-y-[1px] shadow-sm ${!matchedRule ? (isDarkMode ? 'border-white/5' : 'border-slate-200') : ''}` 
                  : `${!matchedRule ? (isDarkMode ? 'bg-black/20 border-transparent hover:bg-black/30' : 'bg-slate-200/40 border-transparent hover:bg-slate-200') : ''}`
              } ${contrastClass}`}
              style={tabStyle}
            >
              <TabFavicon 
                url={tab.url} 
                matchedRule={matchedRule || undefined}
                isActive={isActive}
                isDarkMode={isDarkMode}
                themeConfig={themeConfig}
              />
              
              <span className="truncate flex-1">
                {matchedRule ? `[${matchedRule.label}] ` : ''}{tab.url === 'newtab' ? 'New Tab' : tab.url.split('/')[0]}
              </span>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                className={`rounded-full p-0.5 transition-colors hover:bg-black/10`}
              >
                <XIcon className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
        
        <button 
          onClick={onAddTab}
          className={`px-3 py-2 cursor-pointer text-sm font-light transition-all rounded-t-lg mb-[1px] ${isDarkMode ? 'text-slate-600 hover:text-indigo-400 hover:bg-black/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'}`}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          <ArrowLeft className={`w-4 h-4 cursor-pointer transition-colors ${isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`} />
          <ArrowRight className={`w-4 h-4 opacity-20 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
          <RotateCw className={`w-4 h-4 cursor-pointer transition-colors ${isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`} />
        </div>

        <div className={`flex-1 flex items-center border rounded-full px-4 py-1.5 gap-2 shadow-sm transition-all duration-500 ${
          isDarkMode ? 'bg-black/20 border-white/5 ring-4 ring-white/5' : 'bg-white border-slate-200 ring-4 ring-slate-400/5'
        }`}>
          <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-500 ${activeMatchedRule ? 'text-indigo-500' : 'text-green-500'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>HTTPS://</span>
          <input 
            type="text" 
            value={activeTab.url === 'newtab' ? '' : activeTab.url} 
            onChange={(e) => onUrlChange(e.target.value)}
            className={`w-full text-xs font-medium focus:outline-none bg-transparent transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}
            placeholder="Search or enter website address..."
          />
        </div>

        <div className={`flex items-center gap-2 border-l pl-3 transition-colors ${isDarkMode ? 'border-white/10' : 'border-slate-300'}`}>
          <button 
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'text-amber-400 hover:bg-black/20' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>
          <button 
            onClick={onExtensionClick}
            className={`p-1.5 rounded-md transition-all relative group overflow-hidden ${
              isExtensionOpen 
                ? 'bg-[#00ff87] text-[#0f172a] shadow-lg' 
                : `${isDarkMode ? 'text-slate-500 hover:bg-black/20' : 'text-slate-500 hover:bg-slate-200'}`
            }`}
          >
            <PuzzlePieceIcon className={`w-5 h-5 transition-transform duration-300 ${isExtensionOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};