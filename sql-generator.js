
const schemaString = `
  CREATE TABLE [ApprovalProcess] ([APid] int PRIMARY KEY, [APName] nvarchar) GO
  CREATE TABLE [Area] ([AArea] int PRIMARY KEY, [AAreaDesc] nvarchar) GO
  CREATE TABLE [Batch] ([Bid] int PRIMARY KEY, [BName] nvarchar) GO
  CREATE TABLE [CategoryDetail] ([CDCategoryName] nvarchar, [CDId] int PRIMARY KEY) GO
  CREATE TABLE [Company] ([CNum] int PRIMARY KEY, [CName] nvarchar) GO
  CREATE TABLE [Contract] ([ContractID] int PRIMARY KEY, [CDesc] nvarchar) GO
  CREATE TABLE [Device] ([DDevNum] int, [DSite] int, [DInvNo] nvarchar, [OwnerID] int, [DType] int, [DName] nvarchar, [DCompanyNum] int, [DSection] nvarchar, PRIMARY KEY ([DDevNum], [DSite])) GO
  CREATE TABLE [DeviceInfo] ([DIid] int PRIMARY KEY, [DIDevNum] int, [DIKey] nvarchar, [DIValue] nvarchar) GO
  CREATE TABLE [Downtime] ([DTid] int PRIMARY KEY, [DTFaultid] int, [DTstart] datetime, [DTend] datetime) GO
  CREATE TABLE [Faults] ([Faultid] int PRIMARY KEY, [Username] nvarchar, [UserID] int, [PhoneNumber] nvarchar, [Symptom] nvarchar, [Status] int, [Seriousness] int, [DateOccured] datetime, [SiteNumber] int, [Areaint] int, [Sectio_] nvarchar, [RequestTypeNew] int, [FServiceid] int, [FFlowID] int, [SLAID] int, [DevSite] int, [DeviceNumber] int, [ClearWhoInt] int, [fdeleted] bit, [Category2] nvarchar, [Category3] nvarchar, [Category4] nvarchar, [Category5] nvarchar) GO
  CREATE TABLE [FaultsCustom1] ([FC1id] int PRIMARY KEY, [FC1Val] nvarchar) GO
  CREATE TABLE [FaultsCustomX] ([FCXid] int PRIMARY KEY, [FCXFaultID] int, [FCXVal] nvarchar, [FCXLookupID] int) GO
  CREATE TABLE [FaultDevice] ([FDfaultid] int, [FDsiteid] int, [FDdevnum] int) GO
  CREATE TABLE [FaultWatch] ([FWfaultid] int, [FWunum] int, [FWemail] nvarchar, [FWid] int PRIMARY KEY) GO
  CREATE TABLE [FaultApproval] ([FAid] int PRIMARY KEY, [FAApid] int, [FAstatus] int) GO
  CREATE TABLE [FaultAdditionalAgents] ([FAAId] int PRIMARY KEY, [FAAFaultid] int, [FAAUser] int) GO
  CREATE TABLE [Faulttodo] ([FTid] int PRIMARY KEY, [FTFaultid] int, [FTdesc] nvarchar) GO
  CREATE TABLE [Feedback] ([FBid] int PRIMARY KEY, [FBFaultid] int, [FBNotes] ntext) GO
  CREATE TABLE [FlowHeader] ([FHid] int PRIMARY KEY, [FHName] nvarchar) GO
  CREATE TABLE [FlowStages] ([FSid] int PRIMARY KEY, [FSHeaderID] int, [FSName] nvarchar) GO
  CREATE TABLE [Generic] ([Gid] int PRIMARY KEY, [GName] nvarchar, [GSiteNum] int) GO
  CREATE TABLE [InvoiceHeader] ([ihid] int PRIMARY KEY, [ihRef] nvarchar, [ihTotal] float) GO
  CREATE TABLE [InvoiceDetail] ([IdID] int PRIMARY KEY, [IdIHid] int, [ID_ItemID] int, [IDAmt] float) GO
  CREATE TABLE [InvoicePayment] ([IPid] int PRIMARY KEY, [IPIHid] int, [IPAmount] float) GO
  CREATE TABLE [Item] ([iid] int PRIMARY KEY, [iname] nvarchar, [iRef] nvarchar) GO
  CREATE TABLE [Journey] ([Jid] int PRIMARY KEY, [JFaultid] int, [JDesc] ntext) GO
  CREATE TABLE [Kbentry] ([KBid] int PRIMARY KEY, [KBTitle] nvarchar) GO
  CREATE TABLE [Licence] ([Lid] int PRIMARY KEY, [LName] nvarchar) GO
  CREATE TABLE [Lookup] ([LookupID] int PRIMARY KEY, [LDesc] nvarchar) GO
  CREATE TABLE [Orderhead] ([OHid] int PRIMARY KEY, [OHref] nvarchar) GO
  CREATE TABLE [Orderline] ([OLid] int PRIMARY KEY, [OHid] int, [OLitem] int) GO
  CREATE TABLE [Payment] ([PayId] int PRIMARY KEY, [PayAmount] float) GO
  CREATE TABLE [Paymentheader] ([PHid] int PRIMARY KEY, [PHTotal] float) GO
  CREATE TABLE [Porderhdr] ([POHDRid] int PRIMARY KEY, [POHDRref] nvarchar) GO
  CREATE TABLE [Porderline] ([PLineId] int PRIMARY KEY, [PLineVal] nvarchar) GO
  CREATE TABLE [Policy] ([PId] int PRIMARY KEY, [PDesc] nvarchar, [PSLAID] int) GO
  CREATE TABLE [Policygroup] ([PGid] int PRIMARY KEY, [PGName] nvarchar) GO
  CREATE TABLE [Portals] ([PId] int PRIMARY KEY, [PName] nvarchar) GO
  CREATE TABLE [Portallog] ([PLid] int PRIMARY KEY, [PLMsg] ntext) GO
  CREATE TABLE [Profile] ([PRid] int PRIMARY KEY, [PRName] nvarchar) GO
  CREATE TABLE [Process] ([ProcId] int PRIMARY KEY, [ProcName] nvarchar) GO
  CREATE TABLE [Processstages] ([PSid] int PRIMARY KEY, [PSName] nvarchar) GO
  CREATE TABLE [Quotationheader] ([QHid] int PRIMARY KEY, [QHRef] nvarchar) GO
  CREATE TABLE [Quotationdetail] ([QDId] int PRIMARY KEY, [QDVal] float) GO
  CREATE TABLE [Relateditems] ([RIid] int PRIMARY KEY, [RIparentid] int, [RIchildid] int, [RIref] nvarchar) GO
  CREATE TABLE [Resourcetimelog] ([RTLid] int PRIMARY KEY, [RTLFaultid] int, [RTLSection] nvarchar, [RTLUnum] int, [RTLtime] float) GO
  CREATE TABLE [Roundrobinlog] ([RRLid] int PRIMARY KEY, [RRLinfo] ntext, [RRLFaultid] int) GO
  CREATE TABLE [Requesttype] ([RTID] int PRIMARY KEY, [RTDesc] nvarchar) GO
  CREATE TABLE [Route] ([Rid] int PRIMARY KEY, [RName] nvarchar) GO
  CREATE TABLE [Servsite] ([ServSiteNum] int PRIMARY KEY, [ServName] nvarchar) GO
  CREATE TABLE [Servicecategory] ([SCID] int PRIMARY KEY, [SCName] nvarchar) GO
  CREATE TABLE [Servicerequestdetails] ([SRid] int PRIMARY KEY, [SRCategoryID] int, [SRServID] int) GO
  CREATE TABLE [Site] ([SSitenum] int PRIMARY KEY, [SSitename] nvarchar, [SArea] int, [SManager] int) GO
  CREATE TABLE [Sitecontact] ([SCid] int PRIMARY KEY, [SCName] nvarchar, [SCPhone] nvarchar, [SCsite] int, [SCuid] int) GO
  CREATE TABLE [Stocklocation] ([SLocid] int PRIMARY KEY, [SLocName] nvarchar) GO
  CREATE TABLE [Stocklevel] ([SLid] int PRIMARY KEY, [SLQty] int, [SLlocation] int) GO
  CREATE TABLE [Stockbin] ([SBid] int PRIMARY KEY, [SBname] nvarchar, [STBSsitenum] int) GO
  CREATE TABLE [Stdrequest] ([SRid] int PRIMARY KEY, [SRTemplate] nvarchar) GO
  CREATE TABLE [Supplier] ([SupplierID] int PRIMARY KEY, [SupplierName] nvarchar, [SHSupplierID] int) GO
  CREATE TABLE [Supplierorderheader] ([SHid] int PRIMARY KEY, [SHSupplierID] int, [SHOHID] int) GO
  CREATE TABLE [Supplierorderdetail] ([SDid] int PRIMARY KEY, [SDSHid] int, [SDItemid] int, [SDOLID] int) GO
  CREATE TABLE [Tree] ([TreeID] int PRIMARY KEY, [TreeName] nvarchar) GO
  CREATE TABLE [Tstatus] ([TStatusID] int PRIMARY KEY, [TStatusName] nvarchar) GO
  CREATE TABLE [Typeinfo] ([TIid] int PRIMARY KEY, [TIName] nvarchar) GO
  CREATE TABLE [Uname] ([UnameID] int PRIMARY KEY, [UnameName] nvarchar) GO
  CREATE TABLE [Userdevice] ([UDid] int PRIMARY KEY, [UDsite] int, [UDusername] nvarchar, [UDdevnum] int, [UDdevsite] int) GO
  CREATE TABLE [Users] ([uid] int PRIMARY KEY, [Usite] int, [UUsername] nvarchar, [Email] nvarchar) GO
  CREATE TABLE [Viewlog] ([VLid] int PRIMARY KEY, [VLFaultID] int, [VLUserID] int, [VLtime] datetime) GO
  CREATE TABLE [Xtype] ([XTypeID] int PRIMARY KEY, [XName] nvarchar) GO
  CREATE TABLE [Xtypestatus] ([XTSid] int PRIMARY KEY, [XTSName] nvarchar) GO
  CREATE TABLE [Xtypestatusrestrictions] ([XTRid] int PRIMARY KEY, [XTRName] nvarchar) GO
  CREATE TABLE [Inst] ([InstId] int PRIMARY KEY, [InstVal] nvarchar) GO
`;

