// Halo Navigator - Dashboard/Options Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const globalSave = document.getElementById('global-save');
  const ruleFormTitle = document.getElementById('rule-form-title');
  const cmdFormTitle = document.getElementById('cmd-form-title');
  
  // Rule Form
  const ruleLabel = document.getElementById('rule-label');
  const rulePattern = document.getElementById('rule-pattern');
  const ruleStyle = document.getElementById('rule-style');
  const ruleColor = document.getElementById('rule-color');
  const ruleStrength = document.getElementById('rule-strength');
  const strengthVal = document.getElementById('strength-val');
  const ruleHideLabel = document.getElementById('rule-hide-label');
  const ruleLabelPosition = document.getElementById('rule-label-position');
  
  const ruleCreate = document.getElementById('rule-create');
  const ruleUpdate = document.getElementById('rule-update');
  const ruleCancel = document.getElementById('rule-cancel');
  const ruleEditActions = document.getElementById('rule-edit-actions');

  // Command Form
  const cmdCode = document.getElementById('cmd-code');
  const cmdPath = document.getElementById('cmd-path');
  const cmdAdd = document.getElementById('cmd-add');
  const cmdUpdate = document.getElementById('cmd-update');
  const cmdCancel = document.getElementById('cmd-cancel');
  const cmdEditActions = document.getElementById('cmd-edit-actions');

  // State
  let rules = [];
  let commands = [];
  let editingId = null;
  let editingCmdCode = null;

  // Load Data
  const data = await chrome.storage.local.get(['rules', 'commands']);
  rules = data.rules || [];
  commands = data.commands || [];

  if (ruleStrength) {
    ruleStrength.addEventListener('input', () => {
      if (strengthVal) strengthVal.textContent = ruleStrength.value;
    });
  }

  function renderRules() {
    if (!rulesList) return;
    rulesList.innerHTML = '';
    if (rules.length === 0) {
      rulesList.innerHTML = '<div style="opacity: 0.3; text-align: center; padding: 40px; font-size: 13px;">No rules defined. Configure your first environment above.</div>';
      return;
    }
    rules.forEach(rule => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="color-dot" style="background: ${rule.color}"></div>
        <div class="item-info">
          <div class="item-label">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rule.label || 'Env'}</span>
            <span class="tag">${rule.styleType}</span>
            ${rule.hideLabel ? '<span class="tag" style="color:#ef4444">HIDDEN</span>' : `<span class="tag" style="opacity:0.6">${rule.labelPosition || 'right'}</span>`}
          </div>
          <div class="item-pattern">${rule.pattern}</div>
        </div>
        <div class="item-actions">
          <button class="action-btn edit-rule" data-id="${rule.id}">✎</button>
          <button class="action-btn delete-rule delete" data-id="${rule.id}">✕</button>
        </div>
      `;
      rulesList.appendChild(item);
    });

    rulesList.querySelectorAll('.edit-rule').forEach(btn => {
      btn.onclick = () => {
        const rule = rules.find(r => r.id === btn.getAttribute('data-id'));
        if (rule) startEditRule(rule);
      };
    });

    rulesList.querySelectorAll('.delete-rule').forEach(btn => {
      btn.onclick = () => {
        rules = rules.filter(r => r.id !== btn.getAttribute('data-id'));
        renderRules();
      };
    });
  }

  function renderCommands() {
    if (!commandsList) return;
    commandsList.innerHTML = '';
    if (commands.length === 0) {
      commandsList.innerHTML = '<div style="opacity: 0.3; text-align: center; padding: 40px; font-size: 13px;">No shortcuts registered.</div>';
      return;
    }
    commands.forEach(cmd => {
      const isAbs = cmd.path.includes('://');
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div style="font-weight: 900; color: ${isAbs ? '#818cf8' : 'var(--accent)'}; width: 60px; font-size: 11px; flex-shrink: 0;">#${cmd.code.toUpperCase()}</div>
        <div class="item-info">
          <div class="item-pattern" style="color: #fff; font-size: 10px;">${cmd.path}</div>
        </div>
        <div class="item-actions">
          <button class="action-btn edit-cmd" data-code="${cmd.code}">✎</button>
          <button class="action-btn delete-cmd delete" data-code="${cmd.code}">✕</button>
        </div>
      `;
      commandsList.appendChild(item);
    });

    commandsList.querySelectorAll('.edit-cmd').forEach(btn => {
      btn.onclick = () => {
        const cmd = commands.find(c => c.code === btn.getAttribute('data-code'));
        if (cmd) startEditCmd(cmd);
      };
    });

    commandsList.querySelectorAll('.delete-cmd').forEach(btn => {
      btn.onclick = () => {
        commands = commands.filter(c => c.code !== btn.getAttribute('data-code'));
        renderCommands();
      };
    });
  }

  function startEditRule(rule) {
    editingId = rule.id;
    ruleLabel.value = rule.label || '';
    rulePattern.value = rule.pattern || '';
    ruleStyle.value = rule.styleType || 'full';
    ruleColor.value = rule.color || '#00ff87';
    ruleStrength.value = rule.strength ?? 5;
    strengthVal.textContent = rule.strength ?? 5;
    ruleHideLabel.checked = rule.hideLabel || false;
    ruleLabelPosition.value = rule.labelPosition || 'right';
    
    ruleFormTitle.textContent = 'Edit Environment: ' + (rule.label || rule.pattern);
    ruleCreate.style.display = 'none';
    ruleEditActions.style.display = 'flex';
    rulePattern.style.borderColor = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetRuleForm() {
    editingId = null;
    ruleLabel.value = '';
    rulePattern.value = '';
    ruleStyle.value = 'full';
    ruleColor.value = '#00ff87';
    ruleStrength.value = 5;
    strengthVal.textContent = '5';
    ruleHideLabel.checked = false;
    ruleLabelPosition.value = 'right';
    
    ruleFormTitle.textContent = 'Environment Rules';
    ruleCreate.style.display = 'block';
    ruleEditActions.style.display = 'none';
    rulePattern.style.borderColor = '';
  }

  function startEditCmd(cmd) {
    editingCmdCode = cmd.code;
    cmdCode.value = cmd.code.toUpperCase();
    cmdPath.value = cmd.path;
    
    cmdFormTitle.textContent = 'Edit Shortcut: #' + cmd.code.toUpperCase();
    cmdAdd.style.display = 'none';
    cmdEditActions.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetCommandForm() {
    editingCmdCode = null;
    cmdCode.value = '';
    cmdPath.value = '';
    
    cmdFormTitle.textContent = 'Navigator Shortcuts';
    cmdAdd.style.display = 'block';
    cmdEditActions.style.display = 'none';
  }

  if (ruleCreate) {
    ruleCreate.onclick = () => {
      const pattern = rulePattern.value.trim();
      if (!pattern) {
        rulePattern.style.borderColor = '#ef4444';
        rulePattern.focus();
        return;
      }
      rulePattern.style.borderColor = '';
      rules.push({
        id: Date.now().toString(),
        label: ruleLabel.value.trim() || 'Env',
        pattern: pattern,
        styleType: ruleStyle.value,
        color: ruleColor.value,
        strength: parseInt(ruleStrength.value),
        hideLabel: ruleHideLabel.checked,
        labelPosition: ruleLabelPosition.value
      });
      resetRuleForm();
      renderRules();
    };
  }

  if (ruleUpdate) {
    ruleUpdate.onclick = () => {
      const pattern = rulePattern.value.trim();
      if (!pattern) {
        rulePattern.style.borderColor = '#ef4444';
        rulePattern.focus();
        return;
      }
      rulePattern.style.borderColor = '';

      const idx = rules.findIndex(r => r.id === editingId);
      if (idx !== -1) {
        rules[idx] = {
          ...rules[idx],
          label: ruleLabel.value.trim() || 'Env',
          pattern: pattern,
          styleType: ruleStyle.value,
          color: ruleColor.value,
          strength: parseInt(ruleStrength.value),
          hideLabel: ruleHideLabel.checked,
          labelPosition: ruleLabelPosition.value
        };
      }
      resetRuleForm();
      renderRules();
    };
  }

  if (ruleCancel) ruleCancel.onclick = resetRuleForm;

  if (cmdAdd) {
    cmdAdd.onclick = () => {
      const code = cmdCode.value.trim().toLowerCase();
      const path = cmdPath.value.trim();
      if (!code || !path) return;
      if (commands.find(c => c.code === code)) return;
      commands.push({ code, path });
      cmdCode.value = '';
      cmdPath.value = '';
      renderCommands();
    };
  }

  if (cmdUpdate) {
    cmdUpdate.onclick = () => {
      const code = cmdCode.value.trim().toLowerCase();
      const path = cmdPath.value.trim();
      if (!code || !path || !editingCmdCode) return;
      
      const idx = commands.findIndex(c => c.code === editingCmdCode);
      if (idx !== -1) {
        commands[idx] = { code, path };
      }
      resetCommandForm();
      renderCommands();
    };
  }

  if (cmdCancel) cmdCancel.onclick = resetCommandForm;

  if (globalSave) {
    globalSave.onclick = async () => {
      await chrome.storage.local.set({ rules, commands });
      const originalText = globalSave.textContent;
      globalSave.textContent = 'Settings Successfully Applied!';
      setTimeout(() => globalSave.textContent = originalText, 2000);
    };
  }

  renderRules();
  renderCommands();
});