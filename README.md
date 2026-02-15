Halo Navigator is a specialised Chrome extension designed for administrators, developers, and power users of the HaloITSM platform. Its primary goal is to prevent costly mistakes and boost productivity when managing multiple environments (like Development, UAT, and Production).

V2.5 Updates

Fixed: Tab displays
New: Export\Import JSON - save config, iport to another or same browser
New: NT commands - open a new Halo Tab or NT space open a new Halo tab with a configured jump
New: Vault Tab - Snapshot text fields to reinject later - good for long forms like Change. 
New: SQL Prettify - improve the layout of custom SQL in reports

Here is a breakdown of what the extension does:

1. Visual Environment Guardrails
The most critical feature is the Tab Visuals. Users often have multiple tabs open for different Halo servers and can accidentally perform a destructive action in "Production" thinking they are in "Dev."
Dynamic Styling: It automatically detects the URL and applies a distinct visual style—such as a colored glow, a thick border, or a full background overlay—based on rules you define.
Environment Labels: It injects a floating badge (e.g., "ENV: PROD") onto the page so the current context is always visible.

2. The Navigator Palette (# Hotkey)
Inspired by command palettes in IDEs, pressing the # key anywhere within a Halo portal opens a quick-jump menu.
Instant Navigation: You can type short codes (like #prod, #as, or #tic) to instantly jump to specific environments or modules (Assets, Tickets, Configuration).
Context Awareness: It can handle relative redirects, meaning it knows to keep you within your current "Dev" environment while jumping to a different module.

3. Smart Form Filler ("Magic Fill")
Designed for QA and workflow testing, this tool allows you to populate complex ITSM forms in a single click.
Realistic Mock Data: Instead of "asdf," it populates fields with context-aware data (e.g., realisticish summaries, dates, and dropdown selections).
Sidebar Protection: It is programmed to target main form areas while ignoring navigation or search bars to ensure the UI remains stable during testing.

4. SQL Reporting Hub
Built into the extension is a sophisticated SQL Query Generator.
Visual Schema Explorer: It provides a searchable list of the complex HaloITSM database tables.
Automated Joins: It understands the relationships between tables (like how Faults relates to Actions or Users) and automatically writes the INNER JOIN logic for you as you select fields.
One-Click Export: Once the query is built visually, you can copy the SQL directly into your Halo report builder.

5. Centralized Resource Hub
The extension acts as a "Mission Control" for Halo admins, providing one-click access to:
Official Halo Support and Community forums.
The Product Roadmap.
The System Status page.
Developer-run release note trackers.

In short, it transforms the browser into a specialized workbench that makes managing HaloITSM faster, safer, and much more organized.
