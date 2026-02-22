// Halo Navigator - Hub/Options Logic
document.addEventListener('DOMContentLoaded', async () => {
  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const actionsList = document.getElementById('actions-list');
  const globalSaveTop = document.getElementById('global-save-top');
  const shortcutSearch = document.getElementById('shortcut-search');
  const actionHubSearch = document.getElementById('action-hub-search');
  
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

  const modeToggle = document.getElementById('mode-toggle');
  const mandatoryGhostToggle = document.getElementById('mandatory-ghost-toggle');
  const fieldRevealToggle = document.getElementById('field-reveal-toggle');
  const actionRevealToggle = document.getElementById('action-reveal-toggle');
  const faviconTintToggle = document.getElementById('favicon-tint-toggle');

  let rules = [];
  let commands = [];
  let actions = [];
  let themeConfig = { mode: 'dark', primaryColor: '#00ff87', preset: 'halo', fieldIdReveal: false, mandatoryGhosting: false, actionReveal: false, faviconTinting: true };
  let editingRuleId = null;
  let editingCmdCode = null;
  let editingActionId = null;

  // Explicitly disable Hide Label by default on start
  if (ruleHideLabel) ruleHideLabel.checked = false;

  const data = await chrome.storage.local.get(['rules', 'commands', 'actions', 'themeConfig']);
  rules = data.rules || [];
  commands = data.commands || [];
  actions = data.actions || [];
  if (data.themeConfig) themeConfig = { ...themeConfig, ...data.themeConfig };

  function applyThemeUI() {
    document.body.setAttribute('data-theme', themeConfig.mode);
    document.documentElement.style.setProperty('--accent', themeConfig.primaryColor);
    modeToggle.textContent = themeConfig.mode === 'dark' ? '🌙' : '☀️';
    if (mandatoryGhostToggle) mandatoryGhostToggle.checked = themeConfig.mandatoryGhosting === true;
    if (fieldRevealToggle) fieldRevealToggle.checked = themeConfig.fieldIdReveal === true;
    if (actionRevealToggle) actionRevealToggle.checked = themeConfig.actionReveal === true;
    if (faviconTintToggle) faviconTintToggle.checked = themeConfig.faviconTinting !== false;
  }
  applyThemeUI();

  const sync = async () => {
    await chrome.storage.local.set({ rules, commands, actions, themeConfig });
    chrome.runtime.sendMessage({ type: 'RELOAD_RULES' }).catch(() => {});
  };

  modeToggle.onclick = () => { themeConfig.mode = themeConfig.mode === 'dark' ? 'light' : 'dark'; applyThemeUI(); sync(); };
  if (mandatoryGhostToggle) mandatoryGhostToggle.onchange = (e) => { themeConfig.mandatoryGhosting = e.target.checked; sync(); };
  if (fieldRevealToggle) fieldRevealToggle.onchange = (e) => { themeConfig.fieldIdReveal = e.target.checked; sync(); };
  if (actionRevealToggle) actionRevealToggle.onchange = (e) => { themeConfig.actionReveal = e.target.checked; sync(); };
  if (faviconTintToggle) faviconTintToggle.onchange = (e) => { themeConfig.faviconTinting = e.target.checked; sync(); };

  // Rule Strength UI Helper
  if (ruleStrength) {
    ruleStrength.oninput = (e) => {
      if (ruleStrengthVal) ruleStrengthVal.textContent = e.target.value;
    };
  }

  function renderRules() {
    rulesList.innerHTML = '';
    rules.forEach((rule) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="color-dot" style="background: ${rule.color}; border: 2px solid ${rule.labelColor || 'transparent'}">
        </div>
        <div class="item-info">
          <div class="item-name">${rule.label} <span style="font-size:8px; opacity:0.4;">[${rule.styleType}]</span></div>
          <div class="item-meta">${rule.pattern}</div>
        </div>
        <div style="display:flex; gap:12px;">
           <button class="edit-rule-btn" data-id="${rule.id}" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; opacity:0.6;">✎</button>
           <button class="delete-rule-btn" data-id="${rule.id}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:16px; opacity:0.6;">✕</button>
        </div>
      `;
      rulesList.appendChild(item);
    });

    rulesList.querySelectorAll('.delete-rule-btn').forEach(btn => {
      btn.onclick = () => { rules = rules.filter(r => r.id !== btn.dataset.id); renderRules(); sync(); };
    });

    rulesList.querySelectorAll('.edit-rule-btn').forEach(btn => {
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });
  }

  if (shortcutSearch) {
    shortcutSearch.oninput = () => {
      renderCommands();
    };
  }

  function renderCommands() {
    commandsList.innerHTML = '';
    
    const search = (shortcutSearch.value || '').toLowerCase().trim();
    
    const filtered = commands
      .filter(c => c.code.toLowerCase().includes(search) || c.path.toLowerCase().includes(search))
      .sort((a, b) => a.code.localeCompare(b.code));
    
    filtered.forEach((cmd) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div style="font-weight:900; width:50px; font-size:12px; color:#ffffff;">#${cmd.code.toUpperCase()}</div>
        <div class="item-info"><div class="item-meta" style="opacity:1;">${cmd.path}</div></div>
        <div style="display:flex; gap:12px;">
           <button class="edit-cmd-btn" data-code="${cmd.code}" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; opacity:0.6;">✎</button>
           <button class="delete-cmd-btn" data-code="${cmd.code}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:16px; opacity:0.6;">✕</button>
        </div>
      `;
      commandsList.appendChild(item);
    });

    if (filtered.length === 0) {
      commandsList.innerHTML = '<div style="text-align:center; padding:32px; opacity:0.3; font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">No results found</div>';
    }

    commandsList.querySelectorAll('.delete-cmd-btn').forEach(btn => {
      btn.onclick = () => { commands = commands.filter(c => c.code !== btn.dataset.code); renderCommands(); sync(); };
    });

    commandsList.querySelectorAll('.edit-cmd-btn').forEach(btn => {
      btn.onclick = () => {
        const cmd = commands.find(c => c.code === btn.dataset.code);
        if (cmd) {
          editingCmdCode = cmd.code;
          cmdCode.value = cmd.code.toUpperCase();
          cmdPath.value = cmd.path;
          cmdAdd.textContent = 'Update Jump';
          renderCommands();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });
  }

  if (actionHubSearch) {
    actionHubSearch.oninput = () => {
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

    const search = (actionHubSearch.value || '').toLowerCase().trim();
    
    const filtered = actions.filter(a => 
      a.shortcut.toLowerCase().includes(search) || 
      a.name.toLowerCase().includes(search) ||
      a.elementId.toLowerCase().includes(search)
    );

    filtered.forEach((a) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML = `
            <div style="font-weight:900; width:50px; font-size:12px; color:var(--accent);">${a.shortcut}</div>
            <div class="item-info">
                <div style="display:flex; align-items:center; gap:8px;">
                    <div class="item-name">${a.name} <span style="font-size:8px; opacity:0.4; text-transform:uppercase;">[${a.type}]</span></div>
                    <div class="item-meta" style="opacity:0.3; font-size:9px;">ID: ${a.type === 'button' && !a.elementId.startsWith('action-button-') ? `action-button-${a.elementId}` : a.elementId}</div>
                </div>
            </div>
            <div style="display:flex; gap:12px;">
                <button class="edit-action-btn" data-id="${a.id}" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; opacity:0.6;">✎</button>
                <button class="delete-action-btn" data-id="${a.id}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:16px; opacity:0.6;">✕</button>
            </div>
        `;
        actionsList.appendChild(item);
    });

    if (filtered.length === 0) {
        actionsList.innerHTML = '<div style="text-align:center; padding:32px; opacity:0.3; font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em;">No custom actions found</div>';
    }

    actionsList.querySelectorAll('.delete-action-btn').forEach(btn => {
        btn.onclick = () => { actions = actions.filter(a => a.id !== btn.dataset.id); renderActions(); sync(); };
    });

    actionsList.querySelectorAll('.edit-action-btn').forEach(btn => {
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
      a.download = `halo-navigator-hub-backup.json`;
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
          await sync();
          location.reload();
        } catch (err) {
          alert("Failed to import: Invalid JSON format.");
        }
      };
      reader.readAsText(file);
    };
  }

  if (ruleCreate) {
    ruleCreate.onclick = () => {
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
        ruleCreate.textContent = 'Add Environment Rule';
      } else {
        rules.push({
          id: Date.now().toString(),
          label: ruleLabel.value || 'Env',
          labelColor: ruleLabelColor.value || '#ffffff',
          pattern: rulePattern.value,
          styleType: ruleStyle.value,
          color: ruleColor.value,
          strength: parseInt(ruleStrength.value) || 0,
          labelPosition: ruleLabelPos.value,
          hideLabel: ruleHideLabel.checked
        });
      }

      // Reset form to defaults
      if (rulePattern) rulePattern.value = ''; 
      if (ruleLabel) ruleLabel.value = ''; 
      if (ruleLabelColor) ruleLabelColor.value = '#ffffff';
      if (ruleStrength) ruleStrength.value = 0; 
      if (ruleStrengthVal) ruleStrengthVal.textContent = 0;
      if (ruleHideLabel) ruleHideLabel.checked = false; // Disabled by default
      
      renderRules(); 
      sync();
    };
  }

  if (cmdAdd) {
    cmdAdd.onclick = () => {
      if (!cmdCode || !cmdPath || !cmdCode.value || !cmdPath.value) return;
      const code = cmdCode.value.trim().toLowerCase();

      if (editingCmdCode) {
        commands = commands.map(c => c.code === editingCmdCode ? { code, path: cmdPath.value } : c);
        editingCmdCode = null;
        cmdAdd.textContent = 'Register Jump';
      } else {
        if (commands.find(c => c.code === code)) return;
        commands.push({ code, path: cmdPath.value });
      }

      cmdCode.value = ''; cmdPath.value = ''; renderCommands(); sync();
    };
  }

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
          actionAdd.textContent = 'Register Action';
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
      await sync();
    };
  }

  globalSaveTop.onclick = async () => { await sync(); globalSaveTop.textContent = 'Settings Deployed!'; setTimeout(() => globalSaveTop.textContent = 'Deploy Settings', 2000); };

  renderRules();
  renderCommands();
  renderActions();
});