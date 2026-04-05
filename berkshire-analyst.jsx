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

// ─── FMP Data Layer ───────────────────────────────────────────

async function fmp(path) {
  const key = window.getFMPKey();
  if (!key) throw new Error("Please enter your FMP API key above.");
  const sep = path.includes("?") ? "&" : "?";
  const url = `https://financialmodelingprep.com/api${path}${sep}apikey=${key}`;
  const res = await fetch(url);
  if (res.status === 401) throw new Error("Invalid FMP API key. Please double-check and re-save it.");
  if (res.status === 403) return null; // endpoint not on free plan — caller handles gracefully
  if (!res.ok) throw new Error(`FMP returned HTTP ${res.status}. Try again shortly.`);
  const data = await res.json();
  // FMP returns {"Error Message":"..."} on bad ticker
  if (data && data["Error Message"]) return null;
  return data;
}

// ─── Compute ratios from raw free-tier statements ─────────────
// Replaces the paid /v3/ratios/ and /v3/key-metrics/ endpoints.

function computeRatiosAndMetrics(profile, income5, balance5, cf5) {
  const price = profile.price  || 0;
  const mcap  = profile.mktCap || 0;
  const inc   = income5?.[0]   || {};
  const bal   = balance5?.[0]  || {};
  const cf    = cf5?.[0]       || {};

  const shares = profile.sharesOutstanding
    || (mcap > 0 && price > 0 ? mcap / price : null);

  const equity = bal.totalStockholdersEquity || bal.totalEquity || null;
  const debt   = safe(bal.totalDebt,   0);
  const cash   = safe(bal.cashAndCashEquivalents, 0);
  const fcf    = safe(cf.freeCashFlow, null);

  // Derive EPS: prefer statement field, fall back to net income / shares
  const eps  = safe(inc.eps) || (inc.netIncome && shares ? inc.netIncome / shares : null);
  const bvps = equity && shares ? equity / shares : null;

  // Invested capital for ROIC
  const investedCapital = equity && (equity + debt - cash) > 0
    ? equity + debt - cash : null;

  // r — mirrors the shape the scoring functions expect
  const r = {
    priceEarningsRatio:      eps && eps > 0 && price      ? price / eps            : null,
    priceToBookRatio:        bvps && bvps > 0 && price    ? price / bvps           : null,
    returnOnEquity:          inc.netIncome && equity       ? inc.netIncome / equity : null,
    returnOnCapitalEmployed: inc.operatingIncome && investedCapital
      ? (inc.operatingIncome * 0.79) / investedCapital : null, // after-tax ROIC
    debtEquityRatio:         equity && equity > 0          ? debt / equity          : null,
    currentRatio:            bal.totalCurrentAssets && bal.totalCurrentLiabilities
      ? bal.totalCurrentAssets / bal.totalCurrentLiabilities : null,
    grossProfitMargin:       inc.grossProfit && inc.revenue
      ? inc.grossProfit / inc.revenue : null,
    dividendYield:           profile.lastDiv && price      ? profile.lastDiv / price : null,
    payoutRatio:             inc.netIncome && profile.lastDiv && shares
      ? (profile.lastDiv * shares) / inc.netIncome : null,
  };

  // km — mirrors key-metrics shape used in buildIV and buildMgmtSummary
  const km = {
    netIncomePerShare: eps,
    bookValuePerShare: bvps,
    freeCashFlowYield: fcf && mcap > 0 ? fcf / mcap : null,
  };

  return { r, km };
}

function safe(val, fallback = null) {
  return (val !== undefined && val !== null && !isNaN(val)) ? val : fallback;
}

function fmt(val, suffix = "", decimals = 1) {
  if (val === null || val === undefined) return "N/A";
  return Number(val).toFixed(decimals) + suffix;
}

function fmtDollar(val) {
  if (val === null || val === undefined) return "N/A";
  return "$" + Number(val).toFixed(2);
}

