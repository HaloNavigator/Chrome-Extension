
// Halo Navigator - Dashboard/Options Logic
document.addEventListener('DOMContentLoaded', async () => {
  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const globalSaveTop = document.getElementById('global-save-top');
  
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

  function renderCommands() {
    commandsList.innerHTML = '';
    commands.forEach((cmd) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div style="font-weight:900; width:50px; font-size:12px; color:var(--accent);">#${cmd.code.toUpperCase()}</div>
        <div class="item-info"><div class="item-meta" style="opacity:1;">${cmd.path}</div></div>
        <div style="display:flex; gap:12px;">
           <button class="edit-cmd-btn" data-code="${cmd.code}" style="background:none; border:none; color:var(--text); cursor:pointer; font-size:14px; opacity:0.6;">✎</button>
           <button class="delete-cmd-btn" data-code="${cmd.code}" style="color:var(--red); background:none; border:none; cursor:pointer; font-size:16px; opacity:0.6;">✕</button>
        </div>
      `;
      commandsList.appendChild(item);
    });

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
          cmdAdd.textContent = 'Update Shortcut';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });
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

    rulePattern.value = ''; ruleLabel.value = ''; ruleStrength.value = 0; ruleStrengthVal.textContent = 0; renderRules(); sync();
  };

  cmdAdd.onclick = () => {
    if (!cmdCode.value || !cmdPath.value) return;
    const code = cmdCode.value.trim().toLowerCase();

    if (editingCmdCode) {
      commands = commands.map(c => c.code === editingCmdCode ? { code, path: cmdPath.value } : c);
      editingCmdCode = null;
      cmdAdd.textContent = 'Register Shortcut';
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