const JOINMAP_INPUT = {
  "Actions": { "Faults": "[Actions].[Faultid] = [Faults].[Faultid]" },
  "Appointment": { "Faults": "[Appointment].[APFaultid] = [Faults].[Faultid]", "Uname": "[Appointment].[APunum] = [Uname].[UnameID]" },
  "ApprovalProcess": { "FaultApproval": "[ApprovalProcess].[APid] = [FaultApproval].[FAApid]" },
  "Area": { "Faults": "[Area].[AArea] = [Faults].[Areaint]", "Site": "[Area].[AArea] = [Site].[SArea]", "Tree": "[Area].[AtreeID] = [Tree].[TreeID]" },
  "CategoryDetail": { "Faults": "[CategoryDetail].[CDCategoryName] = [Faults].[Category5]" },
  "Company": { "Contract": "[Company].[CNum] = [Contract].[ContractID]", "Device": "[Company].[CNum] = [Device].[DCompanyNum]", "Faults": "[Company].[CNum] = [Faults].[Supplier]" },
  "Device": { "Company": "[Device].[DCompanyNum] = [Company].[CNum]", "DeviceInfo": "[Device].[DDevNum] = [DeviceInfo].[DIDevNum]", "FaultDevice": "[Device].[DDevNum] = [FaultDevice].[FDdevnum]", "Faults": "[Device].[DDevNum] = [Faults].[DeviceNumber]", "Site": "[Device].[DSite] = [Site].[SSitenum]" },
  "Faults": {
    "Actions": "[Faults].[Faultid] = [Actions].[Faultid]",
    "Appointment": "[Faults].[Faultid] = [Appointment].[APFaultid]",
    "Area": "[Faults].[Areaint] = [Area].[AArea]",
    "CategoryDetail": "[Faults].[Category2] = [CategoryDetail].[CDCategoryName]",
    "Company": "[Faults].[Supplier] = [Company].[CNum]",
    "Device": "[Faults].[DevSite] = [Device].[DSite]",
    "Downtime": "[Faults].[Faultid] = [Downtime].[DTFaultid]",
    "FaultAdditionalAgents": "[Faults].[Faultid] = [FaultAdditionalAgents].[FAAFaultid]",
    "FaultApproval": "[Faults].[Faultid] = [FaultApproval].[FAid]",
    "FaultDevice": "[Faults].[Faultid] = [FaultDevice].[FDfaultid]",
    "FaultWatch": "[Faults].[Faultid] = [FaultWatch].[FWfaultid]",
    "Feedback": "[Faults].[Faultid] = [Feedback].[FBFaultid]",
    "FlowHeader": "[Faults].[FFlowID] = [FlowHeader].[FHid]",
    "InvoiceDetail": "[Faults].[Faultid] = [InvoiceDetail].[IdIHid]",
    "Journey": "[Faults].[Faultid] = [Journey].[JFaultid]",
    "Orderhead": "[Faults].[Faultid] = [Orderhead].[OHid]",
    "Requesttype": "[Faults].[RequestTypeNew] = [Requesttype].[RTID]",
    "Site": "[Faults].[SiteNumber] = [Site].[SSitenum]",
    "Tstatus": "[Faults].[Status] = [Tstatus].[TStatusID]",
    "Uname": "[Faults].[ClearWhoInt] = [Uname].[UnameID]",
    "Users": "[Faults].[UserID] = [Users].[uid]"
  },
  "InvoiceHeader": { "InvoiceDetail": "[InvoiceHeader].[ihid] = [InvoiceDetail].[IdIHid]", "Site": "[InvoiceHeader].[ihid] = [Site].[SSitenum]" },
  "Orderhead": { "Orderline": "[Orderhead].[OHid] = [Orderline].[OHid]", "Site": "[Orderhead].[OHid] = [Site].[SSitenum]" },
  "Site": { "Area": "[Site].[SArea] = [Area].[AArea]", "Device": "[Site].[SSitenum] = [Device].[DSite]", "Faults": "[Site].[SSitenum] = [Faults].[SiteNumber]", "Users": "[Site].[SSitenum] = [Users].[Usite]" }
};

