const PARCHMENT = "#f5f0e8";
const INK      = "#1a1008";
const GOLD     = "#b8860b";
const RUST     = "#8b3a0f";
const CREAM    = "#faf7f0";
const FADED    = "#7a6e5f";
const BORDER   = "#c8b99a";
const GREEN    = "#4a7c59";

/* ─── Fonts & global styles ──────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Courier+Prime:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background:${PARCHMENT}; color:${INK}; font-family:'EB Garamond',Georgia,serif; min-height:100vh; }

  .app { max-width: 1040px; margin: 0 auto; padding: 0 24px 80px; }

  /* Header */
  .header { border-bottom: 3px double ${BORDER}; padding: 36px 0 28px; text-align:center; }
  .header-rule { display:flex; align-items:center; gap:12px; justify-content:center; margin-bottom:10px; }
  .header-rule span { flex:1; height:1px; background:${BORDER}; }
  .orn { color:${GOLD}; font-size:18px; }
  .header h1 { font-family:'Playfair Display',serif; font-size:clamp(26px,4.5vw,42px); font-weight:700; color:${INK}; line-height:1.1; }
  .header h1 em { font-style:italic; color:${RUST}; }
  .header-sub { font-family:'EB Garamond',serif; font-size:13px; letter-spacing:3px; text-transform:uppercase; color:${FADED}; margin-top:8px; }
  .header-epigraph { margin-top:16px; font-family:'EB Garamond',serif; font-size:17px; font-style:italic; color:${FADED}; }

  /* Two-column layout */
  .layout { display:grid; grid-template-columns: 340px 1fr; gap:24px; margin-top:32px; }
  @media(max-width:760px){ .layout { grid-template-columns:1fr; } }

  /* Input panel */
  .panel { border:2px solid ${INK}; background:${CREAM}; }
  .panel-head { background:${INK}; color:${PARCHMENT}; padding:14px 20px; font-family:'Playfair Display',serif; font-size:15px; font-weight:600; letter-spacing:1px; display:flex; align-items:center; gap:8px; }
  .panel-body { padding:20px; display:flex; flex-direction:column; gap:18px; }

  .field label { display:block; font-family:'Courier Prime',monospace; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:${FADED}; margin-bottom:6px; }
  .field input[type=text], .field input[type=number] {
    width:100%; padding:10px 12px; background:${PARCHMENT}; border:1.5px solid ${BORDER};
    font-family:'Playfair Display',serif; font-size:18px; color:${INK}; outline:none;
    transition: border-color .2s;
  }
  .field input:focus { border-color:${INK}; }
  .field input::placeholder { color:${FADED}; font-style:italic; font-size:16px; }

  .slider-row { display:flex; align-items:center; gap:10px; margin-top:4px; }
  .slider-row input[type=range] {
    flex:1; -webkit-appearance:none; height:4px; background:${BORDER};
    outline:none; cursor:pointer;
  }
  .slider-row input[type=range]::-webkit-slider-thumb {
    -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
    background:${INK}; cursor:pointer; border:2px solid ${PARCHMENT};
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .slider-val { font-family:'Courier Prime',monospace; font-size:14px; font-weight:700; color:${INK}; min-width:42px; text-align:right; }

  .divider { height:1px; background:${BORDER}; margin:2px 0; }

  /* Result panel */
  .result-panel { border:2px solid ${INK}; display:flex; flex-direction:column; }
  .result-head { background:${INK}; color:${PARCHMENT}; padding:14px 24px; font-family:'Playfair Display',serif; font-size:15px; font-weight:600; letter-spacing:1px; display:flex; align-items:center; gap:8px; }

  .result-body { flex:1; padding:28px 28px 24px; display:flex; flex-direction:column; gap:20px; background:${PARCHMENT}; }

  .implied-block { text-align:center; padding:20px 0 16px; border-bottom:1px solid ${BORDER}; }
  .implied-label { font-family:'Courier Prime',monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${FADED}; margin-bottom:8px; }
  .implied-rate { font-family:'Playfair Display',serif; font-size:clamp(52px,8vw,76px); font-weight:700; line-height:1; transition: color .4s; }
  .implied-sub { font-family:'EB Garamond',serif; font-size:14px; color:${FADED}; margin-top:6px; font-style:italic; }
  .implied-null { font-family:'Playfair Display',serif; font-size:24px; color:${RUST}; font-style:italic; }

  /* Growth meter */
  .meter-wrap { padding:4px 0 8px; }
  .meter-label { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:${FADED}; margin-bottom:10px; }
  .meter-track { position:relative; height:20px; background:linear-gradient(to right, #4a7c59 0%, #b8860b 40%, #8b3a0f 100%); border:1.5px solid ${BORDER}; }
  .meter-ticks { display:flex; justify-content:space-between; margin-top:4px; }
  .meter-tick { font-family:'Courier Prime',monospace; font-size:9px; color:${FADED}; }
  .meter-pointer {
    position:absolute; top:-6px; width:2px; background:${INK};
    height:32px; transition: left .5s cubic-bezier(.4,0,.2,1);
  }
  .meter-pointer::after {
    content:'▼'; position:absolute; top:-14px; left:50%; transform:translateX(-50%);
    font-size:10px; color:${INK};
  }
  .meter-hist-pointer {
    position:absolute; top:-6px; width:2px; background:${GOLD};
    height:32px; transition: left .5s cubic-bezier(.4,0,.2,1);
  }
  .meter-hist-pointer::after {
    content:'▼'; position:absolute; top:-14px; left:50%; transform:translateX(-50%);
    font-size:10px; color:${GOLD};
  }
  .meter-legend { display:flex; gap:16px; margin-top:8px; }
  .meter-leg-item { display:flex; align-items:center; gap:5px; font-family:'Courier Prime',monospace; font-size:10px; color:${FADED}; }
  .leg-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }

  /* Verdict */
  .verdict-block { background:#fdf8ee; border-left:4px solid ${GOLD}; padding:16px 20px; position:relative; }
  .verdict-qmark { font-family:'Playfair Display',serif; font-size:60px; color:${GOLD}; opacity:.2; position:absolute; top:-4px; left:10px; line-height:1; pointer-events:none; }
  .verdict-text { font-family:'EB Garamond',serif; font-size:17px; font-style:italic; line-height:1.8; color:${INK}; padding-left:20px; }
  .verdict-attr { margin-top:10px; padding-left:20px; font-family:'Courier Prime',monospace; font-size:11px; color:${FADED}; letter-spacing:1px; }

  /* KV strip */
  .kv-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:${BORDER}; border:1px solid ${BORDER}; }
  .kv-cell { background:${CREAM}; padding:12px 14px; }
  .kv-label { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:${FADED}; margin-bottom:4px; }
  .kv-val { font-family:'Playfair Display',serif; font-size:19px; font-weight:600; color:${INK}; }
  .kv-sub { font-size:11px; color:${FADED}; font-family:'EB Garamond',serif; margin-top:1px; }

  /* Sections below */
  .sections { margin-top:24px; border:2px solid ${INK}; border-top:none; }
  .sec { border-top:2px solid ${INK}; overflow:hidden; }
  .sec-head { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; cursor:pointer; background:${CREAM}; user-select:none; transition:background .15s; }
  .sec-head:hover { background:#f0ebe0; }
  .sec-title { font-family:'Playfair Display',serif; font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .sec-toggle { font-size:16px; color:${FADED}; transition:transform .25s; }
  .sec-toggle.open { transform:rotate(180deg); }
  .sec-body { padding:0 24px 22px; background:${PARCHMENT}; display:none; }
  .sec-body.open { display:block; animation:slideDown .2s ease; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }

  /* Table */
  .dcf-table { width:100%; border-collapse:collapse; margin-top:12px; font-family:'EB Garamond',serif; font-size:16px; }
  .dcf-table th { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:${FADED}; border-bottom:2px solid ${INK}; padding:8px 12px; text-align:right; }
  .dcf-table th:first-child { text-align:left; }
  .dcf-table td { padding:7px 12px; border-bottom:1px solid ${BORDER}; text-align:right; }
  .dcf-table td:first-child { text-align:left; font-family:'Courier Prime',monospace; font-size:13px; }
  .dcf-table tr:hover td { background:rgba(200,185,154,0.15); }
  .dcf-table .tv-row td { border-top:1px solid ${BORDER}; font-style:italic; color:${FADED}; }
  .dcf-table .total-row td { border-top:2px solid ${INK}; font-family:'Playfair Display',serif; font-weight:600; font-size:18px; }
  .dcf-table .total-row td:first-child { font-family:'Playfair Display',serif; font-size:14px; letter-spacing:1px; }
  .pv-bar { display:inline-block; height:8px; background:${RUST}; opacity:.5; vertical-align:middle; margin-left:6px; transition:width .4s; }

  /* Sensitivity table */
  .sens-wrap { overflow-x:auto; margin-top:12px; }
  .sens-table { border-collapse:collapse; font-family:'EB Garamond',serif; font-size:15px; width:100%; }
  .sens-table th { font-family:'Courier Prime',monospace; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:${FADED}; padding:8px 14px; border:1px solid ${BORDER}; background:${CREAM}; }
  .sens-table td { padding:9px 14px; border:1px solid ${BORDER}; text-align:center; font-family:'Playfair Display',serif; font-size:16px; font-weight:600; }
  .sens-table .row-label { font-family:'Courier Prime',monospace; font-size:11px; color:${FADED}; text-align:left; background:${CREAM}; font-weight:400; }
  .sens-cell-safe { background:rgba(74,124,89,.15); color:#2d5e3c; }
  .sens-cell-fair { background:rgba(184,134,11,.12); color:#7a5a00; }
  .sens-cell-warn { background:rgba(139,58,15,.12); color:${RUST}; }
  .sens-cell-danger { background:rgba(139,58,15,.25); color:#6b1a00; }
  .sens-cell-current { outline:2px solid ${INK}; outline-offset:-1px; }
  .sens-note { font-family:'EB Garamond',serif; font-size:14px; color:${FADED}; font-style:italic; margin-top:8px; }

  /* Explanation prose */
  .explainer { font-family:'EB Garamond',serif; font-size:17px; line-height:1.8; color:${INK}; }
  .explainer p { margin-bottom:12px; }
  .explainer strong { font-weight:600; }

  /* Empty state */
  .empty { text-align:center; padding:40px; }
  .empty-icon { font-size:40px; margin-bottom:12px; opacity:.4; }
  .empty-text { font-family:'Playfair Display',serif; font-size:20px; font-style:italic; color:${FADED}; }
  .empty-sub { font-family:'EB Garamond',serif; font-size:15px; color:${FADED}; margin-top:6px; }

  /* Animate in */
  .fade-in { animation:fadeIn .5s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

/* ─── DCF Math ─────────────────────────────────────────────── */

function calcPV(fcf, g, r, gt, years = 10) {
  if (r <= gt) return Infinity;
  let pv = 0;
  const rows = [];
  let cumPV = 0;

  for (let t = 1; t <= years; t++) {
    const cf = fcf * Math.pow(1 + g, t);
    const df = 1 / Math.pow(1 + r, t);
    const pvi = cf * df;
    pv += pvi;
    cumPV += pvi;
    rows.push({ year: t, cf, df, pvi, cumPV });
  }

  const termCF = fcf * Math.pow(1 + g, years);
  const tv = (termCF * (1 + gt)) / (r - gt);
  const tvPV = tv / Math.pow(1 + r, years);
  pv += tvPV;

  return { total: pv, rows, tv, tvPV };
}

function solveGrowth(price, fcf, r, gt) {
  if (!price || !fcf || fcf <= 0 || price <= 0) return null;
  if (r <= gt) return null;

  const lo_bound = -0.99;
  const hi_bound = 3.0;

  const pvLow  = calcPV(fcf, lo_bound, r, gt).total;
  const pvHigh = calcPV(fcf, hi_bound, r, gt).total;

  if (pvLow > price) return { rate: lo_bound, capped: true };
  if (pvHigh < price) return null; // even 300% growth can't justify it

  let lo = lo_bound, hi = hi_bound;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const pv  = calcPV(fcf, mid, r, gt).total;
    if (Math.abs(pv - price) < 0.0001) break;
    if (pv < price) lo = mid;
    else            hi = mid;
    if (hi - lo < 0.000001) break;
  }
  return { rate: (lo + hi) / 2, capped: false };
}

/* ─── Helpers ──────────────────────────────────────────────── */

function pct(n, decimals = 1) {
  return `${(n * 100).toFixed(decimals)}%`;
}

function usd(n) {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

function rateColor(g) {
  if (g === null) return RUST;
  const r = g * 100;
  if (r < 0)   return "#2d5e3c";
  if (r < 5)   return "#4a7c59";
  if (r < 10)  return GOLD;
  if (r < 15)  return "#b07000";
  if (r < 25)  return RUST;
  return "#6b1a00";
}

function meterPosition(g) {
  // Map g (-20%..+60%) onto 0..100%
  const MIN = -0.20, MAX = 0.60;
  const clamped = Math.max(MIN, Math.min(MAX, g));
  return ((clamped - MIN) / (MAX - MIN)) * 100;
}

function getVerdict(g, histG) {
  if (g === null) {
    return {
      text: "Even assuming 300% annual growth for a decade, the DCF cannot reach the current market price. The valuation has departed entirely from fundamental analysis. As Graham taught us, price and value can diverge wildly in the short run — but not forever.",
      attr: "— Inspired by The Intelligent Investor, Benjamin Graham"
    };
  }

  const r = g * 100;
  const hist = histG !== null ? histG * 100 : null;
  const diff = hist !== null ? r - hist : null;

  if (r < 0) return {
    text: `The market is pricing in decline — a shrinkage of ${Math.abs(r).toFixed(1)}% per year for a decade. If this business can merely hold its ground, you may have uncovered genuine value. The time to be greedy, Buffett reminds us, is when others are fearful.`,
    attr: "— Inspired by Warren Buffett, Berkshire Hathaway Letters"
  };

  if (r < 3) return {
    text: `The market prices in growth barely above the rate of inflation. For a business with any durable competitive advantage, this is often where value quietly accumulates. "The best thing that happens to us is when a great company gets into temporary trouble," Buffett once noted.`,
    attr: "— Inspired by Warren Buffett"
  };

  if (r < 7) return {
    text: `The market expects solid, sustainable growth — roughly in line with long-term equity returns. This is fair value territory for an average business, and potentially a bargain for a great one. The margin of safety depends entirely on the quality of the franchise.`,
    attr: "— Inspired by Benjamin Graham, Security Analysis"
  };

  if (r < 12) return {
    text: `The market prices in above-average performance — achievable for excellent businesses with wide moats, but demanding. Munger's checklist applies here: is the return on invested capital consistently high? Does management allocate capital wisely? Is the moat widening or narrowing?`,
    attr: "— Inspired by Charlie Munger, Poor Charlie's Almanack"
  };

  if (r < 20) return {
    text: `The market is pricing in outstanding, sustained growth. Few businesses in history have compounded at this rate for a full decade. At this implied rate, there is little room for error — economic cycles, competition, or management missteps could permanently impair your return. This is not a place for a margin of safety.`,
    attr: "— Inspired by Warren Buffett"
  };

  if (r < 35) return {
    text: `The market prices in near-miracle growth — sustained performance that only a handful of companies in history have achieved. Even Amazon grew owner earnings at roughly this pace, and it was a once-in-a-generation business. At this valuation, you are not buying a stock; you are betting on a prophecy. Graham would recognize this as speculation, not investment.`,
    attr: "— Inspired by Benjamin Graham, The Intelligent Investor"
  };

  return {
    text: `The current price implies growth that has almost never been sustained for a decade by any business on earth. This is not optimism — it is fantasy. As Munger observed: invert, always invert. Ask not what must go right, but what must NOT go wrong. At this valuation, everything must go right. For a decade. Without interruption.`,
    attr: "— Inspired by Charlie Munger"
  };
}

function sensCellClass(g, curR, curGT, r, gt) {
  const isCurrent = Math.abs(r - curR) < 0.001 && Math.abs(gt - curGT) < 0.001;
  const pct = g !== null ? g * 100 : null;
  let color = "";
  if (pct === null)      color = "sens-cell-danger";
  else if (pct < 5)      color = "sens-cell-safe";
  else if (pct < 12)     color = "sens-cell-fair";
  else if (pct < 25)     color = "sens-cell-warn";
  else                   color = "sens-cell-danger";
  return color + (isCurrent ? " sens-cell-current" : "");
}

/* ─── Sub-components ────────────────────────────────────────── */

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="slider-row">
        <input type="range" min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
        />
        <span className="slider-val">{format ? format(value) : value}</span>
      </div>
    </div>
  );
}

function Section({ title, icon, defaultOpen, children }) {
  const [open, setOpen] = React.useState(defaultOpen || false);
  return (
    <div className="sec">
      <div className="sec-head" onClick={() => setOpen(o => !o)}>
        <span className="sec-title"><span>{icon}</span>{title}</span>
        <span className={`sec-toggle ${open ? "open" : ""}`}>▾</span>
      </div>
      <div className={`sec-body ${open ? "open" : ""}`}>{children}</div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

function ReverseDCF() {
  const [company,  setCompany]  = React.useState("");
  const [price,    setPrice]    = React.useState("");
  const [fcfInput, setFcf]      = React.useState("");
  const [discRate, setDiscRate] = React.useState(10);
  const [termRate, setTermRate] = React.useState(3);
  const [histRate, setHistRate] = React.useState("");

  const r  = discRate / 100;
  const gt = termRate / 100;
  const P  = parseFloat(price)    || 0;
  const F  = parseFloat(fcfInput) || 0;
  const H  = histRate !== "" ? parseFloat(histRate) / 100 : null;

  const solved = React.useMemo(() => {
    if (P <= 0 || F <= 0) return null;
    return solveGrowth(P, F, r, gt);
  }, [P, F, r, gt]);

  const g = solved ? solved.rate : null;
  const verdict = getVerdict(g, H);
  const rateCol = rateColor(g);

  const dcfDetail = React.useMemo(() => {
    if (g === null || P <= 0 || F <= 0) return null;
    return calcPV(F, g, r, gt);
  }, [g, P, F, r, gt]);

  const maxPV = dcfDetail
    ? Math.max(...dcfDetail.rows.map(row => row.pvi), dcfDetail.tvPV)
    : 1;

  // Sensitivity grid
  const discRates = [0.08, 0.09, 0.10, 0.11, 0.12];
  const termRates = [0.02, 0.03, 0.04, 0.05];

  const sensGrid = React.useMemo(() => {
    if (P <= 0 || F <= 0) return null;
    return discRates.map(dr =>
      termRates.map(tr => {
        if (dr <= tr) return null;
        const res = solveGrowth(P, F, dr, tr);
        return res ? res.rate : null;
      })
    );
  }, [P, F]);

  const hasInputs = P > 0 && F > 0;
  const impliedGLabel = g !== null
    ? pct(g)
    : solved === null && hasInputs ? "∞" : "—";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="header-rule">
            <span /><span className="orn">◆</span><span />
          </div>
          <h1>The <em>Margin of Safety</em> Toolkit</h1>
          <div className="header-sub">10-Year Reverse DCF Calculator</div>
          <div className="header-epigraph">
            "The market is always telling you something. The question is whether you believe it."
          </div>
        </header>

        {/* Two-column layout */}
        <div className="layout">

          {/* ── LEFT: Inputs ── */}
          <div>
            <div className="panel">
              <div className="panel-head">⚙ Assumptions</div>
              <div className="panel-body">

                <div className="field">
                  <label>Company Name</label>
                  <input type="text" placeholder="e.g. Apple Inc." value={company}
                    onChange={e => setCompany(e.target.value)} />
                </div>

                <div className="field">
                  <label>Current Stock Price ($)</label>
                  <input type="number" placeholder="e.g. 185.00" value={price}
                    onChange={e => setPrice(e.target.value)} min="0" step="0.01" />
                </div>

                <div className="field">
                  <label>Owner Earnings / FCF per Share ($) — TTM</label>
                  <input type="number" placeholder="e.g. 6.43" value={fcfInput}
                    onChange={e => setFcf(e.target.value)} min="0" step="0.01" />
                </div>

                <div className="divider" />

                <Slider
                  label="Discount Rate (Required Return)"
                  value={discRate} min={5} max={20} step={0.5}
                  onChange={setDiscRate}
                  format={v => `${v}%`}
                />

                <Slider
                  label="Terminal Growth Rate (After Yr 10)"
                  value={termRate} min={1} max={discRate - 1} step={0.5}
                  onChange={v => setTermRate(Math.min(v, discRate - 0.5))}
                  format={v => `${v}%`}
                />

                <div className="divider" />

                <div className="field">
                  <label>Historical Growth Rate (5-yr avg) — for comparison</label>
                  <input type="number" placeholder="e.g. 12.5  (optional)" value={histRate}
                    onChange={e => setHistRate(e.target.value)} step="0.1" />
                </div>

              </div>
            </div>

            {/* Quick explainer */}
            <div style={{ marginTop:16, padding:"14px 16px", border:`1px solid ${BORDER}`, background:CREAM }}>
              <div style={{ fontFamily:"'Courier Prime',monospace", fontSize:10, letterSpacing:"1.5px", textTransform:"uppercase", color:FADED, marginBottom:8 }}>What is this?</div>
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize:15, lineHeight:1.7, color:FADED }}>
                Instead of projecting forward to estimate a fair price, this tool works <em>backwards</em> from the current price to reveal what growth rate Mr. Market has already baked in. If the implied growth exceeds what any real business can sustain, the price contains no margin of safety.
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div className="result-panel">
            <div className="result-head">
              📐 {company ? `${company} — ` : ""}Reverse DCF Output
            </div>
            <div className="result-body">

              {!hasInputs ? (
                <div className="empty">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-text">Enter a price & owner earnings</div>
                  <div className="empty-sub">The implied growth rate will appear here</div>
                </div>
              ) : (
                <div className="fade-in">

                  {/* Implied rate */}
                  <div className="implied-block">
                    <div className="implied-label">Implied 10-Year Growth Rate</div>
                    {g !== null ? (
                      <div className="implied-rate" style={{ color: rateCol }}>{pct(g)}</div>
                    ) : (
                      <div className="implied-null">Cannot be solved — price implies infinite growth</div>
                    )}
                    <div className="implied-sub">
                      per year for 10 years, then {pct(gt)} in perpetuity
                    </div>
                  </div>

                  {/* KV strip */}
                  <div className="kv-strip">
                    <div className="kv-cell">
                      <div className="kv-label">Stock Price</div>
                      <div className="kv-val">${parseFloat(price).toFixed(2)}</div>
                      <div className="kv-sub">current market</div>
                    </div>
                    <div className="kv-cell">
                      <div className="kv-label">Earnings Yield</div>
                      <div className="kv-val">{P > 0 && F > 0 ? pct(F / P) : "—"}</div>
                      <div className="kv-sub">FCF / Price</div>
                    </div>
                    <div className="kv-cell">
                      <div className="kv-label">Price-to-FCF</div>
                      <div className="kv-val">{P > 0 && F > 0 ? (P / F).toFixed(1) + "×" : "—"}</div>
                      <div className="kv-sub">multiple</div>
                    </div>
                  </div>

                  {/* Growth meter */}
                  {g !== null && (
                    <div className="meter-wrap">
                      <div className="meter-label">Growth rate context</div>
                      <div className="meter-track">
                        <div className="meter-pointer" style={{ left: `${meterPosition(g)}%` }} title={`Implied: ${pct(g)}`} />
                        {H !== null && (
                          <div className="meter-hist-pointer" style={{ left: `${meterPosition(H)}%` }} title={`Historical: ${pct(H)}`} />
                        )}
                      </div>
                      <div className="meter-ticks">
                        {["−20%","0%","GDP 3%","S&P 7%","15%","35%","60%+"].map(t => (
                          <span key={t} className="meter-tick">{t}</span>
                        ))}
                      </div>
                      <div className="meter-legend">
                        <div className="meter-leg-item">
                          <div className="leg-dot" style={{ background:INK }} />
                          Implied ({g !== null ? pct(g) : "—"})
                        </div>
                        {H !== null && (
                          <div className="meter-leg-item">
                            <div className="leg-dot" style={{ background:GOLD }} />
                            Historical ({pct(H)})
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verdict */}
                  <div className="verdict-block">
                    <div className="verdict-qmark">"</div>
                    <div className="verdict-text">{verdict.text}</div>
                    <div className="verdict-attr">{verdict.attr}</div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Expandable sections ── */}
        {hasInputs && g !== null && dcfDetail && (
          <div className="sections">

            {/* Year-by-year table */}
            <Section title="10-Year Cash Flow Projection" icon="📋" defaultOpen={true}>
              <table className="dcf-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Projected FCF/Share</th>
                    <th>Discount Factor</th>
                    <th>Present Value</th>
                    <th style={{textAlign:"left", paddingLeft:16}}>PV Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {dcfDetail.rows.map(row => (
                    <tr key={row.year}>
                      <td>Yr {row.year}</td>
                      <td>${row.cf.toFixed(2)}</td>
                      <td>{row.df.toFixed(4)}</td>
                      <td>${row.pvi.toFixed(2)}</td>
                      <td style={{textAlign:"left"}}>
                        <span className="pv-bar"
                          style={{ width: `${(row.pvi / P) * 140}px` }} />
                      </td>
                    </tr>
                  ))}
                  <tr className="tv-row">
                    <td>Terminal Value</td>
                    <td>{usd(dcfDetail.tv)}</td>
                    <td>{(1 / Math.pow(1 + r, 10)).toFixed(4)}</td>
                    <td>${dcfDetail.tvPV.toFixed(2)}</td>
                    <td style={{textAlign:"left"}}>
                      <span className="pv-bar"
                        style={{ width: `${(dcfDetail.tvPV / P) * 140}px`, background:GOLD }} />
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td>Intrinsic Value</td>
                    <td></td>
                    <td></td>
                    <td>${dcfDetail.total.toFixed(2)}</td>
                    <td style={{textAlign:"left", fontFamily:"'EB Garamond',serif", fontSize:13, color:FADED, fontWeight:400}}>
                      ≈ market price ${parseFloat(price).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop:12, fontFamily:"'EB Garamond',serif", fontSize:14, color:FADED, fontStyle:"italic" }}>
                Terminal value represents {pct(dcfDetail.tvPV / dcfDetail.total)} of the total present value.
                {dcfDetail.tvPV / dcfDetail.total > 0.6
                  ? " This heavy reliance on terminal value makes the valuation highly sensitive to long-run assumptions."
                  : " The near-term cash flows carry meaningful weight, lending some stability to the analysis."
                }
              </div>
            </Section>

            {/* Sensitivity table */}
            <Section title="Sensitivity Analysis — Implied Growth Rate" icon="🔬">
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize:16, color:FADED, fontStyle:"italic", marginBottom:12, marginTop:4 }}>
                How the implied growth rate shifts as discount and terminal assumptions change. Current assumptions highlighted.
              </div>
              {sensGrid && (
                <div className="sens-wrap">
                  <table className="sens-table">
                    <thead>
                      <tr>
                        <th style={{textAlign:"left"}}>Discount Rate ↓ / Terminal →</th>
                        {termRates.map(tr => <th key={tr}>g<sub>t</sub> = {pct(tr, 0)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {discRates.map((dr, i) => (
                        <tr key={dr}>
                          <td className="row-label">r = {pct(dr, 0)}</td>
                          {termRates.map((tr, j) => {
                            const val = sensGrid[i][j];
                            const cls = sensCellClass(val, r, gt, dr, tr);
                            return (
                              <td key={tr} className={cls}>
                                {val !== null ? pct(val) : "N/A"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="sens-note">
                    Green = implied growth below 5% (potential value) · Gold = 5–12% (fair) · Orange = 12–25% (stretched) · Red = above 25% (speculative)
                  </div>
                </div>
              )}
            </Section>

            {/* How it works */}
            <Section title="How the Reverse DCF Works" icon="📖">
              <div className="explainer" style={{marginTop:8}}>
                <p>
                  A traditional DCF starts with your assumptions — growth rate, discount rate — and arrives at a fair value. The <strong>reverse DCF</strong> inverts this: it takes the market price as given and asks, <em>"what growth rate must be true for this price to be rational?"</em>
                </p>
                <p>
                  The formula solves for the growth rate <em>g</em> such that:
                </p>
                <div style={{fontFamily:"'Courier Prime',monospace", fontSize:14, background:CREAM, padding:"10px 14px", margin:"8px 0 12px", border:`1px solid ${BORDER}`, overflowX:"auto"}}>
                  Price = Σ [ FCF₀ × (1+g)ᵗ / (1+r)ᵗ ] + TV / (1+r)¹⁰
                </div>
                <p>
                  Where <strong>TV</strong> (terminal value) = FCF₁₀ × (1 + g<sub>t</sub>) / (r − g<sub>t</sub>), <strong>r</strong> is your required return, and <strong>g<sub>t</sub></strong> is the perpetual growth rate after year 10.
                </p>
                <p>
                  The key question is not whether the implied growth is achievable in isolation, but whether it is achievable <em>with confidence, for a decade, without interruption</em>. That distinction is Graham's margin of safety.
                </p>
              </div>
            </Section>

          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:40, fontFamily:"'Courier Prime',monospace", fontSize:11, color:FADED, letterSpacing:"1px" }}>
          FOR EDUCATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE · ALWAYS DO YOUR OWN RESEARCH
        </div>

      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ReverseDCF />);
