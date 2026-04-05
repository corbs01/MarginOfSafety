// ── The Berkshire Analyst — React App ────────────────────────────────────────
// Depends on globals defined in:
//   js/keys.js     → window.getFMPKey()
//   js/fmp.js      → fetchFMP(), computeMetrics(), formatNum(), fmtPct(), fmtRatio(),
//                    classifyNews(), fmtNewsDate()
//   js/analysis.js → buildMoat(), buildIV(), buildVerdict()

const { useState, useRef } = React;

// ── Colour tokens (kept here for inline JSX styles) ───────────────────────────
const PARCHMENT = "#f5f0e8";
const INK       = "#1a1008";
const GOLD      = "#b8860b";
const RUST      = "#8b3a0f";
const CREAM     = "#faf7f0";
const FADED     = "#7a6e5f";
const BORDER    = "#c8b99a";

const SAMPLE_TICKERS = ["AAPL", "KO", "BAC", "BRK.B", "AMZN", "V"];

// ── Default IV parameters (stored as display values: % not fractions) ─────────
const DEFAULT_IV_PARAMS = {
  grahamMultiplier:   22.5,
  discountRate:       10,    // percent
  fcfGrowthRate:      null,  // null = auto from revenue CAGR
  terminalGrowthRate: 3,     // percent
};

// Convert display params → fraction params for buildIV
function toIVFractions(p) {
  return {
    grahamMultiplier:   p.grahamMultiplier,
    discountRate:       p.discountRate      / 100,
    fcfGrowthRate:      p.fcfGrowthRate != null ? p.fcfGrowthRate / 100 : null,
    terminalGrowthRate: p.terminalGrowthRate / 100,
  };
}

// ── Shared small components ───────────────────────────────────────────────────

function CollapsibleSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-head" onClick={() => setOpen(o => !o)}>
        <div className="section-title">
          <span className="section-icon">{icon}</span>
          {title}
        </div>
        <span className={`section-toggle ${open ? "open" : ""}`}>▾</span>
      </div>
      <div className={`section-body ${open ? "open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function MoatBar({ label, score }) {
  return (
    <div className="moat-row">
      <span className="moat-label">{label}</span>
      <div className="moat-bar-bg">
        <div className="moat-bar-fill" style={{ width: `${score * 10}%` }} />
      </div>
      <span className="moat-score">{score}/10</span>
    </div>
  );
}

function NewsItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = item.fullSummary && item.fullSummary.length > 220;
  return (
    <div className="news-item">
      <div className={`news-dot ${item.sentiment}`} />
      <div>
        <div className="news-headline">{item.headline}</div>
        <div className="news-meta">
          {item.date} · {item.type} ·{" "}
          <span style={{ color: item.sentiment === "bullish" ? "#4a7c59" : item.sentiment === "bearish" ? RUST : FADED }}>
            {item.sentiment}
          </span>
        </div>
        <div className="news-summary">{expanded ? item.fullSummary : item.summary}</div>
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ marginTop: 4, background: "none", border: "none",
                     fontFamily: "'Courier Prime', monospace", fontSize: 12,
                     color: GOLD, cursor: "pointer", padding: 0, letterSpacing: 1 }}
          >
            {expanded ? "▴ Collapse" : "▾ Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 5-Year Financial History Table ───────────────────────────────────────────

function HistoryTable({ history }) {
  if (!history || !history.rows || !history.rows.length) {
    return <div className="prose">Financial history unavailable.</div>;
  }

  const { years, rows } = history;

  const trendIcon  = d => d === "up" ? "▲" : d === "down" ? "▼" : "—";
  const trendColor = d => d === "up" ? "#4a7c59" : d === "down" ? RUST : FADED;

  // Group rows by section so we can render subtle dividers
  let lastSection = null;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table className="history-table">
          <thead>
            <tr>
              <th className="history-th history-th-label">Metric</th>
              {years.map((yr, i) => (
                <th key={i} className={`history-th history-th-year ${i === 0 ? "history-th-latest" : ""}`}>
                  {yr}
                </th>
              ))}
              <th className="history-th history-th-trend">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isNewSection = row.section && row.section !== lastSection;
              lastSection = row.section;
              return (
                <React.Fragment key={ri}>
                  {isNewSection && (
                    <tr className="history-section-row">
                      <td colSpan={years.length + 2} className="history-section-label">
                        {row.section}
                      </td>
                    </tr>
                  )}
                  <tr className={`history-row ${ri % 2 === 0 ? "history-row-even" : "history-row-odd"}`}>
                    <td className="history-td history-td-label">{row.label}</td>
                    {row.values.map((val, vi) => (
                      <td
                        key={vi}
                        className={`history-td history-td-value${vi === 0 ? " history-td-latest" : ""}`}
                      >
                        {val}
                      </td>
                    ))}
                    <td
                      className="history-td history-td-trend"
                      style={{ color: trendColor(row.trend) }}
                    >
                      <span>{trendIcon(row.trend)}</span>
                      {row.trendPct && (
                        <span style={{ marginLeft: 4, fontSize: 11 }}>{row.trendPct}</span>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{
        marginTop: 10,
        fontFamily: "'Courier Prime', monospace",
        fontSize: 11,
        color: FADED,
        letterSpacing: 0.5,
        fontStyle: "italic",
      }}>
        ▲ / ▼ shows change from oldest to most recent year · Most recent year highlighted in gold
      </div>
    </div>
  );
}

// ── IV Parameter Editor ───────────────────────────────────────────────────────

function ParamField({ label, hint, value, onChange, min, max, step, unit, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                    letterSpacing: 1.5, textTransform: "uppercase", color: GOLD }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          value={value ?? ""}
          min={min} max={max} step={step}
          disabled={disabled}
          onChange={e => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) ? null : Math.min(max, Math.max(min, v)));
          }}
          style={{
            width: 68, padding: "5px 8px",
            background: disabled ? "#251c0e" : "#2a2010",
            border: `1px solid ${disabled ? "#3a2e1a" : GOLD}`,
            color: disabled ? FADED : PARCHMENT,
            fontFamily: "'Courier Prime', monospace", fontSize: 14,
            outline: "none", textAlign: "right",
          }}
        />
        {unit && (
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: FADED }}>
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, color: FADED, fontStyle: "italic" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function IVParamsPanel({ params, onParamsChange, autoGrowthRate, autoGrowthSource }) {
  const autoLabel = autoGrowthRate != null
    ? `Auto: ${(autoGrowthRate * 100).toFixed(1)}% (${autoGrowthSource})`
    : "Auto: 5% (default)";

  return (
    <div style={{
      background: INK, padding: "16px 20px", marginBottom: 20,
      borderBottom: `1px solid #3a2e1a`,
    }}>
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                    letterSpacing: 2, textTransform: "uppercase", color: GOLD,
                    marginBottom: 14 }}>
        Valuation Assumptions — Edit to Recalculate Instantly
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px 24px" }}>

        <ParamField
          label="Graham Multiplier"
          hint="Graham's max: 15× P/E × 1.5× P/B = 22.5"
          value={params.grahamMultiplier}
          min={10} max={40} step={0.5} unit="×"
          onChange={v => onParamsChange({ ...params, grahamMultiplier: v ?? 22.5 })}
        />

        <ParamField
          label="Discount Rate"
          hint="Your required rate of return"
          value={params.discountRate}
          min={4} max={20} step={0.5} unit="%"
          onChange={v => onParamsChange({ ...params, discountRate: v ?? 10 })}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                        letterSpacing: 1.5, textTransform: "uppercase", color: GOLD }}>
            FCF Growth Rate
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number"
              value={params.fcfGrowthRate ?? ""}
              placeholder="Auto"
              min={0} max={30} step={0.5}
              onChange={e => {
                const v = parseFloat(e.target.value);
                onParamsChange({ ...params, fcfGrowthRate: isNaN(v) ? null : Math.min(30, Math.max(0, v)) });
              }}
              style={{
                width: 68, padding: "5px 8px",
                background: "#2a2010", border: `1px solid ${GOLD}`,
                color: PARCHMENT, fontFamily: "'Courier Prime', monospace",
                fontSize: 14, outline: "none", textAlign: "right",
              }}
            />
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: FADED }}>%</span>
            {params.fcfGrowthRate != null && (
              <button
                onClick={() => onParamsChange({ ...params, fcfGrowthRate: null })}
                style={{ background: "none", border: `1px solid #3a2e1a`, color: FADED,
                         fontFamily: "'Courier Prime', monospace", fontSize: 10,
                         padding: "3px 8px", cursor: "pointer", letterSpacing: 1 }}
              >
                AUTO
              </button>
            )}
          </div>
          <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 12, color: FADED, fontStyle: "italic" }}>
            {params.fcfGrowthRate == null ? autoLabel : "Manual override — clear to use auto"}
          </div>
        </div>

        <ParamField
          label="Terminal Growth Rate"
          hint="Perpetuity growth after Year 10"
          value={params.terminalGrowthRate}
          min={0} max={5} step={0.25} unit="%"
          onChange={v => onParamsChange({ ...params, terminalGrowthRate: v ?? 3 })}
        />
      </div>
    </div>
  );
}