const tables = {};
const allPotentialJoins = [];
const requestTypeMap = { 'All': [], 'Incident': [1], 'Change': [2], 'Problem': [3], 'Service Request': [4] };

let selectedTables = {};
let selectedJoins = {};
let whereConditions = [];
let tableSearchTerm = '';
let joinSearchTerm = '';
let selectedRequestType = 'All';

async function applyTheme() {
    try {
        const data = await chrome.storage.local.get(['themeConfig']);
        if (data.themeConfig) {
            const config = data.themeConfig;
            document.documentElement.style.setProperty('--accent', config.primaryColor);
            if (config.mode === 'light') {
                document.documentElement.style.setProperty('--bg', '#f1f5f9');
                document.documentElement.style.setProperty('--panel-bg', '#ffffff');
                document.documentElement.style.setProperty('--input-bg', '#f8fafc');
                document.documentElement.style.setProperty('--text', '#1e293b');
                document.documentElement.style.setProperty('--border', '#e2e8f0');
                document.documentElement.style.setProperty('--btn-secondary', '#cbd5e1');
            } else {
                document.documentElement.style.setProperty('--bg', '#264653');
                document.documentElement.style.setProperty('--panel-bg', '#1a202c');
                document.documentElement.style.setProperty('--input-bg', '#0a0c10');
                document.documentElement.style.setProperty('--text', '#e2e8f0');
                document.documentElement.style.setProperty('--border', '#2d3748');
                document.documentElement.style.setProperty('--btn-secondary', '#2c3e50');
            }
        }
    } catch (e) {
        console.warn("Theme application failed - using defaults.", e);
    }
}

