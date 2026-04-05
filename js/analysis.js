// ── Rule-Based Analysis Engine ────────────────────────────────────────────────
// Provides moat scoring, intrinsic value estimation, and Buffett/Munger verdicts
// without requiring any paid API or LLM — derived purely from free FMP data.

// ── Economic Moat Scoring ─────────────────────────────────────────────────────
function buildMoat(profile, m) {
  var gm     = m.grossProfitMarginTTM || 0.20;
  var roe    = m.returnOnEquityTTM    || 0.10;
  var sector = (profile.sector || "").toLowerCase();

  var brandBaseline = { technology: 0.45, "consumer defensive": 0.35, healthcare: 0.40 };
  var base          = brandBaseline[sector] || 0.25;
  var brandPower    = Math.min(10, Math.round((gm / base) * 5));

  var stickySectors  = ["technology", "financial services", "healthcare"];
  var switchingCosts = stickySectors.indexOf(sector) !== -1
    ? Math.min(10, Math.round(roe * 40)) : Math.min(7, Math.round(roe * 30));

  var networkSectors = ["technology", "communication services", "financial services"];
  var networkEffects = networkSectors.indexOf(sector) !== -1
    ? Math.min(8, Math.round(gm * 15)) : Math.min(4, Math.round(gm * 8));

  var pe           = m.peRatioTTM || 20;
  var costAdvantage = Math.min(10, Math.round((gm * 10) + (1 / pe * 50)));

  var intangibleSectors = ["healthcare", "technology", "consumer defensive"];
  var intangibles = intangibleSectors.indexOf(sector) !== -1
    ? Math.min(9, Math.round(gm * 18)) : Math.min(6, Math.round(gm * 12));

  var avg        = (brandPower + switchingCosts + networkEffects + costAdvantage + intangibles) / 5;
  var moatRating = avg >= 7 ? "Wide" : avg >= 5 ? "Narrow" : "None";
  var gmPct      = (gm * 100).toFixed(0) + "%";
  var roePct     = (roe * 100).toFixed(0) + "%";

  var moatSummary = moatRating === "Wide"
    ? profile.companyName + " exhibits characteristics of a wide economic moat. The " + gmPct + " gross margin and sustained " + roePct + " return on equity suggest durable pricing power that most rivals cannot easily replicate. In the " + (profile.sector || "broader") + " sector, this level of consistent profitability typically signals a structural advantage — whether from brand, switching costs, or scale — rather than a temporary tailwind."
    : moatRating === "Narrow"
    ? profile.companyName + " possesses a narrow moat — meaningful competitive advantages that provide some protection, but not the kind of fortress that endures for decades unchallenged. The " + gmPct + " gross margin and " + roePct + " ROE reflect real strengths, though the durability merits ongoing scrutiny."
    : profile.companyName + " does not appear to possess a durable economic moat based on available data. The " + gmPct + " gross margin and " + roePct + " ROE suggest a business operating in a competitive environment where pricing power is limited.";

  var de  = m.debtToEquityTTM || 0;
  var div = m.dividendYield   || 0;
  var pr  = m.payoutRatio     || 0;
  var deStr = de.toFixed(2);
  var managementSummary = de < 0.5 && roe > 0.15
    ? "Management has maintained a conservative balance sheet (D/E: " + deStr + "\u00d7) while generating strong returns \u2014 a combination suggesting disciplined capital allocation rather than financial engineering." + (div > 0 ? " A " + (div * 100).toFixed(1) + "% dividend with a " + (pr * 100).toFixed(0) + "% payout ratio suggests sustainable shareholder returns." : "")
    : de > 1.5
    ? "The balance sheet carries meaningful leverage (D/E: " + deStr + "\u00d7), amplifying both returns and risk. Understanding management\u2019s strategy for servicing this debt is essential before committing capital."
    : "The balance sheet is moderate (D/E: " + deStr + "\u00d7). Capital allocation appears reasonable, though reading the annual reports directly provides colour the numbers alone cannot.";

  var keyDrivers = [
    profile.sector   ? "Sector: " + profile.sector   : "Diversified operations",
    profile.industry ? "Industry: " + profile.industry : "Multiple business lines",
    moatRating !== "None" ? moatRating + " economic moat" : "Competitive market dynamics",
  ];

  return {
    moatRating: moatRating,
    moatScores: { brandPower: brandPower, switchingCosts: switchingCosts, networkEffects: networkEffects, costAdvantage: costAdvantage, intangibles: intangibles },
    moatSummary: moatSummary,
    managementSummary: managementSummary,
    keyDrivers: keyDrivers,
  };
}

