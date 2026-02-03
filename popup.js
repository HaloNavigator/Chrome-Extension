
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
  const linksList = document.getElementById('links-list');
  const openOptions = document.getElementById('open-options');
  const saveButtons = document.querySelectorAll('.save-btn');
  const magicFillBtn = document.getElementById('magic-fill-btn');
  const launchSqlBtn = document.getElementById('launch-sql');
  const fieldRevealToggle = document.getElementById('field-reveal-toggle');
  
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

  // State
  let rules = [];
  let commands = [];
  let themeConfig = { mode: 'dark', primaryColor: '#00ff87', preset: 'halo', fieldIdReveal: false, mandatoryGhosting: false };
  let editingRuleId = null;
  let editingCmdCode = null;

  const HALO_LINKS = [
    { title: "Halo Support", desc: "support.haloservicedesk.com", url: "https://support.haloservicedesk.com/portal/", initial: "S", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Halo Community", desc: "community.haloitsm.com", url: "https://community.haloitsm.com/", initial: "C", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Admin Hangout", desc: "discord.com/haloitsm", url: "https://discord.com/channels/1050832376185495562", initial: "D", color: "var(--accent)", bg: "rgba(0,255,135,0.1)" },
    { title: "Product Roadmap", desc: "usehalo.com/roadmap", url: "https://usehalo.com/haloitsm/roadmap/", initial: "R", color: "var(--amber)", bg: "rgba(245,158,11,0.1)" },
    { title: "Halo Release Notes", desc: "haloreleases.remmy.dev", url: "https://haloreleases.remmy.dev/", initial: "RN", color: "var(--cyan)", bg: "rgba(6, 182, 212, 0.1)" },
    { title: "System Status", desc: "status.haloitsm.com", url: "https://status.haloitsm.com/", initial: "ST", color: "var(--red)", bg: "rgba(239,68,68,0.1)" },
    { title: "Contact Support", desc: "halonavigator@gmail.com", url: "mailto:halonavigator@gmail.com", initial: "M", color: "var(--indigo)", bg: "rgba(129,140,248,0.1)" }
  ];

  // Load Data
  const data = await chrome.storage.local.get(['rules', 'commands', 'themeConfig']);
  rules = data.rules || [];
  commands = data.commands || [];
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
    renderLinks(); // Re-render links to update accent colors if necessary
  }

  const saveAll = async () => {
    await chrome.storage.local.set({ rules, commands, themeConfig });
    chrome.runtime.sendMessage({ type: 'RELOAD_RULES' }).catch(() => {});
  };

  // Rule Strength UI Helper
  ruleStrength.oninput = (e) => {
    ruleStrengthVal.textContent = e.target.value;
  };

  // Rule Handlers
  ruleCreate.onclick = async () => {
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
      ruleCreate.textContent = 'Add Rule';
    } else {
      rules.push({
        id: Date.now().toString(),
        label: ruleLabel.value || 'Env',
        pattern: rulePattern.value,
        styleType: ruleStyle.value,
        color: ruleColor.value,
        strength: parseInt(ruleStrength.value) || 0,
        hideLabel: ruleHideLabel.checked,
        labelPosition: ruleLabelPos.value
      });
    }
    
    rulePattern.value = ''; ruleLabel.value = ''; ruleStrength.value = 0; ruleStrengthVal.textContent = 0;
    renderRules();
    await saveAll();
  };

  function renderRules() {
    if (!rulesList) return;
    rulesList.innerHTML = '';
    rules.forEach((rule) => {
      const card = document.createElement('div');
      card.className = `item-card ${editingRuleId === rule.id ? 'editing-highlight' : ''}`;
      card.innerHTML = `
        <div class="color-box" style="background: ${rule.color}">
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
  cmdAdd.onclick = async () => {
    if (!cmdCode.value || !cmdPath.value) return;
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

  function renderCommands() {
    if (!commandsList) return;
    commandsList.innerHTML = '';
    commands.forEach((cmd) => {
      const isAbs = cmd.path.includes('://');
      const card = document.createElement('div');
      card.className = `item-card ${editingCmdCode === cmd.code ? 'editing-highlight' : ''}`;
      card.innerHTML = `
        <div class="shortcut-label" style="color: ${isAbs ? 'var(--indigo)' : 'var(--accent)'}; font-size:11px; opacity: 1; font-weight: 900;">
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

  // Theme Handlers
  if (modeToggle) modeToggle.onclick = () => { themeConfig.mode = themeConfig.mode === 'dark' ? 'light' : 'dark'; applyTheme(themeConfig); saveAll(); };
  if (mandatoryGhostToggle) mandatoryGhostToggle.onchange = (e) => { themeConfig.mandatoryGhosting = e.target.checked; saveAll(); };
  if (fieldRevealToggle) fieldRevealToggle.onchange = (e) => { themeConfig.fieldIdReveal = e.target.checked; saveAll(); };

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
      document.querySelectorAll('.tab-btn, .view').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
    };
  });

  // Tool Handlers
  if (magicFillBtn) magicFillBtn.onclick = () => chrome.runtime.sendMessage({ type: 'FILL_FORM' });
  if (launchSqlBtn) launchSqlBtn.onclick = () => chrome.tabs.create({ url: 'sql-generator.html' });
  if (openOptions) openOptions.onclick = () => chrome.runtime.openOptionsPage();
  saveButtons.forEach(btn => btn.onclick = async () => { await saveAll(); btn.textContent = 'Saved!'; setTimeout(() => btn.textContent = 'Save', 2000); });

  // Initial Render
  applyTheme(themeConfig);
  renderRules();
  renderCommands();
  renderLinks();
});