function parseSchema(sql) {
    const blocks = sql.split(/\s*GO\s*/).filter(block => block.trim() !== '');
    blocks.forEach(block => {
        const tableMatch = block.match(/CREATE TABLE \[(\w+)\] \((.*)\)/s);
        if (tableMatch) {
            const tableName = tableMatch[1];
            const content = tableMatch[2];
            const columnRegex = /\[([^\]]+)\]\s+([a-zA-Z0-9]+(\([^)]+\))?)/g;
            let columnMatch;
            const columns = [];
            while ((columnMatch = columnRegex.exec(content)) !== null) {
                columns.push({ name: columnMatch[1], type: columnMatch[2] });
            }
            tables[tableName] = { name: tableName, columns: columns };
        }
    });

    Object.keys(JOINMAP_INPUT).forEach(from => {
        Object.keys(JOINMAP_INPUT[from]).forEach(to => {
            allPotentialJoins.push({ from, to, condition: JOINMAP_INPUT[from][to] });
        });
    });
}

function generateQuery() {
    const selectedFields = [];
    for (const t in selectedTables) {
        if (selectedTables[t].isStar) {
            selectedFields.push(`[${t}].*`);
        } else {
            selectedTables[t].columns.forEach(col => selectedFields.push(`[${t}].[${col}]`));
        }
    }

    const joins = Object.values(selectedJoins);
    const hasSelections = selectedFields.length > 0 || joins.length > 0;
    if (!hasSelections) {
        document.getElementById('query-output-sql').value = '';
        return;
    }

    let query = `SELECT\n    ${selectedFields.length > 0 ? selectedFields.join(',\n    ') : '*'}\n`;
    const firstTable = Object.keys(selectedTables)[0] || (joins[0] ? joins[0].from : 'Faults');
    
    if (firstTable) {
        query += `FROM [${firstTable}]`;
        joins.forEach(j => {
            query += `\n    INNER JOIN [${j.to}] ON ${j.condition}`;
        });
    }

    let whereClause = `[Faults].[fdeleted] = 0`;
    if (selectedRequestType !== 'All') {
        const ids = requestTypeMap[selectedRequestType];
        if (ids && ids.length) whereClause += `\n    AND [Faults].[RequestTypeNew] IN (${ids.join(', ')})`;
    }
    whereConditions.forEach(c => {
        if(c.value.trim() !== '') {
           whereClause += `\n    ${c.operatorType} [${c.table}].[${c.column}] ${c.operator} '${c.value}'`;
        }
    });
    query += `\nWHERE ${whereClause}`;

    document.getElementById('query-output-sql').value = query;
    updateJoinInfoPanel();
    updateSelectors();
}

