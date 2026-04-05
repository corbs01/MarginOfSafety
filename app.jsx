// ── The Berkshire Analyst — React App ────────────────────────────────────────
// Depends on globals defined in:
//   js/keys.js     → window.getFMPKey()
//   js/fmp.js      → fetchFMP(), computeMetrics(), formatNum(), fmtPct(), fmtRatio(),
//                    classifyNews(), fmtNewsDate()
//   js/analysis.js → buildMoat(), buildIV(), buildVerdict()

const { useState, useRef } = React;

// Colour tokens — kept here for inline JSX styles
const PARCHMENT = "#f5f0e8";
const INK       = "#1a1008";
const GOLD      = "#b8860b";
const RUST      = "#8b3a0f";
const CREAM     = "#faf7f0";
const FADED     = "#7a6e5f";
const BORDER    = "#c8b99a";

const SAMPLE_TICKERS = ["AAPL", "KO", "BAC", "BRK.B", "AMZN", "V"];

// ── Sub-components ────────────────────────────────────────────────────────────

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

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [report, setReport]         = useState(null);
  const [error, setError]           = useState(null);
  const inputRef = useRef();

  async function analyse(ticker) {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setReport(null);
    setError(null);

    try {
      // Step 1 – Fetch all data in parallel (free FMP endpoints only)
      setLoadingStep("Step 1 of 3 — Fetching financials from FMP…");
      const [profileArr, incomeArr, balanceArr, cashflowArr, newsArr] = await Promise.all([
        fetchFMP(`/profile?symbol=${t}`),
        fetchFMP(`/income-statement?symbol=${t}&limit=5`),
        fetchFMP(`/balance-sheet-statement?symbol=${t}&limit=5`),
        fetchFMP(`/cashflow-statement?symbol=${t}&limit=5`),
        fetchFMP(`/stock-news?symbol=${t}&limit=5`),
      ]);

      const profile = profileArr && profileArr[0];
      if (!profile || !profile.companyName)
        throw new Error(`Ticker "${t}" not found. Try a valid US ticker like AAPL, KO, or V.`);

      // Step 2 – Compute all metrics from raw statements (no paid endpoints)
      setLoadingStep("Step 2 of 3 — Computing metrics & valuation…");
      const m = computeMetrics(profile, incomeArr, balanceArr, cashflowArr);

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

      const moat = buildMoat(profile, m);
      const iv   = buildIV(profile, m);

      const overview = {
        companyName:  profile.companyName,
        ticker:       profile.symbol,
        currentPrice: m.price != null ? "$" + m.price.toFixed(2) : "N/A",
        overview:     profile.description || "No description available.",
        keyDrivers:   moat.keyDrivers,
        metrics: {
          peRatio:          m.peRatioTTM           != null ? m.peRatioTTM.toFixed(1) + "×"          : "N/A",
          pbRatio:          m.pbRatioTTM           != null ? m.pbRatioTTM.toFixed(2) + "×"          : "N/A",
          roe:              m.returnOnEquityTTM    != null ? (m.returnOnEquityTTM * 100).toFixed(1) + "%" : "N/A",
          roic:             m.roicTTM              != null ? (m.roicTTM * 100).toFixed(1) + "%"      : "N/A",
          debtToEquity:     m.debtToEquityTTM      != null ? m.debtToEquityTTM.toFixed(2) + "×"     : "N/A",
          fcfYield:         m.freeCashFlowYieldTTM != null ? (m.freeCashFlowYieldTTM * 100).toFixed(1) + "%" : "N/A",
          revenueGrowth5yr,
          grossMargin:      m.grossProfitMarginTTM != null ? (m.grossProfitMarginTTM * 100).toFixed(1) + "%" : "N/A",
        },
        latestFinancials: latestInc.revenue
          ? `Revenue: ${formatNum(latestInc.revenue)}${revYoY ? " (" + revYoY + ")" : ""} · Net Income: ${formatNum(latestInc.netIncome)} · Operating Income: ${formatNum(latestInc.operatingIncome)}`
          : "Financial statement data not available.",
        sector:   profile.sector   || "",
        industry: profile.industry || "",
      };

      // Step 3 – Verdict
      setLoadingStep("Step 3 of 3 — Rendering the verdict…");
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

      setReport({ overview, moat, iv, verdict, news });
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
            <button key={t} className="chip" disabled={loading} onClick={() => { setQuery(t); analyse(t); }}>{t}</button>
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
        const { overview, moat, iv, verdict, news } = report;
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
                      "P/E Ratio":       overview.metrics.peRatio,
                      "P/B Ratio":       overview.metrics.pbRatio,
                      "ROE":             overview.metrics.roe,
                      "ROIC":            overview.metrics.roic,
                      "Debt / Equity":   overview.metrics.debtToEquity,
                      "FCF Yield":       overview.metrics.fcfYield,
                      "5yr Rev Growth":  overview.metrics.revenueGrowth5yr,
                      "Gross Margin":    overview.metrics.grossMargin,
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
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 2, color: FADED, textTransform: "uppercase", marginBottom: 8 }}>Management</div>
                    <div className="prose" style={{ fontSize: 16 }}>{moat.managementSummary}</div>
                  </div>
                </CollapsibleSection>
              )}

              {/* News & Filings Feed */}
              {news?.news?.length > 0 && (
                <CollapsibleSection title="Latest News & Filings" icon="📰">
                  {news.news.map((item, i) => (
                    <NewsItem key={i} item={item} />
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
        <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>Powered by rule-based analysis · In the spirit of Berkshire Hathaway</span>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
