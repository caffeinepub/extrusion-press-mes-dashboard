import { ChevronDown, ChevronUp, Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLiveData } from "../../context/LiveDataContext";
import { useActor } from "../../hooks/useActor";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimeAgo(date: Date | null): string {
  if (!date) return "Never fetched";
  const diffMs = Date.now() - date.getTime();
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
}

// ─── Code snippet for the middleware guide ────────────────────────────────────
const MIDDLEWARE_SNIPPET = `// Install dependencies:
// npm install express mysql2 cors
// node middleware-template.js

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());

const DB_CONFIG = {
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'your_mes_db',
};

app.get('/api/press-data', async (req, res) => {
  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    const [rows] = await conn.execute(\`
      SELECT
        press_id AS id, press_status AS status,
        kg_per_hour AS kgPerHour, oee_pct AS oee,
        recovery_pct AS recovery,
        input_mt AS inputMt, output_mt AS outputMt,
        contact_time_sec AS contactTime,
        die_kg_h AS dieKgH,
        pp_plan_billets AS ppPlanBillets,
        pp_act_billets AS ppActBillets,
        die_load_count AS dieLoadCount,
        die_unload_count AS dieUnloadCount,
        downtime_minutes AS downtimeMinutes
      FROM press_live_metrics
      WHERE timestamp >= NOW() - INTERVAL 1 HOUR
      ORDER BY timestamp DESC
    \`);
    res.json(rows);
  } finally {
    await conn.end();
  }
});

app.listen(3001, () =>
  console.log('MES Middleware running on :3001')
);`;