function renderSchema() {
    const container = document.getElementById('schema-container-sql');
    if (!container) return;
    container.innerHTML = '';

    const sorted = Object.keys(tables).sort((a, b) => {
        const la = a.toLowerCase();
        const lb = b.toLowerCase();
        if (la === 'faults') return -1;
        if (lb === 'faults') return 1;
        return la.localeCompare(lb);
    });
    
    const filtered = tableSearchTerm ? sorted.filter(t => t.toLowerCase().includes(tableSearchTerm.toLowerCase())) : sorted;

    filtered.forEach(t => {
        const card = document.createElement('div');
        card.className = 'table-item-sql';
        const isSelectedAll = selectedTables[t] && selectedTables[t].isStar;
        
        const hdr = document.createElement('div');
        hdr.className = 'table-header-row';
        hdr.innerHTML = `<div><span class="table-name">${t}</span></div><span class="select-all-btn">${isSelectedAll ? 'Unselect' : 'Select All'}</span>`;
        
        const list = document.createElement('div');
        list.className = 'field-list hidden';
        
        tables[t].columns.forEach(col => {
            const label = document.createElement('label');
            label.className = 'field-item';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = (selectedTables[t] && selectedTables[t].columns.includes(col.name)) || isSelectedAll;
            cb.addEventListener('change', (e) => {
                if (!selectedTables[t]) selectedTables[t] = { columns: [], isStar: false };
                if (e.target.checked) selectedTables[t].columns.push(col.name);
                else selectedTables[t].columns = selectedTables[t].columns.filter(f => f !== col.name);
                if (selectedTables[t].columns.length === 0) delete selectedTables[t];
                generateQuery();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(col.name));
            list.appendChild(label);
        });

        hdr.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-all-btn')) {
                if (isSelectedAll) delete selectedTables[t];
                else selectedTables[t] = { columns: tables[t].columns.map(c => c.name), isStar: true };
                generateQuery();
                renderSchema();
            } else {
                list.classList.toggle('hidden');
            }
        });

        card.appendChild(hdr);
        card.appendChild(list);
        container.appendChild(card);
    });
}

function updateJoinInfoPanel() {
    const list = document.getElementById('join-list');
    if (!list) return;
    list.innerHTML = '';
    const active = new Set([...Object.keys(selectedTables), ...Object.values(selectedJoins).flatMap(j => [j.from, j.to])]);
    if (!active.size) active.add('Faults');

    const filteredJoins = allPotentialJoins.filter(join => {
        const isTarget = active.has(join.from) || active.has(join.to);
        if (!isTarget) return false;
        if (!joinSearchTerm) return true;
        const search = joinSearchTerm.toLowerCase();
        return join.from.toLowerCase().includes(search) || join.to.toLowerCase().includes(search);
    });

    filteredJoins.forEach(join => {
        const key = `${join.from}-${join.to}`;
        const row = document.createElement('div');
        row.className = 'join-card';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!selectedJoins[key];
        cb.onchange = (e) => {
            if (e.target.checked) selectedJoins[key] = join;
            else delete selectedJoins[key];
            generateQuery();
        };
        row.appendChild(cb);
        const info = document.createElement('div');
        info.innerHTML = `<div class="join-label">${join.from} → ${join.to}</div><div class="join-cond">${join.condition}</div>`;
        row.appendChild(info);
        list.appendChild(row);
    });
}

