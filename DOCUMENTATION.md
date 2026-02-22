# Halo Navigator Chrome Extension Documentation

Halo Navigator is a powerful productivity tool designed for Halo ITSM administrators and power users. It provides environmental awareness, rapid navigation, and utility tools directly within the Halo interface.

## Core Features

### 1. Environment Rules (Visual HUD)
Never mistake your Production environment for UAT again.
- **URL Pattern Matching:** Define rules based on URL substrings (e.g., `prod.haloitsm.com`).
- **Visual Styles:**
  - **Ambient (Full BG):** Subtly tints the entire page background.
  - **Frame (Border):** Adds a solid colored border around the viewport.
  - **Bar (Top Bar):** Adds a persistent colored bar at the top of the page.
  - **Glow:** Adds an inner glow effect to the page edges.
- **Custom Labels:** Add a floating label (e.g., "PROD") with customizable text and background colors.
- **Favicon Tinting:** Automatically adds a colored dot to the browser tab icon, allowing you to identify environments even when many tabs are open.

### 2. The Command Palette (Jumps & Actions)
Press `#` on any Halo page to summon the terminal.
- **Jump Shortcuts:** Register short codes (e.g., `#KB`) to instantly navigate to specific paths (e.g., `/kb`).
- **Custom Actions:** Trigger specific Halo action buttons or groups using shortcuts (e.g., `#1` to trigger the first action button).
- **Special Commands:**
  - `CAP`: Capture the current form state into the Vault.
  - `NT [Code]`: Open a jump shortcut in a new tab.
  - `FILL`: Automatically fill mandatory fields with test data (QA Tool).
  - `PRETTY`: Prettify SQL code in report builders.

### 3. Form Data Vault
Safely store and inject form configurations.
- **Capture:** Save every field value on the current page as a "Snapshot".
- **Inject:** Re-apply a saved snapshot to any Halo page to instantly populate complex forms.

### 4. Proximity QA Tools
Tools designed for configuration and testing.
- **Mandatory Ghosting:** Empty required fields pulse with a red highlight to draw attention.
- **Field ID Reveal:** Displays the internal ID (e.g., `CF_123`) next to custom field labels. Clicking the ID takes you directly to that field's configuration page.
- **Action ID Reveal:** Displays the internal ID (e.g., `ACT_456`) next to action buttons. Clicking the ID takes you to the action's configuration.

### 5. Advanced SQL Hub
A dedicated workspace for building and testing Halo reports.
- Explore database schemas.
- Generate production-ready SQL queries.
- Format and prettify complex SQL code.

---

## How to Use

### Installation & Setup
1. Open the extension popup by clicking the Halo Navigator icon in your browser toolbar.
2. Navigate to the **Rules** tab to set up your environment indicators.
3. Use the **Hub** (Options page) for bulk management of Jumps and Actions.

### Daily Workflow
- **Navigation:** Press `#` and type your jump code. Press `Enter` to go or `Tab` to open in a new tab.
- **Configuration:** Enable **Field Reveal** to quickly find IDs while building reports or workflows.
- **Testing:** Use **Smart Fill** (`#FILL`) to rapidly populate forms during QA cycles.
- **Safety:** Use **Vault** to save "baseline" configurations before making experimental changes.

### Customisation
- Change the extension's accent color and theme (Light/Dark) in the **Theme** tab.
- Toggle features like **Favicon Tinting** and **Mandatory Ghosting** in the **Tools** tab.

---

*Operational Guidelines v2.5*
