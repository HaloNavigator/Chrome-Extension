// Halo Navigator - Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const rulesList = document.getElementById('rules-list');
  const commandsList = document.getElementById('commands-list');
  const globalSave = document.getElementById('global-save');
  const footerActions = document.getElementById('footer-actions');
  const openOptions = document.getElementById('open-options');
  const openSqlGen = document.getElementById('open-sql-gen');
  const magicFillBtn = document.getElementById('magic-fill-btn');
  
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
  const ruleFormTitle = document.getElementById('rule-form-title');

  // Command Form
  const cmdCode = document.getElementById('cmd-code');
  const cmdPath = document.getElementById('cmd-path');
  const cmdAdd = document.getElementById('cmd-add');
  const cmdUpdate = document.getElementById('cmd-update');
  const cmdCancel = document.getElementById('cmd-cancel');
  const cmdEditActions = document.getElementById('cmd-edit-actions');
  const cmdFormTitle = document.getElementById('cmd-form-title');

  // State
  let rules = [];
  let commands = [];
  let editingId = null;
  let editingCmdCode = null;

  const DEFAULT_SHORTCUTS = [
    { code: 'prod', path: 'https://tenant.haloitsm.com' },
    { code: 'dev', path: 'https://dev.haloitsm.com' },
    { code: 'uat', path: 'https://uat.haloitsm.com' },
    { code: 'as', path: '/assets' },
    { code: 'con', path: '/config' },
    { code: 'rep', path: '/reports' },
    { code: 'tic', path: '/tickets' }
  ];

  // Load Data
  const data = await chrome.storage.local.get(['rules', 'commands']);
  rules = data.rules || [];
  commands = (data.commands && data.commands.length > 0) ? data.commands : DEFAULT_SHORTCUTS;

  // Launch SQL Generator
  if (openSqlGen) {
    openSqlGen.onclick = () => {
      chrome.tabs.create({ url: 'sql-generator.html' });
    };
  }

  // Magic Fill Form
  if (magicFillBtn) {
    magicFillBtn.onclick = () => {
      chrome.runtime.sendMessage({ type: 'FILL_FORM' });
    };
  }

  // Open Options Page
  if (openOptions) {
    openOptions.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage(() => {
          if (chrome.runtime.lastError) {
            chrome.tabs.create({ url: 'options.html' });
          }
        });
      } else {
        chrome.tabs.create({ url: 'options.html' });
      }
    });
  }

  // Tab Switching Logic
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.view');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
      
      // Hide global save footer for info tabs and tools tab
      if (footerActions) {
        footerActions.style.display = (targetId === 'help-view' || targetId === 'links-view' || targetId === 'tools-view') ? 'none' : 'block';
      }
    });
  });

  if (ruleStrength) {
    ruleStrength.addEventListener('input', () => {
      if (strengthVal) strengthVal.textContent = ruleStrength.value;
    });
  }

  function renderRules() {
    if (!rulesList) return;
    rulesList.innerHTML = '';
    if (rules.length === 0) {
      rulesList.innerHTML = '<div style="font-size: 11px; opacity: 0.4; text-align: center; padding: 40px;">No rules defined. Add your first environment above.</div>';
      return;
    }
    rules.forEach(rule => {
      const item = document.createElement('div');
      item.className = 'item-card';
      item.innerHTML = `
        <div class="color-box" style="background: ${rule.color}"></div>
        <div class="item-info">
          <div class="item-header">
            <span class="item-name">${rule.label || 'Env'}</span>
            <span class="badge">${rule.styleType}</span>
            ${rule.hideLabel ? '<span class="badge red">HIDDEN</span>' : ''}
            ${!rule.hideLabel && rule.labelPosition !== 'right' ? `<span class="badge blue">${rule.labelPosition}</span>` : ''}
          </div>
          <div class="item-meta">${rule.pattern}</div>
        </div>
        <div class="actions">
          <button class="act-btn edit-rule" data-id="${rule.id}">✎</button>
          <button class="act-btn del delete-rule" data-id="${rule.id}">✕</button>
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
      commandsList.innerHTML = '<div style="font-size: 11px; opacity: 0.4; text-align: center; padding: 40px;">No shortcuts registered</div>';
      return;
    }
    commands.forEach(cmd => {
      const isAbs = cmd.path.includes('://');
      const item = document.createElement('div');
      item.className = 'item-card';
      item.innerHTML = `
        <div class="color-box" style="background: ${isAbs ? 'rgba(129,140,248,0.1)' : 'rgba(0,255,135,0.1)'}; display:flex; align-items:center; justify-content:center; color:${isAbs ? '#818cf8' : 'var(--accent)'}; font-weight:900; font-size:9px;">
          #${cmd.code.toUpperCase()}
        </div>
        <div class="item-info">
          <div class="item-meta" style="color: #fff; opacity:0.8;">${cmd.path}</div>
        </div>
        <div class="actions">
          <button class="act-btn edit-cmd" data-code="${cmd.code}">✎</button>
          <button class="act-btn del delete-cmd" data-code="${cmd.code}">✕</button>
        </div>
      `;
      commandsList.appendChild(item);
    });
    commandsList.querySelectorAll('.edit-cmd').forEach(btn => {
      btn.onclick = () => {
        const cmd = commands.find(c => c.code === btn.getAttribute('data-code'));
        if (cmd) startEditCommand(cmd);
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
    
    ruleFormTitle.textContent = 'Edit Rule: ' + (rule.label || 'Env');
    ruleCreate.style.display = 'none';
    ruleEditActions.style.display = 'flex';
    document.getElementById('rules-view').scrollTo({ top: 0, behavior: 'smooth' });
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
    
    ruleFormTitle.textContent = 'Create New Rule';
    ruleCreate.style.display = 'flex';
    ruleEditActions.style.display = 'none';
  }

  function startEditCommand(cmd) {
    editingCmdCode = cmd.code;
    cmdCode.value = cmd.code.toUpperCase();
    cmdPath.value = cmd.path;
    
    cmdFormTitle.textContent = 'Edit Shortcut: #' + cmd.code.toUpperCase();
    cmdAdd.style.display = 'none';
    cmdEditActions.style.display = 'flex';
    document.getElementById('shortcuts-view').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetCommandForm() {
    editingCmdCode = null;
    cmdCode.value = '';
    cmdPath.value = '';
    
    cmdFormTitle.textContent = 'Shortcut Settings';
    cmdAdd.style.display = 'flex';
    cmdEditActions.style.display = 'none';
  }

  if (ruleCreate) {
    ruleCreate.onclick = () => {
      const pattern = rulePattern.value.trim();
      if (!pattern) { 
        rulePattern.style.borderColor = 'var(--red)';
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
      if (!pattern) return;
      
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
      globalSave.textContent = 'Settings Applied!';
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && !tab.url.startsWith('chrome://')) {
           await chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_RULES' }).catch(() => {});
        }
      } catch (e) {}
      setTimeout(() => globalSave.textContent = originalText, 2000);
    };
  }

  renderRules();
  renderCommands();
});