function updateSelectors() {
    const active = new Set([...Object.keys(selectedTables), ...Object.values(selectedJoins).flatMap(j => [j.from, j.to])]);
    if (!active.size) active.add('Faults');
    const cols = [];
    active.forEach(t => { if(tables[t]) tables[t].columns.forEach(c => cols.push({ table: t, name: c.name })); });
    
    const gbs = document.getElementById('group-by-select');
    if (gbs) {
        gbs.innerHTML = cols.map(c => `<option value="${c.table}.${c.name}">[${c.table}].[${c.name}]</option>`).join('');
    }
}

function renderFilters() {
    const rtContainer = document.getElementById('request-type-container');
    if(rtContainer) {
        const select = document.createElement('select');
        select.className = 'search-input';
        select.style.marginBottom = '0';
        Object.keys(requestTypeMap).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            select.appendChild(opt);
        });
        select.onchange = (e) => { selectedRequestType = e.target.value; generateQuery(); };
        rtContainer.appendChild(select);
    }

    document.getElementById('add-where-btn').onclick = () => {
        const id = Math.random().toString(36).substring(7);
        whereConditions.push({ id, table: 'Faults', column: 'Faultid', operator: '=', value: '', operatorType: 'AND' });
        renderWhereConditions();
    };
}

function renderWhereConditions() {
    const container = document.getElementById('where-conditions-container');
    if(!container) return;
    container.innerHTML = '';

    const active = new Set([...Object.keys(selectedTables), ...Object.values(selectedJoins).flatMap(j => [j.from, j.to])]);
    if (!active.size) active.add('Faults');
    const cols = [];
    active.forEach(t => { if(tables[t]) tables[t].columns.forEach(c => cols.push({ table: t, name: c.name })); });

    whereConditions.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = 'join-card flex-col';
        div.style.padding = '8px';
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
               <span class="label-sub" style="margin:0;">Condition ${idx+1}</span>
               <button class="remove-where" data-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:10px; font-weight:900;">✕</button>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 40px 1fr; gap:5px;">
                <select class="search-input col-sel" style="margin:0; padding:5px; height:28px; font-size:10px;">
                    ${cols.map(col => `<option value="${col.table}.${col.name}" ${c.table === col.table && c.column === col.name ? 'selected' : ''}>[${col.table}].[${col.name}]</option>`).join('')}
                </select>
                <select class="search-input op-sel" style="margin:0; padding:5px; height:28px; font-size:10px;">
                    <option value="=" ${c.operator === '=' ? 'selected' : ''}>=</option>
                    <option value="<>" ${c.operator === '<>' ? 'selected' : ''}>!=</option>
                    <option value="LIKE" ${c.operator === 'LIKE' ? 'selected' : ''}>LIKE</option>
                </select>
                <input type="text" class="search-input val-sel" placeholder="Value..." value="${c.value}" style="margin:0; padding:5px; height:28px; font-size:10px;">
            </div>
        `;

        div.querySelector('.col-sel').onchange = (e) => {
            const [t, col] = e.target.value.split('.');
            c.table = t; c.column = col;
            generateQuery();
        };
        div.querySelector('.op-sel').onchange = (e) => { c.operator = e.target.value; generateQuery(); };
        div.querySelector('.val-sel').oninput = (e) => { c.value = e.target.value; generateQuery(); };
        div.querySelector('.remove-where').onclick = () => {
            whereConditions = whereConditions.filter(wc => wc.id !== c.id);
            renderWhereConditions();
            generateQuery();
        };

        container.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyTheme();
    parseSchema(schemaString);
    
    document.getElementById('table-search').oninput = (e) => { tableSearchTerm = e.target.value; renderSchema(); };
    document.getElementById('join-search').oninput = (e) => { joinSearchTerm = e.target.value; updateJoinInfoPanel(); };
    
    const copyBtn = document.getElementById('copy-btn-sql');
    copyBtn.onclick = () => {
        const val = document.getElementById('query-output-sql').value;
        if (val) {
          navigator.clipboard.writeText(val);
          const original = copyBtn.textContent;
          copyBtn.textContent = 'SQL COPIED!';
          setTimeout(() => {
            copyBtn.textContent = original;
          }, 2000);
        }
    };

    document.getElementById('clear-btn-sql').onclick = () => window.location.reload();
    
    renderSchema();
    renderFilters();
    generateQuery();
});
