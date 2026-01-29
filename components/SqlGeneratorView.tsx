
import React, { useState, useEffect, useMemo } from 'react';

const SCHEMA_STRING = `
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

const JOINMAP_INPUT: Record<string, Record<string, string>> = {
  "Actions": { "Faults": "[Actions].[Faultid] = [Faults].[Faultid]" },
  "Appointment": { "Faults": "[Appointment].[APFaultid] = [Faults].[Faultid]", "Uname": "[Appointment].[APunum] = [Uname].[UNum]" },
  "ApprovalProcess": { "FaultApproval": "[ApprovalProcess].[APid] = [FaultApproval].[FAApid]" },
  "Area": { "Faults": "[Area].[AArea] = [Faults].[Areaint]", "Site": "[Area].[AArea] = [Site].[SArea]", "Tree": "[Area].[AtreeID] = [Tree].[TreeID]" },
  "CategoryDetail": { "Faults": "[CategoryDetail].[CDCategoryName] = [Faults].[Category5]" },
  "Company": { "Contract": "[Company].[CNum] = [Contract].[ContractID]", "Device": "[Company].[CNum] = [Device].[DCompanyNum]", "Faults": "[Company].[CNum] = [Faults].[Supplier]" },
  "Device": { "Company": "[Device].[DCompanyNum] = [Company].[CNum]", "DeviceInfo": "[Device].[DDevNum] = [DeviceInfo].[DIDevNum]", "FaultDevice": "[Device].[DDevNum] = [FaultDevice].[FDdevnum]", "Faults": "[Device].[DDevNum] = [Faults].[DeviceNumber]", "Site": "[Device].[DSite] = [Site].[SSitenum]" },
  "Faults": {
    "Actions": "[Faults].[Faultid] = [Actions].[Faultid]", "Appointment": "[Faults].[Faultid] = [Appointment].[APFaultid]", "Area": "[Faults].[Areaint] = [Area].[AArea]", "CategoryDetail": "[Faults].[Category2] = [CategoryDetail].[CDCategoryName]", "Company": "[Faults].[Supplier] = [Company].[CNum]", "Device": "[Faults].[DevSite] = [Device].[DSite]", "Downtime": "[Faults].[Faultid] = [Downtime].[DTFaultid]", "FaultAdditionalAgents": "[Faults].[Faultid] = [FaultAdditionalAgents].[FAAFaultid]", "FaultApproval": "[Faults].[Faultid] = [FaultApproval].[FAid]", "FaultDevice": "[Faults].[Faultid] = [FaultDevice].[FDfaultid]", "FaultWatch": "[Faults].[Faultid] = [FaultWatch].[FWfaultid]", "Feedback": "[Faults].[Faultid] = [Feedback].[FBFaultid]", "FlowHeader": "[Faults].[FFlowID] = [FlowHeader].[FHid]", "InvoiceDetail": "[Faults].[Faultid] = [InvoiceDetail].[IdIHid]", "Journey": "[Faults].[Faultid] = [Journey].[JFaultid]", "OrderHead": "[Faults].[Faultid] = [Orderhead].[OHid]", "RequestType": "[Faults].[RequestTypeNew] = [Requesttype].[RTID]", "Site": "[Faults].[SiteNumber] = [Site].[SSitenum]", "TStatus": "[Faults].[Status] = [Tstatus].[TStatusID]", "Uname": "[Faults].[ClearWhoInt] = [Uname].[UnameID]", "Users": "[Faults].[UserID] = [Users].[uid]"
  },
  "InvoiceHeader": { "InvoiceDetail": "[InvoiceHeader].[ihid] = [InvoiceDetail].[IdIHid]", "Site": "[InvoiceHeader].[ihid] = [Site].[SSitenum]" },
  "Orderhead": { "Orderline": "[Orderhead].[OHid] = [Orderline].[OHid]", "Site": "[Orderhead].[OHid] = [Site].[SSitenum]" },
  "Site": { "Area": "[Site].[SArea] = [Area].[AArea]", "Device": "[Site].[SSitenum] = [Device].[DSite]", "Faults": "[Site].[SSitenum] = [Faults].[SiteNumber]", "Users": "[Site].[SSitenum] = [Users].[Usite]" }
};

interface Column { name: string; type: string; }
interface Table { name: string; columns: Column[]; }
interface JoinInfo { from: string; to: string; condition: string; }
interface WhereCondition { id: string; table: string; column: string; operator: string; value: string; operatorType: 'AND' | 'OR'; }

export const SqlGeneratorView: React.FC = () => {
  const [tables, setTables] = useState<Record<string, Table>>({});
  const [allPotentialJoins, setAllPotentialJoins] = useState<JoinInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<Record<string, { columns: string[], isStar: boolean }>>({});
  const [selectedJoins, setSelectedJoins] = useState<Record<string, JoinInfo>>({});
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [selectedRequestType, setSelectedRequestType] = useState('All');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [tableSearch, setTableSearch] = useState('');
  const [joinSearch, setJoinSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const requestTypeMap: Record<string, number[]> = { 'All': [], 'Incident': [1], 'Change': [2], 'Problem': [3], 'Service Request': [4] };

  useEffect(() => {
    const parsedTables: Record<string, Table> = {};
    const blocks = SCHEMA_STRING.split(/\s*GO\s*/).filter(block => block.trim() !== '');
    blocks.forEach(block => {
      const tableMatch = block.match(/CREATE TABLE \[(\w+)\] \((.*)\)/s);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const content = tableMatch[2];
        const columnRegex = /\[([^\]]+)\]\s+([a-zA-Z0-9]+(\([^)]+\))?)/g;
        let columnMatch;
        const columns: Column[] = [];
        while ((columnMatch = columnRegex.exec(content)) !== null) {
          columns.push({ name: columnMatch[1], type: columnMatch[2] });
        }
        parsedTables[tableName] = { name: tableName, columns };
      }
    });

    const finalJoins: JoinInfo[] = [];
    const processed = new Set();
    Object.keys(JOINMAP_INPUT).forEach(from => {
      Object.keys(JOINMAP_INPUT[from]).forEach(to => {
        const key = [from, to].sort().join('::');
        if (!processed.has(key)) {
          finalJoins.push({ from, to, condition: JOINMAP_INPUT[from][to] });
          processed.add(key);
        }
      });
    });

    setTables(parsedTables);
    setAllPotentialJoins(finalJoins);
  }, []);

  const sortedTableNames = useMemo(() => {
    const keys = Object.keys(tables);
    return keys.sort((a, b) => {
        const la = a.toLowerCase();
        const lb = b.toLowerCase();
        if (la === 'faults') return -1;
        if (lb === 'faults') return 1;
        return la.localeCompare(lb);
    });
  }, [tables]);

  const filteredTableNames = useMemo(() => {
    if (!tableSearch) return sortedTableNames;
    return sortedTableNames.filter(name => name.toLowerCase().includes(tableSearch.toLowerCase()));
  }, [sortedTableNames, tableSearch]);

  // Fix: Explicitly type allAvailableColumns to avoid inference issues resulting in 'unknown' type.
  const allAvailableColumns: { table: string; name: string }[] = useMemo(() => {
    const active = new Set([...Object.keys(selectedTables), ...(Object.values(selectedJoins) as JoinInfo[]).flatMap(j => [j.from, j.to])]);
    if (active.size === 0) active.add('Faults');
    const cols: { table: string, name: string }[] = [];
    active.forEach(t => tables[t]?.columns.forEach(c => cols.push({ table: t, name: c.name })));
    return cols;
  }, [selectedTables, selectedJoins, tables]);

  const generatedQuery = useMemo(() => {
    const hasSelections = Object.keys(selectedTables).length > 0 || Object.keys(selectedJoins).length > 0;
    if (!hasSelections) return "";
    
    const selectedFields: string[] = [];
    for (const tableName in selectedTables) {
      const selection = selectedTables[tableName];
      if (selection.isStar) selectedFields.push(`[${tableName}].*`);
      else selection.columns.forEach(col => selectedFields.push(`[${tableName}].[${col}]`));
    }

    const joins = Object.values(selectedJoins) as JoinInfo[];
    let query = `SELECT\n    ${selectedFields.length > 0 ? selectedFields.join(',\n    ') : '*'}\n`;
    const firstTable = Object.keys(selectedTables)[0] || joins[0]?.from || 'Faults';
    
    if (firstTable) {
      query += `FROM [${firstTable}]`;
      joins.forEach(j => query += `\n    INNER JOIN [${j.to}] ON ${j.condition}`);
    }

    let whereClause = `[Faults].[fdeleted] = 0`;
    if (selectedRequestType !== 'All') {
      const ids = requestTypeMap[selectedRequestType];
      if (ids?.length > 0) whereClause += `\n    AND [Faults].[RequestTypeNew] IN (${ids.join(', ')})`;
    }
    whereConditions.forEach(c => whereClause += `\n    ${c.operatorType} [${c.table}].[${c.column}] ${c.operator} '${c.value}'`);
    
    query += `\nWHERE ${whereClause}`;
    return query;
  }, [selectedTables, selectedJoins, whereConditions, selectedRequestType]);

  const groupedPossibleJoins = useMemo(() => {
    const activeTables = new Set([...Object.keys(selectedTables), ...(Object.values(selectedJoins) as JoinInfo[]).flatMap(j => [j.from, j.to])]);
    if (activeTables.size === 0) activeTables.add('Faults');
    const grouped: Record<string, JoinInfo[]> = {};
    const searchLower = joinSearch.toLowerCase();
    allPotentialJoins.forEach(j => {
      if (activeTables.has(j.from) || activeTables.has(j.to)) {
        const targetTable = activeTables.has(j.from) ? j.to : j.from;
        if (joinSearch && !targetTable.toLowerCase().includes(searchLower)) return;
        if (!grouped[targetTable]) grouped[targetTable] = [];
        grouped[targetTable].push(j);
      }
    });
    return grouped;
  }, [selectedTables, selectedJoins, allPotentialJoins, joinSearch]);

  const toggleTable = (tableName: string) => setExpandedTables(prev => {
    const next = new Set(prev);
    if (next.has(tableName)) next.delete(tableName); else next.add(tableName);
    return next;
  });

  const selectAllFields = (tableName: string) => setSelectedTables(prev => {
    const table = tables[tableName];
    if (!table) return prev;
    const current = prev[tableName] || { columns: [], isStar: false };
    const next = { ...prev };
    if (current.isStar) delete next[tableName];
    else next[tableName] = { columns: table.columns.map(c => c.name), isStar: true };
    return next;
  });

  const toggleField = (tableName: string, colName: string) => setSelectedTables(prev => {
    const current = prev[tableName] || { columns: [], isStar: false };
    const nextCols = current.columns.includes(colName) ? current.columns.filter(c => c !== colName) : [...current.columns, colName];
    const next = { ...prev };
    if (nextCols.length === 0) delete next[tableName]; else next[tableName] = { columns: nextCols, isStar: false };
    return next;
  });

  const toggleJoin = (join: JoinInfo) => {
    const key = `${join.from}-${join.to}`;
    setSelectedJoins(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = join;
      return next;
    });
  };

  const copyToClipboard = () => {
    if (generatedQuery) {
      navigator.clipboard.writeText(generatedQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 bg-[#264653] p-4 lg:p-6 font-sans flex flex-col min-h-0 h-full overflow-hidden">
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        <h1 className="text-[#00ff87] font-black text-center text-xl mb-4 uppercase tracking-widest shrink-0">Halo Navigator SQL Generator</h1>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 h-full items-stretch overflow-hidden">
          {/* Column 1: Schema Explorer */}
          <div className="bg-[#1a202c] p-4 rounded-2xl border border-[#2d3748] shadow-2xl flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3 shrink-0">Schema Explorer</h2>
            <input type="text" placeholder="Search tables..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="w-full bg-[#0a0c10] border border-[#2d3748] text-white p-2 rounded-lg text-[10px] mb-3 focus:outline-none focus:border-[#00ff87] shrink-0" />
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0 custom-scrollbar">
              {filteredTableNames.map(tableName => (
                <div key={tableName} className="bg-black/20 border border-[#2d3748] rounded-xl overflow-hidden shrink-0">
                  <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5" onClick={() => toggleTable(tableName)}>
                    <span className="text-[10px] font-black tracking-tight">{tableName}</span>
                    <button onClick={(e) => { e.stopPropagation(); selectAllFields(tableName); }} className="text-[#00ff87] text-[7px] font-black uppercase hover:opacity-70 px-1">Select All</button>
                  </div>
                  {expandedTables.has(tableName) && (
                    <div className="px-4 py-2 border-t border-[#2d3748] bg-black/10 flex flex-col gap-1">
                      {tables[tableName].columns.map(col => (
                        <label key={col.name} className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={selectedTables[tableName]?.columns.includes(col.name) || false} onChange={() => toggleField(tableName, col.name)} className="w-3 h-3 accent-[#00ff87]" />
                          <span className="text-[9px] text-gray-400 group-hover:text-white">{col.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Filters */}
          <div className="flex flex-col gap-4 min-h-0 h-full overflow-hidden">
            <div className="bg-[#1a202c] p-4 rounded-2xl border border-[#2d3748] shadow-2xl shrink-0">
              <h2 className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Request Filter</h2>
              <select value={selectedRequestType} onChange={(e) => setSelectedRequestType(e.target.value)} className="w-full bg-[#0a0c10] border border-[#2d3748] text-white p-2 rounded-lg text-[10px] focus:outline-none focus:border-[#00ff87]">
                {Object.keys(requestTypeMap).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="bg-[#1a202c] p-4 rounded-2xl border border-[#2d3748] shadow-2xl flex flex-col min-h-0 flex-1 overflow-hidden">
              <h2 className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">WHERE Conditions</h2>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mb-2 min-h-0 custom-scrollbar">
                {whereConditions.map((c, i) => (
                  <div key={c.id} className="flex flex-wrap gap-1 items-center bg-black/20 p-1.5 rounded-xl border border-white/5">
                    <select value={`${c.table}.${c.column}`} onChange={(e) => { const [t, col] = e.target.value.split('.'); setWhereConditions(whereConditions.map(wc => wc.id === c.id ? { ...wc, table: t, column: col } : wc)); }} className="flex-1 bg-[#0a0c10] border border-[#2d3748] text-[8px] p-1 rounded focus:outline-none transition-all">{allAvailableColumns.map(col => <option key={`${col.table}.${col.name}`} value={`${col.table}.${col.name}`}>[{col.table}].[{col.name}]</option>)}</select>
                    <input type="text" value={c.value} onChange={(e) => setWhereConditions(whereConditions.map(wc => wc.id === c.id ? { ...wc, value: e.target.value } : wc))} placeholder="Value..." className="flex-1 bg-[#0a0c10] border border-[#2d3748] text-[8px] p-1 rounded focus:outline-none transition-all" />
                    <button onClick={() => setWhereConditions(whereConditions.filter(wc => wc.id !== c.id))} className="text-red-500 font-black px-1 text-[10px] hover:opacity-70 transition-opacity">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setWhereConditions([...whereConditions, { id: Math.random().toString(), table: 'Faults', column: 'Faultid', operator: '=', value: '', operatorType: 'AND' }])} className="w-full py-1.5 bg-[#00ff87] text-[#1a2c33] font-black rounded-full text-[8px] uppercase shadow-lg flex-shrink-0 active:scale-95 transition-transform">Add Condition</button>
            </div>
          </div>

          {/* Column 3: Dedicated Joins Explorer */}
          <div className="bg-[#1a202c] p-4 rounded-2xl border border-[#2d3748] shadow-2xl flex flex-col min-h-0 h-full overflow-hidden">
            <h2 className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Joins Explorer</h2>
            <input type="text" placeholder="Search joins..." value={joinSearch} onChange={(e) => setJoinSearch(e.target.value)} className="w-full bg-[#0a0c10] border border-[#2d3748] text-white p-2 rounded-lg text-[9px] mb-3 focus:outline-none focus:border-[#00ff87] shrink-0" />
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0">
              {Object.entries(groupedPossibleJoins).map(([targetTable, joins]) => (
                <div key={targetTable} className="space-y-1.5">
                  <h4 className="text-[8px] font-black uppercase text-white/30 border-b border-white/5 pb-1">To {targetTable}:</h4>
                  {joins.map((join, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-2 bg-black/20 rounded-xl border border-white/5 hover:border-[#00ff87]/30 transition-all group">
                      <input type="checkbox" checked={selectedJoins[`${join.from}-${join.to}`] !== undefined} onChange={() => toggleJoin(join)} className="w-4 h-4 accent-[#00ff87] mt-0.5 shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-[#00ff87]">{join.from} → {join.to}</div>
                        <div className="text-[9px] text-gray-500 font-mono truncate opacity-60 group-hover:opacity-100">{join.condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Final Output */}
          <div className="bg-[#1a202c] p-4 rounded-2xl border border-[#2d3748] shadow-2xl flex flex-col min-h-0 h-full overflow-hidden">
              <h2 className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Final Query</h2>
              <div className="flex-1 bg-[#0a0c10] border border-[#2d3748] rounded-xl overflow-hidden mb-3 min-h-0">
                <textarea value={generatedQuery} readOnly placeholder="Select fields or joins..." className="w-full h-full bg-transparent p-2.5 font-mono text-[9px] text-[#cbd5e0] resize-none outline-none" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={copyToClipboard} className={`flex-1 py-2 ${copied ? 'bg-indigo-500 text-white' : 'bg-[#00ff87] text-[#1a2c33]'} font-black rounded-full text-[8px] uppercase tracking-widest shadow-lg transition-all active:scale-95`}>
                  {copied ? 'SQL Copied!' : 'Copy SQL'}
                </button>
                <button onClick={() => { setSelectedTables({}); setSelectedJoins({}); setWhereConditions([]); }} className="px-4 py-2 bg-slate-700 text-white font-black rounded-full text-[8px] uppercase tracking-widest shadow-lg hover:bg-slate-600 transition-all active:scale-95">✕</button>
              </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 10px; border: 1px solid rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00ff87; }
      `}</style>
    </div>
  );
};
