// Halo Navigator - Background Service Worker

const injectContent = async (tabId, rule, commands, themeConfig) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) return;

    const { vault, actions } = await chrome.storage.local.get(['vault', 'actions']);

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (activeRule, cmdList, theme, vaultEntries, actionList) => {
        window.__HALO_NAV_STATE__ = {
          rule: activeRule || null,
          commands: cmdList || [],
          theme: theme || { mode: 'dark', primaryColor: '#00ff87', fieldIdReveal: false, mandatoryGhosting: false, actionReveal: false },
          vault: vaultEntries || [],
          actions: actionList || []
        };

        const currentTheme = window.__HALO_NAV_STATE__.theme;
        const primary = currentTheme?.primaryColor || '#00ff87';
        const isDark = currentTheme.mode === 'dark';

        const existingStyles = document.getElementById('halo-nav-injected-styles');
        if (existingStyles) existingStyles.remove();

        const showHaloBanner = (message, type = 'success') => {
          const existing = document.getElementById('halo-nav-status-banner');
          if (existing) existing.remove();

          const banner = document.createElement('div');
          banner.id = 'halo-nav-status-banner';
          const bgColor = isDark ? '#1e293b' : '#ffffff';
          const textColor = isDark ? '#f8fafc' : '#1e293b';
          const borderColor = type === 'success' ? primary : (type === 'btlc' ? '#f59e0b' : '#ef4444');

          banner.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            z-index: 2147483647; display: flex; align-items: center; gap: 12px;
            padding: 12px 24px; background: ${bgColor}; color: ${textColor};
            border-radius: 16px; border: 2px solid ${borderColor};
            box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${borderColor}44;
            font-family: system-ui, -apple-system, sans-serif; font-weight: 800;
            font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;
            animation: haloBannerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            pointer-events: none;
          `;

          const icon = type === 'success' ? '🛡️' : (type === 'btlc' ? '🚛' : '⚠️');
          banner.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
          document.body.appendChild(banner);

          if (!document.getElementById('halo-banner-styles')) {
            const s = document.createElement('style');
            s.id = 'halo-banner-styles';
            s.innerHTML = `
              @keyframes haloBannerIn { from { opacity: 0; transform: translate(-50%, -40px); } to { opacity: 1; transform: translate(-50%, 0); } }
              @keyframes haloBannerOut { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -40px); } }
            `;
            document.head.appendChild(s);
          }

          setTimeout(() => {
            banner.style.animation = 'haloBannerOut 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => banner.remove(), 500);
          }, 3500);
        };

        const applyMandatoryGhosting = () => {
          if (!window.__HALO_NAV_STATE__.theme?.mandatoryGhosting) {
            document.querySelectorAll('.halo-mandatory-ghost').forEach(el => el.classList.remove('halo-mandatory-ghost'));
            return;
          }
          
          document.querySelectorAll('label').forEach(label => {
            const labelText = (label.innerText || label.textContent || '').trim();
            const isMandatory = labelText.includes('*') || label.querySelector('.mandatory') || label.classList.contains('mandatory') || label.querySelector('.required-marker');
            if (!isMandatory) return;
            const targetId = label.getAttribute('for');
            let field = targetId ? document.getElementById(targetId) : null;
            const parent = label.closest('.halo-field-wrapper') || label.parentElement;
            if (!field || field.type === 'hidden') field = parent.querySelector('input:not([type="hidden"]), select, textarea, .fr-view, .fr-box, .halo-input-container, [role="textbox"]');
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
                isEmpty = rawVal === '' || isPlaceholderText || (rawVal.toLowerCase().startsWith('select a') && rawVal.split(' ').length < 5);
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

        const revealHaloActions = () => {
          if (!window.__HALO_NAV_STATE__.theme?.actionReveal) {
            document.querySelectorAll('.halo-navigator-action-id').forEach(el => el.remove()); return;
          }
          
          // Target traditional outcome buttons
          document.querySelectorAll('.outcomebutton').forEach(button => {
            if (button.querySelector('.halo-navigator-action-id')) return;
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr) {
              const match = onclickAttr.match(/\d+/);
              if (match) {
                const actionId = match[0];
                const idBadge = document.createElement('span');
                idBadge.className = 'halo-navigator-action-id';
                idBadge.innerText = `ACT_${actionId}`;
                idBadge.style.cssText = `display: inline-flex; align-items: center; font-size: 10px; font-weight: 800; margin-left: 8px; padding: 2px 8px; border-radius: 6px; background: ${primary}15; color: ${primary}; border: 1.5px solid ${primary}40; cursor: pointer; white-space: nowrap;`;
                idBadge.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.open(window.location.origin + `/config/tickets/outcomes?id=${actionId}`, '_blank'); };
                button.appendChild(idBadge);
              }
            }
          });

          // Target dropdown menu items
          document.querySelectorAll('.menu.transition .item, .ui.dropdown .menu .item').forEach(item => {
            if (item.querySelector('.halo-navigator-action-id')) return;
            const id = item.getAttribute('id');
            if (id && /^\d+$/.test(id)) {
              const idBadge = document.createElement('span');
              idBadge.className = 'halo-navigator-action-id';
              idBadge.innerText = `ACT_${id}`;
              idBadge.style.cssText = `display: inline-flex; align-items: center; font-size: 10px; font-weight: 800; margin-left: 8px; padding: 2px 8px; border-radius: 6px; background: ${primary}15; color: ${primary}; border: 1.5px solid ${primary}40; cursor: pointer; white-space: nowrap;`;
              idBadge.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.open(window.location.origin + `/config/tickets/outcomes?id=${id}`, '_blank'); };
              item.appendChild(idBadge);
            }
          });
        };

        const setupCommandPalette = () => {
          if (window.__HALO_PALETTE_SETUP__) return;

          chrome.runtime.onMessage.addListener((request) => {
            if (request.type === 'VAULT_UPDATED' && request.vault) window.__HALO_NAV_STATE__.vault = request.vault;
            if (request.type === 'SHOW_BANNER') showHaloBanner(request.message, request.bannerType || 'success');
          });

          window.addEventListener('keydown', (e) => { 
            const isHash = e.key === '#' || (e.key === '3' && e.shiftKey);
            const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
            if (isHash && !isInput) { 
              e.preventDefault(); 
              const wrapper = document.createElement('div');
              wrapper.id = 'halo-palette-wrapper';
              wrapper.style.cssText = `position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); display:flex; align-items:start; justify-content:center; padding-top:15vh; font-family:system-ui, -apple-system, sans-serif;`;
              
              const palette = document.createElement('div');
              palette.style.cssText = `width:580px; background:${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)'}; border:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; border-radius:32px; box-shadow:0 30px 100px rgba(0,0,0,0.6), 0 0 50px -15px ${primary}33; overflow:hidden; animation: haloSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);`;
              
              const kbStyle = `padding: 2px 5px; border-radius: 4px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: ${isDark ? 'white' : 'black'}; font-size: 8px; font-weight: 900; margin-right: 4px;`;
              const guideLabelStyle = `font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.4; color: ${isDark ? 'white' : 'black'};`;

              palette.innerHTML = `
                <div style="height:3px; background:${primary};"></div>
                <div style="display:flex; align-items:center; padding:24px 32px; border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};">
                  <span style="font-size:32px; font-weight:900; color:${primary}; font-style:italic; margin-right:20px;">#</span>
                  <input type="text" id="halo-palette-input" placeholder="Search Protocol..." autocomplete="off" style="flex:1; background:transparent; border:none; outline:none; font-size:24px; color:${isDark ? '#ffffff' : '#0f172a'}; font-weight:800;">
                </div>
                <div style="padding:10px 32px; background:rgba(0,0,0,0.05); border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; display:flex; gap:20px; overflow-x:auto;">
                  <div style="display:flex; align-items:center; white-space:nowrap;"><kbd style="${kbStyle}"># [NUM]</kbd><span style="${guideLabelStyle}">Actions</span></div>
                  <div style="display:flex; align-items:center; white-space:nowrap;"><kbd style="${kbStyle}">NT</kbd><span style="${guideLabelStyle}">New Tab</span></div>
                  <div style="display:flex; align-items:center; white-space:nowrap;"><kbd style="${kbStyle}">CAP</kbd><span style="${guideLabelStyle}">Capture</span></div>
                </div>
                <div id="halo-palette-results" style="max-height:400px; overflow-y:auto; padding:12px;"></div>
                <div style="padding:16px 32px; background:${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)'}; border-top:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; font-size:10px; font-weight:900; letter-spacing:0.1em; color:${isDark ? 'rgba(255,255,255,0.6)' : '#64748b'};">
                  <div style="display:flex; justify-content:space-between; margin-bottom: 6px;"><span>ENTER ↵ OPEN / TRIGGER</span><span># + NUMBER TRIGGER</span></div>
                  <div style="display:flex; justify-content:space-between; opacity: 0.6;"><span>CLICK OPEN</span><span>↗ NEW TAB (TAB)</span></div>
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
                if (cmd.path.startsWith('action:')) {
                   const actionId = cmd.path.replace('action:', '');
                   const action = window.__HALO_NAV_STATE__.actions.find(a => a.id === actionId);
                   if (action) {
                       const targetId = action.type === 'button' 
                         ? (action.elementId.startsWith('action-button-') ? action.elementId : `action-button-${action.elementId}`)
                         : action.elementId;
                       const el = document.getElementById(targetId);
                       if (el) { el.click(); showHaloBanner(`Action: ${action.name} Triggered`); }
                       else { showHaloBanner(`Button not found: #${targetId}`, 'error'); }
                   }
                } else if (cmd.path === 'magic-fill') chrome.runtime.sendMessage({ type: 'FILL_FORM' });
                else if (cmd.path === 'vault:capture') chrome.runtime.sendMessage({ type: 'CAPTURE_FORM' });
                else if (cmd.path === 'format-sql') chrome.runtime.sendMessage({ type: 'FORMAT_SQL' });
                else if ((cmd.path || '').startsWith('vault:apply:')) {
                   const id = cmd.path.replace('vault:apply:', '');
                   const entry = window.__HALO_NAV_STATE__.vault.find(v => v.id === id);
                   if (entry) {
                      const formData = entry.data;
                      Object.keys(formData).forEach(key => {
                          const val = formData[key];
                          try {
                              const selectors = [`#${key}`, `[name="${key}"]`, `[data-field-name="${key}"]`, `[placeholder="${key}"]`, `[aria-label="${key}"]` ];
                              let targets = [];
                              for (let sel of selectors) { const found = document.querySelectorAll(sel); if (found.length > 0) { targets = Array.from(found); break; } }
                              if (targets.length === 0 && key.startsWith('froala_')) { const index = parseInt(key.split('_')[1]); const views = document.querySelectorAll('.fr-view'); if (views[index]) targets = [views[index]]; }
                              if (targets.length === 0) return;
                              targets.forEach(el => {
                                  if (el.classList.contains('fr-view')) el.innerHTML = val;
                                  else if (el.classList.contains('fr-box')) { const view = el.querySelector('.fr-view'); if (view) view.innerHTML = val; }
                                  else if (el.tagName === 'SELECT') el.value = val;
                                  else {
                                      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set || Object.getOwnPropertyDescriptor(el.constructor.prototype, "value")?.set;
                                      if (nativeSetter) nativeSetter.call(el, val); else el.value = val;
                                  }
                                  ['input', 'change', 'blur', 'keyup', 'keydown', 'keypress'].forEach(evName => el.dispatchEvent(new Event(evName, { bubbles: true })));
                              });
                          } catch (err) {}
                      });
                      showHaloBanner(`Snapshot Injected: ${entry.name}`);
                   }
                } else if ((cmd.path || '').startsWith('effect:new-halo-tab')) {
                   const btn = document.querySelector('button.haloCircleBtn[title="New Tab"], button[title="New Tab"], button[aria-label="New Tab"], .crumbs[title="New Tab"] a, .fa-plus')?.closest('button') || document.querySelector('.crumbs[title="New Tab"] a');
                   if (btn) {
                       btn.click();
                       const parts = cmd.path.split(':');
                       if (parts.length > 2) {
                           const targetPath = parts.slice(2).join(':');
                           const cleanPath = targetPath.startsWith('http') ? targetPath : (targetPath.startsWith('/') ? targetPath : '/' + targetPath);
                           setTimeout(() => { if (cleanPath.startsWith('http')) window.location.href = cleanPath; else { window.history.pushState({}, '', cleanPath); window.dispatchEvent(new PopStateEvent('popstate')); } }, 250);
                       }
                   }
                } else if ((cmd.path || '').startsWith('effect:')) {
                   const effect = cmd.path.replace('effect:', '');
                   const cleanup = () => {
                       document.body.classList.remove('halo-spin-active', 'halo-ghost-active', 'halo-trucker-active', 'halo-lopan-active', 'halo-dues-active', 'halo-thunder-active', 'halo-jack-burton-filter');
                       document.getElementById('halo-matrix-canvas')?.remove();
                       document.getElementById('halo-rain-canvas')?.remove();
                       document.getElementById('halo-party-overlay')?.remove();
                       document.getElementById('halo-trucker-banner')?.remove();
                       document.getElementById('halo-lopan-beams')?.remove();
                       document.getElementById('halo-lightning-flash')?.remove();
                       document.getElementById('halo-sixdemon-toast')?.remove();
                       const s = document.getElementById('halo-effect-styles'); if (s) s.innerHTML = '';
                       if (window.__HALO_LOPAN_TIMER__) { clearInterval(window.__HALO_LOPAN_TIMER__); window.__HALO_LOPAN_TIMER__ = null; }
                       if (window.__HALO_RAIN_ANIM__) { cancelAnimationFrame(window.__HALO_RAIN_ANIM__); window.__HALO_RAIN_ANIM__ = null; }
                   };
                   if (effect === 'clean') cleanup();
                   else if (effect === 'lopan') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `.halo-lopan-active { box-shadow: inset 0 0 150px ${primary}66 !important; transition: box-shadow 2s !important; } @keyframes lopanBeams { 0% { height: 0; opacity: 0; } 50% { height: 100vh; opacity: 0.9; } 100% { height: 0; opacity: 0; } } .lopan-beam { position: fixed; top: 0; width: 60px; background: linear-gradient(to bottom, ${primary}, rgba(0,255,135,0)); z-index: 2147483640; filter: blur(20px); pointer-events: none; animation: lopanBeams 4s infinite ease-in-out; }`;
                       document.body.classList.add('halo-lopan-active');
                       const beams = document.createElement('div'); beams.id = 'halo-lopan-beams'; beams.innerHTML = `<div class="lopan-beam" style="left: 45%;"></div><div class="lopan-beam" style="right: 45%;"></div>`;
                       document.body.appendChild(beams);
                       setTimeout(() => cleanup(), 10000); 
                   } else if (effect === 'thunder') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `@keyframes haloThunderShake { 0% { transform: translate(0,0); } 10% { transform: translate(-10px,-10px); } 20% { transform: translate(10px,10px); } 30% { transform: translate(-10px,10px); } 40% { transform: translate(10px,-10px); } 100% { transform: translate(0,0); } } .halo-thunder-active { animation: haloThunderShake 0.4s infinite cubic-bezier(.36,.07,.19,.97) both; }`;
                       document.body.classList.add('halo-thunder-active');
                       setTimeout(() => document.body.classList.remove('halo-thunder-active'), 3000);
                   } else if (effect === 'rain') {
                       cleanup();
                       const canvas = document.createElement('canvas'); canvas.id = 'halo-rain-canvas'; canvas.style.cssText = 'position:fixed; inset:0; z-index:2147483640; pointer-events:none;';
                       document.body.appendChild(canvas);
                       const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
                       const rain = []; for(let i=0; i<150; i++) rain.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, l: Math.random()*25+15, s: Math.random()*20+15 });
                       const draw = () => {
                           ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle = primary; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.lineCap = 'round';
                           rain.forEach(p => { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (p.s*0.1), p.y + p.l); ctx.stroke(); p.y += p.s; p.x += p.s*0.1; if(p.y > canvas.height) { p.y = -p.l; p.x = Math.random()*canvas.width; } });
                           ctx.globalAlpha = 1.0; window.__HALO_RAIN_ANIM__ = requestAnimationFrame(draw);
                       };
                       draw();
                       // RAIN LASTS EXACTLY 10 SECONDS
                       setTimeout(() => cleanup(), 10000); 
                   } else if (effect === 'lightning') {
                       const flash = document.createElement('div'); flash.id = 'halo-lightning-flash'; flash.style.cssText = 'position:fixed; inset:0; background:white; z-index:2147483645; pointer-events:none; opacity:0; transition: opacity 0.05s;';
                       document.body.appendChild(flash);
                       let startTime = Date.now();
                       const triggerStorm = () => { if (Date.now() - startTime > 3000) { flash.remove(); return; } flash.style.opacity = Math.random() > 0.5 ? '1.0' : '0.6'; setTimeout(() => { flash.style.opacity = '0'; setTimeout(triggerStorm, Math.random() * 400 + 100); }, 80); };
                       triggerStorm();
                   } else if (effect === 'sixdemonbag') {
                       cleanup();
                       const toast = document.createElement('div'); toast.id = 'halo-sixdemon-toast'; toast.style.cssText = `position:fixed; bottom:40px; left:50%; transform:translateX(-50%); background:#1e293b; color:#818cf8; padding:25px 50px; border-radius:30px; border:4px solid #818cf8; z-index:2147483647; font-weight:900; font-family:serif; font-style:italic; box-shadow:0 0 60px #818cf888; display:flex; flex-direction:column; align-items:center; gap:8px; animation: haloSlideDown 0.5s ease-out forwards;`;
                       toast.innerHTML = `<span style="font-size:40px;">🏺</span> <div style="text-align:center;"><div style="font-size:16px; text-transform:uppercase;">Six Demon Bag</div><div style="font-size:11px; opacity:0.7;">Wind, Fire, all that kind of thing!</div></div>`;
                       document.body.appendChild(toast);
                       setTimeout(() => toast.remove(), 10000); 
                   } else if (effect === 'checkisinthemail') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `.halo-jack-burton-filter { filter: sepia(0.3) contrast(1.1) brightness(0.95) !important; } @keyframes truckSlide { from { transform: translateY(-100%); } to { transform: translateY(0); } } #halo-trucker-banner { position: fixed; top: 0; left: 0; right: 0; background: #b91c1c; color: white; font-family: 'Impact', sans-serif; text-transform: uppercase; padding: 12px; text-align: center; font-size: 14px; letter-spacing: 0.3em; z-index: 2147483647; border-bottom: 4px solid black; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: truckSlide 0.4s ease-out; }`;
                       document.body.classList.add('halo-jack-burton-filter');
                       const banner = document.createElement('div'); banner.id = 'halo-trucker-banner'; banner.innerText = "PORKCHOP EXPRESS — HAULING SOLUTIONS";
                       document.body.appendChild(banner);
                       showHaloBanner("Yessir, the check is in the mail.", 'btlc');
                       setTimeout(() => cleanup(), 10000);
                   } else if (effect === 'duespaid') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `.halo-dues-active { filter: contrast(0.85) sepia(0.2) brightness(0.9) !important; font-family: 'Courier New', Courier, monospace !important; } .halo-dues-active * { font-family: inherit !important; } .halo-dues-active::before { content: ""; position: fixed; inset: 0; z-index: 2147483630; pointer-events: none; opacity: 0.05; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.get-icons.com'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); }`;
                       document.body.classList.add('halo-dues-active');
                       showHaloBanner("It's all in the reflexes", 'btlc');
                       setTimeout(() => cleanup(), 10000);
                   } else if (effect === 'ghost') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `@keyframes haloGhostGlow { 0%, 100% { box-shadow: inset 0 0 30px #3b82f6; } 50% { box-shadow: inset 0 0 80px #3b82f6aa; } } .halo-ghost-active { opacity: 0.6 !important; animation: haloGhostGlow 4s infinite ease-in-out !important; transition: opacity 1s, box-shadow 1s !important; }`;
                       document.body.classList.add('halo-ghost-active');
                       setTimeout(() => cleanup(), 10000);
                   } else if (effect === 'halo') {
                       cleanup();
                       if (!document.getElementById('halo-effect-styles')) { const s = document.createElement('style'); s.id = 'halo-effect-styles'; document.head.appendChild(s); }
                       document.getElementById('halo-effect-styles').innerHTML += `@keyframes haloSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .halo-spin-active { animation: haloSpin 2s linear infinite !important; }`;
                       document.body.classList.add('halo-spin-active');
                       setTimeout(() => cleanup(), 10000);
                   } else if (effect === 'party') {
                       cleanup();
                       const overlay = document.createElement('div'); overlay.id = 'halo-party-overlay'; overlay.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:1000000;';
                       document.body.appendChild(overlay);
                       for(let i=0; i<100; i++) { const c = document.createElement('div'); c.style.cssText = `position:absolute; top:-20px; left:${Math.random()*100}%; width:${Math.random()*10+5}px; height:${Math.random()*10+5}px; background:hsl(${Math.random()*360},70%,50%); border-radius:2px; transform:rotate(${Math.random()*360}deg); animation: haloConfetti ${Math.random()*3+2}s linear forwards;`; overlay.appendChild(c); }
                       if (!document.getElementById('halo-confetti-styles')) { const s = document.createElement('style'); s.id = 'halo-confetti-styles'; s.innerHTML = `@keyframes haloConfetti { to { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`; document.head.appendChild(s); }
                       setTimeout(() => overlay.remove(), 10000);
                   } else if (effect === 'navigator-matrix') {
                       cleanup();
                       const canvas = document.createElement('canvas'); canvas.id = 'halo-matrix-canvas'; canvas.style.cssText = 'position:fixed; inset:0; z-index:999999; pointer-events:none; opacity:0.3; background:rgba(0,0,0,0.8);';
                       document.body.appendChild(canvas);
                       const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
                       const chars = "HALOITSMNAVIGATOR01".split(""); const fontSize = 14; const columns = canvas.width/fontSize;
                       const drops = Array(Math.floor(columns)).fill(1);
                       const draw = () => { ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = primary; ctx.font = fontSize + "px monospace"; for(let i=0; i<drops.length; i++) { const text = chars[Math.floor(Math.random()*chars.length)]; ctx.fillText(text, i*fontSize, drops[i]*fontSize); if(drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0; drops[i]++; } };
                       const interval = setInterval(draw, 33);
                       setTimeout(() => { clearInterval(interval); canvas.remove(); cleanup(); }, 10000);
                   }
                } else {
                   const url = cmd.path.startsWith('http') ? cmd.path : window.location.origin + (cmd.path.startsWith('/') ? '' : '/') + cmd.path;
                   if (newTab) window.open(url, '_blank'); else window.location.href = url;
                }
                wrapper.remove();
              };

              const render = () => {
                const search = input.value.toLowerCase().trim();
                let resultsData = [];
                const state = window.__HALO_NAV_STATE__;
                if (search.startsWith('#') && search.length > 1) {
                    resultsData = (state.actions || []).filter(a => a.shortcut.toLowerCase().includes(search) || a.name.toLowerCase().includes(search.substring(1))).map(a => ({ code: a.shortcut.toUpperCase(), path: `action:${a.id}`, desc: `Trigger ➔ ${a.name} (${a.type})`, type: 'action' }));
                } else if (/^nt\s+/i.test(input.value)) {
                    const subSearch = input.value.substring(3).toLowerCase().trim();
                    resultsData = (state.commands || []).filter(c => c.code.toLowerCase().includes(subSearch) || c.path.toLowerCase().includes(subSearch)).map(c => ({ code: `NT ${c.code.toUpperCase()}`, path: `effect:new-halo-tab:${c.path}`, desc: `New Tab Context ➔ ${c.path}`, type: 'effect' })).slice(0, 10);
                } else if (/^cap\s+/i.test(input.value)) {
                    const subSearch = input.value.substring(4).toLowerCase().trim();
                    resultsData = (state.vault || []).filter(v => v.name.toLowerCase().includes(subSearch)).map(v => ({ code: 'INJECT', path: `vault:apply:${v.id}`, desc: `Inject Snapshot ➔ ${v.name}`, type: 'vault' })).slice(0, 10);
                } else {
                    const effects = [ { code: 'CAP', path: 'vault:capture', desc: 'Capture Secure Form' }, { code: 'NT', path: 'effect:new-halo-tab', desc: 'Open New Halo Tab' }, { code: 'HALONAVIGATOR', path: 'effect:navigator-matrix', desc: 'Halo Navigator: Matrix Protocol' }, { code: 'HALO', path: 'effect:halo', desc: 'Spin Effect' }, { code: 'PARTY', path: 'effect:party', desc: 'Confetti' }, { code: 'LOPAN', path: 'effect:lopan', desc: 'David Lo Pan' }, { code: 'THUNDER', path: 'effect:thunder', desc: 'Thunder' }, { code: 'RAIN', path: 'effect:rain', desc: 'Rain' }, { code: 'LIGHTNING', path: 'effect:lightning', desc: 'Lightning' }, { code: 'MAIL', path: 'effect:checkisinthemail', desc: 'The Jack Burton Protocol' }, { code: 'SIXDEMONBAG', path: 'effect:sixdemonbag', desc: 'Six Demon Bag' }, { code: 'DUESPAID', path: 'effect:duespaid', desc: 'Dirty Tank Top Filter' }, { code: 'GHOST', path: 'effect:ghost', desc: 'Ghost mode' }, { code: 'CLEAN', path: 'effect:clean', desc: 'Clear All Effects' } ];
                    resultsData = [...(state.commands || []), ...effects].map(c => { let score = 0; const code = (c.code || '').toLowerCase(); const path = (c.path || '').toLowerCase(); if (code === search) score += 1000; else if (code.startsWith(search)) score += 500; else if (code.includes(search)) score += 100; if (path.startsWith(search) || path.startsWith('/' + search)) score += 50; else if (path.includes(search)) score += 10; return { ...c, score }; }).filter(c => c.score > 0 || search === '').sort((a, b) => b.score - a.score);
                    if (search === 'fill') resultsData.unshift({ code: 'FILL', path: 'magic-fill', desc: 'Magic Fill QA Data' });
                    if (search === 'sql' || search === 'pretty') resultsData.unshift({ code: 'PRETTY', path: 'format-sql', desc: 'Prettify SQL Code' });
                }
                currentFiltered = resultsData;
                results.innerHTML = currentFiltered.map((c, i) => {
                  const isSelected = i === selectedIndex; const itemColor = isSelected ? primary : (isDark ? '#ffffff' : '#0f172a');
                  const isEffect = (c.path || '').startsWith('effect:'); const isVault = (c.path || '').startsWith('vault:'); const isAction = (c.path || '').startsWith('action:');
                  return `<div data-index="${i}" class="halo-result-item" style="padding:16px 24px; border-radius:24px; display:flex; align-items:center; cursor:pointer; background:${isSelected ? primary + '33' : 'transparent'}; border: 1px solid ${isSelected ? primary + '66' : 'transparent'}; transition: 0.1s; margin-bottom: 4px;">
                      <span style="font-weight:900; font-size:13px; color:${itemColor}; min-width:110px;">${isVault || c.code === 'INJECT' ? '🔒' : isAction ? '⚡' : isEffect ? (c.code.startsWith('NT') ? '➕' : '✨') : '#' + c.code.toUpperCase()}</span>
                      <span style="font-size:12px; color: ${itemColor}; opacity:${isSelected ? 1.0 : 0.8}; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex: 1;">${c.desc || c.path}</span>
                    </div>`;
                }).join('');
              };

              results.onclick = (e) => { const item = e.target.closest('.halo-result-item'); if (item) { const index = parseInt(item.getAttribute('data-index')); execute(currentFiltered[index], e.ctrlKey || e.metaKey); } };
              results.onmousemove = (e) => { if (e.clientX === lastMouseX && e.clientY === lastMouseY) return; lastMouseX = e.clientX; lastMouseY = e.clientY; const item = e.target.closest('.halo-result-item'); if (item) { const index = parseInt(item.getAttribute('data-index')); if (selectedIndex !== index) { selectedIndex = index; render(); } } };
              input.oninput = () => { selectedIndex = 0; render(); };
              input.onkeydown = (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = (selectedIndex + 1) % Math.max(1, currentFiltered.length); render(); } else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = (selectedIndex - 1 + currentFiltered.length) % Math.max(1, currentFiltered.length); render(); } else if (e.key === 'Tab') { e.preventDefault(); if (currentFiltered[selectedIndex]) execute(currentFiltered[selectedIndex], true); } else if (e.key === 'Enter') { e.preventDefault(); if (currentFiltered[selectedIndex]) execute(currentFiltered[selectedIndex], e.ctrlKey || e.metaKey); } else if (e.key === 'Escape') wrapper.remove(); };
              wrapper.onclick = (e) => { if (e.target === wrapper) wrapper.remove(); };
              render();
            } 
          });
          window.__HALO_PALETTE_SETUP__ = true;
        };

        const updateFavicon = () => {
          if (!activeRule || !activeRule.color || !theme.faviconTinting) return;
          
          const existingFavicon = document.querySelector('link[rel*="icon"]');
          const originalHref = existingFavicon ? existingFavicon.getAttribute('href') : '/favicon.ico';
          
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const drawDot = () => {
            // Draw colored dot
            ctx.beginPath();
            ctx.arc(24, 24, 7, 0, 2 * Math.PI);
            ctx.fillStyle = activeRule.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const newIcon = canvas.toDataURL('image/png');
            let link = document.querySelector('link[rel*="icon"]');
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = newIcon;
          };
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 32, 32);
            drawDot();
          };
          img.onerror = () => {
            // Fallback: draw a generic icon background if original fails
            ctx.fillStyle = '#1e293b';
            ctx.roundRect(4, 4, 24, 24, 6);
            ctx.fill();
            drawDot();
          };
          img.src = originalHref;
        };

        if (activeRule) {
          updateFavicon();
          const ruleStyle = document.createElement('style'); ruleStyle.id = 'halo-nav-injected-styles';
          let css = ''; const strength = activeRule.strength ?? 4; const color = activeRule.color;
          switch (activeRule.styleType) {
            case 'full': css = `body::after { content: ""; position: fixed; inset: 0; background: ${color}; opacity: ${strength / 50}; pointer-events: none; z-index: 999997; }`; break;
            case 'border': css = `body::after { content: ""; position: fixed; inset: 0; box-shadow: inset 0 0 0 ${strength}px ${color}; pointer-events: none; z-index: 999997; }`; break;
            case 'top-bar': css = `body::after { content: ""; position: fixed; top: 0; left: 0; right: 0; height: ${strength}px; background: ${color}; z-index: 999998; pointer-events: none; box-shadow: 0 0 15px ${color}88; }`; break;
            case 'glow': css = `body::after { content: ""; position: fixed; inset: 0; box-shadow: inset 0 0 ${strength * 20}px ${color}; opacity: 0.6; pointer-events: none; z-index: 999997; }`; break;
          }
          if (activeRule.label && !activeRule.hideLabel) {
            const pos = activeRule.labelPosition || 'right'; const flexPos = pos === 'center' ? '50%' : pos === 'left' ? '40px' : 'auto'; const flexRight = pos === 'right' ? '40px' : 'auto'; const transform = pos === 'center' ? 'translateX(-50%)' : 'none';
            css += `body::before { content: "${activeRule.label}"; position: fixed; top: 0; left: ${flexPos}; right: ${flexRight}; transform: ${transform}; display: flex; align-items: center; justify-content: center; padding: 4px 20px; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: ${activeRule.labelColor || '#121212'}; background-color: ${color}; border-left: 1.5px solid ${color}; border-right: 1.5px solid ${color}; border-bottom: 1.5px solid ${color}; border-radius: 0 0 12px 12px; z-index: 2147483647; pointer-events: none; box-shadow: 0 8px 30px rgba(0,0,0,0.4), 0 0 15px ${color}44; }`;
          }
          ruleStyle.innerHTML = css; document.head.appendChild(ruleStyle);
        }

        if (!window.__HALO_NAV_OBSERVER__) {
          window.__HALO_NAV_OBSERVER__ = new MutationObserver(() => { revealHaloFields(); revealHaloActions(); applyMandatoryGhosting(); });
          window.__HALO_NAV_OBSERVER__.observe(document.body, { childList: true, subtree: true });
        }
        revealHaloFields(); revealHaloActions(); applyMandatoryGhosting(); setupCommandPalette();
        if (!document.getElementById('halo-nav-utility-styles')) {
          const s = document.createElement('style'); s.id = 'halo-nav-utility-styles';
          s.innerHTML = `@keyframes haloSlideDown { from { opacity:0; transform: translateY(-20px); } to { opacity:1; transform: translateY(0); } } @keyframes haloPulseRed { 0%, 100% { border-color: rgba(239, 68, 68, 0.2); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 10px 2px rgba(239, 68, 68, 0.4); } } .halo-mandatory-ghost { animation: haloPulseRed 2.5s infinite ease-in-out !important; border: 2.2px solid #ef4444 !important; border-radius: 8px !important; }`;
          document.head.appendChild(s);
        }
      },
      args: [rule, commands, themeConfig, vault, actions]
    });
  } catch (e) { console.warn("Halo Navigator Injection Failed:", e); }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig', 'actions']);
    const rules = data.rules || []; const url = tab.url.toLowerCase();
    const match = rules.find(r => { const pattern = r.pattern.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''); const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, ''); return cleanUrl.includes(pattern); });
    injectContent(tabId, match, data.commands || [], data.themeConfig);
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === 'RELOAD_RULES') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && !tab.url.startsWith('chrome://')) {
      const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig', 'actions']);
      const rules = data.rules || []; const url = tab.url.toLowerCase();
      const match = rules.find(r => { const pattern = r.pattern.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''); const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, ''); return cleanUrl.includes(pattern); });
      injectContent(tab.id, match, data.commands || [], data.themeConfig);
    }
  } else if (msg.type === 'FILL_FORM') {
    const tabId = sender.tab ? sender.tab.id : (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
    if (!tabId) return;
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const fill = (sel, val) => { const el = document.querySelector(sel); if (el) { if (el.classList.contains('fr-view')) { el.innerHTML = val.replace(/\n/g, '<br>'); } else { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } } };
        fill('input[name="summary"], #input-summary, #summary', 'UAT Magic Fill: All regression tests passed. Verified.');
        document.querySelectorAll('.fr-view').forEach(el => { el.innerHTML = '1. Quiesce connections.<br>2. Apply patches.<br>3. Verify services.<br>4. Close change.'; el.dispatchEvent(new Event('input', { bubbles: true })); });
        document.querySelectorAll('textarea').forEach(el => { if (!el.value) { el.value = 'Magic Fill: Comprehensive testing data generated.'; el.dispatchEvent(new Event('input', { bubbles: true })); } });
      }
    });
    chrome.tabs.sendMessage(tabId, { type: 'SHOW_BANNER', message: 'Smart Fill Executed' });
  } else if (msg.type === 'CAPTURE_FORM') {
     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
     if (!tab) return;
     const results = await chrome.scripting.executeScript({
       target: { tabId: tab.id },
       func: () => {
         const data = {};
         document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => { const id = el.id || el.getAttribute('name') || el.getAttribute('data-field-name') || el.getAttribute('placeholder'); if (id) data[id] = el.value; });
         document.querySelectorAll('.fr-view').forEach((el, i) => { const box = el.closest('.fr-box'); const key = box ? (box.id || `froala_${i}`) : `froala_${i}`; data[key] = el.innerHTML; });
         return data;
       }
     });
     const capturedData = results[0]?.result || {};
     const { vault } = await chrome.storage.local.get(['vault']);
     const name = `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
     const updatedVault = [{ id: Date.now().toString(), name: name, timestamp: new Date().toLocaleString(), data: capturedData }, ...(vault || [])];
     await chrome.storage.local.set({ vault: updatedVault });
     chrome.tabs.sendMessage(tab.id, { type: 'VAULT_UPDATED', vault: updatedVault });
     chrome.tabs.sendMessage(tab.id, { type: 'SHOW_BANNER', message: `Snapshot Captured: ${name}` });
  } else if (msg.type === 'FORMAT_SQL') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    await chrome.scripting.executeScript({
      target: { tabId: tab.id }, world: 'MAIN',
      func: () => {
        const prettifySql = (sql) => {
            if (!sql) return ""; const indent = "   "; let res = sql.replace(/\s+/g, " ").trim();
            const keywords = ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "ON", "AND", "OR", "IN", "NOT IN", "IS", "NULL", "UNION", "ALL", "INSERT INTO", "UPDATE", "SET", "DELETE FROM", "VALUES", "AS", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END"];
            keywords.forEach(kw => { const regex = new RegExp(`\\b${kw}\\b`, "gi"); res = res.replace(regex, kw); });
            const majorClauses = ["FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "SET", "VALUES", "UNION"];
            majorClauses.forEach(clause => { const regex = new RegExp(`\\b${clause}\\b`, "g"); res = res.replace(regex, `\n${clause}`); });
            res = res.replace(/\bSELECT\s+(DISTINCT\s+)?/g, (match) => `${match}\n${indent}`);
            let formatted = ""; let parenLevel = 0;
            for (let i = 0; i < res.length; i++) { const char = res[i]; if (char === "(") parenLevel++; else if (char === ")") parenLevel--; if (char === "," && parenLevel === 0) formatted += ",\n" + indent; else formatted += char; }
            res = formatted; res = res.replace(/\n\s*WHERE\s+/g, "\nWHERE\n" + indent); res = res.replace(/\bAND\b/g, "\n" + indent + "AND"); res = res.replace(/\bOR\b/g, "\n" + indent + "OR"); res = res.replace(/\bON\b/g, "\n" + indent + indent + "ON");
            return res.trim();
        };
        try { if (window.monaco && window.monaco.editor) { const models = window.monaco.editor.getModels(); if (models && models.length > 0) { const model = models[0]; const currentSql = model.getValue(); if (currentSql && currentSql.trim()) model.pushEditOperations([], [{ range: model.getFullModelRange(), text: prettifySql(currentSql) }]); } } }
        catch(e) { console.error('Prettify failed:', e); }
      }
    });
    chrome.tabs.sendMessage(tab.id, { type: 'SHOW_BANNER', message: 'SQL Prettified' });
  }
});