function growthRate(arr, field) {
  // CAGR from oldest to newest value in array
  const vals = arr.map(r => r[field]).filter(v => v && v > 0);
  if (vals.length < 2) return null;
  const newest = vals[0], oldest = vals[vals.length - 1];
  const years = vals.length - 1;
  return Math.pow(newest / oldest, 1 / years) - 1;
}

// ─── Scoring Engine (Graham / Buffett criteria) ────────────────

function scoreMetrics(r, km, profile, income5, cf5) {
  // r = latest ratios, km = latest key-metrics
  const scores = {};

  // ROE — Buffett wants >15% consistently
  const roe = safe(r.returnOnEquity);
  scores.roe = roe === null ? 5 : roe > 0.20 ? 9 : roe > 0.15 ? 7 : roe > 0.10 ? 5 : roe > 0 ? 3 : 1;

  // ROIC — capital allocation quality
  const roic = safe(r.returnOnCapitalEmployed);
  scores.roic = roic === null ? 5 : roic > 0.20 ? 9 : roic > 0.15 ? 7 : roic > 0.10 ? 5 : roic > 0 ? 3 : 1;

  // Gross margin — pricing power proxy
  const gm = safe(r.grossProfitMargin);
  scores.grossMargin = gm === null ? 5 : gm > 0.50 ? 10 : gm > 0.35 ? 8 : gm > 0.25 ? 6 : gm > 0.15 ? 4 : 2;

  // P/E — valuation
  const pe = safe(r.priceEarningsRatio);
  scores.pe = pe === null ? 5 : pe < 10 ? 10 : pe < 15 ? 8 : pe < 20 ? 6 : pe < 30 ? 4 : 2;

  // P/B — Graham likes < 1.5
  const pb = safe(r.priceToBookRatio);
  scores.pb = pb === null ? 5 : pb < 1 ? 10 : pb < 1.5 ? 8 : pb < 3 ? 6 : pb < 5 ? 4 : 2;

  // Debt/Equity — financial health
  const de = safe(r.debtEquityRatio);
  scores.debt = de === null ? 5 : de < 0.3 ? 10 : de < 0.5 ? 8 : de < 1.0 ? 6 : de < 2.0 ? 4 : 2;

  // Current ratio — liquidity
  const cr = safe(r.currentRatio);
  scores.liquidity = cr === null ? 5 : cr > 2 ? 10 : cr > 1.5 ? 8 : cr > 1 ? 5 : 2;

  // FCF yield — owner earnings perspective
  const fcfY = safe(km.freeCashFlowYield);
  scores.fcfYield = fcfY === null ? 5 : fcfY > 0.08 ? 10 : fcfY > 0.05 ? 8 : fcfY > 0.03 ? 6 : fcfY > 0.01 ? 4 : 2;

  // Revenue growth (5yr CAGR)
  const revG = growthRate(income5, "revenue");
  scores.growth = revG === null ? 5 : revG > 0.15 ? 9 : revG > 0.08 ? 7 : revG > 0.04 ? 5 : revG > 0 ? 3 : 1;

  return scores;
}

// ─── Moat Scoring ──────────────────────────────────────────────

