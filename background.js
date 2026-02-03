
// Halo Navigator - Background Service Worker

const injectContent = async (tabId, rule, commands, themeConfig) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) return;

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (activeRule, cmdList, theme) => {
        // Update local state in the tab
        window.__HALO_NAV_STATE__ = {
          rule: activeRule || null,
          commands: cmdList || [],
          theme: theme || { mode: 'dark', primaryColor: '#00ff87', fieldIdReveal: false, mandatoryGhosting: false }
        };

        const currentTheme = window.__HALO_NAV_STATE__.theme;
        const primary = currentTheme?.primaryColor || '#00ff87';
        const isDark = currentTheme.mode === 'dark';

        // Clear existing rule styles if any
        const existingStyles = document.getElementById('halo-nav-injected-styles');
        if (existingStyles) existingStyles.remove();

        const applyMandatoryGhosting = () => {
          if (!window.__HALO_NAV_STATE__.theme?.mandatoryGhosting) {
            document.querySelectorAll('.halo-mandatory-ghost').forEach(el => el.classList.remove('halo-mandatory-ghost'));
            return;
          }
          
          document.querySelectorAll('label').forEach(label => {
            const labelText = (label.innerText || label.textContent || '').trim();
            const isMandatory = labelText.includes('*') || 
                               label.querySelector('.mandatory') || 
                               label.classList.contains('mandatory') ||
                               label.querySelector('.required-marker');

            if (!isMandatory) return;

            const targetId = label.getAttribute('for');
            let field = targetId ? document.getElementById(targetId) : null;
            
            const parent = label.closest('.halo-field-wrapper') || label.parentElement;
            if (!field || field.type === 'hidden') {
              field = parent.querySelector('input:not([type="hidden"]), select, textarea, .fr-view, .fr-box, .halo-input-container, [role="textbox"]');
            }

            if (!field) return;

            let isEmpty = false;
            let ghostTarget = field;

            const froalaBox = field.closest('.fr-box');
            if (froalaBox) {
                const view = froalaBox.querySelector('.fr-view');
                if (view) {
                    const textContent = (view.innerText || view.textContent || '').trim();
                    const placeholders = ['', 'Team: $SECTION Assets: $ALLASSETS', 'Team: $SECTION\nAssets: $ALLASSETS'];
                    isEmpty = placeholders.includes(textContent);
                    ghostTarget = froalaBox;
                }
            } else {
                const rawVal = (field.value || field.innerText || '').trim();
                const placeholderAttr = field.getAttribute('placeholder') || '';
                const isPlaceholderText = rawVal === 'Not set' || rawVal === 'Select a value...' || rawVal.toLowerCase() === placeholderAttr.toLowerCase();
                const startsWithSelect = rawVal.toLowerCase().startsWith('select a') && rawVal.split(' ').length < 5;
                isEmpty = rawVal === '' || isPlaceholderText || startsWithSelect;
                if (field.classList.contains('halo-dropdown-placeholder')) isEmpty = true;
                if (field.classList.contains('halo-datetime-picker') && rawVal.includes('--/--')) isEmpty = true;
            }

            if (isEmpty) ghostTarget.classList.add('halo-mandatory-ghost');
            else ghostTarget.classList.remove('halo-mandatory-ghost');
          });
        };

        const revealHaloFields = () => {
          if (!window.__HALO_NAV_STATE__.theme?.fieldIdReveal) {
            document.querySelectorAll('.halo-navigator-id').forEach(el => el.remove()); return;
          }
          document.querySelectorAll('label[for^="input-field-for-"]').forEach(label => {
            const forAttr = label.getAttribute('for') || '';
            if (!forAttr.includes('customfield_')) return;
            if (!label.querySelector('.halo-navigator-id')) {
              const numericMatch = forAttr.match(/\d+/);
              const firstThree = numericMatch ? numericMatch[0].substring(0, 3) : '';
              if (!firstThree) return;
              const idBadge = document.createElement('span');
              idBadge.className = 'halo-navigator-id'; 
              idBadge.innerText = `CF_${firstThree}`;
              idBadge.style.cssText = `display: inline-flex; align-items: center; font-size: 10px; font-weight: 800; margin-left: 8px; padding: 2px 8px; border-radius: 6px; background: ${primary}15; color: ${primary}; border: 1.5px solid ${primary}40; cursor: pointer; white-space: nowrap;`;
              idBadge.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.open(window.location.origin + `/config/custom/fields?id=${firstThree}`, '_blank'); };
              label.appendChild(idBadge);
            }
          });
        };

        const setupCommandPalette = () => {
          if (window.__HALO_PALETTE_SETUP__) return;
          window.addEventListener('keydown', (e) => { 
            const isHash = e.key === '#' || (e.key === '3' && e.shiftKey);
            const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
            if (isHash && !isInput) { 
              e.preventDefault(); 
              const wrapper = document.createElement('div');
              wrapper.id = 'halo-palette-wrapper';
              wrapper.style.cssText = `position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); display:flex; align-items:start; justify-content:center; padding-top:15vh; font-family:system-ui, -apple-system, sans-serif;`;
              
              const palette = document.createElement('div');
              palette.style.cssText = `width:580px; background:${isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)'}; border:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius:32px; box-shadow:0 30px 100px rgba(0,0,0,0.6), 0 0 50px -15px ${primary}33; overflow:hidden; animation: haloSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);`;
              
              palette.innerHTML = `
                <div style="height:3px; background:${primary};"></div>
                <div style="display:flex; align-items:center; padding:24px 32px; border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};">
                  <span style="font-size:32px; font-weight:900; color:${primary}; font-style:italic; margin-right:20px;">#</span>
                  <input type="text" id="halo-palette-input" placeholder="Search Protocol..." autocomplete="off" style="flex:1; background:transparent; border:none; outline:none; font-size:24px; color:${isDark ? '#ffffff' : '#0f172a'}; font-weight:800;">
                </div>
                <div id="halo-palette-results" style="max-height:400px; overflow-y:auto; padding:12px;"></div>
                <div style="padding:16px 32px; background:${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)'}; border-top:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; font-size:10px; font-weight:900; letter-spacing:0.1em; color:${isDark ? 'rgba(255,255,255,0.6)' : '#64748b'};">
                  <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
                    <span>ENTER ↵ OPEN</span>
                    <span>↗ NEW TAB (TAB)</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; opacity: 0.6;">
                    <span>CLICK OPEN</span>
                    <span>CTRL/⌘+CLICK NEW TAB</span>
                  </div>
                </div>
              `;
              
              document.body.appendChild(wrapper);
              wrapper.appendChild(palette);
              const input = document.getElementById('halo-palette-input');
              const results = document.getElementById('halo-palette-results');
              input.focus();

              let selectedIndex = 0;
              let currentFiltered = [];
              let lastMouseX = -1;
              let lastMouseY = -1;

              const execute = (cmd, newTab = false) => {
                if (!cmd) return;
                if (cmd.path === 'magic-fill') {
                   chrome.runtime.sendMessage({ type: 'FILL_FORM' });
                } else {
                   const url = cmd.path.startsWith('http') ? cmd.path : window.location.origin + (cmd.path.startsWith('/') ? '' : '/') + cmd.path;
                   if (newTab) {
                     window.open(url, '_blank');
                   } else {
                     window.location.href = url;
                   }
                }
                wrapper.remove();
              };

              const render = () => {
                const search = input.value.toLowerCase().trim();
                
                // Prioritized filtering
                currentFiltered = cmdList.map(c => {
                  let score = 0;
                  const code = c.code.toLowerCase();
                  const path = c.path.toLowerCase();
                  
                  if (code === search) score += 1000;
                  else if (code.startsWith(search)) score += 500;
                  else if (code.includes(search)) score += 100;
                  
                  if (path.startsWith(search) || path.startsWith('/' + search)) score += 50;
                  else if (path.includes(search)) score += 10;
                  
                  return { ...c, score };
                }).filter(c => c.score > 0 || search === '').sort((a, b) => b.score - a.score);

                if (search === 'fill') currentFiltered.unshift({ code: 'FILL', path: 'magic-fill', isSpecial: true });
                
                results.innerHTML = currentFiltered.map((c, i) => {
                  const isSelected = i === selectedIndex;
                  const itemColor = isSelected ? primary : (isDark ? '#ffffff' : '#0f172a');
                  return `
                    <div data-index="${i}" class="halo-result-item" style="padding:16px 24px; border-radius:24px; display:flex; align-items:center; cursor:pointer; background:${isSelected ? primary + '33' : 'transparent'}; border: 1px solid ${isSelected ? primary + '66' : 'transparent'}; transition: 0.1s; margin-bottom: 4px;">
                      <span style="font-weight:900; font-size:13px; color:${itemColor}; min-width:100px; opacity: 1.0;">#${c.code.toUpperCase()}</span>
                      <span style="font-size:12px; color: ${itemColor}; opacity:${isSelected ? 1.0 : 0.8}; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex: 1;">${c.path}</span>
                    </div>
                  `;
                }).join('');
              };

              results.onclick = (e) => {
                const item = e.target.closest('.halo-result-item');
                if (item) {
                  const index = parseInt(item.getAttribute('data-index'));
                  const isNewTab = e.ctrlKey || e.metaKey;
                  execute(currentFiltered[index], isNewTab);
                }
              };

              // Mouse safeguard: only update index if mouse actually moved
              results.onmousemove = (e) => {
                if (e.clientX === lastMouseX && e.clientY === lastMouseY) return;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                
                const item = e.target.closest('.halo-result-item');
                if (item) {
                  const index = parseInt(item.getAttribute('data-index'));
                  if (selectedIndex !== index) {
                    selectedIndex = index;
                    render();
                  }
                }
              };

              input.oninput = () => { selectedIndex = 0; render(); };
              input.onkeydown = (e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = (selectedIndex + 1) % Math.max(1, currentFiltered.length); render(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = (selectedIndex - 1 + currentFiltered.length) % Math.max(1, currentFiltered.length); render(); }
                else if (e.key === 'Tab') { e.preventDefault(); if (currentFiltered[selectedIndex]) execute(currentFiltered[selectedIndex], true); }
                else if (e.key === 'Enter') { e.preventDefault(); if (currentFiltered[selectedIndex]) execute(currentFiltered[selectedIndex], e.ctrlKey || e.metaKey); }
                else if (e.key === 'Escape') { wrapper.remove(); }
              };
              wrapper.onclick = (e) => { if (e.target === wrapper) wrapper.remove(); };
              render();
            } 
          });
          window.__HALO_PALETTE_SETUP__ = true;
        };

        // Active Rule Application
        if (activeRule) {
          const ruleStyle = document.createElement('style');
          ruleStyle.id = 'halo-nav-injected-styles';
          let css = '';
          const strength = activeRule.strength ?? 4;
          const color = activeRule.color;

          switch (activeRule.styleType) {
            case 'full':
              css = `body::after { content: ""; position: fixed; inset: 0; background: ${color}; opacity: ${strength / 50}; pointer-events: none; z-index: 999997; }`;
              break;
            case 'border':
              css = `body { border: ${strength}px solid ${color} !important; min-height: 100vh; box-sizing: border-box; }`;
              break;
            case 'top-bar':
              css = `body::after { content: ""; position: fixed; top: 0; left: 0; right: 0; height: ${strength}px; background: ${color}; z-index: 999998; pointer-events: none; box-shadow: 0 0 15px ${color}88; }`;
              break;
            case 'glow':
              css = `body { box-shadow: inset 0 0 ${strength * 20}px ${color}66 !important; min-height: 100vh; }`;
              break;
          }

          if (activeRule.label && !activeRule.hideLabel) {
            const pos = activeRule.labelPosition || 'right';
            const flexPos = pos === 'center' ? 'center' : pos === 'left' ? 'flex-start' : 'flex-end';
            css += `
              body::before { 
                content: "${activeRule.label}"; 
                position: fixed; 
                top: 10px; 
                left: 0; 
                right: 0; 
                display: flex; 
                justify-content: ${flexPos}; 
                padding: 0 40px; 
                font-family: system-ui, sans-serif; 
                font-size: 10px; 
                font-weight: 900; 
                text-transform: uppercase; 
                letter-spacing: 0.15em; 
                color: ${color}; 
                opacity: 0.8; 
                z-index: 999999; 
                pointer-events: none;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
            `;
          }
          ruleStyle.innerHTML = css;
          document.head.appendChild(ruleStyle);
        }

        if (!window.__HALO_NAV_OBSERVER__) {
          window.__HALO_NAV_OBSERVER__ = new MutationObserver(() => { revealHaloFields(); applyMandatoryGhosting(); });
          window.__HALO_NAV_OBSERVER__.observe(document.body, { childList: true, subtree: true });
        }
        revealHaloFields(); 
        applyMandatoryGhosting();
        setupCommandPalette();
        
        if (!document.getElementById('halo-nav-utility-styles')) {
          const s = document.createElement('style');
          s.id = 'halo-nav-utility-styles';
          s.innerHTML = `
            @keyframes haloSlideDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } }
            @keyframes haloPulseRed { 
              0%, 100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
              50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 10px 2px rgba(239, 68, 68, 0.4); }
            }
            .halo-mandatory-ghost { animation: haloPulseRed 2.5s infinite ease-in-out !important; border: 2.2px solid #ef4444 !important; border-radius: 8px !important; }
          `;
          document.head.appendChild(s);
        }
      },
      args: [rule, commands, themeConfig]
    });
  } catch (e) { console.warn("Halo Navigator Injection Failed:", e); }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig']);
    const rules = data.rules || [];
    const url = tab.url.toLowerCase();
    
    // Better matching logic
    const match = rules.find(r => {
      const pattern = r.pattern.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return cleanUrl.includes(pattern);
    });
    
    injectContent(tabId, match, data.commands || [], data.themeConfig);
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === 'RELOAD_RULES') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && !tab.url.startsWith('chrome://')) {
      const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig']);
      const rules = data.rules || [];
      const url = tab.url.toLowerCase();
      const match = rules.find(r => {
        const pattern = r.pattern.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return cleanUrl.includes(pattern);
      });
      injectContent(tab.id, match, data.commands || [], data.themeConfig);
    }
  } else if (msg.type === 'FILL_FORM') {
    const tabId = sender.tab ? sender.tab.id : (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
    if (!tabId) return;
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const fill = (sel, val) => {
          const el = document.querySelector(sel);
          if (el) {
            if (el.classList.contains('fr-view')) {
                el.innerHTML = val.replace(/\n/g, '<br>');
            } else {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        };
        fill('input[name="summary"], #input-summary', 'UAT Magic Fill: All regression tests passed. Verified.');
        fill('.fr-view', '1. Quiesce connections.\n2. Apply patches.\n3. Verify services.\n4. Close change.');
        document.querySelectorAll('input.halo-input, textarea.halo-input').forEach(i => { if (!i.value) fill(`#${i.id}`, 'Automated Test Value'); });
      }
    });
  }
});
