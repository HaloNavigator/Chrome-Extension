// Halo Navigator - Background Service Worker

const injectContent = async (tabId, rule, commands) => {
  try {
    // Safety check for internal Chrome pages
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (activeRule, cmdList) => {
        const STYLE_ID = 'halo-nav-styles';
        const LABEL_ID = 'halo-nav-label';
        const PALETTE_ID = 'halo-nav-palette';
        const TOAST_ID = 'halo-nav-toast';
        
        let styleEl = document.getElementById(STYLE_ID);
        let labelEl = document.getElementById(LABEL_ID);
        if (styleEl) styleEl.remove();
        if (labelEl) labelEl.remove();
        
        if (!activeRule) return;

        // Apply Styles
        const strength = activeRule.strength ?? 5;
        if (strength > 0) {
          const style = document.createElement('style');
          style.id = STYLE_ID;
          let css = '';
          switch(activeRule.styleType) {
            case 'full': css = `body { background-color: ${activeRule.color}33 !important; }`; break;
            case 'border': css = `body { border: ${strength * 4}px solid ${activeRule.color} !important; border-top: 0 !important; min-height: 100vh; box-sizing: border-box; }`; break;
            case 'top-bar': css = `body::before { content: ""; position: fixed; top: 0; left: 0; right: 0; height: ${strength * 3}px; background: ${activeRule.color}; z-index: 2147483647; }`; break;
            case 'glow': css = `body { box-shadow: inset 0 0 ${strength * 15}px ${activeRule.color}aa !important; }`; break;
          }
          style.innerHTML = css;
          document.head.appendChild(style);
        }

        // Environment Label
        if (!activeRule.hideLabel) {
          const label = document.createElement('div');
          label.id = LABEL_ID;
          let posCss = 'right: 40px; left: auto;';
          if (activeRule.labelPosition === 'left') posCss = 'left: 40px; right: auto;';
          else if (activeRule.labelPosition === 'center') posCss = 'left: 50%; transform: translateX(-50%);';

          label.style.cssText = `
            position: fixed; top: 0; ${posCss}
            background: ${activeRule.color}; color: #fff; 
            padding: 4px 16px; font-size: 11px; font-weight: 800;
            border-radius: 0 0 8px 8px; z-index: 2147483647;
            text-transform: uppercase; font-family: sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3); pointer-events: none;
          `;
          label.textContent = `Env: ${activeRule.label}`;
          document.body.appendChild(label);
        }

        // --- SMART FORM FILLER UTILITY ---
        const fillFormFields = () => {
          // 1. SELECT TARGET: Find the main "Ticket details" form container
          let mainContainer = document.querySelector('.new-ticket') || 
                              document.querySelector('.new-ticket-form') || 
                              document.querySelector('.ticket-details-container') || 
                              document.body;

          // 2. REFINED EXCLUSION RULES
          const isExcluded = (el) => {
            return el.closest('.buttoncontainer.nav-search') || 
                   el.closest('.sc-top-bar') ||
                   el.closest('.sc-nav') ||
                   el.closest('.sc-side-panel') ||
                   el.closest('.sc-user-details-sidebar');
          };

          // 3. GATHER FIELDS
          const allPotential = mainContainer.querySelectorAll('input, textarea, select, [contenteditable="true"], .Select, .rc-tree-select, .fr-element');
          
          let count = 0;

          const triggerEvents = (el) => {
            ['focus', 'input', 'change', 'blur'].forEach(name => {
              el.dispatchEvent(new Event(name, { bubbles: true }));
            });
          };

          const getLabelText = (el) => {
            const formGroup = el.closest('.col-md-12, .col-md-6, .sc-form-group, .details-group');
            const labelEl = formGroup?.querySelector('label');
            const placeholder = el.getAttribute('placeholder') || '';
            const aria = el.getAttribute('aria-label') || '';
            return (labelEl?.innerText || placeholder || aria || el.name || el.id || '').toLowerCase();
          };

          allPotential.forEach(el => {
            if (isExcluded(el)) return;
            if (el.disabled || el.readOnly) return;

            if (el.tagName === 'INPUT' && (el.closest('.Select') || el.closest('.rc-tree-select'))) {
              return; 
            }

            const labelText = getLabelText(el);
            let filled = false;

            if (el.getAttribute('contenteditable') === 'true' || el.classList.contains('fr-element')) {
              el.innerHTML = "<p><strong>Automated Validation Active</strong></p><p>Testing ticket creation workflows in the <strong>" + (activeRule.label || 'Simulation') + "</strong> environment. This content is system-generated.</p>";
              filled = true;
            }
            else if (el.classList.contains('Select')) {
              const hiddenInput = el.querySelector('input[type="hidden"]');
              const valueDisplay = el.querySelector('.Select__single-value');

              if (hiddenInput) {
                let val = "1";
                let labelDisplay = "Selection Applied";

                if (labelText.includes('itil')) { val = "-1"; labelDisplay = "All"; }
                else if (labelText.includes('team')) { val = "EUC"; labelDisplay = "EUC"; }
                else if (labelText.includes('agent')) { val = "1"; labelDisplay = "Unassigned"; }
                else if (labelText.includes('type')) { val = "1"; labelDisplay = "Incident"; }
                
                hiddenInput.value = val;
                triggerEvents(hiddenInput);

                if (valueDisplay) {
                   valueDisplay.textContent = labelDisplay;
                }
                filled = true;
              }
            }
            else if (el.tagName === 'SELECT') {
              const validOptions = Array.from(el.options).filter(o => o.value && o.value !== '0' && o.value !== '');
              if (validOptions.length > 0) {
                el.value = validOptions[Math.floor(Math.random() * validOptions.length)].value;
                triggerEvents(el);
                filled = true;
              }
            }
            else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              if (el.type === 'hidden' || el.offsetParent === null) return;

              let val = "";
              if (labelText.includes('summary') || el.name === 'summary' || el.id.includes('summary')) {
                val = "ENV TEST: " + (activeRule.label || 'SIM') + " [" + Math.random().toString(36).substring(7).toUpperCase() + "]";
              } else if (labelText.includes('time')) {
                const now = new Date();
                val = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
              } else if (labelText.includes('date') || el.type === 'date') {
                val = new Date().toISOString().split('T')[0];
              } else if (el.type === 'number') {
                val = "1";
              } else {
                val = "Automated Test Data";
              }

              if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = true;
              } else {
                el.value = val;
              }
              triggerEvents(el);
              filled = true;
            }

            if (filled) count++;
          });

          // Notification
          let toast = document.getElementById(TOAST_ID);
          if (toast) toast.remove();
          toast = document.createElement('div');
          toast.id = TOAST_ID;
          toast.style.cssText = `
            position: fixed; bottom: 40px; right: 40px;
            background: #6366f1; color: white; padding: 12px 24px;
            border-radius: 12px; font-weight: 800; font-family: sans-serif;
            z-index: 2147483647; font-size: 13px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            animation: haloToastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; align-items: center; gap: 10px;
          `;
          toast.innerHTML = `<span>✨ Form Content Deployed (${count} fields)</span>`;
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
          }, 3000);
        };

        if (!document.getElementById('halo-nav-animations')) {
          const style = document.createElement('style');
          style.id = 'halo-nav-animations';
          style.innerHTML = `@keyframes haloToastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
          document.head.appendChild(style);
        }

        if (!window.haloNavigatorInitialized) {
          window.addEventListener('keydown', (e) => {
            if (e.key === '#' && !document.getElementById(PALETTE_ID)) {
              const tag = document.activeElement.tagName;
              if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement.isContentEditable) return;

              e.preventDefault();
              const palette = document.createElement('div');
              palette.id = PALETTE_ID;
              palette.style.cssText = `
                position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
                width: 440px; background: #264653; border: 2px solid #00ff87;
                border-radius: 16px; z-index: 2147483647; padding: 12px;
                box-shadow: 0 30px 60px rgba(0,0,0,0.6); font-family: sans-serif;
                color: white; animation: haloSlideDown 0.3s ease;
              `;
              palette.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom: 8px;">
                  <span style="color:#00ff87; font-weight:900; font-size:24px; font-style: italic;">#</span>
                  <input id="halo-cmd-input" type="text" placeholder="Jump or tool (try #fill)..." 
                    style="flex:1; background:transparent; border:none; outline:none; color:white; font-size:18px; font-weight:bold; box-shadow: none !important;">
                </div>
                <div id="halo-cmd-hints" style="display:flex; flex-wrap:wrap; gap:6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                  <span style="font-size: 10px; background:rgba(99,102,241,0.2); padding: 2px 6px; border-radius: 4px; color: #818cf8; font-weight: 800;">#FILL (Magic Form Fill)</span>
                  ${cmdList.map(c => `<span style="font-size: 10px; background:rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px; color: #00ff87; font-weight: 800;">#${c.code.toUpperCase()}</span>`).join('')}
                </div>
              `;
              document.body.appendChild(palette);
              const input = document.getElementById('halo-cmd-input');
              input.focus();
              
              const executeRedirect = (openNewTab = false) => {
                const val = input.value.trim().toLowerCase();
                if (val === 'fill') {
                  fillFormFields();
                  palette.remove();
                  return;
                }
                const cmd = cmdList.find(c => c.code === val);
                if (cmd) {
                  let targetUrl = '';
                  if (cmd.path.includes('://')) {
                    targetUrl = cmd.path;
                  } else {
                    const url = window.location.href;
                    const pattern = activeRule.pattern;
                    const patternIndex = url.toLowerCase().indexOf(pattern.toLowerCase());
                    let envBase = window.location.origin;
                    if (patternIndex !== -1) envBase = url.substring(0, patternIndex + pattern.length);
                    const cleanPath = cmd.path.startsWith('/') ? cmd.path : '/' + cmd.path;
                    const cleanBase = envBase.endsWith('/') ? envBase.slice(0, -1) : envBase;
                    targetUrl = cleanBase + cleanPath;
                  }
                  if (openNewTab) window.open(targetUrl, '_blank');
                  else window.location.href = targetUrl;
                }
                palette.remove();
              };

              input.onkeydown = (ev) => {
                if (ev.key === 'Enter') { ev.preventDefault(); executeRedirect(false); }
                else if (ev.key === 'Tab') { ev.preventDefault(); executeRedirect(true); }
                else if (ev.key === 'Escape') palette.remove();
              };
              const closer = (cEv) => { if (!palette.contains(cEv.target)) { palette.remove(); window.removeEventListener('mousedown', closer); } };
              window.addEventListener('mousedown', closer);
            }
          });
          window.haloNavigatorInitialized = true;
        }

        window.triggerHaloFill = fillFormFields;
      },
      args: [rule, commands]
    });
  } catch (e) {
    console.warn("Halo Navigator injection failed:", e);
  }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
    const data = await chrome.storage.local.get(['rules', 'commands']);
    const match = (data.rules || []).find(r => tab.url.toLowerCase().includes(r.pattern.toLowerCase()));
    if (match) injectContent(tabId, match, data.commands || []);
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === 'RELOAD_RULES') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
      const data = await chrome.storage.local.get(['rules', 'commands']);
      const match = (data.rules || []).find(r => tab.url.toLowerCase().includes(r.pattern.toLowerCase()));
      injectContent(tab.id, match, data.commands || []);
    }
  } else if (msg.type === 'FILL_FORM') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // CRITICAL: Block execution on protected browser pages
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (window.triggerHaloFill) window.triggerHaloFill();
          else alert("Halo Navigator filler not ready. Please refresh the page.");
        }
      });
    }
  }
});