function buildMoat(r, km, profile, income5) {
  const gm = safe(r.grossProfitMargin, 0.2);
  const roe = safe(r.returnOnEquity, 0.1);
  const sector = (profile.sector || "").toLowerCase();

  // Brand power — proxy: gross margin vs sector baseline
  const brandBaseline = { technology: 0.45, "consumer defensive": 0.35, healthcare: 0.40 };
  const base = brandBaseline[sector] || 0.25;
  const brandPower = Math.min(10, Math.round((gm / base) * 5));

  // Switching costs — stable recurring revenue sectors score higher
  const stickySectors = ["technology", "financial services", "healthcare"];
  const switchingCosts = stickySectors.includes(sector) ? Math.min(10, Math.round(roe * 40)) : Math.min(7, Math.round(roe * 30));

  // Network effects — tech and financial platforms
  const networkSectors = ["technology", "communication services", "financial services"];
  const networkEffects = networkSectors.includes(sector) ? Math.min(8, Math.round(gm * 15)) : Math.min(4, Math.round(gm * 8));

  // Cost advantage — low P/E + healthy margins = possible cost leader
  const pe = safe(r.priceEarningsRatio, 20);
  const costAdvantage = Math.min(10, Math.round((gm * 10) + (1 / pe * 50)));

  // Intangibles — patents, brands, licenses
  const intangibleSectors = ["healthcare", "technology", "consumer defensive"];
  const intangibles = intangibleSectors.includes(sector) ? Math.min(9, Math.round(gm * 18)) : Math.min(6, Math.round(gm * 12));

  const avg = (brandPower + switchingCosts + networkEffects + costAdvantage + intangibles) / 5;
  const moatRating = avg >= 7 ? "Wide" : avg >= 5 ? "Narrow" : "None";

  const moatSummary = buildMoatSummary(profile.companyName, moatRating, gm, roe, sector);
  const managementSummary = buildMgmtSummary(profile.companyName, r, km);

  return {
    moatRating,
    moatScores: { brandPower, switchingCosts, networkEffects, costAdvantage, intangibles },
    moatSummary,
    managementSummary,
  };
}

// ─── Intrinsic Value ───────────────────────────────────────────

function buildIV(r, km, profile, cf5) {
  const eps = safe(km.netIncomePerShare);
  const bvps = safe(km.bookValuePerShare);
  const price = safe(profile.price);
  const fcfYield = safe(km.freeCashFlowYield);

  // Graham Number: √(22.5 × EPS × BVPS)
  let grahamNum = null;
  if (eps && eps > 0 && bvps && bvps > 0) {
    grahamNum = Math.sqrt(22.5 * eps * bvps);
  }

  // FCF-based: if FCF yield known, value = FCF / required_return (10%)
  let fcfValue = null;
  if (fcfYield && fcfYield > 0 && price) {
    const fcfPerShare = price * fcfYield;
    fcfValue = fcfPerShare / 0.10; // capitalise at 10%
  }

  // Conservative: lower of Graham and FCF
  const low  = grahamNum ? grahamNum * 0.80 : (fcfValue ? fcfValue * 0.75 : null);
  const mid  = grahamNum || fcfValue;
  const high = grahamNum && fcfValue ? Math.max(grahamNum, fcfValue) * 1.10 : (mid ? mid * 1.20 : null);

  let marginOfSafety = "Insufficient data";
  if (mid && price) {
    const mos = (mid - price) / price;
    marginOfSafety = mos > 0.25 ? `${fmt(mos * 100, "%", 0)} undervalued — meaningful margin of safety`
      : mos > 0 ? `${fmt(mos * 100, "%", 0)} undervalued — modest margin of safety`
      : mos > -0.15 ? `${fmt(-mos * 100, "%", 0)} overvalued — fairly valued territory`
      : `${fmt(-mos * 100, "%", 0)} overvalued — limited margin of safety`;
  }

  const assumptions = [];
  if (grahamNum) assumptions.push(`Graham Number (√22.5 × EPS × Book Value) = ${fmtDollar(grahamNum)}`);
  if (fcfValue) assumptions.push(`FCF capitalised at 10% required return = ${fmtDollar(fcfValue)}`);
  assumptions.push("No credit given for speculative future growth");
  assumptions.push("Conservative 10% discount rate (Buffett's hurdle)");

  return {
    intrinsicValueLow:  low  ? fmtDollar(low)  : "N/A",
    intrinsicValueMid:  mid  ? fmtDollar(mid)  : "N/A",
    intrinsicValueHigh: high ? fmtDollar(high) : "N/A",
    currentPrice: fmtDollar(price),
    marginOfSafety,
    valuationMethod: grahamNum && fcfValue
      ? "Graham Number + FCF Capitalisation (blended)"
      : grahamNum ? "Graham Number (EPS × Book Value)"
      : "FCF Capitalisation at 10% hurdle rate",
    keyAssumptions: assumptions,
    ivSummary: buildIVSummary(profile.companyName, mid, price, marginOfSafety),
  };
}

// ─── Verdict Engine ────────────────────────────────────────────

