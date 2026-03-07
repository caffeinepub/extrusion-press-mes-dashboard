# Extrusion Press MES Dashboard

## Current State

The dashboard is a full-featured React MES dashboard with:
- A white-themed TopNavBar with brand, shift/period/date filters, role selector, AI insight button, and settings gear
- A KPI Ribbon with 12 clickable tiles (Total Input through Gas) each with colored top-border accent
- A Dashboard tab with 3 bar charts (ProductionVsPlan, OEEQuality, OutputRates), PressFleetTable, DowntimeAnalysis, and WIPAgingDonut
- 17 management tabs: Total Input, Total Output, Total Scrap, Recovery, WIP Stock, Contact Time, Delay & Downtime, PP (Plan/Act), Die (Load/Unload), Fleet OEE, Total UTIL, Energy, Gas Consumption, Production, OEE, Orders, Quality
- Role views: Operator, Management (tabbed), CEO, Supervisor
- FilterContext for shift/period/date, SettingsContext for per-view configuration
- All charts use Recharts library (BarChart only currently)

## Requested Changes (Diff)

### Add

- **GrafanaToolbar** component (replaces TopNavBar) with:
  - Left: MES logo + dashboard title "BANCO ALUMINIUM · MES EXECUTIVE VIEW"
  - Center: Grafana-style time range picker dropdown (Last 1h / Last 6h / Last 24h / Last 7d / Last 30d / Custom Range) with calendar icon, replacing the current date+period selectors
  - Center: Shift selector (existing behavior, kept)  
  - Center: Auto-refresh dropdown (Off / 5s / 10s / 30s / 1m / 5m) replacing the manual "Updated:" text
  - Right: Role selector, AI Insight button, Settings gear icon, Logout — all existing
  - Overall style: white background, 44px height, Grafana-characteristic compact toolbar with bordered pill selectors
  
- **GrafanaPanel** wrapper component used for EVERY chart, table, and section:
  - Panel border: `1px solid #e4e7ed` with `border-radius: 3px`
  - Colored header bar: 3px solid left accent bar OR a full-width thin colored top line (configurable per panel type)
  - Panel title: top-left, 11px, bold, uppercase, gray `#464c54`
  - Panel icons top-right: gear icon + info icon (both 12px, gray, hover to show tooltip)
  - Header background: `#f7f8fa` (slightly off-white)
  - Body background: white `#ffffff`
  - No drop shadow — flat bordered aesthetic like Grafana

- **Grafana-style chart types** (replace all existing BarChart-only charts):
  - **StatPanel** — large number display with trend sparkline, threshold color, used for KPI tiles
  - **GaugePanel** — circular arc gauge for OEE %, Utilization %, Recovery % metrics
  - **TimeSeriesPanel** — line chart with area fill for trend data (used in Delay & Downtime trend, Energy tab, Gas tab)
  - **BarGaugePanel** — horizontal bar gauge for press-wise comparison (used in Production vs Plan, Press Kg/H, OEE comparison)
  - **TablePanel** — Grafana-styled table with alternating rows, compact density, sortable headers
  - Keep existing Recharts for charts that are already working well (DowntimeAnalysis pie, WIPAging donut)

- **KPI Ribbon** converted to Grafana stat panel row:
  - Each tile becomes a stat panel: large value (mono font), label above in small gray text, unit right of value, colored threshold indicator bar at bottom of tile
  - Tile border: 1px solid `#e4e7ed`, no colored top border (replaced by bottom threshold bar)
  - Tile background: white, hover background: `#f7f8fa`
  - Keep all click-to-drill-down behavior

### Modify

- **TopNavBar** → replaced by **GrafanaToolbar** as described above
- **KPIRibbon** → convert tile style to Grafana stat panel aesthetic (keep grid layout and all click handlers)
- **Charts.tsx** → convert ProductionVsPlanChart, OEEQualityChart, OutputRatesChart to use GrafanaPanel wrapper with proper Grafana panel header (title top-left, gear+info icons top-right)
- **PressFleetTable** → wrap in GrafanaPanel, update header to Grafana style (title top-left, icons top-right)
- **DowntimeAnalysis** → wrap in GrafanaPanel
- **WIPAgingDonut** → wrap in GrafanaPanel
- **All tab content components** → wrap their sections in GrafanaPanel components
- **Tab bar** (Management view) → Grafana-style tab bar: flat tabs, no bottom border highlight, active tab has white background with slight elevation, inactive tabs are `#f7f8fa`, tab text `#464c54`
- **Background** → keep `#f0f2f5` (Grafana light uses a slightly gray page background)
- **Overall page** → light theme maintained throughout

### Remove

- Old PanelHeader component in Charts.tsx (replaced by GrafanaPanel wrapper)
- Blue top-border accent on KPI tiles (replaced by bottom threshold bar)
- Box shadows on panels (Grafana uses flat borders, no shadows)

## Implementation Plan

1. Create `src/frontend/src/components/grafana/GrafanaPanel.tsx` — reusable panel wrapper with title, gear/info icons, and header styling
2. Create `src/frontend/src/components/grafana/GrafanaStatPanel.tsx` — stat panel variant for KPI tiles with threshold bar
3. Create `src/frontend/src/components/grafana/GaugePanel.tsx` — circular gauge for OEE/Util metrics using SVG arc
4. Create `src/frontend/src/components/grafana/BarGaugePanel.tsx` — horizontal bar gauge component
5. Create `src/frontend/src/components/grafana/TimeSeriesPanel.tsx` — line chart with area using Recharts LineChart
6. Replace `TopNavBar.tsx` with `GrafanaToolbar.tsx` — Grafana-style toolbar, preserving all existing functionality (shift/date filters, role selector, AI insight, settings)
7. Update `KPIRibbon.tsx` — convert tiles to GrafanaStatPanel style
8. Update `Charts.tsx` — wrap charts in GrafanaPanel, add time-series option, update header styling
9. Update `PressFleetTable.tsx` — wrap in GrafanaPanel
10. Update `DowntimeAnalysis.tsx` and `TopTablesAndWIP.tsx` — wrap in GrafanaPanel
11. Update all tab components to use GrafanaPanel wrappers for their sections
12. Update `App.tsx` to use GrafanaToolbar and update background colors
13. Update `index.css` with Grafana-matching design tokens