// ── IV Method Card — shows one valuation method's workings ────────────────────

function IVMethodCard({ method, showTable }) {
  const [expanded, setExpanded] = useState(true);
  const hasResult = method.value != null && method.value > 0 && isFinite(method.value);
  const resultColor = hasResult ? GOLD : FADED;

  return (
    <div className="iv-method-card">
      {/* Card header */}
      <div
        className="iv-method-head"
        onClick={() => setExpanded(e => !e)}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14,
                         fontWeight: 600, letterSpacing: 0.5 }}>
            {method.name}
          </span>
          {hasResult && (
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20,
                           fontWeight: 700, color: GOLD }}>
              ${method.value.toFixed(2)}
            </span>
          )}
          {!hasResult && (
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12,
                           color: FADED }}>N/A</span>
          )}
        </div>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                       color: FADED, letterSpacing: 1 }}>
          {expanded ? "▴ hide" : "▾ show"} workings
        </span>
      </div>

      {/* Steps table */}
      {expanded && (
        <div className="iv-method-body">
          <table className="iv-step-table">
            <tbody>
              {method.steps.map((step, i) => (
                <tr key={i} style={{
                  background: step.highlight ? "#fdf8ee" : step.warn ? "#fdf2ec" : "transparent"
                }}>
                  <td className="iv-step-label">{step.label}</td>
                  <td className="iv-step-value" style={{
                    color: step.highlight ? GOLD : step.warn ? RUST : INK,
                    fontWeight: step.highlight ? 700 : 400,
                  }}>
                    {step.value}
                  </td>
                  <td className="iv-step-source">{step.source || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* DCF year-by-year table */}
          {showTable && method.yearTable && method.yearTable.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                            letterSpacing: 2, color: FADED, textTransform: "uppercase",
                            marginBottom: 8 }}>
                Year-by-Year Projected Free Cash Flow
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="iv-step-table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th className="iv-step-label" style={{ color: FADED }}>Year</th>
                      <th className="iv-step-value" style={{ color: FADED, fontWeight: 400 }}>FCF / Share</th>
                      <th className="iv-step-source" style={{ color: FADED }}>Present Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {method.yearTable.map(row => (
                      <tr key={row.year}>
                        <td className="iv-step-label">{row.year}</td>
                        <td className="iv-step-value">${row.fcf.toFixed(2)}</td>
                        <td className="iv-step-source">${row.pv.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Full Intrinsic Value Section ──────────────────────────────────────────────

function IVSection({ iv, ivParams, onParamsChange }) {
  const methods = iv.methods || {};
  const validMethods = Object.values(methods).filter(m => m.value != null && m.value > 0);
  const price = parseFloat((iv.currentPrice || "").replace("$", ""));
  const midVal = parseFloat((iv.intrinsicValueMid || "").replace("$", ""));
  const mosNum = !isNaN(midVal) && !isNaN(price) && price > 0 ? (midVal - price) / price : null;
  const mosColor = mosNum == null ? FADED : mosNum > 0.15 ? "#4a7c59" : mosNum > 0 ? GOLD : RUST;

  return (
    <>
      {/* Param editor */}
      <IVParamsPanel
        params={ivParams}
        onParamsChange={onParamsChange}
        autoGrowthRate={iv.autoGrowthRate}
        autoGrowthSource={iv.autoGrowthSource}
      />

      {/* Summary boxes */}
      <div className="metrics-grid" style={{ marginBottom: 20 }}>
        {Object.values(methods).map(m => (
          <div className="metric-cell" key={m.name}>
            <div className="metric-label">{m.name}</div>
            <div className="metric-value" style={{ fontSize: 20, color: m.value ? INK : FADED }}>
              {m.value ? "$" + m.value.toFixed(2) : "N/A"}
            </div>
          </div>
        ))}
        <div className="metric-cell">
          <div className="metric-label">Current Price</div>
          <div className="metric-value" style={{ fontSize: 20 }}>{iv.currentPrice}</div>
        </div>
      </div>

      {/* Blended range + MoS */}
      {iv.intrinsicValueMid !== "N/A" && (
        <div style={{ padding: "14px 20px", background: "#fdf8ee",
                      borderLeft: `4px solid ${mosColor}`, marginBottom: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 28px", alignItems: "baseline" }}>
            <div>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                             letterSpacing: 1.5, color: FADED, textTransform: "uppercase" }}>
                Blended Range{" "}
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
                {iv.intrinsicValueLow} – {iv.intrinsicValueHigh}
              </span>
            </div>
            <div>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                             letterSpacing: 1.5, color: FADED, textTransform: "uppercase" }}>
                Mid Estimate{" "}
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20,
                             fontWeight: 700, color: GOLD }}>
                {iv.intrinsicValueMid}
              </span>
            </div>
            <div>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10,
                             letterSpacing: 1.5, color: FADED, textTransform: "uppercase" }}>
                Margin of Safety{" "}
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16,
                             fontWeight: 700, color: mosColor }}>
                {iv.marginOfSafety}
              </span>
            </div>
          </div>
          {validMethods.length > 1 && (
            <div style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, color: FADED,
                          marginTop: 8, fontStyle: "italic" }}>
              Blended average of {validMethods.length} methods · Low/High = ±10% of min/max
            </div>
          )}
        </div>
      )}

      {/* Per-method workings */}
      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 2,
                    color: FADED, textTransform: "uppercase", marginBottom: 12 }}>
        Calculation Workings — Expand / Collapse Each Method
      </div>

      {methods.graham        && <IVMethodCard method={methods.graham} />}
      {methods.dcf           && <IVMethodCard method={methods.dcf} showTable={true} />}
      {methods.ownerEarnings && <IVMethodCard method={methods.ownerEarnings} />}

      {/* Narrative */}
      <div className="prose" style={{ fontSize: 16, marginTop: 20, color: FADED }}>
        {iv.ivSummary}
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [query, setQuery]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState("");
  const [report, setReport]             = useState(null);
  const [error, setError]               = useState(null);
  const [ivParams, setIVParams]         = useState(DEFAULT_IV_PARAMS);

  // Ref caches raw FMP data so params can change without re-fetching
  const rawDataRef = useRef(null);
  const inputRef   = useRef();

  // Called whenever IV params change — recomputes IV + verdict from cached raw data
  function updateIVParams(newParams) {
    setIVParams(newParams);
    if (!rawDataRef.current || !report) return;
    const { profile, incomeArr, balanceArr, cashflowArr } = rawDataRef.current;
    const m       = computeMetrics(profile, incomeArr, balanceArr, cashflowArr);
    const moat    = buildMoat(profile, m);
    const iv      = buildIV(profile, m, incomeArr, cashflowArr, toIVFractions(newParams));
    const verdict = buildVerdict(profile, m, moat, iv);
    setReport(r => r ? { ...r, iv, verdict } : null);
  }

  async function analyse(ticker) {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setReport(null);
    setError(null);

    // Reset fetch metadata so we get a clean cache summary for this run
    window.__fetchMeta = [];

    try {
      // ── Step 1: Fetch all free FMP endpoints in parallel ─────────────────
      setLoadingStep("Step 1 of 3 — Loading financials…");
      const [profileArr, incomeArr, balanceArr, cashflowArr, newsArr] = await Promise.all([
        fetchFMP(`/profile?symbol=${t}`),
        fetchFMP(`/income-statement?symbol=${t}&limit=5`),
        fetchFMP(`/balance-sheet-statement?symbol=${t}&limit=5`),
        fetchFMP(`/cashflow-statement?symbol=${t}&limit=5`),
        fetchFMP(`/stock-news?symbol=${t}&limit=5`),
      ]);

      // Build cache summary for display in the report header
      const meta      = window.__fetchMeta || [];
      const hits      = meta.filter(m => m.status === "HIT");
      const misses    = meta.filter(m => m.status === "MISS");
      const isDirect  = meta.every(m => m.status === "DIRECT");
      const cacheInfo = isDirect
        ? { label: "Live — FMP API", icon: "🌐", hint: "Run via server for caching" }
        : hits.length === meta.length
        ? { label: `All ${hits.length} datasets from cache`, icon: "📂", hint: `Oldest: ${hits.map(h=>h.age).filter(Boolean).sort().pop() || "fresh"}` }
        : hits.length > 0
        ? { label: `${hits.length} cached · ${misses.length} fresh from FMP`, icon: "📂", hint: "Partial cache hit" }
        : { label: "Fetched fresh from FMP — saved to cache", icon: "↓", hint: "Will load instantly next time" };

      const profile = profileArr && profileArr[0];
      if (!profile || !profile.companyName)
        throw new Error(`Ticker "${t}" not found. Try a valid US ticker like AAPL, KO, or V.`);

      // Cache raw data for re-computation when params change
      rawDataRef.current = { profile, incomeArr, balanceArr, cashflowArr };

      // ── Step 2: Compute metrics, moat, and intrinsic value ───────────────
      setLoadingStep("Step 2 of 3 — Computing metrics & valuation…");
      const m    = computeMetrics(profile, incomeArr, balanceArr, cashflowArr);
      const moat = buildMoat(profile, m);
      const iv   = buildIV(profile, m, incomeArr, cashflowArr, toIVFractions(ivParams));

      const inc5      = incomeArr || [];
      const latestInc = inc5[0]  || {};
      const oldestInc = inc5.length > 1 ? inc5[inc5.length - 1] : {};

      let revenueGrowth5yr = "N/A";
      if (inc5.length >= 2 && oldestInc.revenue && latestInc.revenue) {
        const cagr = (Math.pow(latestInc.revenue / oldestInc.revenue, 1 / (inc5.length - 1)) - 1) * 100;
        revenueGrowth5yr = cagr.toFixed(1) + "%";
      }
      const revYoY = inc5.length >= 2 && inc5[1].revenue
        ? ((latestInc.revenue - inc5[1].revenue) / inc5[1].revenue * 100).toFixed(1) + "% YoY" : "";

      const overview = {
        companyName:  profile.companyName,
        ticker:       profile.symbol,
        currentPrice: m.price != null ? "$" + m.price.toFixed(2) : "N/A",
        overview:     profile.description || "No description available.",
        keyDrivers:   moat.keyDrivers,
        metrics: {
          peRatio:         m.peRatioTTM           != null ? m.peRatioTTM.toFixed(1) + "×"          : "N/A",
          pbRatio:         m.pbRatioTTM           != null ? m.pbRatioTTM.toFixed(2) + "×"          : "N/A",
          roe:             m.returnOnEquityTTM    != null ? (m.returnOnEquityTTM * 100).toFixed(1) + "%" : "N/A",
          roic:            m.roicTTM              != null ? (m.roicTTM * 100).toFixed(1) + "%"      : "N/A",
          debtToEquity:    m.debtToEquityTTM      != null ? m.debtToEquityTTM.toFixed(2) + "×"     : "N/A",
          fcfYield:        m.freeCashFlowYieldTTM != null ? (m.freeCashFlowYieldTTM * 100).toFixed(1) + "%" : "N/A",
          revenueGrowth5yr,
          grossMargin:     m.grossProfitMarginTTM != null ? (m.grossProfitMarginTTM * 100).toFixed(1) + "%" : "N/A",
        },
        latestFinancials: latestInc.revenue
          ? `Revenue: ${formatNum(latestInc.revenue)}${revYoY ? " (" + revYoY + ")" : ""} · Net Income: ${formatNum(latestInc.netIncome)} · Operating Income: ${formatNum(latestInc.operatingIncome)}`
          : "Financial statement data not available.",
        sector:   profile.sector   || "",
        industry: profile.industry || "",
      };

      // ── Step 3: Build 5-year history + verdict ───────────────────────────
      setLoadingStep("Step 3 of 3 — Rendering the verdict…");
      const history = buildHistory(incomeArr, balanceArr, cashflowArr);
      const verdict = buildVerdict(profile, m, moat, iv);

      const news = {
        news: (newsArr || []).slice(0, 5).map(item => {
          const { sentiment, type } = classifyNews(item.title || "", item.text || "");
          return {
            headline:    item.title || "",
            date:        fmtNewsDate(item.publishedDate),
            sentiment,
            summary:     item.text ? item.text.slice(0, 220) + (item.text.length > 220 ? "…" : "") : "",
            fullSummary: item.text || "",
            type,
          };
        }),
      };

      setReport({ overview, moat, iv, verdict, news, history, cacheInfo });
    } catch (e) {
      const msg = e.name === "AbortError"
        ? "Request timed out. Please check your connection and try again."
        : (e.message || "Something went wrong. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  function handleSubmit() { analyse(query); }

  const verdictClass = {
    BUY:   "verdict-buy",
    HOLD:  "verdict-hold",
    AVOID: "verdict-avoid",
    WATCH: "verdict-watch",
  }[report?.verdict?.verdict] || "verdict-watch";

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="header-rule">
          <span /><span className="header-ornament">◆</span><span />
        </div>
        <h1>The <em>Berkshire</em> Analyst</h1>
        <p className="header-sub">Value Intelligence — Est. in the Spirit of Omaha</p>
        <div className="header-rule" style={{ marginTop: 16, marginBottom: 0 }}>
          <span /><span className="header-ornament">◆</span><span />
        </div>
      </header>

      {/* Search */}
      <div className="search-area">
        <p className="search-label">"Price is what you pay. Value is what you get."</p>
        <div className="search-row">
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Enter ticker or company name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
          />
          <button className="search-btn" onClick={handleSubmit} disabled={loading || !query.trim()}>
            ANALYSE
          </button>
        </div>
        <div className="recent-row">
          {SAMPLE_TICKERS.map(t => (
            <button key={t} className="chip" disabled={loading}
              onClick={() => { setQuery(t); analyse(t); }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-block">
          <div className="loading-spinner" />
          <div className="loading-text">Consulting the Oracle of Omaha…</div>
          <div className="loading-sub">{loadingStep}</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-box">
          <strong>⚠ Analysis Failed</strong>
          <div style={{ marginTop: 8, fontSize: 15 }}>{error}</div>
          <button
            style={{ marginTop: 14, fontFamily: "'Courier Prime', monospace", fontSize: 13,
                     padding: "6px 16px", cursor: "pointer", background: "transparent",
                     border: `1px solid ${RUST}`, color: RUST }}
            onClick={() => analyse(query)}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {/* Report */}
      {report && !loading && (() => {
        const { overview, moat, iv, verdict, news, history, cacheInfo } = report;
        return (
          <div className="report">

            {/* Report Header */}
            <div className="report-header">
              <div>
                <div className="report-company">{overview?.companyName || query.toUpperCase()}</div>
                <div className="report-ticker">{overview?.ticker} · {overview?.currentPrice}</div>
                {(overview?.sector || overview?.industry) && (
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 2,
                                color: GOLD, opacity: 0.75, marginTop: 4, textTransform: "uppercase" }}>
                    {[overview.sector, overview.industry].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                {verdict?.verdict && (
                  <div className={`verdict-badge ${verdictClass}`}>{verdict.verdict}</div>
                )}
                {cacheInfo && (
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                letterSpacing: 1, color: FADED, display: "flex",
                                alignItems: "center", gap: 5 }}
                       title={cacheInfo.hint}>
                    <span>{cacheInfo.icon}</span>
                    <span>{cacheInfo.label}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="sections">

              {/* Buffett & Munger Verdict */}
              <CollapsibleSection title="The Verdict — Buffett & Munger" icon="🎩" defaultOpen={true}>
                {verdict ? (
                  <div className="verdict-section">
                    <div className="verdict-quote-mark">"</div>
                    {verdict.buffettVoice && (
                      <>
                        <div className="verdict-text">{verdict.buffettVoice}</div>
                        <div className="verdict-attribution">— Warren Buffett</div>
                      </>
                    )}
                    {verdict.mungerVoice && (
                      <>
                        <div className="verdict-text" style={{ marginTop: 18 }}>{verdict.mungerVoice}</div>
                        <div className="verdict-attribution">— Charlie Munger</div>
                      </>
                    )}
                    {verdict.keyRisks?.length > 0 && (
                      <div style={{ marginTop: 20, paddingLeft: 24 }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                      letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>
                          Key Risks
                        </div>
                        {verdict.keyRisks.map((r, i) => (
                          <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, marginBottom: 4, color: RUST }}>◦ {r}</div>
                        ))}
                      </div>
                    )}
                    {verdict.catalysts?.length > 0 && (
                      <div style={{ marginTop: 16, paddingLeft: 24 }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                      letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>
                          Catalysts
                        </div>
                        {verdict.catalysts.map((c, i) => (
                          <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, marginBottom: 4, color: "#4a7c59" }}>◦ {c}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : <div className="prose">No verdict available.</div>}
              </CollapsibleSection>

              {/* Intrinsic Value — now with full workings */}
              <CollapsibleSection title="Intrinsic Value Estimate" icon="⚖️" defaultOpen={true}>
                {iv
                  ? <IVSection iv={iv} ivParams={ivParams} onParamsChange={updateIVParams} />
                  : <div className="prose">Intrinsic value data unavailable.</div>}
              </CollapsibleSection>

              {/* Business Overview */}
              <CollapsibleSection title="Business Overview" icon="🏛️" defaultOpen={true}>
                {overview ? (
                  <>
                    <div className="prose" style={{ fontSize: 17, marginBottom: 18 }}>{overview.overview}</div>
                    {overview.keyDrivers?.length > 0 && (
                      <>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                      letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 10 }}>
                          Key Value Drivers
                        </div>
                        {overview.keyDrivers.map((d, i) => (
                          <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 17, marginBottom: 6 }}>◆ {d}</div>
                        ))}
                      </>
                    )}
                    {overview.latestFinancials && (
                      <div style={{ marginTop: 18, padding: "14px 18px", borderLeft: `3px solid ${BORDER}`, background: CREAM }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                      letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>
                          Latest Financials
                        </div>
                        <div className="prose" style={{ fontSize: 16 }}>{overview.latestFinancials}</div>
                      </div>
                    )}
                  </>
                ) : <div className="prose">Overview unavailable.</div>}
              </CollapsibleSection>

              {/* Key Metrics */}
              {overview?.metrics && (
                <CollapsibleSection title="Key Metrics" icon="📊">
                  <div className="metrics-grid">
                    {Object.entries({
                      "P/E Ratio":      overview.metrics.peRatio,
                      "P/B Ratio":      overview.metrics.pbRatio,
                      "ROE":            overview.metrics.roe,
                      "ROIC":           overview.metrics.roic,
                      "Debt / Equity":  overview.metrics.debtToEquity,
                      "FCF Yield":      overview.metrics.fcfYield,
                      "5yr Rev Growth": overview.metrics.revenueGrowth5yr,
                      "Gross Margin":   overview.metrics.grossMargin,
                    }).map(([label, val]) => (
                      <div className="metric-cell" key={label}>
                        <div className="metric-label">{label}</div>
                        <div className="metric-value" style={{ fontSize: 18 }}>{val || "N/A"}</div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* 5-Year Financial History */}
              {history && (
                <CollapsibleSection title="5-Year Financial History" icon="📈">
                  <HistoryTable history={history} />
                </CollapsibleSection>
              )}

              {/* Moat & Management */}
              {moat && (
                <CollapsibleSection title="Economic Moat & Management" icon="🏰">
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                   letterSpacing: 2, color: FADED, textTransform: "uppercase" }}>
                      Moat Rating:{" "}
                    </span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
                      {moat.moatRating}
                    </span>
                  </div>
                  {moat.moatScores && Object.entries({
                    "Brand Power":     moat.moatScores.brandPower,
                    "Switching Costs": moat.moatScores.switchingCosts,
                    "Network Effects": moat.moatScores.networkEffects,
                    "Cost Advantage":  moat.moatScores.costAdvantage,
                    "Intangibles":     moat.moatScores.intangibles,
                  }).map(([label, score]) => (
                    <MoatBar key={label} label={label} score={Number(score) || 0} />
                  ))}
                  <div className="prose" style={{ fontSize: 17, marginTop: 18 }}>{moat.moatSummary}</div>
                  <div style={{ marginTop: 18, padding: "14px 18px", borderLeft: `3px solid ${GOLD}`, background: "#fdf8ee" }}>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11,
                                   letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>
                      Management
                    </div>
                    <div className="prose" style={{ fontSize: 16 }}>{moat.managementSummary}</div>
                  </div>
                </CollapsibleSection>
              )}

              {/* News */}
              {news?.news?.length > 0 && (
                <CollapsibleSection title="Latest News & Filings" icon="📰">
                  {news.news.map((item, i) => <NewsItem key={i} item={item} />)}
                </CollapsibleSection>
              )}

            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="footer">
        <span className="footer-ornament">◆</span>
        For educational purposes only — not financial advice
        <span className="footer-ornament">◆</span>
        <br />
        <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>
          Powered by rule-based analysis · In the spirit of Berkshire Hathaway
        </span>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
