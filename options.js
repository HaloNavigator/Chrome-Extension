
// Halo Navigator - Hub/Options Logic
document.addEventListener('DOMContentLoaded', async () => {
  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const globalSaveTop = document.getElementById('global-save-top');
  const shortcutSearch = document.getElementById('shortcut-search');
  
  const exportBtn = document.getElementById('export-btn');
  const importInput = document.getElementById('import-input');

  const ruleLabel = document.getElementById('rule-label');
  const rulePattern = document.getElementById('rule-pattern');
  const ruleStyle = document.getElementById('rule-style');
  const ruleColor = document.getElementById('rule-color');
  const ruleStrength = document.getElementById('rule-strength');
  const ruleStrengthVal = document.getElementById('strength-val');
  const ruleLabelPos = document.getElementById('rule-label-pos');
  const ruleHideLabel = document.getElementById('rule-hide-label');
  const ruleCreate = document.getElementById('rule-create');

  const cmdCode = document.getElementById('cmd-code');
  const cmdPath = document.getElementById('cmd-path');
  const cmdAdd = document.getElementById('cmd-add');

  const modeToggle = document.getElementById('mode-toggle');

  let rules = [];
  let commands = [];
  let themeConfig = { mode: 'dark', primaryColor: '#00ff87', preset: 'halo', fieldIdReveal: false };
  let editingRuleId = null;
  let editingCmdCode = null;

  // Explicitly disable Hide Label by default on start
  if (ruleHideLabel) ruleHideLabel.checked = false;

  const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig']);
  rules = data.rules || [];
  commands = data.commands || [];
  if (data.themeConfig) themeConfig = { ...themeConfig, ...data.themeConfig };

  function applyThemeUI() {
    document.body.setAttribute('data-theme', themeConfig.mode);
    document.documentElement.style.setProperty('--accent', themeConfig.primaryColor);
    modeToggle.textContent = themeConfig.mode === 'dark' ? '🌙' : '☀️';
  }
  applyThemeUI();

  const sync = async () => {
    await chrome.storage.local.set({ rules, commands, themeConfig });
    chrome.runtime.sendMessage({ type: 'RELOAD_RULES' }).catch(() => {});
  };

  modeToggle.onclick = () => { themeConfig.mode = themeConfig.mode === 'dark' ? 'light' : 'dark'; applyThemeUI(); sync(); };

  ruleStrength.oninput = (e) => {
    ruleStrengthVal.textContent = e.target.value;
  };

  function renderRules() {
    rulesList.innerHTML = '';
    rules.forEach((rule) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="color-dot" style="background: ${rule.color}">
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

  shortcutSearch.oninput = () => {
    renderCommands();
  };

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

  // Export/Import Handlers
  if (exportBtn) {
    exportBtn.onclick = () => {
      const dataToExport = {
        rules,
        commands,
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

  ruleCreate.onclick = () => {
    if (!rulePattern.value) return;

    if (editingRuleId) {
      rules = rules.map(r => r.id === editingRuleId ? {
        ...r,
        label: ruleLabel.value || 'Env',
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
        pattern: rulePattern.value,
        styleType: ruleStyle.value,
        color: ruleColor.value,
        strength: parseInt(ruleStrength.value) || 0,
        labelPosition: ruleLabelPos.value,
        hideLabel: ruleHideLabel.checked
      });
    }

    // Reset form to defaults
    rulePattern.value = ''; 
    ruleLabel.value = ''; 
    ruleStrength.value = 0; 
    ruleStrengthVal.textContent = 0;
    ruleHideLabel.checked = false; // Disabled by default
    
    renderRules(); 
    sync();
  };

  cmdAdd.onclick = () => {
    if (!cmdCode.value || !cmdPath.value) return;
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

  globalSaveTop.onclick = async () => { await sync(); globalSaveTop.textContent = 'Settings Deployed!'; setTimeout(() => globalSaveTop.textContent = 'Deploy Settings', 2000); };

  renderRules();
  renderCommands();
});