function buildVerdict(scores, iv, moat, profile, r, km) {
  const price = safe(profile.price);
  const mid = iv.intrinsicValueMid !== "N/A" ? parseFloat(iv.intrinsicValueMid.replace("$", "")) : null;
  const mos = mid && price ? (mid - price) / price : null;
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  let verdict;
  if (mos !== null) {
    if (mos > 0.25 && avgScore > 6)      verdict = "BUY";
    else if (mos > 0.10 && avgScore > 5) verdict = "BUY";
    else if (mos > -0.10)                verdict = "HOLD";
    else if (mos > -0.25)                verdict = "WATCH";
    else                                 verdict = "AVOID";
  } else {
    verdict = avgScore > 7 ? "HOLD" : avgScore > 5 ? "WATCH" : "AVOID";
  }

  // Override: badly indebted or negative earnings → AVOID
  if (safe(r.debtEquityRatio, 0) > 3 || safe(r.returnOnEquity, 0.1) < -0.05) {
    verdict = "AVOID";
  }

  return {
    verdict,
    buffettVoice: buildBuffettVoice(profile.companyName, verdict, mos, moat.moatRating, scores, r, km),
    mungerVoice:  buildMungerVoice(profile.companyName, verdict, moat.moatRating, scores, r),
    keyRisks:     buildRisks(r, km, profile, moat),
    catalysts:    buildCatalysts(r, km, profile, moat, mos),
  };
}

// ─── Prose Generators ─────────────────────────────────────────

function buildMoatSummary(name, rating, gm, roe, sector) {
  const gmStr = fmt(gm * 100, "%", 0);
  const roeStr = fmt(roe * 100, "%", 0);
  if (rating === "Wide") {
    return `${name} exhibits characteristics of a wide economic moat. The gross margin of ${gmStr} and sustained return on equity of ${roeStr} suggest durable pricing power and competitive insulation that most rivals cannot easily replicate. In the ${sector} sector, this level of consistent profitability typically signals a structural advantage — whether from brand, switching costs, or scale — rather than a temporary cyclical tailwind. The moat appears to be holding, though no advantage lasts forever.`;
  }
  if (rating === "Narrow") {
    return `${name} possesses a narrow moat — meaningful competitive advantages that provide some protection, but not the kind of fortress that endures for decades unchallenged. The ${gmStr} gross margin and ${roeStr} ROE reflect a real business with genuine strengths, though the durability of these advantages merits ongoing scrutiny. Competitors are likely investing to close the gap. The investor's task is to determine whether the moat is widening or eroding.`;
  }
  return `${name} does not appear to possess a durable economic moat based on available financial data. The ${gmStr} gross margin and ${roeStr} ROE suggest a business operating in a competitive environment where pricing power is limited. Without a structural advantage, long-term returns tend to gravitate toward the cost of capital. Investors must be especially price-disciplined here.`;
}

function buildMgmtSummary(name, r, km) {
  const roe = safe(r.returnOnEquity, 0);
  const de  = safe(r.debtEquityRatio, 0);
  const div = safe(r.dividendYield, 0);
  const payout = safe(r.payoutRatio, 0);

  let capitalLine;
  if (de < 0.3 && roe > 0.15) {
    capitalLine = `Management has maintained a conservative balance sheet (debt/equity of ${fmt(de, "×")}) while generating strong returns — a combination that suggests disciplined capital allocation rather than financial engineering.`;
  } else if (de > 1.5) {
    capitalLine = `The balance sheet carries meaningful leverage (debt/equity of ${fmt(de, "×")}), which amplifies both returns and risk. Understanding management's strategy for servicing and reducing this debt is essential before committing capital.`;
  } else {
    capitalLine = `The balance sheet is moderate, with a debt/equity of ${fmt(de, "×")} — neither a fortress nor a liability, but requiring attention to trend.`;
  }

  let returnLine;
  if (div > 0 && payout < 0.6) {
    returnLine = ` Dividends are paid with a sustainable ${fmt(payout * 100, "%", 0)} payout ratio, suggesting management returns capital to shareholders without sacrificing reinvestment.`;
  } else if (div > 0 && payout > 0.8) {
    returnLine = ` The ${fmt(payout * 100, "%", 0)} payout ratio is high, leaving little room for reinvestment or maintaining dividends through a downturn. Worth monitoring.`;
  } else {
    returnLine = " Capital is primarily retained for reinvestment rather than dividends, which is appropriate if management can deploy it above the cost of capital.";
  }

  return capitalLine + returnLine + " As always, reading the annual letters and tracking insider ownership over time provides colour that the numbers alone cannot.";
}

