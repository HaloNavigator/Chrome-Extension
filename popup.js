// Halo Navigator - Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const modeToggle = document.getElementById('mode-toggle');
  const primaryColorPicker = document.getElementById('primary-color-picker');
  const primaryColorHex = document.getElementById('primary-color-hex');
  const themePresetsGrid = document.getElementById('theme-presets');
  const themeApply = document.getElementById('theme-apply');
  const mandatoryGhostToggle = document.getElementById('mandatory-ghost-toggle');

  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const actionsList = document.getElementById('actions-list');
  const vaultList = document.getElementById('vault-list');
  const linksList = document.getElementById('links-list');
  const openOptions = document.getElementById('open-options');
  const openHelpBtn = document.getElementById('open-help-btn');
  const saveButtons = document.querySelectorAll('.save-btn');
  const magicFillBtn = document.getElementById('magic-fill-btn');
  const formatSqlBtn = document.getElementById('format-sql-btn');
  const launchSqlBtn = document.getElementById('launch-sql');
  const fieldRevealToggle = document.getElementById('field-reveal-toggle');
  const actionRevealToggle = document.getElementById('action-reveal-toggle');
  const faviconTintToggle = document.getElementById('favicon-tint-toggle');
  const shortcutSearch = document.getElementById('shortcut-search');
  const actionSearch = document.getElementById('action-search');
  
  const exportBtn = document.getElementById('export-btn');
  const importInput = document.getElementById('import-input');
  
  const ruleLabel = document.getElementById('rule-label');
  const rulePattern = document.getElementById('rule-pattern');
  const ruleStyle = document.getElementById('rule-style');
  const ruleColor = document.getElementById('rule-color');
  const ruleLabelColor = document.getElementById('rule-label-color');
  const ruleStrength = document.getElementById('rule-strength');
  const ruleStrengthVal = document.getElementById('strength-val');
  const ruleLabelPos = document.getElementById('rule-label-pos');
  const ruleHideLabel = document.getElementById('rule-hide-label');
  const ruleCreate = document.getElementById('rule-create');

  const cmdCode = document.getElementById('cmd-code');
  const cmdPath = document.getElementById('cmd-path');
  const cmdAdd = document.getElementById('cmd-add');

  const actionType = document.getElementById('action-type');
  const actionShortcut = document.getElementById('action-shortcut');
  const actionName = document.getElementById('action-name');
  const actionElementId = document.getElementById('action-element-id');
  const actionAdd = document.getElementById('action-add');
  
  const vaultNameInput = document.getElementById('vault-name');
  const vaultCaptureBtn = document.getElementById('vault-capture');

  // State
  let rules = [];
  let commands = [];
  let actions = [];
  let vault = [];
  let themeConfig = { mode: 'dark', primaryColor: '#00ff87', preset: 'halo', fieldIdReveal: false, mandatoryGhosting: false, actionReveal: false, faviconTinting: true };
  let editingRuleId = null;
  let editingCmdCode = null;
  let editingActionId = null;
  let renamingVaultId = null;

  // Explicitly disable Hide Label by default on start
  if (ruleHideLabel) ruleHideLabel.checked = false;

  const HALO_LINKS = [
    { title: "Halo Support", desc: "support.haloservicedesk.com", url: "https://support.haloservicedesk.com/portal/", initial: "S", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Halo Community", desc: "community.haloitsm.com", url: "https://community.haloitsm.com/", initial: "C", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Admin Hangout", desc: "discord.com/haloitsm", url: "https://discord.com/channels/1050832376185495562", initial: "D", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Support Documentation", desc: "Shared Knowledge Base", url: "https://docs.google.com/document/d/1ZkbsvjXwX2vynObvjsJiObvo7wz5dvfIUomNPlUrIMc/edit?usp=sharing", initial: "DOC", color: "var(--indigo)", bg: "rgba(129,140,248,0.1)" },
    { title: "Product Roadmap", desc: "usehalo.com/roadmap", url: "https://usehalo.com/haloitsm/roadmap/", initial: "R", color: "var(--amber)", bg: "rgba(245,158,11,0.1)" },
    { title: "Halo Release Notes", desc: "haloreleases.remmy.dev", url: "https://haloreleases.remmy.dev/", initial: "RN", color: "var(--cyan)", bg: "rgba(6, 182, 212, 0.1)" },
    { title: "System Status", desc: "status.haloitsm.com", url: "https://status.haloitsm.com/", initial: "ST", color: "var(--red)", bg: "rgba(239,68,68,0.1)" },
    { title: "Contact Support", desc: "halonavigator@gmail.com", url: "mailto:halonavigator@gmail.com", initial: "M", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" }
  ];

  // Load Data
  const data = await chrome.storage.local.get(['rules', 'commands', 'actions', 'vault', 'themeConfig']);
  rules = data.rules || [];
  commands = data.commands || [];
  actions = data.actions || [];
  vault = data.vault || [];
  if (data.themeConfig) themeConfig = { ...themeConfig, ...data.themeConfig };

  // Apply Theme
  function applyTheme(config) {
    document.body.setAttribute('data-theme', config.mode);
    document.documentElement.style.setProperty('--accent', config.primaryColor);
    if (modeToggle) {
        modeToggle.innerHTML = config.mode === 'dark' ? '🌙' : '☀️';
        modeToggle.style.color = config.mode === 'dark' ? '#a5b4fc' : '#f59e0b';
    }
    if (primaryColorPicker) primaryColorPicker.value = config.primaryColor;
    if (primaryColorHex) primaryColorHex.value = config.primaryColor;
    if (mandatoryGhostToggle) mandatoryGhostToggle.checked = config.mandatoryGhosting === true;
    if (fieldRevealToggle) fieldRevealToggle.checked = config.fieldIdReveal === true;
    if (actionRevealToggle) actionRevealToggle.checked = config.actionReveal === true;
    if (faviconTintToggle) faviconTintToggle.checked = config.faviconTinting !== false;
    
    // Highlight active preset
    if (themePresetsGrid) {
        themePresetsGrid.querySelectorAll('.preset-item').forEach(p => {
            const name = p.dataset.preset;
            if (name === config.preset) {
                p.classList.add('active');
                p.style.borderColor = config.primaryColor;
                p.style.backgroundColor = `${config.primaryColor}15`;
            } else {
                p.classList.remove('active');
                p.style.borderColor = '';
                p.style.backgroundColor = '';
            }
        });
    }
    renderLinks(); 
    renderVault(); 
  }

  const saveAll = async () => {
    await chrome.storage.local.set({ rules, commands, actions, vault, themeConfig });
    chrome.runtime.sendMessage({ type: 'RELOAD_RULES' }).catch(() => {});
  };

  // Rule Strength UI Helper
  if (ruleStrength) {
    ruleStrength.oninput = (e) => {
      if (ruleStrengthVal) ruleStrengthVal.textContent = e.target.value;
    };
  }

  // Rule Handlers
  if (ruleCreate) {
    ruleCreate.onclick = async () => {
      if (!rulePattern || !rulePattern.value) return;

      if (editingRuleId) {
        rules = rules.map(r => r.id === editingRuleId ? {
          ...r,
          label: ruleLabel.value || 'Env',
          labelColor: ruleLabelColor.value || '#ffffff',
          pattern: rulePattern.value,
          styleType: ruleStyle.value,
          color: ruleColor.value,
          strength: parseInt(ruleStrength.value),
          labelPosition: ruleLabelPos.value,
          hideLabel: ruleHideLabel.checked
        } : r);
        editingRuleId = null;
        ruleCreate.textContent = 'Add Rule';
      } else {
        rules.push({
          id: Date.now().toString(),
          label: ruleLabel.value || 'Env',
          labelColor: ruleLabelColor.value || '#ffffff',
          pattern: rulePattern.value,
          styleType: ruleStyle.value,
          color: ruleColor.value,
          strength: parseInt(ruleStrength.value) || 0,
          hideLabel: ruleHideLabel.checked,
          labelPosition: ruleLabelPos.value
        });
      }
      
      // Reset form to defaults
      if (rulePattern) rulePattern.value = ''; 
      if (ruleLabel) ruleLabel.value = ''; 
      if (ruleLabelColor) ruleLabelColor.value = '#ffffff';
      if (ruleStrength) ruleStrength.value = 0; 
      if (ruleStrengthVal) ruleStrengthVal.textContent = 0;
      if (ruleHideLabel) ruleHideLabel.checked = false; 
      
      renderRules();
      await saveAll();
    };
  }

  function renderRules() {
    if (!rulesList) return;
    rulesList.innerHTML = '';
    rules.forEach((rule) => {
      const card = document.createElement('div');
      card.className = `item-card ${editingRuleId === rule.id ? 'editing-highlight' : ''}`;
      card.innerHTML = `
        <div class="color-box" style="background: ${rule.color}; color: ${rule.labelColor || '#121212'}">
          ${rule.label.substring(0, 3)}
        </div>
        <div class="item-info">
          <div class="item-header">
            <span class="item-name">${rule.label}</span>
            <div style="display:flex; gap:8px;">
               <button class="edit-item" data-id="${rule.id}" style="color:var(--text); background:none; border:none; cursor:pointer; font-size:12px; opacity:0.6;">✎</button>
               <button class="delete-item" data-id="${rule.id}">✕</button>
            </div>
          </div>
          <div class="item-meta">${rule.pattern}</div>
        </div>
      `;
      rulesList.appendChild(card);
    });

    rulesList.querySelectorAll('.delete-item').forEach(btn => {
      btn.onclick = async () => {
        rules = rules.filter(r => r.id !== btn.dataset.id);
        renderRules();
        await saveAll();
      };
    });

    rulesList.querySelectorAll('.edit-item').forEach(btn => {
      btn.onclick = () => {
        const rule = rules.find(r => r.id === btn.dataset.id);
        if (rule) {
          editingRuleId = rule.id;
          ruleLabel.value = rule.label;
          rulePattern.value = rule.pattern;
          ruleStyle.value = rule.styleType;
          ruleColor.value = rule.color;
          ruleLabelColor.value = rule.labelColor || '#ffffff';
          ruleStrength.value = rule.strength ?? 0;
          ruleStrengthVal.textContent = rule.strength ?? 0;
          ruleLabelPos.value = rule.labelPosition || 'right';
          ruleHideLabel.checked = rule.hideLabel || false;
          ruleCreate.textContent = 'Update Rule';
          renderRules();
          document.getElementById('rules-view').scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });
  }

  // Action Handlers
  if (actionAdd) {
    actionAdd.onclick = async () => {
      if (!actionShortcut || !actionName || !actionElementId || !actionShortcut.value || !actionName.value || !actionElementId.value) return;
      const shortcut = actionShortcut.value.startsWith('#') ? actionShortcut.value : `#${actionShortcut.value}`;

      if (editingActionId) {
          actions = actions.map(a => a.id === editingActionId ? {
              ...a,
              type: actionType.value,
              shortcut: shortcut,
              name: actionName.value,
              elementId: actionElementId.value
          } : a);
          editingActionId = null;
          actionAdd.textContent = 'Add Action';
      } else {
          actions.push({
              id: Date.now().toString(),
              type: actionType.value,
              shortcut: shortcut,
              name: actionName.value,
              elementId: actionElementId.value
          });
      }

      actionShortcut.value = ''; actionName.value = ''; actionElementId.value = '';
      renderActions();
      await saveAll();
    };
  }

  if (actionSearch) {
    actionSearch.oninput = () => {
      renderActions();
    };
  }

  const updateActionUI = () => {
    const isButton = actionType.value === 'button';
    const label = document.querySelector('label[for="action-element-id"]');
    if (label) label.textContent = isButton ? 'Action Button Number' : 'HTML Element ID';
    if (actionElementId) {
      actionElementId.placeholder = isButton ? 'e.g. 1' : 'e.g. action-group-id';
    }
  };

  if (actionType) {
    actionType.onchange = updateActionUI;
  }

  function renderActions() {
    if (!actionsList) return;
    actionsList.innerHTML = '';
    
    const search = (actionSearch.value || '').toLowerCase().trim();
    
    const filtered = actions.filter(a => 
      a.shortcut.toLowerCase().includes(search) || 
      a.name.toLowerCase().includes(search) ||
      a.elementId.toLowerCase().includes(search)
    );

    filtered.forEach((a) => {
        const card = document.createElement('div');
        card.className = `item-card ${editingActionId === a.id ? 'editing-highlight' : ''}`;
        card.innerHTML = `
            <div class="shortcut-label" style="color: var(--accent); font-size:11px; font-weight: 900;">
                ${a.shortcut}
            </div>
            <div class="item-info">
                <div class="item-header">
                    <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                        <span class="item-name" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.name}</span>
                        <span class="type-badge">${a.type}</span>
                        <span class="item-meta" style="opacity:0.3; margin-left:4px; font-size:8px;">ID: ${a.type === 'button' && !a.elementId.startsWith('action-button-') ? `action-button-${a.elementId}` : a.elementId}</span>
                    </div>
                    <div style="display:flex; gap:8px; flex-shrink:0;">
                        <button class="edit-action" data-id="${a.id}" style="color:var(--text); background:none; border:none; cursor:pointer; font-size:12px; opacity:0.6;">✎</button>
                        <button class="delete-action" data-id="${a.id}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:14px;">✕</button>
                    </div>
                </div>
            </div>
        `;
        actionsList.appendChild(card);
    });

    if (filtered.length === 0) {
      actionsList.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.3; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">No results found</div>';
    }

    actionsList.querySelectorAll('.delete-action').forEach(btn => {
        btn.onclick = async () => {
            actions = actions.filter(a => a.id !== btn.dataset.id);
            renderActions();
            await saveAll();
        };
    });

    actionsList.querySelectorAll('.edit-action').forEach(btn => {
        btn.onclick = () => {
            const a = actions.find(action => action.id === btn.dataset.id);
            if (a) {
                editingActionId = a.id;
                actionType.value = a.type;
                actionShortcut.value = a.shortcut.replace('#', '');
                actionName.value = a.name;
                actionElementId.value = a.elementId;
                updateActionUI();
                actionAdd.textContent = 'Update Action';
                renderActions();
                document.getElementById('actions-view').scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
    });
  }

  // Vault Handlers
  if (vaultCaptureBtn) {
    vaultCaptureBtn.onclick = async () => {
      const name = (vaultNameInput ? vaultNameInput.value.trim() : '') || `Snapshot ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.id && !tab.url.startsWith('chrome://')) {
          const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                  const data = {};
                  // Capture all inputs with comprehensive identifiers
                  document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => {
                      const id = el.id || el.getAttribute('name') || el.getAttribute('data-field-name') || el.getAttribute('placeholder') || el.getAttribute('aria-label');
                      if (id) data[id] = el.value;
                  });
                  // Capture Froala rich text views
                  document.querySelectorAll('.fr-view').forEach((el, i) => {
                      const box = el.closest('.fr-box');
                      const key = box ? (box.id || `froala_${i}`) : `froala_${i}`;
                      data[key] = el.innerHTML;
                  });
                  return data;
              }
          });

          const capturedData = results[0]?.result || {};
          const entry = {
              id: Date.now().toString(),
              name: name,
              timestamp: new Date().toLocaleString(),
              data: capturedData
          };
          
          vault = [entry, ...vault];
          if (vaultNameInput) vaultNameInput.value = '';
          renderVault();
          await saveAll();
      }
    };
  }

  function renderVault() {
    if (!vaultList) return;
    vaultList.innerHTML = '';
    vault.forEach((entry) => {
      const card = document.createElement('div');
      card.className = "item-card group";
      card.style.borderColor = "var(--border)";
      
      const isRenaming = renamingVaultId === entry.id;

      let nameContent = "";
      if (isRenaming) {
        nameContent = `
          <div style="display:flex; gap:6px; width:100%; align-items:center;">
            <input type="text" class="rename-input" data-id="${entry.id}" value="${entry.name}" style="flex:1; padding:4px 8px; font-size:12px; font-weight:900; background:rgba(0,0,0,0.2); border:1px solid var(--accent); color:var(--accent); border-radius:6px; outline:none;">
            <button class="save-rename" data-id="${entry.id}" style="background:none; border:none; color:var(--emerald); cursor:pointer; font-size:12px;">✓</button>
            <button class="cancel-rename" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:12px;">✕</button>
          </div>
        `;
      } else {
        nameContent = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="item-name" style="color: #ffffff;">${entry.name}</span>
            <button class="start-rename" data-id="${entry.id}" style="opacity:0; transition:0.2s; background:none; border:none; color:var(--text); cursor:pointer; font-size:10px; padding:2px;">✎</button>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="color-box" style="background: var(--accent); color: #000; font-size: 10px;">V</div>
        <div class="item-info">
          <div class="item-header" style="align-items: center;">
            ${nameContent}
            <div style="display:flex; gap:8px; align-items:center;">
               <button class="inject-btn" data-id="${entry.id}">Inject</button>
               <button class="delete-item" data-id="${entry.id}" title="Delete snapshot">✕</button>
            </div>
          </div>
          <div class="item-meta">${entry.timestamp}</div>
        </div>
      `;
      vaultList.appendChild(card);

      if (!isRenaming) {
        const renameBtn = card.querySelector('.start-rename');
        card.onmouseenter = () => { if(renameBtn) renameBtn.style.opacity = "0.5"; };
        card.onmouseleave = () => { if(renameBtn) renameBtn.style.opacity = "0"; };
        if(renameBtn) {
            renameBtn.onmouseenter = () => renameBtn.style.opacity = "1";
            renameBtn.onmouseleave = () => renameBtn.style.opacity = "0.5";
            renameBtn.onclick = (e) => { e.stopPropagation(); renamingVaultId = entry.id; renderVault(); };
        }
      } else {
        const input = card.querySelector('.rename-input');
        input.focus();
        input.onkeydown = (e) => {
          if (e.key === 'Enter') handleVaultRename(entry.id, input.value);
          if (e.key === 'Escape') { renamingVaultId = null; renderVault(); }
        };
        card.querySelector('.save-rename').onclick = () => handleVaultRename(entry.id, input.value);
        card.querySelector('.cancel-rename').onclick = () => { renamingVaultId = null; renderVault(); };
      }
    });

    const handleVaultRename = async (id, newName) => {
        if (!newName.trim()) return;
        vault = vault.map(v => v.id === id ? { ...v, name: newName } : v);
        renamingVaultId = null;
        renderVault();
        await saveAll();
    };

    vaultList.querySelectorAll('.inject-btn').forEach(btn => {
      btn.onclick = async () => {
        const entry = vault.find(v => v.id === btn.dataset.id);
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (entry && tab) {
            // NUCLEAR INJECTION SCRIPT
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (formData) => {
                    const keys = Object.keys(formData);
                    keys.forEach(key => {
                        const val = formData[key];
                        try {
                            const selectors = [`#${key}`, `[name="${key}"]`, `[data-field-name="${key}"]`, `[placeholder="${key}"]`, `[aria-label="${key}"]` ];
                            let targets = [];
                            for (let sel of selectors) {
                                const found = document.querySelectorAll(sel);
                                if (found.length > 0) { targets = Array.from(found); break; }
                            }
                            if (targets.length === 0 && key.startsWith('froala_')) {
                                const index = parseInt(key.split('_')[1]);
                                const views = document.querySelectorAll('.fr-view');
                                if (views[index]) targets = [views[index]];
                            }
                            if (targets.length === 0) return;
                            targets.forEach(el => {
                                if (el.classList.contains('fr-view')) { el.innerHTML = val; }
                                else if (el.classList.contains('fr-box')) { const view = el.querySelector('.fr-view'); if (view) view.innerHTML = val; }
                                else if (el.tagName === 'SELECT') { el.value = val; }
                                else {
                                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set ||
                                                         Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set ||
                                                         Object.getOwnPropertyDescriptor(el.constructor.prototype, "value")?.set;
                                    if (nativeSetter) nativeSetter.call(el, val);
                                    else el.value = val;
                                }
                                ['input', 'change', 'blur', 'keyup', 'keydown', 'keypress'].forEach(evName => el.dispatchEvent(new Event(evName, { bubbles: true })));
                            });
                        } catch (err) {}
                    });
                },
                args: [entry.data]
            });
            const originalText = btn.textContent;
            btn.textContent = 'DONE';
            btn.style.background = '#10b981';
            setTimeout(() => { btn.textContent = originalText; btn.style.background = 'var(--accent)'; }, 2000);
        }
      };
    });

    vaultList.querySelectorAll('.delete-item').forEach(btn => {
      btn.onclick = async () => {
        vault = vault.filter(v => v.id !== btn.dataset.id);
        renderVault();
        await saveAll();
      };
    });
  }

  function renderLinks() {
    if (!linksList) return;
    linksList.innerHTML = '';
    HALO_LINKS.forEach(link => {
      const card = document.createElement('a');
      card.href = link.url;
      card.target = "_blank";
      card.className = "item-card";
      card.style.textDecoration = "none";
      card.innerHTML = `
        <div class="color-box" style="background: ${link.bg}; color: ${link.color};">
          ${link.initial}
        </div>
        <div class="item-info">
          <div class="item-name">${link.title}</div>
          <div class="item-meta">${link.desc}</div>
        </div>
      `;
      linksList.appendChild(card);
    });
  }

  // Command Handlers
  if (cmdAdd) {
    cmdAdd.onclick = async () => {
      if (!cmdCode || !cmdPath || !cmdCode.value || !cmdPath.value) return;
      const code = cmdCode.value.toLowerCase();
      
      if (editingCmdCode) {
        commands = commands.map(c => c.code === editingCmdCode ? { code, path: cmdPath.value } : c);
        editingCmdCode = null;
        cmdAdd.textContent = 'Add';
      } else {
        commands.push({ code, path: cmdPath.value });
      }
      
      cmdCode.value = ''; cmdPath.value = '';
      renderCommands();
      await saveAll();
    };
  }

  if (shortcutSearch) {
    shortcutSearch.oninput = () => {
      renderCommands();
    };
  }

  function renderCommands() {
    if (!commandsList) return;
    commandsList.innerHTML = '';
    
    const search = (shortcutSearch.value || '').toLowerCase().trim();
    
    const filtered = commands
      .filter(c => c.code.toLowerCase().includes(search) || c.path.toLowerCase().includes(search))
      .sort((a, b) => a.code.localeCompare(b.code));
    
    filtered.forEach((cmd) => {
      const isAbs = cmd.path.includes('://');
      const card = document.createElement('div');
      card.className = `item-card ${editingCmdCode === cmd.code ? 'editing-highlight' : ''}`;
      card.innerHTML = `
        <div class="shortcut-label" style="color: ${isAbs ? '#818cf8' : '#ffffff'}; font-size:11px; opacity: 1; font-weight: 900;">
          #${cmd.code.toUpperCase()}
        </div>
        <div class="item-info">
          <div class="item-header">
            <div class="item-meta" style="opacity:1;">${cmd.path}</div>
            <div style="display:flex; gap:8px;">
               <button class="edit-cmd" data-code="${cmd.code}" style="color:var(--text); background:none; border:none; cursor:pointer; font-size:12px; opacity:0.6;">✎</button>
               <button class="delete-cmd" data-code="${cmd.code}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:14px;">✕</button>
            </div>
          </div>
        </div>
      `;
      commandsList.appendChild(card);
    });

    if (filtered.length === 0) {
      commandsList.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.3; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">No results found</div>';
    }

    commandsList.querySelectorAll('.delete-cmd').forEach(btn => {
      btn.onclick = async () => {
        commands = commands.filter(c => c.code !== btn.dataset.code);
        renderCommands();
        await saveAll();
      };
    });

    commandsList.querySelectorAll('.edit-cmd').forEach(btn => {
      btn.onclick = () => {
        const cmd = commands.find(c => c.code === btn.dataset.code);
        if (cmd) {
          editingCmdCode = cmd.code;
          cmdCode.value = cmd.code.toUpperCase();
          cmdPath.value = cmd.path;
          cmdAdd.textContent = 'Update';
          renderCommands();
          document.getElementById('shortcuts-view').scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });
  }

  // Export/Import Handlers
  if (exportBtn) {
    exportBtn.onclick = () => {
      const dataToExport = {
        rules,
        commands,
        actions,
        themeConfig,
        exportedAt: new Date().toISOString(),
        version: "1.1"
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `halo-navigator-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  if (importInput) {
    importInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.rules) rules = imported.rules;
          if (imported.commands) commands = imported.commands;
          if (imported.actions) actions = imported.actions;
          if (imported.themeConfig) themeConfig = imported.themeConfig;
          await saveAll();
          location.reload(); 
        } catch (err) {
          alert("Failed to import: Invalid JSON format.");
        }
      };
      reader.readAsText(file);
    };
  }

  // Theme Handlers
  if (modeToggle) modeToggle.onclick = () => { themeConfig.mode = themeConfig.mode === 'dark' ? 'light' : 'dark'; applyTheme(themeConfig); saveAll(); };
  if (mandatoryGhostToggle) mandatoryGhostToggle.onchange = (e) => { themeConfig.mandatoryGhosting = e.target.checked; saveAll(); };
  if (fieldRevealToggle) fieldRevealToggle.onchange = (e) => { themeConfig.fieldIdReveal = e.target.checked; saveAll(); };
  if (actionRevealToggle) actionRevealToggle.onchange = (e) => { themeConfig.actionReveal = e.target.checked; saveAll(); };
  if (faviconTintToggle) faviconTintToggle.onchange = (e) => { themeConfig.faviconTinting = e.target.checked; saveAll(); };

  if (primaryColorPicker) primaryColorPicker.oninput = (e) => { 
    themeConfig.primaryColor = e.target.value; 
    themeConfig.preset = 'custom'; 
    primaryColorHex.value = e.target.value;
    applyTheme(themeConfig); 
  };
  
  if (primaryColorHex) primaryColorHex.oninput = (e) => {
    const val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        themeConfig.primaryColor = val;
        themeConfig.preset = 'custom';
        primaryColorPicker.value = val;
        applyTheme(themeConfig);
    }
  };

  // Preset Selection Logic
  if (themePresetsGrid) {
    themePresetsGrid.querySelectorAll('.preset-item').forEach(p => {
        p.onclick = () => {
            themeConfig.preset = p.dataset.preset;
            themeConfig.primaryColor = p.dataset.color;
            applyTheme(themeConfig);
        };
    });
  }

  if (themeApply) themeApply.onclick = async () => { await saveAll(); themeApply.textContent = 'Updated!'; setTimeout(() => themeApply.textContent = 'Apply Changes', 2000); };

  // Tab Logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tab-btn, .view, .help-header-btn').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
    };
  });

  if (openHelpBtn) {
    openHelpBtn.onclick = () => {
      document.querySelectorAll('.tab-btn, .view').forEach(el => el.classList.remove('active'));
      openHelpBtn.classList.add('active');
      document.getElementById('help-view').classList.add('active');
    };
  }

  // Tool Handlers
  if (magicFillBtn) magicFillBtn.onclick = () => chrome.runtime.sendMessage({ type: 'FILL_FORM' });
  if (formatSqlBtn) formatSqlBtn.onclick = () => chrome.runtime.sendMessage({ type: 'FORMAT_SQL' });
  if (launchSqlBtn) launchSqlBtn.onclick = () => chrome.tabs.create({ url: 'sql-generator.html' });
  if (openOptions) openOptions.onclick = () => chrome.runtime.openOptionsPage();
  saveButtons.forEach(btn => btn.onclick = async () => { await saveAll(); btn.textContent = 'Saved!'; setTimeout(() => btn.textContent = 'Save', 2000); });

  // Initial Render
  applyTheme(themeConfig);
  renderRules();
  renderCommands();
  renderActions();
  renderVault();
  renderLinks();
});