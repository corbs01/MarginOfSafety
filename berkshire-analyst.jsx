import { useState, useEffect, useRef } from "react";

const PARCHMENT = "#f5f0e8";
const INK = "#1a1008";
const GOLD = "#b8860b";
const RUST = "#8b3a0f";
const CREAM = "#faf7f0";
const FADED = "#7a6e5f";
const BORDER = "#c8b99a";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Courier+Prime:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${PARCHMENT};
    color: ${INK};
    font-family: 'EB Garamond', Georgia, serif;
    min-height: 100vh;
  }

  .app {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }

  /* ── Header ── */
  .header {
    border-bottom: 3px double ${BORDER};
    padding: 36px 0 28px;
    text-align: center;
    position: relative;
  }
  .header-rule {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    margin-bottom: 10px;
  }
  .header-rule span { flex: 1; height: 1px; background: ${BORDER}; }
  .header-ornament { color: ${GOLD}; font-size: 18px; }
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 5vw, 46px);
    font-weight: 700;
    letter-spacing: -0.5px;
    color: ${INK};
    line-height: 1.1;
  }
  .header h1 em { font-style: italic; color: ${RUST}; }
  .header-sub {
    font-family: 'EB Garamond', serif;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${FADED};
    margin-top: 8px;
  }

  /* ── Search ── */
  .search-area {
    padding: 36px 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .search-label {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    color: ${FADED};
  }
  .search-row {
    display: flex;
    gap: 0;
    width: 100%;
    max-width: 520px;
    border: 2px solid ${INK};
    background: ${CREAM};
    box-shadow: 4px 4px 0 ${BORDER};
  }
  .search-input {
    flex: 1;
    padding: 14px 18px;
    font-family: 'EB Garamond', serif;
    font-size: 18px;
    background: transparent;
    border: none;
    outline: none;
    color: ${INK};
  }
  .search-input::placeholder { color: ${FADED}; font-style: italic; }
  .search-btn {
    padding: 14px 24px;
    background: ${INK};
    color: ${PARCHMENT};
    border: none;
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 1px;
    transition: background 0.2s;
  }
  .search-btn:hover { background: ${RUST}; }
  .search-btn:disabled { background: ${FADED}; cursor: not-allowed; }

  /* ── Ticker chips ── */
  .recent-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    max-width: 520px;
  }
  .chip {
    padding: 4px 14px;
    border: 1px solid ${BORDER};
    background: transparent;
    font-family: 'Courier Prime', monospace;
    font-size: 13px;
    color: ${RUST};
    cursor: pointer;
    letter-spacing: 1px;
    transition: all 0.15s;
  }
  .chip:hover { background: ${INK}; color: ${PARCHMENT}; border-color: ${INK}; }

  /* ── Loading ── */
  .loading-block {
    text-align: center;
    padding: 60px 0;
  }
  .loading-spinner {
    display: inline-block;
    width: 36px; height: 36px;
    border: 3px solid ${BORDER};
    border-top-color: ${RUST};
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
    margin-bottom: 18px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 18px;
    color: ${FADED};
  }
  .loading-sub {
    font-size: 14px;
    color: ${FADED};
    margin-top: 6px;
    font-family: 'EB Garamond', serif;
  }

  /* ── Report ── */
  .report { animation: fadeIn 0.6s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

  .report-header {
    border: 2px solid ${INK};
    padding: 28px 32px;
    margin-bottom: 0;
    background: ${INK};
    color: ${PARCHMENT};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .report-company {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .report-ticker {
    font-family: 'Courier Prime', monospace;
    font-size: 14px;
    letter-spacing: 3px;
    color: ${GOLD};
    margin-top: 4px;
  }
  .verdict-badge {
    padding: 10px 22px;
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 1px;
    border: 2px solid;
  }
  .verdict-buy { border-color: #4a7c59; color: #4a7c59; background: rgba(74,124,89,0.15); }
  .verdict-hold { border-color: ${GOLD}; color: ${GOLD}; background: rgba(184,134,11,0.1); }
  .verdict-avoid { border-color: ${RUST}; color: #e07040; background: rgba(139,58,15,0.1); }
  .verdict-watch { border-color: #7a6e5f; color: #aaa; background: rgba(122,110,95,0.1); }

  /* ── Sections ── */
  .sections { border: 2px solid ${INK}; border-top: none; }

  .section {
    border-bottom: 1px solid ${BORDER};
    overflow: hidden;
  }
  .section:last-child { border-bottom: none; }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 28px;
    cursor: pointer;
    background: ${CREAM};
    user-select: none;
    transition: background 0.15s;
  }
  .section-head:hover { background: #f0ebe0; }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-icon { font-size: 18px; }
  .section-toggle { font-size: 18px; color: ${FADED}; transition: transform 0.25s; }
  .section-toggle.open { transform: rotate(180deg); }

  .section-body {
    padding: 0 28px 24px;
    background: ${PARCHMENT};
    display: none;
  }
  .section-body.open { display: block; animation: slideDown 0.25s ease; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

  /* ── Prose ── */
  .prose {
    font-family: 'EB Garamond', serif;
    font-size: 18px;
    line-height: 1.75;
    color: ${INK};
    white-space: pre-wrap;
  }
  .prose p { margin-bottom: 14px; }

  /* ── Verdict section special ── */
  .verdict-section {
    background: #fdf8ee;
    border-left: 4px solid ${GOLD};
    padding: 20px 24px;
    margin-top: 4px;
    position: relative;
  }
  .verdict-quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 72px;
    color: ${GOLD};
    opacity: 0.25;
    position: absolute;
    top: -8px;
    left: 14px;
    line-height: 1;
    pointer-events: none;
  }
  .verdict-text {
    font-family: 'EB Garamond', serif;
    font-size: 19px;
    font-style: italic;
    line-height: 1.8;
    color: ${INK};
    white-space: pre-wrap;
    padding-left: 24px;
  }
  .verdict-attribution {
    margin-top: 14px;
    padding-left: 24px;
    font-family: 'Courier Prime', monospace;
    font-size: 13px;
    color: ${FADED};
    letter-spacing: 1px;
  }

  /* ── Metrics grid ── */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1px;
    background: ${BORDER};
    border: 1px solid ${BORDER};
    margin-top: 4px;
  }
  .metric-cell {
    background: ${CREAM};
    padding: 16px;
  }
  .metric-label {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: ${FADED};
    margin-bottom: 6px;
  }
  .metric-value {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: ${INK};
  }
  .metric-sub {
    font-size: 12px;
    color: ${FADED};
    margin-top: 2px;
    font-family: 'EB Garamond', serif;
  }

  /* ── Moat rating ── */
  .moat-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px 0 6px;
  }
  .moat-label {
    font-family: 'Courier Prime', monospace;
    font-size: 12px;
    letter-spacing: 1px;
    color: ${FADED};
    width: 100px;
  }
  .moat-bar-bg {
    flex: 1;
    height: 8px;
    background: ${BORDER};
    position: relative;
    max-width: 260px;
  }
  .moat-bar-fill {
    height: 100%;
    background: ${RUST};
    transition: width 0.8s ease;
  }
  .moat-score {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 15px;
    width: 30px;
    text-align: right;
  }

  /* ── News feed ── */
  .news-item {
    padding: 16px 0;
    border-bottom: 1px solid ${BORDER};
    display: flex;
    gap: 16px;
  }
  .news-item:last-child { border-bottom: none; }
  .news-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    margin-top: 7px;
    flex-shrink: 0;
  }
  .news-dot.bullish { background: #4a7c59; }
  .news-dot.bearish { background: ${RUST}; }
  .news-dot.neutral { background: ${FADED}; }
  .news-headline {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 4px;
  }
  .news-meta {
    font-family: 'Courier Prime', monospace;
    font-size: 12px;
    color: ${FADED};
    letter-spacing: 0.5px;
  }
  .news-summary {
    font-family: 'EB Garamond', serif;
    font-size: 16px;
    color: ${FADED};
    margin-top: 4px;
    line-height: 1.6;
  }

  /* ── Error ── */
  .error-box {
    border: 2px solid ${RUST};
    padding: 20px 24px;
    background: #fdf2ec;
    color: ${RUST};
    font-family: 'EB Garamond', serif;
    font-size: 17px;
    margin-top: 20px;
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    padding: 40px 0 0;
    font-family: 'EB Garamond', serif;
    font-size: 14px;
    color: ${FADED};
    border-top: 1px solid ${BORDER};
    margin-top: 48px;
  }
  .footer-ornament { color: ${GOLD}; margin: 0 8px; }

  @media (max-width: 600px) {
    .report-header { padding: 20px; }
    .section-head { padding: 14px 18px; }
    .section-body { padding: 0 18px 18px; }
    .verdict-text { padding-left: 10px; font-size: 17px; }
  }
`;

const SAMPLE_TICKERS = ["AAPL", "KO", "BAC", "BRK.B", "AMZN", "V"];

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

function parseJSON(text) {
  try {
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

async function callClaude(messages, systemPrompt, useSearch = false) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  };
  if (useSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || "").filter(Boolean).join("\n");
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  async function analyse(ticker) {
    if (!ticker.trim()) return;
    setLoading(true);
    setReport(null);
    setError(null);

    try {
      // Step 1 – Business overview + latest financials via search
      setLoadingStep("Researching the business & latest filings…");
      const overviewRaw = await callClaude(
        [{ role: "user", content: `Analyse ${ticker.trim().toUpperCase()} for a value investor. Return ONLY valid JSON (no markdown fences) with these exact keys:
{
  "companyName": "Full company name",
  "ticker": "TICKER",
  "currentPrice": "e.g. $185.20 (or 'N/A')",
  "overview": "3–4 sentences explaining what the business does in plain English, how it makes money, and its key revenue drivers",
  "keyDrivers": ["driver 1", "driver 2", "driver 3"],
  "metrics": {
    "peRatio": "value or N/A",
    "pbRatio": "value or N/A",
    "roe": "value% or N/A",
    "roic": "value% or N/A",
    "debtToEquity": "value or N/A",
    "fcfYield": "value% or N/A",
    "revenueGrowth5yr": "value% or N/A",
    "grossMargin": "value% or N/A"
  },
  "latestFinancials": "2–3 sentences summarising the most recent 10-Q or 10-K highlights"
}` }],
        "You are a financial data analyst. Return only valid JSON, no commentary, no markdown.",
        true
      );

      const overview = parseJSON(overviewRaw);
      if (!overview) throw new Error("Could not parse company data. Try a major ticker like AAPL or KO.");

      // Step 2 – Moat analysis
      setLoadingStep("Evaluating the economic moat…");
      const moatRaw = await callClaude(
        [{ role: "user", content: `Evaluate the economic moat of ${overview.companyName} (${overview.ticker}). Return ONLY valid JSON:
{
  "moatRating": "Wide / Narrow / None",
  "moatScores": {
    "brandPower": 0-10,
    "switchingCosts": 0-10,
    "networkEffects": 0-10,
    "costAdvantage": 0-10,
    "intangibles": 0-10
  },
  "moatSummary": "3–4 sentences on the competitive advantages and any threats to the moat",
  "managementSummary": "3–4 sentences on management quality, capital allocation track record, and alignment with shareholders"
}` }],
        "You are a value investing analyst specialising in competitive moat analysis. Return only valid JSON.",
        true
      );
      const moat = parseJSON(moatRaw);

      // Step 3 – Intrinsic value
      setLoadingStep("Calculating intrinsic value…");
      const ivRaw = await callClaude(
        [{ role: "user", content: `Estimate the intrinsic value of ${overview.companyName} (${overview.ticker}) using value investing principles. Return ONLY valid JSON:
{
  "intrinsicValueLow": "$XXX",
  "intrinsicValueMid": "$XXX",
  "intrinsicValueHigh": "$XXX",
  "currentPrice": "${overview.currentPrice}",
  "marginOfSafety": "e.g. 25% undervalued / 10% overvalued / fairly valued",
  "valuationMethod": "brief description of method used (e.g. DCF with conservative FCF growth)",
  "keyAssumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "ivSummary": "3 sentences explaining the valuation and what drives it"
}` }],
        "You are a value investing analyst. Be conservative and margin-of-safety focused. Return only valid JSON.",
        true
      );
      const iv = parseJSON(ivRaw);

      // Step 4 – Buffett/Munger verdict
      setLoadingStep("Channelling Buffett & Munger…");
      const verdictRaw = await callClaude(
        [{ role: "user", content: `You are Warren Buffett and Charlie Munger analysing ${overview.companyName} (${overview.ticker}).
Business: ${overview.overview}
Moat: ${moat?.moatSummary}
Valuation: ${iv?.ivSummary}
Management: ${moat?.managementSummary}

Return ONLY valid JSON:
{
  "verdict": "BUY / HOLD / AVOID / WATCH",
  "buffettVoice": "3–4 sentences in Warren Buffett's folksy, measured voice giving his view on this business and whether he'd buy it today",
  "mungerVoice": "2–3 sentences in Charlie Munger's blunt, multi-disciplinary voice adding a sharp observation or contrarian point",
  "keyRisks": ["risk 1", "risk 2", "risk 3"],
  "catalysts": ["catalyst 1", "catalyst 2"]
}` }],
        "You are Warren Buffett and Charlie Munger. Speak authentically in their voices. Return only valid JSON.",
        false
      );
      const verdict = parseJSON(verdictRaw);

      // Step 5 – News feed
      setLoadingStep("Scanning for latest news & filings…");
      const newsRaw = await callClaude(
        [{ role: "user", content: `Find the 4 most recent and important news items, filings, or events for ${overview.companyName} (${overview.ticker}) that a value investor should know about. Return ONLY valid JSON:
{
  "news": [
    {
      "headline": "...",
      "date": "approx date",
      "sentiment": "bullish/bearish/neutral",
      "summary": "1–2 sentences on what happened and why it matters to a value investor",
      "type": "Earnings / Filing / M&A / Product / Macro / Other"
    }
  ]
}` }],
        "You are a financial news analyst. Return only valid JSON.",
        true
      );
      const news = parseJSON(newsRaw);

      setReport({ overview, moat, iv, verdict, news });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  function handleSubmit() {
    analyse(query);
  }

  const verdictClass = {
    BUY: "verdict-buy",
    HOLD: "verdict-hold",
    AVOID: "verdict-avoid",
    WATCH: "verdict-watch",
  }[report?.verdict?.verdict] || "verdict-watch";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
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
              <button key={t} className="chip" onClick={() => { setQuery(t); analyse(t); }}>{t}</button>
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
        {error && <div className="error-box">⚠ {error}</div>}

        {/* Report */}
        {report && !loading && (() => {
          const { overview, moat, iv, verdict, news } = report;
          return (
            <div className="report">
              {/* Report Header */}
              <div className="report-header">
                <div>
                  <div className="report-company">{overview?.companyName || query.toUpperCase()}</div>
                  <div className="report-ticker">{overview?.ticker} · {overview?.currentPrice}</div>
                </div>
                {verdict?.verdict && (
                  <div className={`verdict-badge ${verdictClass}`}>{verdict.verdict}</div>
                )}
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
                          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Key Risks</div>
                          {verdict.keyRisks.map((r, i) => (
                            <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, marginBottom: 4, color: RUST }}>◦ {r}</div>
                          ))}
                        </div>
                      )}
                      {verdict.catalysts?.length > 0 && (
                        <div style={{ marginTop: 16, paddingLeft: 24 }}>
                          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Catalysts</div>
                          {verdict.catalysts.map((c, i) => (
                            <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, marginBottom: 4, color: "#4a7c59" }}>◦ {c}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : <div className="prose">No verdict available.</div>}
                </CollapsibleSection>

                {/* Intrinsic Value */}
                <CollapsibleSection title="Intrinsic Value Estimate" icon="⚖️" defaultOpen={true}>
                  {iv ? (
                    <>
                      <div className="metrics-grid" style={{ marginBottom: 16 }}>
                        <div className="metric-cell">
                          <div className="metric-label">Intrinsic Value (Low)</div>
                          <div className="metric-value" style={{ color: RUST }}>{iv.intrinsicValueLow}</div>
                        </div>
                        <div className="metric-cell">
                          <div className="metric-label">Intrinsic Value (Mid)</div>
                          <div className="metric-value">{iv.intrinsicValueMid}</div>
                        </div>
                        <div className="metric-cell">
                          <div className="metric-label">Intrinsic Value (High)</div>
                          <div className="metric-value" style={{ color: "#4a7c59" }}>{iv.intrinsicValueHigh}</div>
                        </div>
                        <div className="metric-cell">
                          <div className="metric-label">Current Price</div>
                          <div className="metric-value">{iv.currentPrice || overview?.currentPrice}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1.5, color: FADED, textTransform: "uppercase" }}>Margin of Safety: </span>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600 }}>{iv.marginOfSafety}</span>
                      </div>
                      <div className="prose" style={{ fontSize: 17 }}>{iv.ivSummary}</div>
                      {iv.keyAssumptions?.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Key Assumptions</div>
                          {iv.keyAssumptions.map((a, i) => (
                            <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, marginBottom: 4 }}>◦ {a}</div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : <div className="prose">Intrinsic value data unavailable.</div>}
                </CollapsibleSection>

                {/* Business Overview */}
                <CollapsibleSection title="Business Overview" icon="🏛️" defaultOpen={true}>
                  {overview ? (
                    <>
                      <div className="prose" style={{ fontSize: 17, marginBottom: 18 }}>{overview.overview}</div>
                      {overview.keyDrivers?.length > 0 && (
                        <>
                          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 10 }}>Key Value Drivers</div>
                          {overview.keyDrivers.map((d, i) => (
                            <div key={i} style={{ fontFamily: "'EB Garamond', serif", fontSize: 17, marginBottom: 6 }}>◆ {d}</div>
                          ))}
                        </>
                      )}
                      {overview.latestFinancials && (
                        <div style={{ marginTop: 18, padding: "14px 18px", borderLeft: `3px solid ${BORDER}`, background: CREAM }}>
                          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Latest Financials</div>
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
                        "P/E Ratio": overview.metrics.peRatio,
                        "P/B Ratio": overview.metrics.pbRatio,
                        "ROE": overview.metrics.roe,
                        "ROIC": overview.metrics.roic,
                        "Debt / Equity": overview.metrics.debtToEquity,
                        "FCF Yield": overview.metrics.fcfYield,
                        "5yr Rev Growth": overview.metrics.revenueGrowth5yr,
                        "Gross Margin": overview.metrics.grossMargin,
                      }).map(([label, val]) => (
                        <div className="metric-cell" key={label}>
                          <div className="metric-label">{label}</div>
                          <div className="metric-value" style={{ fontSize: 18 }}>{val || "N/A"}</div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Moat & Management */}
                {moat && (
                  <CollapsibleSection title="Economic Moat & Management" icon="🏰">
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase" }}>Moat Rating: </span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{moat.moatRating}</span>
                    </div>
                    {moat.moatScores && Object.entries({
                      "Brand Power": moat.moatScores.brandPower,
                      "Switching Costs": moat.moatScores.switchingCosts,
                      "Network Effects": moat.moatScores.networkEffects,
                      "Cost Advantage": moat.moatScores.costAdvantage,
                      "Intangibles": moat.moatScores.intangibles,
                    }).map(([label, score]) => (
                      <MoatBar key={label} label={label} score={Number(score) || 0} />
                    ))}
                    <div className="prose" style={{ fontSize: 17, marginTop: 18 }}>{moat.moatSummary}</div>
                    <div style={{ marginTop: 18, padding: "14px 18px", borderLeft: `3px solid ${GOLD}`, background: "#fdf8ee" }}>
                      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Management</div>
                      <div className="prose" style={{ fontSize: 16 }}>{moat.managementSummary}</div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* News & Filings Feed */}
                {news?.news?.length > 0 && (
                  <CollapsibleSection title="Latest News & Filings" icon="📰">
                    {news.news.map((item, i) => (
                      <div className="news-item" key={i}>
                        <div className={`news-dot ${item.sentiment}`} />
                        <div>
                          <div className="news-headline">{item.headline}</div>
                          <div className="news-meta">{item.date} · {item.type} · <span style={{ color: item.sentiment === "bullish" ? "#4a7c59" : item.sentiment === "bearish" ? RUST : FADED }}>{item.sentiment}</span></div>
                          <div className="news-summary">{item.summary}</div>
                        </div>
                      </div>
                    ))}
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
          <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>Powered by Claude · In the spirit of Berkshire Hathaway</span>
        </footer>
      </div>
    </>
  );
}