function buildIVSummary(name, mid, price, marginOfSafety) {
  if (!mid || !price) {
    return `Insufficient financial data to calculate a reliable intrinsic value for ${name}. This is not uncommon for newer or less-covered businesses. A Graham-style analyst would insist on at least five years of earnings history before committing capital.`;
  }
  const mos = (mid - price) / price;
  if (mos > 0.25) {
    return `Our conservative estimate suggests ${name} trades at a meaningful discount to intrinsic value — precisely the margin of safety Graham insisted upon. At the current price, the investor is not paying for optimism, but being compensated for the uncertainty that always accompanies the future.`;
  }
  if (mos > 0) {
    return `${name} appears modestly undervalued relative to our conservative intrinsic value estimate. The margin of safety is present but thin. A patient investor might wait for a wider gap, or accept the current price if conviction in the business quality is high.`;
  }
  if (mos > -0.20) {
    return `${name} trades near our estimate of intrinsic value. At this price, the investor earns a fair return if the business performs in line with history — but there is no margin of safety to absorb disappointment. Graham reserved his enthusiasm for deeper discounts.`;
  }
  return `${name} trades at a premium to our conservative intrinsic value estimate. At this price, the investor is paying for future growth that has yet to materialise. The higher the premium, the more things must go right for the investment to succeed.`;
}

function buildBuffettVoice(name, verdict, mos, moatRating, scores, r, km) {
  const pe = safe(r.priceEarningsRatio);
  const roe = safe(r.returnOnEquity);

  const mosStr = mos !== null
    ? (mos > 0 ? `trading at roughly ${fmt(mos * 100, "%", 0)} below what I'd estimate it's worth` : `trading at about ${fmt(-mos * 100, "%", 0)} above my estimate of intrinsic value`)
    : "trading at a price I find difficult to assess with confidence";

  if (verdict === "BUY") {
    return `I look for three things: a business I understand, a durable competitive advantage, and a fair price. ${name} appears to offer all three today. It's ${mosStr}, and a ${moatRating.toLowerCase()} moat suggests the earnings power that generates a ${fmt((roe || 0) * 100, "%", 0)} return on equity isn't a fluke — it's the product of something real and difficult to replicate. I don't need to be precise about valuation. I just need to be confident I'm paying substantially less than what the business is worth. Here, I think I am.`;
  }
  if (verdict === "HOLD") {
    return `${name} is a wonderful business — the kind Charlie and I would be happy to own forever. But wonderful businesses at too-high prices make for poor investments. At the current price, ${mosStr}. I'd hold what I own, but I wouldn't be adding aggressively. The ideal time to buy a great business is when something scares everybody else out of it. That moment hasn't arrived yet.`;
  }
  if (verdict === "WATCH") {
    return `${name} is a business worth understanding deeply. The fundamentals have real merit — a ${fmt((roe || 0) * 100, "%", 0)} return on equity doesn't come from luck. But at the current valuation, the price assumes a future I'm not confident enough to bank on. I'll watch from a distance. If Mr. Market has a bad day and offers this at a 20–30% discount, the conversation changes considerably.`;
  }
  return `Rule number one: never lose money. Rule number two: never forget rule number one. ${name} at this price violates both rules in spirit — you're being asked to pay a rich price for a business with ${moatRating.toLowerCase() === "none" ? "no obvious competitive moat" : "uncertain durability"}, ${pe !== null ? `a P/E of ${fmt(pe, "×", 1)},` : ""} and a return on equity of ${fmt((roe || 0) * 100, "%", 0)}. I've passed on many businesses that later did well. I'm comfortable passing on this one.`;
}

