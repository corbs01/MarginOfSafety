// ── The Berkshire Analyst — Local Cache Server ────────────────────────────────
//
//  Runs a local HTTP server that:
//    • Serves the app at http://localhost:3000
//    • Proxies FMP API calls through /api/fmp/*
//    • Caches responses as JSON files in cache/{SYMBOL}/{endpoint}.json
//    • Returns cached data when fresh, fetches from FMP when stale
//
//  Start: node server.js
//  Stop:  Ctrl+C
// ─────────────────────────────────────────────────────────────────────────────

"use strict";

const express = require("express");
const fs      = require("fs");
const path    = require("path");
const https   = require("https");
const http    = require("http");

const app      = express();
const PORT     = 3000;
const ROOT     = __dirname;
const CACHE    = path.join(ROOT, "cache");
const FMP_HOST = "financialmodelingprep.com";
const FMP_BASE = "/stable";

// ── Cache time-to-live per endpoint (milliseconds) ───────────────────────────
const TTL = {
  "income-statement":        24 * 60 * 60 * 1000,  // 24 h — quarterly filings
  "balance-sheet-statement": 24 * 60 * 60 * 1000,  // 24 h
  "cashflow-statement":      24 * 60 * 60 * 1000,  // 24 h
  "profile":                  4 * 60 * 60 * 1000,  //  4 h — price updates
  "stock-news":               1 * 60 * 60 * 1000,  //  1 h — news freshness
  "default":                  4 * 60 * 60 * 1000,  //  4 h
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAge(ms) {
  if (ms < 60000)   return Math.round(ms / 1000) + "s";
  if (ms < 3600000) return Math.round(ms / 60000) + "m";
  return (ms / 3600000).toFixed(1) + "h";
}

function cacheDir(symbol)  { return path.join(CACHE, symbol.toUpperCase()); }
function cacheFile(symbol, endpoint) {
  return path.join(cacheDir(symbol), endpoint + ".json");
}

function readCache(file) {
  try   { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return null; }
}

function writeCache(file, payload) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.error("  [CACHE WRITE ERROR]", err.message);
  }
}

// Fetch a URL using Node's built-in https/http modules (no extra dependencies)
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: 15000 }, (res) => {
      let body = "";
      res.on("data",  chunk => { body += chunk; });
      res.on("end",   ()    => resolve({ status: res.statusCode, body }));
    });
    req.on("error",   reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(ROOT));

// ── FMP Proxy with file cache ─────────────────────────────────────────────────
//
//  Client calls: GET /api/fmp/income-statement?symbol=AAPL&limit=5&apikey=KEY
//  Server:       checks cache → if fresh, returns cached JSON
//                otherwise    → fetches from FMP, stores, returns fresh JSON
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/fmp/*", async (req, res) => {
  const fmpPath    = "/" + (req.params[0] || "");
  const qs         = { ...req.query };
  const symbol     = (qs.symbol || qs.tickers || "unknown").toUpperCase();
  const endpointName = fmpPath.split("/").filter(Boolean)[0] || "default";
  const ttl        = TTL[endpointName] || TTL.default;
  const file       = cacheFile(symbol, endpointName);

  // ── 1. Check cache ──────────────────────────────────────────────────────
  const cached = readCache(file);
  if (cached && cached.fetchedAt) {
    const age = Date.now() - cached.fetchedAt;
    if (age < ttl) {
      const ageStr = fmtAge(age);
      console.log(`  ✓ CACHE HIT  ${symbol.padEnd(8)} ${endpointName.padEnd(28)} ${ageStr} old`);
      res.setHeader("X-Cache",     "HIT");
      res.setHeader("X-Cache-Age", ageStr);
      return res.json(cached.data);
    }
    console.log(`  ↻ STALE      ${symbol.padEnd(8)} ${endpointName} (${fmtAge(Date.now() - cached.fetchedAt)} old — refreshing)`);
  } else {
    console.log(`  ↓ FETCH      ${symbol.padEnd(8)} ${endpointName}`);
  }

  // ── 2. Fetch from FMP ───────────────────────────────────────────────────
  const queryStr = Object.entries(qs).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const url      = `https://${FMP_HOST}${FMP_BASE}${fmpPath}?${queryStr}`;

  let result;
  try {
    result = await fetchURL(url);
  } catch (err) {
    console.error("  [FMP ERROR]", err.message);
    res.status(502).json({ "Error Message": "FMP fetch failed: " + err.message });
    return;
  }

  // ── 3. Parse + cache ────────────────────────────────────────────────────
  let data;
  try { data = JSON.parse(result.body); }
  catch { data = null; }

  if (result.status === 200 && data && !data["Error Message"]) {
    writeCache(file, {
      fetchedAt: Date.now(),
      symbol,
      endpoint: endpointName,
      source:   "FMP stable API",
      data,
    });
    console.log(`  ✎ SAVED      ${symbol.padEnd(8)} → cache/${symbol}/${endpointName}.json`);
  }

  res.status(result.status);
  res.setHeader("X-Cache",     "MISS");
  res.setHeader("Content-Type","application/json");
  res.send(result.body);
});

// ── Cache inspection endpoint ─────────────────────────────────────────────────
//  GET /api/cache → lists all cached symbols and file freshness
app.get("/api/cache", (req, res) => {
  const summary = [];
  if (!fs.existsSync(CACHE)) { return res.json([]); }
  for (const sym of fs.readdirSync(CACHE)) {
    const dir = path.join(CACHE, sym);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = {};
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const data = readCache(path.join(dir, f));
      if (data) {
        const endpt = f.replace(".json", "");
        const age   = Date.now() - (data.fetchedAt || 0);
        const ttlMs = TTL[endpt] || TTL.default;
        files[endpt] = {
          cachedAt: new Date(data.fetchedAt).toISOString(),
          age:      fmtAge(age),
          fresh:    age < ttlMs,
          ttl:      fmtAge(ttlMs),
        };
      }
    }
    summary.push({ symbol: sym, files });
  }
  res.json(summary);
});

// ── Cache-bust endpoint ───────────────────────────────────────────────────────
//  DELETE /api/cache/:symbol → removes cached files for that symbol
app.delete("/api/cache/:symbol", (req, res) => {
  const dir = cacheDir(req.params.symbol);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
    console.log(`  ✗ CLEARED    cache/${req.params.symbol.toUpperCase()}/`);
    res.json({ cleared: req.params.symbol.toUpperCase() });
  } else {
    res.status(404).json({ error: "No cache for that symbol" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
fs.mkdirSync(CACHE, { recursive: true });

app.listen(PORT, () => {
  console.log("");
  console.log("  ┌─────────────────────────────────────────┐");
  console.log("  │        The Berkshire Analyst            │");
  console.log("  ├─────────────────────────────────────────┤");
  console.log(`  │  App:   http://localhost:${PORT}             │`);
  console.log(`  │  Cache: ${path.relative(ROOT, CACHE).padEnd(32)}│`);
  console.log("  └─────────────────────────────────────────┘");
  console.log("");
  console.log("  Waiting for requests… (Ctrl+C to stop)");
  console.log("");
});