// ── Intrinsic Value (Graham Number + FCF Capitalisation) ─────────────────────
function buildIV(profile, m) {
  var price = m.price;
  var eps   = m.epsTTM;
  var bvps  = m.bookValuePerShareTTM;
  var fcfY  = m.freeCashFlowYieldTTM;

  var grahamNum = (eps && eps > 0 && bvps && bvps > 0) ? Math.sqrt(22.5 * eps * bvps) : null;
  var fcfValue  = (fcfY && fcfY > 0 && price) ? (price * fcfY) / 0.10 : null;

  var low  = grahamNum ? grahamNum * 0.80 : (fcfValue ? fcfValue * 0.75 : null);
  var mid  = grahamNum || fcfValue;
  var high = (grahamNum && fcfValue) ? Math.max(grahamNum, fcfValue) * 1.10 : (mid ? mid * 1.20 : null);

  var fmt2 = function (v) { return v != null ? "$" + v.toFixed(2) : "N/A"; };

  var mos = "Insufficient data to estimate";
  if (mid && price) {
    var pct = ((mid - price) / price * 100).toFixed(0);
    mos = mid > price
      ? pct + "% undervalued \u2014 " + (pct > 25 ? "meaningful" : "modest") + " margin of safety"
      : Math.abs(pct) + "% overvalued \u2014 " + (Math.abs(pct) > 25 ? "limited" : "modest") + " margin of safety";
  }

  var assumptions = [];
  if (grahamNum) assumptions.push("Graham Number \u221a(22.5 \u00d7 EPS \u00d7 BVPS) = " + fmt2(grahamNum));
  if (fcfValue)  assumptions.push("FCF capitalised at 10% required return = " + fmt2(fcfValue));
  assumptions.push("No credit for speculative future growth");
  assumptions.push("Conservative 10% discount rate (Buffett\u2019s hurdle)");

  var ivSummary = !mid || !price
    ? "Insufficient data for a reliable intrinsic value estimate for " + profile.companyName + ". A Graham analyst would insist on at least five years of earnings history first."
    : (mid - price) / price > 0.25
    ? profile.companyName + " trades at a meaningful discount to our conservative estimate \u2014 precisely the margin of safety Graham demanded."
    : (mid - price) / price > 0
    ? profile.companyName + " appears modestly undervalued. The margin of safety is present but thin \u2014 patience may reward a more compelling entry."
    : (mid - price) / price > -0.20
    ? profile.companyName + " trades near intrinsic value. A fair return requires the business to perform in line with history, with little buffer for disappointment."
    : profile.companyName + " trades at a premium to our conservative estimate. The investor is paying for growth that has yet to materialise.";

  return {
    intrinsicValueLow:  fmt2(low),
    intrinsicValueMid:  fmt2(mid),
    intrinsicValueHigh: fmt2(high),
    currentPrice:       fmt2(price),
    marginOfSafety:     mos,
    valuationMethod:    grahamNum && fcfValue ? "Graham Number + FCF Capitalisation (blended)"
                        : grahamNum ? "Graham Number (EPS \u00d7 Book Value)" : "FCF Capitalisation at 10% hurdle",
    keyAssumptions: assumptions,
    ivSummary: ivSummary,
  };
}

