// ── FMP API Helpers & Metrics ─────────────────────────────────────────────────
// All calls go to the stable FMP endpoint. 403 responses (paid endpoints)
// return null so callers can degrade gracefully.

var FMP_BASE = "https://financialmodelingprep.com/stable";

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

async function fetchFMP(path) {
  var key = window.getFMPKey();
  if (!key) throw new Error("Please enter your FMP API key above and click Save.");
  var sep = path.includes("?") ? "&" : "?";
  var url = FMP_BASE + path + sep + "apikey=" + key;

  var res;
  try {
    res = await fetchWithTimeout(url, {}, 15000);
  } catch (e) {
    if (e.name === "AbortError") throw e;
    return null; // network error — degrade gracefully
  }

  if (res.status === 401) throw new Error("Invalid FMP API key — please double-check and re-save it.");
  if (res.status === 403) return null; // paid endpoint — caller handles null
  if (res.status === 429) return null; // rate limited — degrade
  if (!res.ok) return null;

  var data = await res.json();

  // FMP signals key/subscription errors inside a 200 body
  if (data && data["Error Message"]) {
    if (data["Error Message"].includes("Invalid API KEY")) {
      throw new Error("Invalid FMP API key — please check it at financialmodelingprep.com and re-save.");
    }
    return null;
  }

  return data;
}

// ── Compute all metrics from free statements ──────────────────────────────────
// Replaces the paid /key-metrics-ttm/ endpoint entirely.
function computeMetrics(profile, income5, balance5, cf5) {
  var price  = profile.price  || 0;
  var mcap   = profile.mktCap || 0;
  var inc    = (income5  && income5[0])  || {};
  var bal    = (balance5 && balance5[0]) || {};
  var cf     = (cf5      && cf5[0])      || {};

  var shares      = profile.sharesOutstanding || (mcap > 0 && price > 0 ? mcap / price : null);
  var equity      = bal.totalStockholdersEquity || bal.totalEquity || null;
  var debt        = bal.totalDebt               || 0;
  var cash        = bal.cashAndCashEquivalents  || 0;
  var fcf         = cf.freeCashFlow             || null;
  var eps         = inc.eps || (inc.netIncome && shares ? inc.netIncome / shares : null);
  var bvps        = equity && shares ? equity / shares : null;
  var investedCap = equity && (equity + debt - cash) > 0 ? equity + debt - cash : null;

  return {
    // valuation
    peRatioTTM:            eps && eps > 0 && price ? price / eps : null,
    pbRatioTTM:            bvps && bvps > 0 && price ? price / bvps : null,
    // profitability
    returnOnEquityTTM:     inc.netIncome && equity ? inc.netIncome / equity : null,
    roicTTM:               inc.operatingIncome && investedCap ? (inc.operatingIncome * 0.79) / investedCap : null,
    grossProfitMarginTTM:  inc.grossProfit && inc.revenue ? inc.grossProfit / inc.revenue : null,
    // leverage & liquidity
    debtToEquityTTM:       equity && equity > 0 ? debt / equity : null,
    currentRatioTTM:       bal.totalCurrentAssets && bal.totalCurrentLiabilities
                             ? bal.totalCurrentAssets / bal.totalCurrentLiabilities : null,
    // FCF
    freeCashFlowYieldTTM:  fcf && mcap > 0 ? fcf / mcap : null,
    // dividends
    dividendYield:         profile.lastDiv && price ? profile.lastDiv / price : null,
    payoutRatio:           inc.netIncome && profile.lastDiv && shares
                             ? (profile.lastDiv * shares) / inc.netIncome : null,
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
  if (abs >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M";
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
  if (/earnings|eps|revenue|quarterly|q[1-4]\s/.test(s)) type = "Earnings";
  else if (/acqui|merger|deal|buyout|takeover/.test(s)) type = "M&A";
  else if (/fda|launch|product|release|unveil/.test(s)) type = "Product";
  else if (/sec|filing|10-k|10-q|proxy|annual report/.test(s)) type = "Filing";
  else if (/fed|rate|inflation|macro|gdp|tariff/.test(s)) type = "Macro";

  return { sentiment: sentiment, type: type };
}

function fmtNewsDate(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d)) return dateStr.slice(0, 10);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
