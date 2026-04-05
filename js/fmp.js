// ── FMP API Helpers & Metrics ─────────────────────────────────────────────────
//
//  When the app is served via the local Node server (http://localhost:3000),
//  all FMP requests are routed through /api/fmp/* which caches responses to
//  disk (cache/{SYMBOL}/{endpoint}.json).
//
//  When opened directly as a file:// URL, requests go straight to FMP.
//
//  Cache headers (X-Cache, X-Cache-Age) returned by the server are captured
//  and exposed via the global `window.__lastFetchMeta` for the UI to display.
// ─────────────────────────────────────────────────────────────────────────────

var FMP_STABLE  = "https://financialmodelingprep.com/stable";
var LOCAL_PROXY = "/api/fmp";  // served by server.js

// True when running under the local cache server
var IS_LOCAL_SERVER = (
  window.location.protocol !== "file:" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
);

// Tracks cache status across a batch of requests — reset at the start of each analyse()
window.__fetchMeta = [];

function parseJSON(text) {
  try {
    var clean = text.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

function fetchWithTimeout(url, options, ms) {
  ms = ms || 15000;
  var ctrl = new AbortController();
  var id = setTimeout(function () { ctrl.abort(); }, ms);
  return fetch(url, Object.assign({}, options, { signal: ctrl.signal }))
    .finally(function () { clearTimeout(id); });
}

// ── Core FMP fetch ────────────────────────────────────────────────────────────
//
//  path  — e.g. "/income-statement?symbol=AAPL&limit=5"
//
//  Returns the parsed JSON data array, or null on non-fatal errors.
//  Throws on auth errors so the UI can surface a clear message.
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFMP(path) {
  var key = window.getFMPKey();
  if (!key) throw new Error("Please enter your FMP API key above and click Save.");

  var url, res;

  if (IS_LOCAL_SERVER) {
    // ── Via local cache server ──────────────────────────────────────────────
    // The server appends nothing extra — we still pass apikey so the server
    // can forward it to FMP on a cache miss.
    var sep = path.includes("?") ? "&" : "?";
    url = LOCAL_PROXY + path + sep + "apikey=" + key;
  } else {
    // ── Direct FMP (file:// fallback) ───────────────────────────────────────
    var sep = path.includes("?") ? "&" : "?";
    url = FMP_STABLE + path + sep + "apikey=" + key;
  }

  try {
    res = await fetchWithTimeout(url, {}, 15000);
  } catch (e) {
    if (e.name === "AbortError") throw e;
    return null; // network error — degrade gracefully
  }

  // ── Capture cache metadata from server headers ──────────────────────────
  var cacheStatus = res.headers.get("X-Cache")     || (IS_LOCAL_SERVER ? "MISS" : "DIRECT");
  var cacheAge    = res.headers.get("X-Cache-Age") || null;
  var endpoint    = path.split("?")[0].replace(/^\//, "");
  window.__fetchMeta.push({ endpoint: endpoint, status: cacheStatus, age: cacheAge });

  if (res.status === 401) throw new Error("Invalid FMP API key — please double-check and re-save it.");
  if (res.status === 403) return null; // paid endpoint — degrade gracefully
  if (res.status === 429) return null; // rate limited — degrade
  if (!res.ok)            return null;

  var data = await res.json();

  // FMP signals key errors inside a 200 body
  if (data && data["Error Message"]) {
    if (data["Error Message"].includes("Invalid API KEY")) {
      throw new Error("Invalid FMP API key — please check it at financialmodelingprep.com and re-save.");
    }
    return null;
  }

  return data;
}

// ── Compute all metrics from free FMP statements ──────────────────────────────
//
//  Replaces the paid /key-metrics-ttm/ endpoint entirely.
//  Inputs are the raw arrays returned by FMP.
// ─────────────────────────────────────────────────────────────────────────────
function computeMetrics(profile, income5, balance5, cf5) {
  var price = profile.price || 0;

  // FMP stable API uses "marketCap" — older endpoints used "mktCap"
  var mcap  = profile.marketCap || profile.mktCap || 0;

  var inc = (income5  && income5[0])  || {};
  var bal = (balance5 && balance5[0]) || {};
  var cf  = (cf5      && cf5[0])      || {};

  // Shares: income statement weighted average is the most reliable source in the
  // stable API (profile.sharesOutstanding is not returned by all endpoints)
  var shares = profile.sharesOutstanding
             || inc.weightedAverageShsOut
             || inc.weightedAverageShsOutDil
             || (mcap > 0 && price > 0 ? mcap / price : null);

  var equity = bal.totalStockholdersEquity != null ? bal.totalStockholdersEquity
             : bal.totalEquity             != null ? bal.totalEquity : null;
  var debt   = bal.totalDebt              || 0;
  var cash   = bal.cashAndCashEquivalents || 0;

  // CapEx is negative in FMP (cash outflow)
  var capex  = cf.capitalExpenditure   != null ? cf.capitalExpenditure
             : cf.capitalExpenditures  != null ? cf.capitalExpenditures : null;

  // FCF: use direct field when available, else derive from operating CF − |CapEx|
  var fcf = cf.freeCashFlow != null ? cf.freeCashFlow
          : (cf.operatingCashFlow != null && capex != null)
            ? cf.operatingCashFlow + capex  // capex is stored as negative
            : null;

  var eps  = inc.eps != null ? inc.eps
           : (inc.netIncome && shares ? inc.netIncome / shares : null);
  var bvps = (equity != null && shares) ? equity / shares : null;

  var investedCap = (equity != null && equity > 0 && (equity + debt - cash) > 0)
                    ? equity + debt - cash : null;

  // FMP stable API uses "lastDividend" — older endpoints used "lastDiv"
  var lastDiv = profile.lastDividend || profile.lastDiv || 0;

  return {
    // valuation
    peRatioTTM:            eps && eps > 0 && price ? price / eps : null,
    pbRatioTTM:            bvps && bvps > 0 && price ? price / bvps : null,
    // profitability
    returnOnEquityTTM:     inc.netIncome && equity && equity > 0 ? inc.netIncome / equity : null,
    roicTTM:               inc.operatingIncome && investedCap ? (inc.operatingIncome * 0.79) / investedCap : null,
    grossProfitMarginTTM:  inc.grossProfit && inc.revenue ? inc.grossProfit / inc.revenue : null,
    // leverage & liquidity
    debtToEquityTTM:       equity && equity > 0 ? debt / equity : null,
    currentRatioTTM:       bal.totalCurrentAssets && bal.totalCurrentLiabilities
                             ? bal.totalCurrentAssets / bal.totalCurrentLiabilities : null,
    // FCF
    freeCashFlowYieldTTM:  fcf != null && mcap > 0 ? fcf / mcap : null,
    // dividends
    dividendYield:         lastDiv && price ? lastDiv / price : null,
    payoutRatio:           inc.netIncome && lastDiv && shares
                             ? (lastDiv * shares) / inc.netIncome : null,
    // per-share
    epsTTM:                eps,
    bookValuePerShareTTM:  bvps,
    freeCashFlowTTM:       fcf,
    // raw
    marketCap: mcap, price: price, equity: equity, debt: debt, cash: cash, shares: shares,
  };
}

// ── Formatting Helpers ────────────────────────────────────────────────────────

function formatNum(n) {
  if (n == null || isNaN(n)) return "N/A";
  var abs = Math.abs(n);
  if (abs >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9)  return "$" + (n / 1e9).toFixed(2)  + "B";
  if (abs >= 1e6)  return "$" + (n / 1e6).toFixed(2)  + "M";
  return "$" + n.toLocaleString();
}

function fmtPct(v) {
  if (v == null || isNaN(v)) return "N/A";
  return (v * 100).toFixed(1) + "%";
}

function fmtRatio(v) {
  if (v == null || isNaN(v)) return "N/A";
  return Number(v).toFixed(2);
}

function classifyNews(title, text) {
  var s = (title + " " + text).toLowerCase();
  var bullishWords = ["beat", "record", "growth", "raised", "dividend", "buyback", "upgrade", "exceeded", "surpassed", "strong", "outperform"];
  var bearishWords = ["miss", "loss", "decline", "lawsuit", "recall", "downgrade", "cut", "warning", "weak", "below", "disappointing", "layoff"];
  var isBullish = bullishWords.some(function (w) { return s.includes(w); });
  var isBearish = bearishWords.some(function (w) { return s.includes(w); });
  var sentiment = isBearish ? "bearish" : isBullish ? "bullish" : "neutral";

  var type = "Other";
  if (/earnings|eps|revenue|quarterly|q[1-4]\s/.test(s))  type = "Earnings";
  else if (/acqui|merger|deal|buyout|takeover/.test(s))    type = "M&A";
  else if (/fda|launch|product|release|unveil/.test(s))    type = "Product";
  else if (/sec|filing|10-k|10-q|proxy|annual report/.test(s)) type = "Filing";
  else if (/fed|rate|inflation|macro|gdp|tariff/.test(s))  type = "Macro";

  return { sentiment: sentiment, type: type };
}

function fmtNewsDate(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d)) return dateStr.slice(0, 10);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