function buildMungerVoice(name, verdict, moatRating, scores, r) {
  const gm = safe(r.grossProfitMargin, 0);
  const de = safe(r.debtEquityRatio, 0);

  if (verdict === "BUY") {
    return `Invert, always invert. I asked myself: what would have to go wrong for this to be a bad investment? For ${name}, the list is shorter than for most. The ${fmt(gm * 100, "%", 0)} gross margin tells you something about pricing power. Businesses with pricing power don't have to be geniuses — they just have to not be idiots. This management appears to clear that bar.`;
  }
  if (verdict === "HOLD") {
    return `All I want to know is where I'm going to die, so I'll never go there. ${name} is not a place I'd die — it's a solid franchise. But I've watched too many investors overpay for quality and wonder years later why their returns were mediocre. The business is fine. The price is the problem.`;
  }
  if (verdict === "WATCH") {
    return `The great lesson of ${name}: good businesses bought at bad prices are bad investments. The ${fmt(gm * 100, "%", 0)} margin is respectable. But I want a margin of safety in the price, not just the business quality. Come back when Mr. Market is more cooperative.`;
  }
  return `Show me the incentive and I'll show you the outcome. A ${de > 1.5 ? "highly leveraged " : ""}business ${moatRating === "None" ? "without a discernible competitive moat " : ""}trading at a premium to intrinsic value creates incentives for precisely the wrong outcomes — for management, for capital, and for the investor. I've seen this film before. It doesn't end well.`;
}

function buildRisks(r, km, profile, moat) {
  const risks = [];
  const de = safe(r.debtEquityRatio, 0);
  const pe = safe(r.priceEarningsRatio, 0);
  const cr = safe(r.currentRatio, 2);
  const gm = safe(r.grossProfitMargin, 0.3);

  if (de > 1.0) risks.push(`Elevated leverage (D/E: ${fmt(de, "×")}) — amplifies downside in a recession or rising-rate environment`);
  if (pe > 30)  risks.push(`Rich valuation (P/E: ${fmt(pe, "×", 0)}) leaves little room for earnings disappointment`);
  if (cr < 1.2) risks.push(`Tight liquidity (current ratio: ${fmt(cr, "×")}) — limited buffer if conditions deteriorate`);
  if (moat.moatRating === "None") risks.push("No identifiable economic moat — returns could be competed away over time");
  if (gm < 0.20) risks.push(`Thin gross margins (${fmt(gm * 100, "%", 0)}) offer little pricing power or buffer against cost inflation`);
  risks.push("Macro sensitivity: rising interest rates increase the discount rate applied to all future earnings");

  return risks.slice(0, 4);
}

function buildCatalysts(r, km, profile, moat, mos) {
  const catalysts = [];
  const div = safe(r.dividendYield, 0);
  const fcfY = safe(km.freeCashFlowYield, 0);

  if (mos !== null && mos > 0.15) catalysts.push("Valuation re-rating as the market recognises intrinsic value");
  if (fcfY > 0.06) catalysts.push(`High free cash flow yield (${fmt(fcfY * 100, "%", 0)}) funds buybacks, dividends, or reinvestment`);
  if (moat.moatRating === "Wide") catalysts.push("Wide moat compounds quietly — time is the friend of the excellent business");
  if (div > 0.03) catalysts.push(`Dividend yield of ${fmt(div * 100, "%", 0)} provides income while waiting for price appreciation`);
  catalysts.push("Management execution on existing capital allocation strategy");

  return catalysts.slice(0, 3);
}

// ─── Main Analyse Function ────────────────────────────────────