// ─── Component ────────────────────────────────────────────────────────────────
export function ApiConfigPanel() {
  const { actor } = useActor();
  const {
    isLiveMode,
    liveApiUrl,
    lastFetchStatus,
    lastFetchTime,
    isLoading,
    errorMsg,
    setLiveMode,
    setApiUrl,
    triggerFetch,
  } = useLiveData();

  const [urlInput, setUrlInput] = useState(liveApiUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleSave = async () => {
    if (!actor) {
      toast.error("Backend not ready");
      return;
    }
    setIsSaving(true);
    try {
      await actor.setApiEndpoint(urlInput, isLiveMode);
      setApiUrl(urlInput);
      toast.success("API endpoint saved");
      setTestResult(null);
    } catch (err) {
      toast.error(
        `Save failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!actor) {
      toast.error("Backend not ready");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      // Save URL first, then trigger a fetch
      await actor.setApiEndpoint(urlInput, true);
      setApiUrl(urlInput);
      const [success, msg] = await actor.fetchLiveData();
      if (success) {
        setTestResult({ ok: true, msg: msg || "Connection successful" });
        toast.success("Connection test passed");
        // Trigger full re-fetch to populate livePressList
        await triggerFetch();
      } else {
        setTestResult({ ok: false, msg: msg || "Connection failed" });
        toast.error(`Test failed: ${msg}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, msg: message });
      toast.error(`Test error: ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleLive = (enabled: boolean) => {
    setLiveMode(enabled);
    if (actor) {
      actor.setApiEndpoint(urlInput || liveApiUrl, enabled).catch(() => {});
    }
  };

  // Record count extracted from status string
  const recordMatch = lastFetchStatus.match(/(\d+)\s*records?/i);
  const recordCount = recordMatch ? recordMatch[1] : null;
  const timeAgo = formatTimeAgo(lastFetchTime);
  const statusLine =
    lastFetchTime && recordCount
      ? `Last fetch: ${timeAgo} · ${recordCount} records`
      : lastFetchTime
        ? `Last fetch: ${timeAgo}`
        : "Never fetched";

  return (
    <div>
      {/* Live Mode Toggle */}
      <div className="flex items-center justify-between py-1.5 gap-3 mb-2">
        <div>
          <span
            className="text-[11px] font-semibold"
            style={{ color: "#1e293b" }}
          >
            Live Data Mode
          </span>
          <div className="text-[9px] mt-0.5" style={{ color: "#94a3b8" }}>
            Pull real metrics from your MySQL database
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isLiveMode}
          data-ocid="api_config.live_mode.toggle"
          onClick={() => handleToggleLive(!isLiveMode)}
          className="relative shrink-0 transition-colors duration-200"
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: isLiveMode ? "#22c55e" : "#e2e8f0",
            border: `1px solid ${isLiveMode ? "#16a34a" : "#cbd5e1"}`,
            outline: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            className="absolute top-0.5 transition-all duration-200"
            style={{
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              left: isLiveMode ? "calc(100% - 17px)" : "2px",
            }}
          />
        </button>
      </div>

      {/* Status indicator */}
      <div
        className="flex items-center gap-1.5 py-1 px-2 rounded mb-2"
        style={{
          background: isLiveMode ? "#f0fdf4" : "#f8fafc",
          border: `1px solid ${isLiveMode ? "#86efac" : "#e2e8f0"}`,
        }}
      >
        {isLoading ? (
          <Loader2
            size={8}
            className="animate-spin"
            style={{ color: "#16a34a" }}
          />
        ) : (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isLiveMode ? "#22c55e" : "#94a3b8" }}
          />
        )}
        <span
          className="text-[9px] font-semibold"
          style={{ color: isLiveMode ? "#15803d" : "#64748b" }}
        >
          {isLoading ? "Fetching…" : statusLine}
        </span>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div
          className="px-2 py-1 rounded mb-2 text-[9px]"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
          }}
          data-ocid="api_config.error_state"
        >
          ⚠ {errorMsg}
        </div>
      )}

      {/* Test result */}
      {testResult && (
        <div
          className="px-2 py-1 rounded mb-2 text-[9px]"
          style={{
            background: testResult.ok ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${testResult.ok ? "#86efac" : "#fecaca"}`,
            color: testResult.ok ? "#15803d" : "#b91c1c",
          }}
          data-ocid="api_config.success_state"
        >
          {testResult.ok ? "✓ " : "✗ "}
          {testResult.msg}
        </div>
      )}

      {/* API URL input */}
      <div className="mb-2">
        <label
          htmlFor="api-url-input"
          className="block text-[9px] font-bold uppercase tracking-wider mb-1"
          style={{ color: "#64748b" }}
        >
          Middleware API Base URL
        </label>
        <input
          id="api-url-input"
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://your-api-server.com"
          data-ocid="api_config.url.input"
          className="w-full px-2 py-1.5 text-[11px] rounded border outline-none focus:ring-1"
          style={{
            background: "#f8fafc",
            borderColor: "#e2e8f0",
            color: "#1e293b",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "10px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#ff6600";
            e.currentTarget.style.boxShadow = "0 0 0 2px #ff660020";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div className="text-[8.5px] mt-0.5" style={{ color: "#94a3b8" }}>
          The dashboard polls{" "}
          <span style={{ fontFamily: "monospace" }}>
            {urlInput || "…"}/api/press-data
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !urlInput.trim()}
          data-ocid="api_config.save.button"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold transition-opacity"
          style={{
            background: "#ff6600",
            color: "#ffffff",
            opacity: isSaving || !urlInput.trim() ? 0.5 : 1,
            cursor: isSaving || !urlInput.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? <Loader2 size={10} className="animate-spin" /> : null}
          {isSaving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting || !urlInput.trim()}
          data-ocid="api_config.test.button"
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold transition-opacity"
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#334155",
            opacity: isTesting || !urlInput.trim() ? 0.5 : 1,
            cursor: isTesting || !urlInput.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isTesting ? <Loader2 size={10} className="animate-spin" /> : null}
          {isTesting ? "Testing…" : "Test Connection"}
        </button>
      </div>

      {/* Middleware Setup Guide (collapsible) */}
      <div
        className="rounded overflow-hidden"
        style={{ border: "1px solid #e2e8f0" }}
      >
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          data-ocid="api_config.setup_guide.toggle"
          className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold transition-colors"
          style={{
            background: guideOpen ? "#f1f5f9" : "#f8fafc",
            color: "#475569",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = guideOpen
              ? "#f1f5f9"
              : "#f8fafc";
          }}
        >
          <div className="flex items-center gap-1.5">
            <Database size={10} style={{ color: "#64748b" }} />
            <span>Middleware Setup Guide</span>
          </div>
          {guideOpen ? (
            <ChevronUp size={10} style={{ color: "#94a3b8" }} />
          ) : (
            <ChevronDown size={10} style={{ color: "#94a3b8" }} />
          )}
        </button>

        {guideOpen && (
          <div className="px-3 pb-3">
            {/* Steps */}
            <div className="mt-2 space-y-2">
              {[
                {
                  step: 1,
                  title: "Install dependencies",
                  body: "Run in your project folder:",
                  code: "npm install express mysql2 cors",
                },
                {
                  step: 2,
                  title: "Configure MySQL connection",
                  body: "Edit DB_CONFIG in the template with your host, user, password, and database name.",
                },
                {
                  step: 3,
                  title: "Start the server",
                  body: "Run the middleware and make it reachable from the internet (use ngrok, a VPS, or a static IP):",
                  code: "node middleware-template.js",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-2">
                  <div
                    className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black mt-0.5"
                    style={{ background: "#ff6600", color: "#fff" }}
                  >
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-[10px] font-bold"
                      style={{ color: "#1e293b" }}
                    >
                      {s.title}
                    </div>
                    <div className="text-[9px]" style={{ color: "#64748b" }}>
                      {s.body}
                    </div>
                    {s.code && (
                      <code
                        className="block text-[9px] px-2 py-1 rounded mt-1"
                        style={{
                          background: "#1e293b",
                          color: "#7dd3fc",
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {s.code}
                      </code>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Code snippet */}
            <div className="mt-3">
              <div
                className="text-[9px] font-bold mb-1"
                style={{ color: "#475569" }}
              >
                Sample /api/press-data endpoint (Node.js + Express):
              </div>
              <pre
                className="text-[8.5px] p-2 rounded overflow-x-auto"
                style={{
                  background: "#0f172a",
                  color: "#94a3b8",
                  fontFamily: '"JetBrains Mono", monospace',
                  maxHeight: 200,
                  lineHeight: 1.5,
                  border: "1px solid #1e293b",
                }}
              >
                {MIDDLEWARE_SNIPPET}
              </pre>
            </div>

            {/* Download tip */}
            <div
              className="mt-2 px-2 py-1.5 rounded text-[9px]"
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                color: "#15803d",
              }}
            >
              💡 A ready-to-use template is included at{" "}
              <span style={{ fontFamily: "monospace" }}>
                /middleware-template.js
              </span>{" "}
              in the project root.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
