# Extrusion Press MES Dashboard

## Current State
- Full dashboard with 14 KPI tabs, Press Fleet Performance table, multiple modals, charts, and role views (Operator, Management, CEO, Supervisor)
- All data is mock/dummy data generated in `mockData.ts` on the frontend
- Backend (main.mo) stores data in Map structures but is not populated with live data
- No HTTP outcalls integration exists

## Requested Changes (Diff)

### Add
- HTTP outcalls Motoko module to fetch data from an external middleware API (user's MySQL → REST bridge)
- New backend functions: `fetchLiveData()` (timer-based), `setApiEndpoint(url)`, `getApiEndpoint()`, `getLastFetchStatus()`, `getLivePressData()` returning cached live press metrics
- New frontend hook `useLiveData` that calls backend to check if live data is available and returns it
- New frontend component `ApiConfigPanel` — a settings sub-section inside SettingsPanel where the admin can enter the middleware API base URL and toggle live data on/off
- A `DataSourceBadge` component shown in the top nav: green "LIVE" when connected to the API, gray "MOCK" when using dummy data
- A `LiveDataContext` that provides the active data source mode and live press data to all components
- In `App.tsx`, when live data mode is on, replace `getFilteredMockData()` with data from the backend HTTP outcalls cache

### Modify
- `SettingsPanel.tsx` — add a new "Data Source" section (gear icon) at the top of the panel with the API config UI
- `TopNavBar.tsx` — add the `DataSourceBadge` next to the settings gear icon
- `main.mo` — add HTTP outcalls capability, `apiEndpoint` stable variable, `lastFetchTime`, `lastFetchStatus`, cached press data Map, and a `fetchFromApi` function using `ExperimentalInternetComputer.httpRequest`

### Remove
- Nothing removed

## Implementation Plan
1. Select `http-outcalls` Caffeine component
2. Regenerate Motoko backend with HTTP outcalls: store configurable API URL, periodic fetch function, cache live press data (id, status, kgPerHour, oee, recovery, inputMt, outputMt, contactTime, dieKgH, ppPlanBillets, ppActBillets, dieLoadCount, dieUnloadCount, downtime), expose getters
3. Update `backend.d.ts` with new types and method signatures
4. Add `LiveDataContext` — manages `isLiveMode`, `liveApiUrl`, `livePressList` state; exposes toggle and setter
5. Add `useLiveData` hook — polls backend every 30s for cached press data; returns loading/error/data states
6. Add `ApiConfigPanel` component — URL input, Save button, Test Connection button, Live/Mock toggle, last fetch status display
7. Update `SettingsPanel` — add Data Source section at top using `ApiConfigPanel`
8. Update `TopNavBar` — add `DataSourceBadge` (LIVE / MOCK pill)
9. Update `App.tsx` — when `isLiveMode` is true and live data is available, use it; otherwise fall back to mock data
10. Provide Node.js middleware template as a comment block in a new file `src/frontend/public/middleware-template.md` so the user can set up their bridge