// ── Verdict Engine ────────────────────────────────────────────────────────────
function buildVerdict(profile, m, moat, iv) {
  var price = m.price;
  var mid   = iv.intrinsicValueMid !== "N/A" ? parseFloat(iv.intrinsicValueMid.replace("$", "")) : null;
  var mos   = mid && price ? (mid - price) / price : null;
  var scores = [
    m.returnOnEquityTTM   > 0.15 ? 8 : m.returnOnEquityTTM   > 0.10 ? 6 : 4,
    m.grossProfitMarginTTM > 0.40 ? 8 : m.grossProfitMarginTTM > 0.25 ? 6 : 4,
    m.debtToEquityTTM     < 0.5  ? 9 : m.debtToEquityTTM     < 1.0  ? 6 : 3,
    m.freeCashFlowYieldTTM > 0.05 ? 9 : m.freeCashFlowYieldTTM > 0.02 ? 6 : 3,
  ].filter(Boolean);
  var avgScore = scores.length ? scores.reduce(function (a, b) { return a + b; }, 0) / scores.length : 5;

  var verdict;
  if      (mos > 0.25 && avgScore > 6)  verdict = "BUY";
  else if (mos > 0.10 && avgScore > 5)  verdict = "BUY";
  else if (mos !== null && mos > -0.10) verdict = "HOLD";
  else if (mos !== null && mos > -0.25) verdict = "WATCH";
  else if (mos !== null)                verdict = "AVOID";
  else verdict = avgScore > 6.5 ? "HOLD" : avgScore > 5 ? "WATCH" : "AVOID";

  if ((m.debtToEquityTTM || 0) > 3 || (m.returnOnEquityTTM || 0.1) < -0.05) verdict = "AVOID";

  var roePct = m.returnOnEquityTTM    != null ? (m.returnOnEquityTTM * 100).toFixed(0) + "%" : "N/A";
  var gmPct  = m.grossProfitMarginTTM != null ? (m.grossProfitMarginTTM * 100).toFixed(0) + "%" : "N/A";
  var peStr  = m.peRatioTTM           != null ? m.peRatioTTM.toFixed(1) + "\u00d7" : "N/A";
  var mosStr = mos != null
    ? (mos > 0 ? "trading roughly " + (mos * 100).toFixed(0) + "% below my estimate of intrinsic value"
               : "trading about " + (Math.abs(mos) * 100).toFixed(0) + "% above my estimate")
    : "at a price I find difficult to assess with confidence";

  var buffettVoice = verdict === "BUY"
    ? "I look for three things: a business I understand, a durable competitive advantage, and a fair price. " + profile.companyName + " appears to offer all three today \u2014 " + mosStr + ", with a " + moat.moatRating.toLowerCase() + " moat and a " + roePct + " return on equity that doesn\u2019t come from luck. I don\u2019t need to be precise about value. I just need to be confident I\u2019m paying substantially less than what the business is worth. Here, I believe I am."
    : verdict === "HOLD"
    ? profile.companyName + " is a fine business \u2014 the kind Charlie and I would be happy to own. But wonderful businesses at full prices make for mediocre investments. It\u2019s " + mosStr + ". I\u2019d hold what I own, but I wouldn\u2019t be adding aggressively. The best time to buy a great business is when something scares everybody else away. That moment hasn\u2019t arrived yet."
    : verdict === "WATCH"
    ? profile.companyName + " is worth understanding deeply. A " + roePct + " return on equity and " + gmPct + " gross margin aren\u2019t accidental. But at the current price \u2014 " + mosStr + " \u2014 the valuation requires more things to go right than I\u2019m comfortable banking on. Put it on the watchlist. If Mr. Market has a bad day and offers this at a 20\u201330% discount, the conversation changes."
    : "Rule number one: never lose money. At this price, " + profile.companyName + " is " + mosStr + ". A P/E of " + peStr + " and ROE of " + roePct + " don\u2019t justify the premium being asked. I\u2019ve passed on many businesses that later did well. I\u2019m comfortable passing on this one too.";

  var mungerVoice = verdict === "BUY"
    ? "Invert, always invert. What would have to go wrong for this to be a bad investment? For " + profile.companyName + ", that list is shorter than most. The " + gmPct + " gross margin is genuine pricing power. Businesses with pricing power don\u2019t need to be geniuses \u2014 they just can\u2019t be idiots. This management clears that bar."
    : verdict === "HOLD"
    ? "All I want to know is where I\u2019m going to die, so I\u2019ll never go there. " + profile.companyName + " won\u2019t kill you \u2014 it\u2019s a real business. But I\u2019ve watched too many investors overpay for quality and wonder why their returns were mediocre. The business is fine. The price is the variable to watch."
    : verdict === "WATCH"
    ? "The " + gmPct + " gross margin is respectable. But I want a margin of safety in the price, not just in the franchise. Come back when Mr. Market is having a worse day."
    : "Show me the incentive and I\u2019ll show you the outcome. This valuation creates incentives for precisely the wrong outcomes \u2014 for management, for capital, and for the shareholder. I\u2019ve seen this before. It doesn\u2019t end well.";

  var keyRisks = [];
  if ((m.debtToEquityTTM || 0) > 1.0)        keyRisks.push("Elevated leverage (D/E: " + (m.debtToEquityTTM || 0).toFixed(2) + "\u00d7) amplifies downside in a downturn");
  if ((m.peRatioTTM || 0) > 30)               keyRisks.push("Rich valuation (P/E: " + (m.peRatioTTM || 0).toFixed(1) + "\u00d7) leaves little room for earnings disappointment");
  if (moat.moatRating === "None")              keyRisks.push("No identifiable moat \u2014 returns could be competed away over time");
  if ((m.grossProfitMarginTTM || 0.3) < 0.20) keyRisks.push("Thin gross margins (" + gmPct + ") offer little pricing power buffer");
  keyRisks.push("Rising interest rates increase the discount rate applied to all future cash flows");

  var catalysts = [];
  if (mos !== null && mos > 0.15)             catalysts.push("Valuation re-rating as Mr. Market recognises intrinsic value");
  if ((m.freeCashFlowYieldTTM || 0) > 0.05)  catalysts.push("Strong FCF yield (" + ((m.freeCashFlowYieldTTM || 0) * 100).toFixed(1) + "%) funds buybacks or reinvestment");
  if (moat.moatRating === "Wide")             catalysts.push("Wide moat compounds quietly \u2014 time is the friend of an excellent business");
  catalysts.push("Disciplined management execution on existing capital strategy");

  return {
    verdict:      verdict,
    buffettVoice: buffettVoice,
    mungerVoice:  mungerVoice,
    keyRisks:     keyRisks.slice(0, 4),
    catalysts:    catalysts.slice(0, 3),
  };
}