async function analyseWithFMP(ticker, setLoadingStep) {
  const t = ticker.trim().toUpperCase();

  // All four endpoints are on the FMP free tier
  setLoadingStep("Fetching company profile & financials…");
  const [profileArr, income5Arr, balance5Arr, cf5Arr, newsArr] = await Promise.all([
    fmp(`/v3/profile/${t}`),
    fmp(`/v3/income-statement/${t}?limit=5`),
    fmp(`/v3/balance-sheet-statement/${t}?limit=5`),
    fmp(`/v3/cash-flow-statement/${t}?limit=5`),
    fmp(`/v3/stock_news?tickers=${t}&limit=5`),
  ]);

  if (!profileArr || !profileArr[0]) {
    throw new Error(`No data found for "${t}". Check the ticker symbol and ensure your FMP key is saved.`);
  }

  const profile  = profileArr[0];
  const income5  = income5Arr  || [];
  const balance5 = balance5Arr || [];
  const cf5      = cf5Arr      || [];

  // Derive all ratios from raw statements — no paid endpoint needed
  const { r, km } = computeRatiosAndMetrics(profile, income5, balance5, cf5);

  // ── Overview ──
  setLoadingStep("Calculating intrinsic value…");
  const revG = growthRate(income5, "revenue");
  const overview = {
    companyName:  profile.companyName || t,
    ticker:       profile.symbol || t,
    currentPrice: fmtDollar(profile.price),
    overview: profile.description
      ? profile.description.slice(0, 420) + (profile.description.length > 420 ? "…" : "")
      : `${profile.companyName} is a ${profile.sector || ""} company listed on ${profile.exchangeShortName || "a major exchange"}.`,
    keyDrivers: [
      profile.sector   ? `Sector: ${profile.sector}`   : "Diversified operations",
      profile.industry ? `Industry: ${profile.industry}` : "Multiple business lines",
      profile.country  ? `Domicile: ${profile.country}`  : "Global operations",
    ],
    metrics: {
      peRatio:          fmt(safe(r.priceEarningsRatio), "×"),
      pbRatio:          fmt(safe(r.priceToBookRatio),   "×"),
      roe:              r.returnOnEquity          !== null ? fmt(r.returnOnEquity          * 100, "%") : "N/A",
      roic:             r.returnOnCapitalEmployed !== null ? fmt(r.returnOnCapitalEmployed * 100, "%") : "N/A",
      debtToEquity:     fmt(safe(r.debtEquityRatio),    "×"),
      fcfYield:         km.freeCashFlowYield      !== null ? fmt(km.freeCashFlowYield      * 100, "%") : "N/A",
      revenueGrowth5yr: revG !== null ? fmt(revG * 100, "%") : "N/A",
      grossMargin:      r.grossProfitMargin       !== null ? fmt(r.grossProfitMargin       * 100, "%") : "N/A",
    },
    latestFinancials: income5[0]
      ? `Most recent annual revenue: $${(income5[0].revenue / 1e9).toFixed(2)}B. ` +
        `Net income: $${(income5[0].netIncome / 1e9).toFixed(2)}B. ` +
        `Gross profit margin: ${r.grossProfitMargin !== null ? fmt(r.grossProfitMargin * 100, "%", 0) : "N/A"}.`
      : "Detailed financials not available.",
  };

  // ── Moat ──
  setLoadingStep("Evaluating the economic moat…");
  const moat = buildMoat(r, km, profile, income5);

  // ── Intrinsic Value ──
  const iv = buildIV(r, km, profile, cf5);

  // ── Scores & Verdict ──
  setLoadingStep("Rendering the verdict…");
  const scores  = scoreMetrics(r, km, profile, income5, cf5);
  const verdict = buildVerdict(scores, iv, moat, profile, r, km);

  // ── News ──
  const newsItems = (newsArr || []).slice(0, 5).map(n => ({
    headline:  n.title || "—",
    date:      n.publishedDate ? n.publishedDate.slice(0, 10) : "—",
    sentiment: n.sentiment || "neutral",
    summary:   n.text ? n.text.slice(0, 180) + "…" : n.title,
    type:      "News",
  }));
  const news = { news: newsItems };

  return { overview, moat, iv, verdict, news };
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
      const result = await analyseWithFMP(ticker, setLoadingStep);
      setReport(result);
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
