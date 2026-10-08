import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Eye,
  EyeOff,
  Info,
  Check,
  X,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowDownRight,
  ArrowUp,
  Sparkles,
  ShieldCheck,
  Clock,
  Home,
  LineChart,
  Wallet,
  User,
  Flame,
  Lock,
  LockOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Sell charges configuration: update rates here                       */
/* ------------------------------------------------------------------ */

const SELL_CHARGES = {
  dpChargePerStock: 20, // ₹ flat, per stock sold (plus GST)
  brokeragePct: 0.001, // 0.1% of order value...
  brokerageCap: 20, // ...or ₹20, whichever is lower...
  brokerageMin: 5, // ...but at least ₹5 (plus GST)
  sttPct: 0.001, // 0.1% of order value
  gstPct: 0.18, // GST on DP charge and brokerage
  highChargesPct: 0.02, // flag when total charges exceed 2% of sale value
};

function calcSellCharges(orderValue, stocksSold = 1, cfg = SELL_CHARGES) {
  const dp = orderValue > 0 ? cfg.dpChargePerStock * stocksSold : 0;
  const brokerage = orderValue > 0 ? Math.max(cfg.brokerageMin, Math.min(cfg.brokerageCap, orderValue * cfg.brokeragePct)) : 0;
  const gst = (dp + brokerage) * cfg.gstPct;
  const stt = orderValue * cfg.sttPct;
  const total = dp + brokerage + gst + stt;
  const net = orderValue - total;
  // Whole-rupee headline figures that always add back up to the sale value.
  const netRounded = Math.round(net);
  const totalRounded = Math.round(orderValue) - netRounded;
  return { orderValue, dp, brokerage, gst, stt, total, net, netRounded, totalRounded, isHigh: orderValue > 0 && total > orderValue * cfg.highChargesPct };
}

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

// Groww light theme. Text-bearing greens/greys/reds sit one step darker on Groww's own scale for WCAG AA.
const C = {
  paper: "#F8F8F8", // page ground (gray50)
  ink: "#44475B", // primary text (gray900)
  sub: "#696C7C", // secondary text (gray800)
  line: "#E9E9EB", // hairlines and card borders (gray150)
  track: "#DDDEE1", // progress tracks, connectors, handles (gray200)
  control: "#C7C8CE", // unselected control borders, inactive dots, disabled fills (gray300)
  faint: "#B0B2BA", // disabled glyphs (gray400)
  forest: "#00825C", // primary action fill with white label, active state text (green11)
  mint: "#04B488", // brand green for fills, bars, dots, icons (green9)
  mintDeep: "#00825C", // green text and gains (green11)
  mintSoft: "#E9FAF3", // green tint surfaces (green2)
  loss: "#D23A15", // loss text and icons (red11)
  lossSoft: "#FFF1ED", // loss tint (red2)
  amber: "#8A5A00", // warning text
  amberSoft: "#FFF7DE", // warning tint (yellow2)
  amberLine: "#FFE7AA", // warning border (yellow4)
  info: "#4452D6", // secondary accent text (blue11)
  infoSoft: "#F2F5FF", // secondary accent tint (blue2)
  mintLine: "#CDF3E3", // green tint border (green4)
  chip: "#F0F0F2", // neutral tag fill (gray100)
  scrim: "rgba(18,18,18,.5)",
};

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap');
.gw { font-family: 'Figtree', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: ${C.ink}; -webkit-font-smoothing: antialiased; }
.gw-display { font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.01em; }
.gw-num { font-variant-numeric: tabular-nums; }
.gw button { -webkit-tap-highlight-color: transparent; }
.gw ::selection { background: ${C.mintSoft}; color: ${C.forest}; }
.gw input, .gw textarea { caret-color: ${C.mintDeep}; }
.gw input:focus-visible, .gw textarea:focus-visible { outline: 2px solid ${C.forest}; outline-offset: 1px; }
.gw button { transition: transform .16s cubic-bezier(.16,1,.3,1), background-color .16s, border-color .16s, opacity .16s; }
.gw button:not(:disabled):active { transform: scale(.97); }
.gw button:disabled { cursor: not-allowed; }
.gw button:focus-visible { outline: 2px solid ${C.forest}; outline-offset: 2px; }
.gw-phone { height: calc(100dvh - 52px); }
@media (min-width: 640px) {
  .gw-phone { height: min(860px, calc(100dvh - 96px)); border-radius: 36px; border: 1px solid ${C.track}; box-shadow: 0 32px 64px -32px rgba(68, 71, 91, .28); }
}
.gw-scroll { scrollbar-width: none; }
.gw-scroll::-webkit-scrollbar { display: none; }
@keyframes gw-reel { from { width: 0%; } to { width: 100%; } }
.gw-reel-bar { animation: gw-reel 60s linear forwards; }
@keyframes gw-pop { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
.gw-pop { animation: gw-pop .35s cubic-bezier(.16,1,.3,1) both; }
@keyframes gw-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.gw-fade { animation: gw-fade .25s cubic-bezier(.16,1,.3,1) both; }
@keyframes gw-slide { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
.gw-slide { animation: gw-slide .22s cubic-bezier(.16,1,.3,1) both; }
@keyframes gw-tip { 0% { opacity: 0; transform: translateY(-4px); } 12% { opacity: 1; transform: none; } 80% { opacity: 1; } 100% { opacity: 0; } }
.gw-tip { animation: gw-tip 2.6s ease-out forwards; }
@keyframes gw-rise { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
.gw-rise { animation: gw-rise .25s cubic-bezier(.16,1,.3,1) both; }
@keyframes gw-dot { 0%, 80%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
.gw-dot { animation: gw-dot 1s infinite ease-in-out; }
@keyframes gw-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(.6); opacity: .5; } }
.gw-pulse { animation: gw-pulse 1.4s infinite ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  .gw-pop, .gw-fade, .gw-slide, .gw-tip, .gw-rise, .gw-dot, .gw-pulse { animation: none; }
  .gw button:not(:disabled):active { transform: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Formatting (Indian number system)                                   */
/* ------------------------------------------------------------------ */

const formatINR = (n) => "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
const formatSigned = (n) => (n < 0 ? "−" : "+") + formatINR(n);
const formatINR2 = (n) =>
  "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MASK = "₹••,•••";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

// isNewToAssistant: user hasn't opened Ask AI before, so the intro tooltip shows once per session.
const USER = { name: "Vedant", initial: "V", isNewToAssistant: true };

const MARKET = {
  index: "NIFTY 50",
  change: -0.8,
  why: "Banking and IT stocks slipped today as global markets turned cautious. A one-day move like this doesn't change a long-term plan, and your SIP keeps buying at whatever the price is.",
};

const PORTFOLIO = { current: 48250, invested: 45000 };

const ALLOCATION = [
  { id: "mf", label: "Mutual funds", pct: 70, color: C.mint },
  { id: "stocks", label: "Stocks", pct: 30, color: "#5367FF" },
];

const TRADING_PNL_MONTH = -1840;

const TASKS = [
  {
    id: "nominee",
    title: "Add a nominee",
    detail: "Takes 2 minutes. Lets your family claim your investments easily if something happens to you.",
    action: "Add",
  },
  {
    id: "sip",
    title: "Your SIP of ₹2,000 is due in 3 days",
    detail: "Keep at least ₹2,000 in your linked bank account by 11 Oct for the auto-debit.",
    action: "View",
  },
  {
    id: "emergency",
    title: "Build an emergency fund",
    detail: "Aim for one month's salary in a liquid fund you can withdraw from anytime.",
    action: "Add money",
  },
];

const SIP = {
  fund: "Nifty 50 Index Fund",
  amount: 2000,
  nextDate: "11 Oct 2026",
  followingDate: "11 Nov",
  bank: "Bank account ••4417",
  streak: 8,
};

const EMERGENCY = { start: 12000, target: 30000, fund: "Liquid Fund", quickAmounts: [500, 1000, 2000, 5000] };

const RELATIONS = ["Parent", "Spouse", "Sibling", "Child", "Other"];

// First-time user (Phase 2)
const NEW_TASKS = [
  {
    id: "goal",
    title: "Set your first goal",
    detail: "A bike, a trip or a safety net. Naming it makes saving easier.",
    action: "Set goal",
  },
  {
    id: "first-sip",
    title: "Start a ₹100 SIP",
    detail: "Invest a small amount every month, automatically.",
    action: "Start",
  },
  {
    id: "nominee",
    title: "Add a nominee",
    detail: "Takes 2 minutes. Lets your family claim your investments easily if something happens to you.",
    action: "Add",
    doneDetail: "Nominee added",
  },
  {
    id: "risk",
    title: "Take the 2-minute risk quiz",
    detail: "A few quick questions on how you feel about ups and downs.",
    action: "Start",
  },
];

const FIRST_SIP_AMOUNTS = [100, 500, 1000];
const FIRST_DEBIT = "5 Nov"; // next 5th after today (8 Oct 2026)

/* ------------------------------------------------------------------ */
/* Ask AI: offline answer engine (no external API)                     */
/* ------------------------------------------------------------------ */

const AI_GREETING = `Hi ${USER.name}! I'm your AI assistant in Beginner Mode. Ask me what an investing term means, or what a number in your account is telling you.`;

// Guardrail: anything asking for a buy/sell decision, tips or price predictions is declined.
const DECISION =
  /\b(should i (buy|sell|invest|exit|hold|book|switch|redeem)|what to (buy|sell|invest)|which (stock|share|fund|ipo|company)s?|(stock|share|fund|ipo)s? to (buy|sell|pick)|best (stock|share|fund|ipo)s?|good (stock|share|fund|ipo)s?|tips?|recommend\w*|suggest\w*|worth (buying|selling|investing)|(good|right) time to|target price|stop ?loss (for|on|at)\b|multibagger|hot stocks?|(buy|sell) or (hold|sell|buy))\b/i;
const TRADE_WORD = /\b(buy|buying|bought|sell|selling|sold|purchase|invest in|trade|redeem)\b/i;
const EXPLAIN = /\b(what is|what are|what's|whats|meaning|mean|means|explain|how does|why|charges?|fees?|tax|stt|brokerage)\b/i;
const PREDICT =
  /\b(predict\w*|forecast|will .+ (go up|go down|rise|fall|crash|double|recover)|going to (rise|fall|crash|go up|go down))\b/i;

const GUARD_REPLY =
  "I can't tell you what to buy or sell, or share tips. In Beginner Mode I only explain how investing works and what your numbers mean, so the decision always stays yours.\nTry asking something like \"What is an expense ratio?\" or \"How does an SIP work?\"";
const PREDICT_REPLY =
  "I can't predict where prices will go. Nobody can do that reliably, so I won't guess with your money.\nI can explain what usually moves markets, or what today's change means for your SIP.";

function sellChargesReply(d, fromSellSheet = false) {
  const cfg = SELL_CHARGES;
  const pct = (v) => `${+(v * 100).toFixed(2)}%`;
  const intro = fromSellSheet
    ? `Here's where the ${formatINR2(d.total)} goes when you sell ${d.qty} ${d.qty === 1 ? "share" : "shares"} of ${d.name} worth ${formatINR2(d.orderValue)}:`
    : `Selling shares comes with a few charges. For example, selling shares worth ${formatINR2(d.orderValue)} costs ${formatINR2(d.total)}:`;
  const lines = [
    intro,
    `• DP charge ${formatINR2(d.dp)}: a flat ₹${cfg.dpChargePerStock} per stock you sell, for moving shares out of your demat account.`,
    `• Brokerage ${formatINR2(d.brokerage)}: the app's fee for placing your order. It's ${pct(cfg.brokeragePct)} of the order value or ₹${cfg.brokerageCap}, whichever is lower, and at least ₹${cfg.brokerageMin}.`,
    `• GST ${formatINR2(d.gst)}: ${pct(cfg.gstPct)} tax on the DP charge and brokerage.`,
    `• STT ${formatINR2(d.stt)}: Securities Transaction Tax, a government tax of ${pct(cfg.sttPct)} of the sale value.`,
    `That leaves ${formatINR2(d.net)} for you.`,
  ];
  if (d.isHigh)
    lines.push(
      `Here charges are ${pct(d.total / d.orderValue)} of the sale, mostly because the DP charge is flat. On a bigger sale, the same fixed fee is a much smaller share.`
    );
  return lines.join("\n");
}

const gainAmount = PORTFOLIO.current - PORTFOLIO.invested;
const gainPct = ((gainAmount / PORTFOLIO.invested) * 100).toFixed(1);

// New users have no holdings yet, so portfolio questions get this instead of numbers.
function noDataReply(c) {
  return c.firstSip
    ? `Your first SIP of ${formatINR(c.firstSip.amount)} goes in on ${FIRST_DEBIT}, so there's nothing to show here yet. After that, I can walk you through how your money is doing.`
    : "You haven't invested yet, so there's nothing to show here. Once your first SIP goes in, I can walk you through how your money is doing.";
}

const DEBIT_FAIL_TAIL =
  "\nThe units you already own aren't affected. That month's instalment is simply skipped, and your bank may charge a bounce fee. If it fails 3 months in a row, the SIP is usually cancelled and you'd need to set it up again.";

const INTENTS = [
  {
    test: /leverage|margin/i,
    reply: () =>
      "Leverage lets you control a big position with a small amount of your own money. For example, ₹20,000 of margin can control a ₹1,00,000 position, which is 5× leverage.\nA 2% move is then ₹2,000, or 10% of your money. Leverage multiplies losses exactly as much as gains.",
  },
  {
    test: /stop.?loss/i,
    reply: () =>
      "A stop-loss is an order you set in advance that exits your position automatically if the price reaches a level you choose. If you buy at ₹200 with a stop-loss at ₹190, you're out at ₹190, which caps the loss near ₹10 per unit.\nIt isn't a guarantee: in a sudden move, the order can fill below your level.",
  },
  {
    test: /f\s?&\s?o|f and o|futures|derivative|time decay|theta|expiry|options? trading|call option|put option|^what (are|is) (an )?options?\b/i,
    reply: () =>
      "Futures and options (F&O) are contracts whose value comes from an underlying asset, like the NIFTY 50. They use leverage, so small market moves cause big gains or losses, and options also lose value as expiry gets closer.\nIn FY25, about 91% of individual F&O traders made a net loss, according to a SEBI study.\nIn this app, F&O unlocks after a short module, a quiz and a risk acknowledgement in the F&O section of the Invest tab.",
  },
  {
    test: /\bp\/?e\b|price.to.earnings|consistency|market cap|large cap|mid cap/i,
    reply: () =>
      "Here's what the numbers on a stock page mean:\n• P/E (price-to-earnings): how many rupees you pay for every ₹1 of the company's yearly profit. Comparing it with the sector average shows whether the market values it higher or lower than similar companies. A higher P/E usually means people expect more growth. It doesn't make a stock better or worse on its own.\n• 3-year consistency: a 1–10 score for how steadily revenue and profit grew over 3 years, and how much the price swung. Higher means steadier. It describes the past, not the future.\n• Market cap: the total value of all the company's shares. Large caps are India's 100 biggest listed companies; mid caps rank 101–250.",
  },
  {
    test: /risk (quiz|profile)/i,
    reply: () =>
      "The risk quiz asks a few quick questions about your income, your goals and how you'd feel if your investments dropped for a while.\nIt gives you a risk profile, like conservative, moderate or aggressive, so you know how much up and down you're comfortable with. It takes about 2 minutes.",
  },
  {
    test: /₹?\s?100\b|start small|small amount/i,
    reply: () =>
      "You don't need a big amount to start. Many index funds let you begin an SIP with ₹100 a month.\nStarting small helps you build the habit and see how investing works before putting in more. You can increase the amount anytime.",
  },
  {
    test: /nominee/i,
    reply: (c) =>
      "A nominee is the person who can claim your investments if something happens to you. Without one, your family may need extra legal paperwork, like a succession certificate, which can take months.\nAdding one takes about 2 minutes, and you can change it anytime." +
      (c.openTaskIds.includes("nominee")
        ? "\nYou haven't added a nominee yet. You'll find it in Your next steps on Home."
        : "\nYou've already added a nominee, so you're covered."),
  },
  {
    test: /auto-?debit|bounce|fail|miss/i,
    reply: (c) => {
      if (c.isNew) {
        const lead = c.firstSip
          ? `Your SIP of ${formatINR(c.firstSip.amount)} debits on the 5th of every month, starting ${FIRST_DEBIT}. If your bank account has less than that on the day, the auto-debit fails.`
          : "If your bank account has less than your SIP amount on the debit date, the auto-debit fails.";
        return lead + DEBIT_FAIL_TAIL;
      }
      const lead = c.openTaskIds.includes("sip")
        ? `Your SIP of ${formatINR(SIP.amount)} is due on ${SIP.nextDate.slice(0, 6)}. If your bank account has less than that on the day, the auto-debit fails.`
        : "You've already paid this month's SIP, so October is covered. In general, if your bank account is short on the SIP date, the auto-debit fails.";
      return lead + DEBIT_FAIL_TAIL;
    },
  },
  {
    test: /emergency|liquid/i,
    reply: (c) =>
      "An emergency fund is money set aside for surprises, like a medical bill or a gap between jobs, so you never have to sell investments at a bad time.\nA common rule of thumb is 3–6 months of expenses." +
      (c.isNew
        ? ""
        : ` Your first target here is ${formatINR(EMERGENCY.target)}, one month's salary, and you've saved ${formatINR(c.saved)} so far.`) +
      "\nIt usually sits in a liquid fund because its value barely moves day to day and you can withdraw by the next working day.",
  },
  {
    test: /goal/i,
    reply: () =>
      "A goal gives your money a job, like a bike, a trip or a safety net. Once you set a target amount and date, you can see how much to put aside each month and how close you are.\nYou can set a goal from Your next steps on Home.",
  },
  {
    test: /p&l|p & l|pnl|profit and loss|trading/i,
    reply: (c) =>
      c.isNew
        ? noDataReply(c)
        : `Your portfolio gain of ${formatSigned(gainAmount)} (+${gainPct}%) counts everything you hold, measured since you started.\nTrading P&L is different. It's the profit or loss only from stocks you bought and sold within this month, and for you that's ${formatSigned(TRADING_PNL_MONTH)}.\nSo both can be true at once: your long-term holdings are up, while short-term trades this month lost money.`,
  },
  {
    test: /expense ratio|\bter\b/i,
    reply: () =>
      "An expense ratio is the yearly fee a mutual fund charges to manage your money, shown as a % of what you've invested.\nAt a 1% expense ratio, ₹10,000 invested costs you ₹100 a year. It's taken from the fund's value, so you never see a separate bill.\nIndex funds usually charge far less than actively managed funds. The Nifty 50 index funds in Start here range from 0.10% to 0.20%.",
  },
  {
    test: /xirr|cagr|annuali[sz]ed|p\.a\./i,
    reply: (c) =>
      "XIRR is your return per year, adjusted for when each rupee went in. Because SIPs add money at different times, it gives a fairer picture of how fast your money is actually growing than a simple % gain." +
      (c.isNew
        ? ""
        : `\nYour +${gainPct}% is an absolute return: it treats money invested ${SIP.streak} months ago the same as money invested last month.`),
  },
  {
    test: /index fund|nifty 50 fund|passive/i,
    reply: () =>
      "An index fund copies a market index instead of picking stocks. A Nifty 50 index fund holds the 50 largest companies on the NSE, in the same proportions as the index.\nBecause nobody is actively picking, fees are low, and your return closely tracks the index itself, minus the expense ratio.",
  },
  {
    test: /allocation|split|diversif|mutual funds? (vs|or|and) stocks?/i,
    reply: (c) => {
      if (c.isNew) return noDataReply(c);
      const [mf, st] = ALLOCATION;
      return `About ${mf.pct}% of your money (${formatINR((PORTFOLIO.current * mf.pct) / 100)}) is in mutual funds and ${st.pct}% (${formatINR((PORTFOLIO.current * st.pct) / 100)}) is in stocks.\nA mutual fund spreads your money across many companies, while each stock depends on one company. That's why the stock part of a portfolio usually moves up and down more.`;
    },
  },
  {
    test: /gain|return|7\.2|how am i doing|my portfolio|current value|invested/i,
    reply: (c) =>
      c.isNew
        ? noDataReply(c)
        : `You've invested ${formatINR(PORTFOLIO.invested)} and it's worth ${formatINR(PORTFOLIO.current)} today, so you're up ${formatINR(gainAmount)}. That's ${gainPct}% on the money you put in.\nThis is an absolute return, so it doesn't account for how long each rupee has been invested. XIRR is the measure that adjusts for timing.`,
  },
  {
    test: /\bsips?\b|systematic/i,
    reply: (c) => {
      const base = "An SIP (Systematic Investment Plan) invests a fixed amount automatically every month.";
      const averaging =
        "\nBecause the amount is fixed, you buy more units when prices are low and fewer when they're high. This is called rupee cost averaging.";
      if (c.isNew) {
        const yours = c.firstSip
          ? ` Yours is set: ${formatINR(c.firstSip.amount)} a month into ${c.firstSip.fund.name}, starting ${FIRST_DEBIT}.`
          : " You can start one with as little as ₹100 a month.";
        return base + yours + averaging;
      }
      return `${base} Yours is ${formatINR(SIP.amount)} a month in ${SIP.fund}, and you've kept it going ${SIP.streak} months in a row.${averaging}`;
    },
  },
  {
    test: /market|nifty|sensex|down today|fell|falling/i,
    reply: () =>
      `${MARKET.index} is ${MARKET.change < 0 ? "down" : "up"} ${Math.abs(MARKET.change)}% today. ${MARKET.why}\nMoves of 1–2% in a day are normal, even without big news.`,
  },
  { test: /charge|brokerage|\bstt\b|\bfees?\b|\bdp\b|tax/i, reply: () => sellChargesReply(calcSellCharges(1000), false) },
  { test: /^(hi|hello|hey|namaste)\b/i, reply: () => `Hi ${USER.name}! Ask me about any investing term, or tap a suggestion below.` },
  { test: /thank/i, reply: () => "Happy to help. Ask anything else whenever you like." },
];

const FALLBACK_REPLY =
  "I don't have a good answer for that yet. In Beginner Mode I can explain investing terms, like SIPs, expense ratios and index funds, and what the numbers in your account mean.\nTry one of the suggestions below.";

const RISK_MEANING = {
  "Very High": "its value can swing a lot, especially over months rather than years",
  High: "it can rise and fall noticeably over a few months",
  "Moderately High": "it can move a fair amount over a few months",
  Moderate: "small ups and downs are normal",
  "Low to Moderate": "its value barely moves from day to day",
  Low: "its value is very stable",
};

function fundReply(f) {
  const perThousand = f.expense * 10;
  const fee = Number.isInteger(perThousand) ? `₹${perThousand}` : formatINR2(perThousand);
  const lines = [
    `${f.name} is ${f.category === "Index fund" ? "an index fund" : `a ${f.category.toLowerCase()} fund`}. ${f.about[0]}`,
    `Its SEBI riskometer level is ${f.risk}, which means ${RISK_MEANING[f.risk]}.`,
    `The expense ratio is ${f.expense.toFixed(2)}%, so you pay about ${fee} a year for every ₹1,000 invested.`,
    `Its 3-year return of ${f.return3y.toFixed(1)}% a year is past performance, not a promise for the future.`,
  ];
  if (f.id === "elss") lines.push("Each investment is locked in for 3 years, so you can't withdraw it before then.");
  lines.push("I can explain how it works, but whether it fits your goals is your call.");
  return lines.join("\n");
}

function getReply(q, ctx, opts = {}) {
  if (opts.topic === "fund" && opts.data) return { text: fundReply(opts.data) };
  if (opts.topic === "sell-charges" && opts.data) return { text: sellChargesReply(opts.data, true) };
  if (DECISION.test(q) || (TRADE_WORD.test(q) && !EXPLAIN.test(q))) return { text: GUARD_REPLY, kind: "guard" };
  if (PREDICT.test(q)) return { text: PREDICT_REPLY, kind: "guard" };
  const hit = INTENTS.find((i) => i.test.test(q));
  return { text: hit ? hit.reply(ctx) : FALLBACK_REPLY };
}

function getSuggestions(ctx, asked) {
  const pool = ctx.isNew
    ? [
        !ctx.firstSip && "Why start with just ₹100?",
        "What is an SIP?",
        ctx.openTaskIds.includes("nominee") && "Why do I need a nominee?",
        ctx.openTaskIds.includes("risk") && "What is the risk quiz?",
        ctx.firstSip && "What if my SIP auto-debit fails?",
        "How does a Nifty 50 index fund work?",
        "What is an expense ratio?",
      ]
    : [
        ctx.openTaskIds.includes("nominee") && "Why do I need a nominee?",
        ctx.openTaskIds.includes("sip") && "What if my SIP auto-debit fails?",
        ctx.openTaskIds.includes("emergency") && "Why keep an emergency fund in a liquid fund?",
        TRADING_PNL_MONTH < 0 && "Why is my trading P&L negative?",
        `What does my +${gainPct}% gain mean?`,
        MARKET.change < 0 && "Why is the market down today?",
        "What is an expense ratio?",
        "How does a Nifty 50 index fund work?",
        "What is XIRR?",
      ];
  return pool.filter(Boolean).filter((q) => !asked.includes(q)).slice(0, 4);
}

const QUIZ = {
  question: "A fund has a 1% expense ratio. On ₹10,000 invested for a year, how much do you pay in fees?",
  options: [
    { id: "a", label: "₹100" },
    { id: "b", label: "₹1,000" },
  ],
  correctId: "a",
  streakAfter: 4,
  right: "Correct. 1% of ₹10,000 is ₹100 a year, taken from the fund's value, so you never see a separate bill.",
  wrong: "Not quite. 1% of ₹10,000 is ₹100 a year, taken from the fund's value rather than charged separately.",
};

const FUNDS = [
  { id: "banyan", name: "Banyan Nifty 50 Index Fund", initials: "BN", expense: 0.1, return3y: 13.4, minSip: 100, tag: "Lowest cost" },
  { id: "lotus", name: "Lotus Nifty 50 Index Fund", initials: "LT", expense: 0.18, return3y: 13.2, minSip: 500 },
  { id: "meridian", name: "Meridian Nifty 50 Index Fund", initials: "MR", expense: 0.2, return3y: 13.1, minSip: 100 },
];

// Stocks (Phase 3). Fictional companies, mock numbers. Large and mid caps only.
const STOCKS = [
  {
    id: "kaveri", name: "Kaveri Power Grid", initials: "KP",
    sector: "Power utilities", tier: "Large cap", mcapCr: 112400, price: 1450, dayChange: -0.6,
    pe: 18.2, sectorPe: 21.5, consistency: 8, revenueYears: 3, profitYears: 2, swings: "Low",
    about: "Runs electricity transmission lines across five states.",
  },
  {
    id: "sahyadri", name: "Sahyadri Foods", initials: "SF",
    sector: "Packaged foods", tier: "Large cap", mcapCr: 221800, price: 2310, dayChange: 0.4,
    pe: 52.0, sectorPe: 46.8, consistency: 9, revenueYears: 3, profitYears: 3, swings: "Low",
    about: "Makes biscuits, snacks and ready-to-cook meals sold across India.",
  },
  {
    id: "narmada", name: "Narmada Cement", initials: "NC",
    sector: "Cement", tier: "Mid cap", mcapCr: 54300, price: 1245, dayChange: 1.2,
    pe: 27.4, sectorPe: 30.1, consistency: 6, revenueYears: 2, profitYears: 2, swings: "Medium",
    about: "Produces cement for housing and infrastructure in central India.",
  },
  {
    id: "indus", name: "Indus Payments", initials: "IP",
    sector: "Digital payments", tier: "Mid cap", mcapCr: 41600, price: 500, dayChange: -2.1,
    pe: 61.3, sectorPe: 38.0, consistency: 4, revenueYears: 3, profitYears: 1, swings: "High",
    about: "Runs a UPI app and payment terminals for small shops.",
  },
];
const stockById = (id) => STOCKS.find((s) => s.id === id);

// Plan (intent) captured before confirming a buy. Quick trade is a first-class, equal option.
const PLANS = [
  { id: "trade", label: "Quick trade", detail: "Days to weeks", tag: "Plan: Quick trade", tone: "neutral" },
  { id: "hold", label: "Hold", detail: "1–5 years", tag: "Plan: 1–5 year hold", tone: "mint", horizon: "1–5 years" },
  { id: "hold5", label: "Hold", detail: "5+ years", tag: "Plan: 5+ year hold", tone: "mint", horizon: "5+ years" },
  { id: "skip", label: "Skip", detail: "Decide later", tag: "No plan set", tone: "grey" },
];
const BUY_PLANS = PLANS.filter((p) => ["trade", "hold", "skip"].includes(p.id));
const planById = (id) => PLANS.find((p) => p.id === id);
const isLongTermPlan = (id) => id === "hold" || id === "hold5";
const SELL_REMINDER_DAYS = 30;

// Returning user's stocks: ₹7,250 + ₹6,225 + ₹1,000 = ₹14,475, matching the 30% stock split on Home.
// The two older lots were bought before plans existed, so no plan is set.
const RETURNING_HOLDINGS = [
  { id: "h-kaveri", stockId: "kaveri", qty: 5, intent: "skip", boughtDaysAgo: 214 },
  { id: "h-narmada", stockId: "narmada", qty: 5, intent: "skip", boughtDaysAgo: 160 },
  { id: "h-indus", stockId: "indus", qty: 2, intent: "hold5", boughtDaysAgo: 10 },
];

// Mutual funds (Phase 6). Generic names and illustrative data. Risk uses SEBI riskometer labels.
const RISK_LEVELS = ["Low", "Low to Moderate", "Moderate", "Moderately High", "High", "Very High"];
const RISK_COLORS = ["#5DBB8A", "#9CCB64", "#D9C24F", "#E5A04A", "#DE7C45", "#C8553D"];

const MF_FUNDS = [
  {
    id: "nifty50", name: "Nifty 50 Index Fund", category: "Index fund", filters: ["index"], initials: "NF",
    expense: 0.2, return3y: 13.2, risk: "Very High", minSip: 100, minOnce: 100,
    about: [
      "It buys the 50 largest companies on the NSE in the same proportions as the Nifty 50 index.",
      "Your return follows the index, minus a small yearly fee.",
    ],
  },
  {
    id: "next50", name: "Nifty Next 50 Index Fund", category: "Index fund", filters: ["index"], initials: "NN",
    expense: 0.3, return3y: 17.8, risk: "Very High", minSip: 100, minOnce: 100,
    about: [
      "It buys the 50 companies ranked just below the Nifty 50: large, but still growing.",
      "It usually moves more than the Nifty 50, both up and down.",
    ],
  },
  {
    id: "liquid", name: "Liquid Fund", category: "Liquid", filters: ["low"], initials: "LQ",
    expense: 0.15, return3y: 6.9, risk: "Low to Moderate", minSip: 500, minOnce: 500,
    about: [
      "It lends money for up to 91 days to the government, banks and large companies.",
      "It's built for parking cash you may need soon, and withdrawals usually reach you by the next working day.",
    ],
  },
  {
    id: "baf", name: "Balanced Advantage Fund", category: "Hybrid", filters: [], initials: "BA",
    expense: 0.75, return3y: 11.6, risk: "High", minSip: 500, minOnce: 1000,
    about: [
      "It moves money between shares and bonds depending on how expensive the stock market looks.",
      "The aim is a smoother ride than a fund that holds only shares.",
    ],
  },
  {
    id: "elss", name: "ELSS Tax Saver Fund", category: "ELSS", filters: ["tax"], initials: "TS",
    expense: 0.65, return3y: 15.1, risk: "Very High", minSip: 500, minOnce: 500,
    about: [
      "It invests mainly in shares of Indian companies, and each investment is locked in for 3 years.",
      "Up to ₹1,50,000 a year can be claimed as a deduction under Section 80C if you use the old tax regime.",
    ],
  },
  {
    id: "sdd", name: "Short Duration Debt Fund", category: "Debt", filters: ["low"], initials: "SD",
    expense: 0.35, return3y: 7.2, risk: "Moderate", minSip: 1000, minOnce: 1000,
    about: [
      "It lends to companies and the government for roughly 1 to 3 years.",
      "Returns are steadier than shares, but its value can dip when interest rates rise.",
    ],
  },
];
const fundById = (id) => MF_FUNDS.find((f) => f.id === id);

const MF_FILTERS = [
  { id: "all", label: "All", hint: "All 6 funds." },
  { id: "index", label: "Index funds", hint: "Funds that copy a market index, usually with low fees." },
  { id: "low", label: "Low risk", hint: "Rated Moderate or lower on SEBI's riskometer." },
  { id: "tax", label: "Tax saving", hint: "ELSS funds qualify for Section 80C deductions under the old tax regime." },
];

// Returning user's funds: ₹21,775 + ₹12,000 = ₹33,775, the 70% split on Home.
const RETURNING_FUNDS = [
  { fundId: "nifty50", value: 21775, note: "SIP ₹2,000 a month" },
  { fundId: "liquid", value: 12000, note: "Emergency fund" },
];

const INVEST_ONCE_AMOUNTS = [1000, 5000, 10000];
const TODAY_LABEL = "8 Oct";
const NEXT_WORKING_DAY = "Fri 9 Oct"; // today is Thu 8 Oct 2026

const formatAgo = (d) =>
  d === 0 ? "Bought today" : d === 1 ? "Bought yesterday" : d < 30 ? `Bought ${d} days ago` : `Bought ${Math.round(d / 30)} months ago`;

// F&O gate (Phase 5). Statistic from SEBI's FY25 study on individual traders in equity derivatives (July 2025).
const FNO_STAT = "Futures & Options are high-risk. 9 in 10 individual traders lost money in FY25 (SEBI study). Complete a 5-minute module to unlock.";

const FNO_CARDS = [
  {
    id: "leverage",
    big: "5×",
    title: "What leverage is",
    body: [
      "Leverage lets you control a big position with a small amount of your own money.",
      "Example: ₹20,000 of margin controls a ₹1,00,000 position. That's 5× leverage. A 2% market move is ₹2,000, which is 10% of your money in a single move.",
      "It works the same way on the way down. Leverage multiplies losses exactly as much as gains.",
    ],
  },
  {
    id: "losses",
    big: "91%",
    title: "Why most traders lose",
    body: [
      "In FY25, about 91% of individual F&O traders made a net loss. Together they lost ₹1,05,603 crore (SEBI study).",
      "Leverage turns small mistakes into big losses. Options lose value every day as expiry gets closer, called time decay, so being right too slowly can still lose money.",
      "Costs on every trade also add up quickly for people who trade often.",
    ],
  },
  {
    id: "stoploss",
    big: "₹200 → ₹190",
    title: "What a stop-loss is",
    body: [
      "A stop-loss is an order you set in advance. It exits your position automatically if the price reaches a level you choose.",
      "Example: you buy at ₹200 and set a stop-loss at ₹190. If the price falls to ₹190 you're out, which caps the loss near ₹10 per unit.",
      "It isn't a guarantee. In a sudden move, the order can fill below your level.",
    ],
  },
];

// Quiz: basics (true/false) plus concept MCQs. All must be correct to unlock.
const TRUE_FALSE = [
  { id: "t", text: "True" },
  { id: "f", text: "False" },
];
const FNO_QUIZ = [
  {
    id: "b1",
    section: "Basics",
    q: "Every F&O contract has an expiry date.",
    options: TRUE_FALSE,
    correct: "t",
    why: "Futures and options contracts end on a set date. After expiry, the contract no longer exists.",
  },
  {
    id: "b2",
    section: "Basics",
    q: "With futures, you can lose more than the margin you put in.",
    options: TRUE_FALSE,
    correct: "t",
    why: "Losses are calculated on the full position size, not on your margin, so they can exceed it.",
  },
  {
    id: "q1",
    section: "Concepts",
    q: "You use ₹20,000 of margin to control a ₹1,00,000 position. The market falls 5%. Roughly how much do you lose?",
    options: [
      { id: "a", text: "₹1,000" },
      { id: "b", text: "₹5,000" },
      { id: "c", text: "₹20,000" },
    ],
    correct: "b",
    why: "5% of the full ₹1,00,000 position is ₹5,000. That's 25% of your own ₹20,000.",
  },
  {
    id: "q2",
    section: "Concepts",
    q: "You bought an option and the market hasn't moved, but the option is worth less today. What's the most likely reason?",
    options: [
      { id: "a", text: "The exchange charged a penalty" },
      { id: "b", text: "Time decay as expiry gets closer" },
      { id: "c", text: "Your stop-loss was triggered" },
    ],
    correct: "b",
    why: "Options lose value every day as expiry approaches, even if the price stands still.",
  },
  {
    id: "q3",
    section: "Concepts",
    q: "What does a stop-loss do?",
    options: [
      { id: "a", text: "Guarantees you never lose money" },
      { id: "b", text: "Exits automatically at a price you set, to limit a loss" },
      { id: "c", text: "Adds to your position when the price falls" },
    ],
    correct: "b",
    why: "It's an exit order set in advance. It limits a loss but can't guarantee the exact price in a fast move.",
  },
];

// Unlock progress per user state. Returning user completed the module earlier.
const FNO_START = {
  returning: { learned: true, quizPassed: true, acknowledged: true, completedOn: "12 Aug" },
  new: { learned: false, quizPassed: false, acknowledged: false, completedOn: null },
};

// Sample rows for the unlocked placeholder screen (not live data).
const FNO_SAMPLE_CHAIN = [
  { strike: 24600, call: 212.4, put: 71.3 },
  { strike: 24700, call: 148.15, put: 104.65 },
  { strike: 24800, call: 96.8, put: 151.2 },
  { strike: 24900, call: 58.25, put: 211.9 },
];

const formatCr = (cr) => "₹" + cr.toLocaleString("en-IN") + " Cr";
const formatPct = (v) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(1) + "%";
const peStanding = (s) => {
  const r = s.pe / s.sectorPe;
  return r < 0.95 ? "Below sector" : r > 1.05 ? "Above sector" : "In line with sector";
};
const consistencyWord = (n) => (n >= 8 ? "Steady" : n >= 5 ? "Moderate" : "Uneven");

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "invest", label: "Invest", icon: LineChart },
  { id: "pay", label: "Pay", icon: Wallet },
  { id: "account", label: "Account", icon: User },
];

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Card({ children, className = "" }) {
  return (
    <section className={`mx-4 rounded-2xl bg-white p-4 ${className}`} style={{ border: `1px solid ${C.line}` }}>
      {children}
    </section>
  );
}

function SectionTitle({ children }) {
  return <h2 className="gw-display text-lg font-bold leading-tight">{children}</h2>;
}

const TONES = {
  amber: { bg: C.amberSoft, fg: C.amber },
  neutral: { bg: C.infoSoft, fg: C.info },
  mint: { bg: C.mintSoft, fg: C.mintDeep },
  grey: { bg: C.chip, fg: C.sub },
};

function Tag({ tone = "neutral", children }) {
  const t = TONES[tone];
  return (
    <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: t.bg, color: t.fg }}>
      {children}
    </span>
  );
}

function Progress({ value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mt-2.5">
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: C.track }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Emergency fund progress"
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.mint }} />
      </div>
      <div className="gw-num mt-1.5 flex justify-between text-xs">
        <span>
          <span className="font-semibold">{formatINR(value)}</span>
          <span style={{ color: C.sub }}> of {formatINR(max)}</span>
        </span>
        <span style={{ color: C.sub }}>{pct}% there</span>
      </div>
    </div>
  );
}

function IconButton({ label, children, onClick, color = C.ink }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full"
      style={{ color }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Home sections                                                       */
/* ------------------------------------------------------------------ */

function Header({ onOpenAI, showIntro }) {
  return (
    <header className="flex items-center justify-between px-5 pb-3 pt-5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="gw-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
          style={{ background: C.mintSoft, color: C.mintDeep }}
          aria-hidden="true"
        >
          {USER.initial}
        </div>
        <div className="min-w-0">
          <p className="text-xs" style={{ color: C.sub }}>Good evening</p>
          <p className="truncate text-base font-semibold">{USER.name}</p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <IconButton label="Ask AI" onClick={onOpenAI} color={C.mintDeep}>
            <Sparkles size={20} />
          </IconButton>
          {showIntro && (
            <div
              className="absolute"
              style={{ top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", zIndex: 5 }}
              role="status"
            >
              <div
                className="gw-tip relative whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium text-white"
                style={{ background: C.ink, boxShadow: "0 8px 20px -8px rgba(68,71,91,.45)" }}
              >
                <span
                  className="absolute h-2.5 w-2.5"
                  style={{ top: -4, left: "50%", marginLeft: -5, background: C.ink, transform: "rotate(45deg)" }}
                />
                Hi {USER.name}! I'm your AI assistant
              </div>
            </div>
          )}
        </div>
        <IconButton label="Search">
          <Search size={20} />
        </IconButton>
        <IconButton label="Notifications, 2 unread">
          <Bell size={20} />
          <span
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{ top: 9, right: 10, background: C.loss, border: `2px solid ${C.paper}` }}
          />
        </IconButton>
      </div>
    </header>
  );
}

function MarketStrip() {
  const [open, setOpen] = useState(false);
  const down = MARKET.change < 0;
  return (
    <div className="px-4 pb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs"
        style={{ border: `1px solid ${C.line}` }}
      >
        <ArrowDownRight size={14} className="shrink-0" style={{ color: down ? C.loss : C.mint }} />
        <span className="shrink-0 font-semibold">{MARKET.index}</span>
        <span className="gw-num shrink-0 font-medium" style={{ color: down ? C.loss : C.mintDeep }}>
          {down ? "−" : "+"}
          {Math.abs(MARKET.change)}%
        </span>
        <span className="shrink-0" style={{ color: C.sub }}>·</span>
        <span className="min-w-0 truncate" style={{ color: C.sub }}>Tap to see why</span>
        <ChevronDown
          size={14}
          className="ml-auto shrink-0"
          style={{ color: C.sub, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>
      {open && (
        <p className="gw-fade mt-2 px-3 text-xs leading-relaxed" style={{ color: C.sub }}>
          {MARKET.why}
        </p>
      )}
    </div>
  );
}

function PortfolioCard({ hidden, onToggle, onOpenHoldings }) {
  const gain = PORTFOLIO.current - PORTFOLIO.invested;
  const pct = (gain / PORTFOLIO.invested) * 100;
  const dim = { color: C.sub };

  return (
    <section className="mx-4 rounded-3xl bg-white p-5" style={{ border: `1px solid ${C.line}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm" style={dim}>Current value</p>
          <p className="gw-display gw-num mt-1 text-4xl font-bold leading-none">
            {hidden ? MASK : formatINR(PORTFOLIO.current)}
          </p>
        </div>
        <button
          onClick={onToggle}
          aria-label={hidden ? "Show amounts" : "Hide amounts"}
          aria-pressed={hidden}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: C.paper, color: C.sub }}
        >
          {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="min-w-0">
          <p className="text-xs" style={dim}>Invested</p>
          <p className="gw-num mt-0.5 text-base font-semibold">{hidden ? MASK : formatINR(PORTFOLIO.invested)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs" style={dim}>Total gain</p>
          <p className="gw-num mt-0.5 text-base font-semibold" style={{ color: C.mintDeep }}>
            {hidden ? MASK : `${formatSigned(gain)} (+${pct.toFixed(1)}%)`}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs" style={dim}>Since you started investing</p>
        <button
          onClick={onOpenHoldings}
          className="flex shrink-0 items-center gap-0.5 rounded-full py-1.5 pl-3 pr-2 text-xs font-semibold"
          style={{ background: C.mintSoft, color: C.mintDeep }}
        >
          View holdings
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}

function AllocationCard({ hidden }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <Card>
      <SectionTitle>Where your money is</SectionTitle>

      <div
        className="mt-3 flex h-3 w-full gap-1"
        role="img"
        aria-label={ALLOCATION.map((a) => `${a.label} ${a.pct} percent`).join(", ")}
      >
        {ALLOCATION.map((a) => (
          <div key={a.id} className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {ALLOCATION.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} />
              {a.label}
            </span>
            <span className="gw-num shrink-0">
              <span className="font-semibold">{a.pct}%</span>
              <span style={{ color: C.sub }}> {hidden ? MASK : formatINR((PORTFOLIO.current * a.pct) / 100)}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${C.line}` }}>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex min-w-0 items-center gap-1" style={{ color: C.sub }}>
            Trading P&amp;L this month
            <button
              onClick={() => setShowInfo((s) => !s)}
              aria-label="What is trading P&L?"
              aria-expanded={showInfo}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ color: C.sub }}
            >
              <Info size={15} />
            </button>
          </span>
          <span className="gw-num shrink-0 font-semibold" style={{ color: C.loss }}>
            {hidden ? MASK : formatSigned(TRADING_PNL_MONTH)}
          </span>
        </div>
        {showInfo && (
          <p className="gw-fade mt-1 text-xs leading-relaxed" style={{ color: C.sub }}>
            Profit or loss from stocks you bought and sold this month. It's kept separate from your long-term gain above.
          </p>
        )}
      </div>
    </Card>
  );
}

function WelcomeCard({ sip, onStart }) {
  const dim = { color: C.sub };
  return (
    <section className="mx-4 rounded-3xl p-5" style={{ background: C.mintSoft, border: `1px solid ${C.mintLine}` }}>
      {sip ? (
        <>
          <p className="gw-display text-2xl font-bold leading-tight">You're all set, {USER.name}</p>
          <p className="gw-num mt-2 text-sm leading-relaxed" style={dim}>
            Your first {formatINR(sip.amount)} goes into {sip.fund.name} on {FIRST_DEBIT}. Your portfolio will show up here after that.
          </p>
        </>
      ) : (
        <>
          <p className="gw-display text-2xl font-bold leading-tight">Hi {USER.name}</p>
          <p className="gw-display mt-1 text-xl font-semibold leading-snug" style={{ color: C.mintDeep }}>
            Your first investment can be just ₹100.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={dim}>
            Set up a monthly SIP in a couple of minutes. It runs on its own, and you can pause it anytime.
          </p>
          <button
            onClick={onStart}
            className="mt-5 w-full rounded-lg py-3 text-sm font-semibold text-white"
            style={{ background: C.forest }}
          >
            Start your first SIP
          </button>
        </>
      )}
    </section>
  );
}

function NextStepsCard({ tasks, emergencySaved, onOpen }) {
  const openCount = tasks.filter((t) => !t.done).length;
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>Your next steps</SectionTitle>
        {openCount > 0 && (
          <span
            className="gw-num flex h-6 shrink-0 items-center justify-center rounded-full px-2.5 text-xs font-semibold"
            style={{ background: C.mintSoft, color: C.mintDeep }}
            aria-label={`${openCount} to do`}
          >
            {openCount}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs" style={{ color: C.sub }}>Picked for you based on your account.</p>

      {tasks.length > 0 ? (
        <ul className="mt-2">
          {tasks.map((t, i) => (
            <li key={t.id} style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
              {t.done ? (
                <div className="gw-fade flex w-full items-center gap-3 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: C.mint }}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug" style={{ color: C.sub, textDecoration: "line-through" }}>
                      {t.title}
                    </p>
                    {t.doneDetail && (
                      <p className="gw-num mt-0.5 text-xs" style={{ color: C.mintDeep }}>{t.doneDetail}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-semibold" style={{ color: C.mintDeep }}>Done</span>
                </div>
              ) : (
                <button
                  onClick={() => onOpen(t.id)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{t.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: C.sub }}>{t.detail}</p>
                    {t.id === "emergency" && <Progress value={emergencySaved} max={EMERGENCY.target} />}
                  </div>
                  <span className="flex shrink-0 items-center text-xs font-semibold" style={{ color: C.mintDeep }}>
                    {t.action}
                    <ChevronRight size={16} />
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="gw-fade mt-3 rounded-xl p-3 text-sm" style={{ background: C.mintSoft, color: C.mintDeep }}>
          You're all caught up. New steps show up here when there's something worth doing.
        </p>
      )}
    </Card>
  );
}

function LearnCard() {
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer] = useState(null);
  const answered = answer !== null;
  const gotIt = answer === QUIZ.correctId;

  const optionStyle = (id) => {
    if (!answered) return { background: "#fff", border: `1.5px solid ${C.line}`, color: C.ink };
    if (id === QUIZ.correctId) return { background: C.mintSoft, border: `1.5px solid ${C.mint}`, color: C.mintDeep };
    if (id === answer) return { background: C.lossSoft, border: `1.5px solid ${C.loss}`, color: C.loss };
    return { background: "#fff", border: `1.5px solid ${C.line}`, color: C.sub, opacity: 0.6 };
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>Learn</SectionTitle>
        {answered && (
          <span
            className="gw-pop shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: C.amberSoft, color: C.amber }}
            aria-live="polite"
          >
            <Flame size={13} className="mr-1 inline-block align-[-2px]" aria-hidden="true" />
            {QUIZ.streakAfter}-day streak
          </span>
        )}
      </div>

      {/* Reel */}
      <button onClick={() => setPlaying(true)} className="mt-3 flex w-full gap-3 rounded-xl text-left" aria-label="Play 60-second reel: What is an expense ratio?">
        <div
          className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl"
          style={{ background: C.forest }}
        >
          <span className="gw-display absolute left-2 top-2 text-2xl font-bold" style={{ color: "rgba(255,255,255,.22)" }}>
            0.1%
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,.92)" }}>
              <Play size={15} fill={C.forest} color={C.forest} style={{ marginLeft: 2 }} />
            </span>
          </span>
          <span
            className="gw-num absolute rounded px-1 font-semibold text-white"
            style={{ bottom: 8, right: 6, fontSize: 10, background: "rgba(0,0,0,.35)" }}
          >
            1:00
          </span>
          {playing && (
            <div className="absolute bottom-0 left-0 h-1 w-full" style={{ background: "rgba(255,255,255,.2)" }}>
              <div className="gw-reel-bar h-full" style={{ background: C.mint }} />
            </div>
          )}
        </div>
        <div className="min-w-0 py-1">
          <p className="gw-display text-base font-bold leading-snug">What is an expense ratio?</p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.sub }}>
            {playing ? "Playing…" : "The yearly fee a fund charges, and why a small one adds up over time."}
          </p>
          <p className="mt-2 text-xs font-medium" style={{ color: C.sub }}>60-second reel</p>
        </div>
      </button>

      {/* Daily quiz */}
      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
        <p className="text-xs font-medium" style={{ color: C.sub }}>
          {answered ? "Daily quiz" : "Daily quiz · answer to keep your streak"}
        </p>
        <p className="mt-1 text-sm font-medium leading-snug">{QUIZ.question}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUIZ.options.map((o) => (
            <button
              key={o.id}
              disabled={answered}
              onClick={() => setAnswer(o.id)}
              className="gw-num flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold"
              style={{ ...optionStyle(o.id), transition: "background .15s, border-color .15s" }}
            >
              {answered && o.id === QUIZ.correctId && <Check size={15} strokeWidth={3} />}
              {answered && o.id === answer && o.id !== QUIZ.correctId && <X size={15} strokeWidth={3} />}
              {o.label}
            </button>
          ))}
        </div>
        {answered && (
          <p className="gw-fade mt-3 text-xs leading-relaxed" role="status" style={{ color: gotIt ? C.mintDeep : C.loss }}>
            {gotIt ? QUIZ.right : QUIZ.wrong}
            <span style={{ color: C.sub }}> Next question tomorrow.</span>
          </p>
        )}
      </div>
    </Card>
  );
}

function StartHere() {
  return (
    <section>
      <div className="px-5">
        <SectionTitle>Start here</SectionTitle>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.sub }}>
          Low-cost NIFTY 50 index funds. One fund holds India's 50 largest companies, so you don't have to pick them yourself.
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {FUNDS.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start gap-3">
              <div
                className="gw-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                aria-hidden="true"
              >
                {f.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{f.name}</p>
                  {f.tag && <Tag tone="mint">{f.tag}</Tag>}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: C.sub }}>Direct plan, growth</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl p-3" style={{ background: C.paper }}>
              <div>
                <p className="text-xs" style={{ color: C.sub }}>Expense ratio</p>
                <p className="gw-num mt-0.5 text-sm font-semibold">{f.expense.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: C.sub }}>3Y return</p>
                <p className="gw-num mt-0.5 text-sm font-semibold">
                  {f.return3y.toFixed(1)}% p.a.
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="gw-num text-xs" style={{ color: C.sub }}>Min SIP {formatINR(f.minSip)}</span>
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: C.forest }}>
                Start SIP
              </button>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-3 px-5 text-xs leading-relaxed" style={{ color: C.sub }}>
        Mock data for this prototype. Past returns don't guarantee future returns.
      </p>
    </section>
  );
}

function HomeScreen({
  hidden,
  onToggleHidden,
  tasks,
  emergencySaved,
  onOpenTask,
  onOpenAI,
  showIntro,
  isNew,
  firstSip,
  onStartFirstSip,
  onOpenHoldings,
}) {
  return (
    <div className="pb-8">
      <Header onOpenAI={onOpenAI} showIntro={showIntro} />
      <MarketStrip />
      <div className="space-y-4">
        {isNew ? (
          // New users never see a ₹0 portfolio: welcome card instead, and no split bar or trading P&L.
          <WelcomeCard sip={firstSip} onStart={onStartFirstSip} />
        ) : (
          <>
            <PortfolioCard hidden={hidden} onToggle={onToggleHidden} onOpenHoldings={onOpenHoldings} />
            <AllocationCard hidden={hidden} />
          </>
        )}
        <NextStepsCard tasks={tasks} emergencySaved={emergencySaved} onOpen={onOpenTask} />
        <LearnCard />
        <div className="pt-2">
          <StartHere />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Invest tab and stock flow (Phase 3)                                 */
/* ------------------------------------------------------------------ */

function StockLogo({ s, size = 40 }) {
  return (
    <div
      className="gw-display flex shrink-0 items-center justify-center rounded-xl text-sm font-bold"
      style={{ width: size, height: size, background: "#fff", border: `1px solid ${C.line}`, color: C.ink }}
      aria-hidden="true"
    >
      {s.initials}
    </div>
  );
}

function ConsistencyBadge({ score }) {
  const tone = score >= 8 ? TONES.mint : score >= 5 ? TONES.amber : TONES.grey;
  return (
    <span
      className="gw-num inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: tone.bg, color: tone.fg }}
      aria-label={`3-year consistency ${score} out of 10, ${consistencyWord(score)}`}
    >
      {score}/10 {consistencyWord(score)}
    </span>
  );
}

function PlanTag({ intent }) {
  const p = planById(intent) || planById("skip");
  return <Tag tone={p.tone}>{p.tag}</Tag>;
}

function HoldingsCard({ holdings, onOpenStock }) {
  const total = holdings.reduce((sum, h) => sum + h.qty * stockById(h.stockId).price, 0);
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <SectionTitle>Your stocks</SectionTitle>
        {holdings.length > 0 && <span className="gw-num shrink-0 text-sm font-semibold">{formatINR(total)}</span>}
      </div>
      {holdings.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
          You don't own any stocks yet. When you buy one, the plan you pick shows up here.
        </p>
      ) : (
        <ul className="mt-1">
          {holdings.map((h, i) => {
            const s = stockById(h.stockId);
            return (
              <li key={h.id} style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
                <button onClick={() => onOpenStock(s.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <StockLogo s={s} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <div className="mt-1">
                      <PlanTag intent={h.intent} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="gw-num text-sm font-semibold">{formatINR(h.qty * s.price)}</p>
                    <p className="gw-num text-xs" style={{ color: C.sub }}>
                      {h.qty} {h.qty === 1 ? "share" : "shares"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

const INVEST_TABS = [
  { id: "mf", label: "Mutual Funds" },
  { id: "stocks", label: "Stocks" },
  { id: "fno", label: "F&O" },
];

function InvestScreen({
  investTab,
  onInvestTab,
  holdings,
  onOpenStock,
  myFunds,
  onOpenFund,
  isNew,
  fnoProgress,
  onStartFno,
  onReviewFno,
}) {
  return (
    <div className="pb-8">
      <header className="px-5 pb-3 pt-6">
        <h1 className="gw-display text-2xl font-bold">Invest</h1>
      </header>

      {/* Section navigation: sticks to the top while the list scrolls */}
      <div className="sticky top-0 px-4 pb-3 pt-1" style={{ background: C.paper, zIndex: 3 }}>
        <div className="grid grid-cols-3 gap-1 rounded-full bg-white p-1" style={{ border: `1px solid ${C.line}` }} role="tablist" aria-label="Invest sections">
          {INVEST_TABS.map((t) => {
            const active = investTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => onInvestTab(t.id)}
                className="rounded-full py-2 text-sm font-semibold"
                style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.ink }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="pt-1">
        {investTab === "stocks" && <StocksTab holdings={holdings} onOpenStock={onOpenStock} />}
        {investTab === "mf" && <MfTab myFunds={myFunds} onOpenFund={onOpenFund} />}
        {investTab === "fno" && <FnoTab isNew={isNew} progress={fnoProgress} onStart={onStartFno} onReview={onReviewFno} />}
      </div>
    </div>
  );
}

function StocksTab({ holdings, onOpenStock }) {
  return (
    <div className="space-y-5">
      <HoldingsCard holdings={holdings} onOpenStock={onOpenStock} />

      <section>
        <div className="px-5">
          <SectionTitle>Stocks to explore</SectionTitle>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: C.sub }}>
            Large and mid-sized companies, shown by how steady they've been rather than by today's move.
          </p>
        </div>
        <ul className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white" style={{ border: `1px solid ${C.line}` }}>
          {STOCKS.map((s, i) => (
            <li key={s.id} style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
              <button onClick={() => onOpenStock(s.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <StockLogo s={s} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="gw-num mt-0.5 text-xs leading-snug" style={{ color: C.sub }}>
                    {s.tier}, P/E {s.pe.toFixed(1)} vs sector {s.sectorPe.toFixed(1)}
                  </p>
                  <div className="mt-1.5">
                    <ConsistencyBadge score={s.consistency} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="gw-num text-sm font-medium">{formatINR(s.price)}</p>
                  <p className="gw-num mt-0.5 text-xs" style={{ color: C.sub }}>{formatPct(s.dayChange)} today</p>
                </div>
                <ChevronRight size={16} className="shrink-0" style={{ color: C.sub }} />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 px-5 text-xs leading-relaxed" style={{ color: C.sub }}>
          3-year consistency is a 1–10 score for how steadily revenue and profit grew and how much the price swung. Fictional companies and mock data for this prototype.
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mutual funds (Phase 6)                                              */
/* ------------------------------------------------------------------ */

function RiskMeter({ risk }) {
  const level = RISK_LEVELS.indexOf(risk);
  return (
    <span className="flex items-center gap-2" aria-label={`Risk: ${risk}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {RISK_LEVELS.map((r, i) => (
          <span key={r} className="h-1.5 w-3 rounded-full" style={{ background: i <= level ? RISK_COLORS[i] : C.track }} />
        ))}
      </span>
      <span className="text-xs font-semibold">{risk}</span>
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs" style={{ color: C.sub }}>{label}</p>
      <p className="gw-num mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function FundCard({ f, onOpen }) {
  return (
    <button onClick={() => onOpen(f.id)} className="w-full rounded-2xl bg-white p-4 text-left" style={{ border: `1px solid ${C.line}` }}>
      <div className="flex items-start gap-3">
        <StockLogo s={f} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{f.name}</p>
          <div className="mt-1">
            <Tag tone="grey">{f.category}</Tag>
          </div>
        </div>
        <ChevronRight size={16} className="mt-1 shrink-0" style={{ color: C.sub }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl p-2.5" style={{ background: C.paper }}>
        <Stat label="Expense ratio" value={`${f.expense.toFixed(2)}%`} />
        <Stat label="3Y return" value={`${f.return3y.toFixed(1)}% p.a.`} />
        <Stat label="Min SIP" value={formatINR(f.minSip)} />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: C.sub }}>Risk level</span>
        <RiskMeter risk={f.risk} />
      </div>
    </button>
  );
}

function YourFunds({ myFunds, onOpenFund }) {
  const total = myFunds.reduce((s, h) => s + h.value, 0);
  return (
    <section className="mx-4">
      <div className="flex items-baseline justify-between gap-2">
        <SectionTitle>Your funds</SectionTitle>
        <span className="gw-num text-sm font-semibold">{formatINR(total)}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {myFunds.map((h) => {
          const f = fundById(h.fundId);
          return (
            <button
              key={h.fundId}
              onClick={() => onOpenFund(f.id)}
              className="min-w-0 rounded-2xl bg-white p-3 text-left"
              style={{ border: `1px solid ${C.line}` }}
            >
              <StockLogo s={f} size={28} />
              <p className="mt-2 text-sm font-semibold leading-snug">{f.name}</p>
              <p className="gw-display gw-num mt-1 text-lg font-bold">
                {h.value > 0 ? formatINR(h.value) : `Starts ${FIRST_DEBIT}`}
              </p>
              <p className="gw-num text-xs" style={{ color: C.sub }}>{h.note}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MfTab({ myFunds, onOpenFund }) {
  const [filter, setFilter] = useState("all");
  const active = MF_FILTERS.find((x) => x.id === filter);
  const list = filter === "all" ? MF_FUNDS : MF_FUNDS.filter((f) => f.filters.includes(filter));

  return (
    <div className="space-y-5">
      {myFunds.length > 0 && <YourFunds myFunds={myFunds} onOpenFund={onOpenFund} />}

      <section>
        <div className="flex flex-wrap gap-2 px-4" role="radiogroup" aria-label="Filter funds">
          {MF_FILTERS.map((x) => {
            const on = filter === x.id;
            return (
              <button
                key={x.id}
                role="radio"
                aria-checked={on}
                onClick={() => setFilter(x.id)}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium"
                style={{
                  background: on ? C.mintSoft : "#fff",
                  border: `1.5px solid ${on ? C.mint : C.line}`,
                  color: on ? C.mintDeep : C.ink,
                }}
              >
                {x.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-5 text-xs" style={{ color: C.sub }}>{active.hint}</p>

        <div className="mt-3 space-y-3 px-4">
          {list.map((f) => (
            <FundCard key={f.id} f={f} onOpen={onOpenFund} />
          ))}
        </div>
        <p className="mt-3 px-5 text-xs leading-relaxed" style={{ color: C.sub }}>
          Illustrative data. Generic fund names for this prototype. Past returns don't guarantee future returns.
        </p>
      </section>
    </div>
  );
}

// Deterministic mock path: monthly values for ₹10,000 that end exactly at the fund's 3-year return.
function fundSeries(f) {
  let seed = [...f.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const vol = { "Very High": 0.045, High: 0.03, "Moderately High": 0.02, Moderate: 0.008, "Low to Moderate": 0.002, Low: 0.001 }[f.risk];
  const monthly = Math.pow(1 + f.return3y / 100, 1 / 12) - 1;
  const pts = [10000];
  for (let i = 1; i <= 36; i++) pts.push(pts[i - 1] * (1 + monthly + (rand() - 0.5) * 2 * vol));
  const k = (10000 * Math.pow(1 + f.return3y / 100, 3)) / pts[36];
  return pts.map((v, i) => v * Math.pow(k, i / 36));
}

function FundChart({ f }) {
  const pts = fundSeries(f);
  const W = 320, H = 120, P = 6;
  const min = Math.min(...pts), max = Math.max(...pts);
  const x = (i) => P + (i / 36) * (W - 2 * P);
  const y = (v) => P + (1 - (v - min) / (max - min || 1)) * (H - 2 * P);
  const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(36).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  const end = pts[36];

  return (
    <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
      <p className="text-xs font-medium" style={{ color: C.sub }}>Last 3 years</p>
      <p className="gw-num mt-1 text-sm leading-snug">
        ₹10,000 invested 3 years ago would be about <span className="font-semibold">{formatINR(end)}</span> now.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`Illustrative chart: ₹10,000 grows to about ${formatINR(end)} over 3 years`}
      >
        <path d={area} fill={C.mintSoft} />
        <path d={line} fill="none" stroke={C.mintDeep} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(36)} cy={y(end)} r="3.5" fill={C.mintDeep} />
      </svg>
      <div className="mt-1 flex justify-between text-xs" style={{ color: C.sub }}>
        <span>Oct 2023</span>
        <span>Oct 2026</span>
      </div>
    </div>
  );
}

function InvestOnceSheet({ f, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");
  const n = parseInt(amount || "0", 10);
  const error = amount && n < f.minOnce ? `Minimum is ${formatINR(f.minOnce)}.` : "";
  const valid = n >= f.minOnce;

  return (
    <BottomSheet label={`Invest once in ${f.name}`} onClose={onClose}>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="gw-display text-lg font-bold leading-tight">Invest once</h2>
          <p className="mt-0.5 text-xs" style={{ color: C.sub }}>{f.name}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5">
        <Field label="Amount" hint={`Minimum ${formatINR(f.minOnce)}`} error={error}>
          <div className="flex items-center rounded-xl" style={inputStyle(error)}>
            <span className="gw-display pl-4 text-2xl font-bold" style={{ color: C.sub }}>₹</span>
            <input
              value={amount ? Number(amount).toLocaleString("en-IN") : ""}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              placeholder="0"
              aria-label="Amount in rupees"
              className="gw-display gw-num w-full min-w-0 rounded-xl bg-transparent px-2 py-3 text-2xl font-bold outline-none"
            />
          </div>
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          {INVEST_ONCE_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="gw-num rounded-full bg-white px-3.5 py-2 text-sm font-medium"
              style={{ border: `1.5px solid ${n === q ? C.mint : C.line}`, color: n === q ? C.mintDeep : C.ink }}
            >
              {formatINR(q)}
            </button>
          ))}
        </div>
        {f.id === "elss" && (
          <p className="mt-3 flex gap-1.5 text-xs leading-relaxed" style={{ color: C.amber }}>
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>This money is locked in for 3 years from the date you invest.</span>
          </p>
        )}
      </div>

      <div className="mt-5">
        <PrimaryButton disabled={!valid} onClick={() => onConfirm(n)}>
          {valid ? `Invest ${formatINR(n)}` : "Enter an amount"}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function FundDetail({ f, showTip, onTipSeen, onBack, onStartSip, onInvestOnce, onAskAI }) {
  // Expense ratio explainer: only on the first fund detail opened this session.
  const [tip, setTip] = useState(showTip);
  useEffect(() => {
    if (showTip) onTipSeen();
  }, []);
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState(null);

  if (done) {
    return (
      <SuccessView
        title="Investment placed"
        body={`${formatINR(done)} in ${f.name}. Units are allotted at the day's NAV, usually within 1 working day.`}
        doneLabel="Done"
        onDone={onBack}
      />
    );
  }

  return (
    <div className="relative h-full">
      <SubPage
        title={f.name}
        onBack={onBack}
        footer={
          <div className="flex gap-2">
            <div className="flex-1">
              <SecondaryButton onClick={() => setSheet(true)}>Invest once</SecondaryButton>
            </div>
            <div className="flex-1">
              <PrimaryButton onClick={onStartSip}>Start SIP</PrimaryButton>
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <StockLogo s={f} size={48} />
          <div className="min-w-0 space-y-1.5">
            <Tag tone="grey">{f.category}</Tag>
            <RiskMeter risk={f.risk} />
          </div>
        </div>

        {tip && (
          <div className="gw-fade mt-4 flex gap-2 rounded-xl p-3" style={{ background: C.mintSoft, color: C.ink }} role="note">
            <Info size={16} className="mt-0.5 shrink-0" style={{ color: C.mintDeep }} />
            <p className="flex-1 text-xs leading-relaxed">
              <span className="font-semibold" style={{ color: C.mintDeep }}>What is an expense ratio?</span> It's the yearly fee the fund charges. 0.20% means ₹2 per year on every ₹1,000 invested.
            </p>
            <button onClick={() => setTip(false)} aria-label="Dismiss" className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
          <Stat label="Expense ratio" value={`${f.expense.toFixed(2)}% a year`} />
          <Stat label="3-year return" value={`${f.return3y.toFixed(1)}% a year`} />
          <Stat label="Risk level" value={f.risk} />
          <Stat label="Minimum SIP" value={formatINR(f.minSip)} />
        </div>

        <div className="mt-4">
          <FundChart f={f} />
        </div>

        <h2 className="gw-display mt-6 text-lg font-bold">What this fund does</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
          {f.about.join(" ")}
        </p>

        <button onClick={onAskAI} className="mt-4 flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.mintDeep }}>
          <Sparkles size={15} />
          Ask AI about this fund
        </button>
        <p className="mt-4 text-xs" style={{ color: C.sub }}>Illustrative data. Past returns don't guarantee future returns.</p>
      </SubPage>

      {sheet && (
        <div className="absolute inset-0 z-10">
          <InvestOnceSheet
            f={f}
            onClose={() => setSheet(false)}
            onConfirm={(amt) => {
              onInvestOnce(amt);
              setSheet(false);
              setDone(amt);
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Account (Phase 6)                                                   */
/* ------------------------------------------------------------------ */

function AccountScreen({ isNew, fnoProgress, nomineeAdded, onOpenFno }) {
  const unlocked = fnoProgress.acknowledged;
  const rows = [
    {
      label: "Risk level",
      value: isNew ? "Not set yet" : "Moderate",
      hint: isNew ? "Take the 2-minute risk quiz from Home." : "From your risk quiz.",
    },
    {
      label: "F&O",
      value: `F&O: ${unlocked ? "Unlocked" : "Locked"}`,
      hint: unlocked ? `Module completed ${fnoProgress.completedOn}.` : "Finish the module in Invest to unlock.",
      tone: unlocked ? "mint" : "grey",
      onClick: onOpenFno,
    },
    { label: "Nominee", value: nomineeAdded ? "Added" : "Not added", tone: nomineeAdded ? "mint" : "amber" },
  ];

  return (
    <div className="pb-8">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <div
          className="gw-display flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
          style={{ background: C.mintSoft, color: C.mintDeep }}
          aria-hidden="true"
        >
          {USER.initial}
        </div>
        <div>
          <h1 className="gw-display text-2xl font-bold leading-tight">{USER.name}</h1>
          <p className="text-xs" style={{ color: C.sub }}>Account</p>
        </div>
      </header>

      <Card>
        <SectionTitle>Risk profile</SectionTitle>
        <ul className="mt-2">
          {rows.map((r, i) => {
            const body = (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" style={{ color: C.sub }}>{r.label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{r.value}</p>
                  {r.hint && <p className="mt-0.5 text-xs" style={{ color: C.sub }}>{r.hint}</p>}
                </div>
                {r.tone && <Tag tone={r.tone}>{r.tone === "mint" ? "Done" : "To do"}</Tag>}
                {r.onClick && <ChevronRight size={16} className="shrink-0" style={{ color: C.sub }} />}
              </>
            );
            return (
              <li key={r.label} style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
                {r.onClick ? (
                  <button onClick={r.onClick} className="flex w-full items-center gap-3 py-3 text-left">
                    {body}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, chip, children }) {
  return (
    <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
      <p className="text-xs font-medium" style={{ color: C.sub }}>{title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="gw-display gw-num text-xl font-bold">{value}</p>
        {chip}
      </div>
      <div className="mt-2 text-xs leading-relaxed" style={{ color: C.sub }}>{children}</div>
    </div>
  );
}

function OrderSheet({ stock, onClose, onConfirm }) {
  const [qtyText, setQtyText] = useState("1");
  const [plan, setPlan] = useState(null);
  const qty = parseInt(qtyText || "0", 10);
  const amount = qty * stock.price;
  const step = (d) => setQtyText(String(Math.min(999, Math.max(1, (qty || 0) + d))));
  const canConfirm = qty >= 1 && !!plan;

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end" role="dialog" aria-label={`Buy ${stock.name}`}>
      <button aria-label="Close order" onClick={onClose} className="gw-fade absolute inset-0" style={{ background: C.scrim }} />
      <div
        className="gw-rise gw-scroll relative overflow-y-auto rounded-t-3xl bg-white px-5 pt-3"
        style={{ maxHeight: "92%", paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto h-1 w-10 rounded-full" style={{ background: C.track }} />
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="gw-display text-lg font-bold leading-tight">Buy {stock.name}</h2>
            <p className="gw-num mt-0.5 text-xs" style={{ color: C.sub }}>Market price {formatINR(stock.price)} per share</p>
          </div>
          <button onClick={onClose} aria-label="Close order" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Quantity</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => step(-1)}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold"
              style={{ border: `1.5px solid ${C.line}`, color: qty <= 1 ? C.faint : C.ink }}
            >
              −
            </button>
            <input
              value={qtyText}
              onChange={(e) => setQtyText(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onBlur={() => qty < 1 && setQtyText("1")}
              inputMode="numeric"
              aria-label="Quantity"
              className="gw-num w-14 rounded-xl py-2 text-center text-base font-semibold outline-none"
              style={{ border: `1.5px solid ${C.line}` }}
            />
            <button
              onClick={() => step(1)}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold"
              style={{ border: `1.5px solid ${C.line}`, color: C.ink }}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3 rounded-xl p-3" style={{ background: C.paper }}>
          <span className="text-sm" style={{ color: C.sub }}>Estimated amount</span>
          <span className="gw-display gw-num text-xl font-bold">{qty >= 1 ? formatINR(amount) : "—"}</span>
        </div>
        <p className="mt-1.5 text-xs" style={{ color: C.sub }}>The final amount can differ slightly if the price moves before your order fills.</p>

        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <p className="text-sm font-semibold">What's your plan for this stock?</p>
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: C.sub }}>
            One tap. It shows as a tag on your holding and doesn't limit what you can do later.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Your plan">
            {BUY_PLANS.map((p) => {
              const active = plan === p.id;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPlan(p.id)}
                  className="rounded-xl px-2 py-2.5 text-center"
                  style={{
                    background: active ? C.mintSoft : "#fff",
                    border: `1.5px solid ${active ? C.mint : C.line}`,
                    color: active ? C.mintDeep : C.ink,
                  }}
                >
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: active ? C.mintDeep : C.sub }}>{p.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton disabled={!canConfirm} onClick={() => onConfirm(qty, plan)}>
            {canConfirm ? "Confirm buy" : qty < 1 ? "Enter a quantity" : "Pick a plan, or tap Skip"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function StockPage({ stock, owned, onBack, onBuy, onAskAI, onDone, onSell }) {
  const [sheet, setSheet] = useState(false);
  const [order, setOrder] = useState(null);

  if (order) {
    const p = planById(order.plan);
    return (
      <SuccessView
        title="Order placed"
        body={`${order.qty} ${order.qty === 1 ? "share" : "shares"} of ${stock.name} for about ${formatINR(order.qty * stock.price)}. ${p.tag}.`}
        doneLabel="View your stocks"
        onDone={onDone}
      />
    );
  }

  const peRounded = Math.round(stock.pe);
  const sectorRounded = Math.round(stock.sectorPe);

  return (
    <div className="relative h-full">
      <SubPage title={stock.name} onBack={onBack} footer={<PrimaryButton onClick={() => setSheet(true)}>Buy</PrimaryButton>}>
        <div className="flex items-center gap-3">
          <StockLogo s={stock} size={48} />
          <div className="min-w-0">
            <p className="text-sm" style={{ color: C.sub }}>{stock.sector}</p>
            <div className="mt-1">
              <Tag tone="grey">{stock.tier}</Tag>
            </div>
          </div>
        </div>
        <p className="gw-display gw-num mt-4 text-3xl font-bold leading-none">{formatINR(stock.price)}</p>
        <p className="gw-num mt-1.5 text-xs" style={{ color: C.sub }}>{formatPct(stock.dayChange)} today</p>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: C.sub }}>{stock.about}</p>

        {owned.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white px-4" style={{ border: `1px solid ${C.line}` }}>
            {owned.map((h, i) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 py-3"
                style={i ? { borderTop: `1px solid ${C.line}` } : undefined}
              >
                <div className="min-w-0">
                  <p className="gw-num text-sm font-semibold">
                    You own {h.qty} {h.qty === 1 ? "share" : "shares"}
                  </p>
                  <p className="gw-num text-xs" style={{ color: C.sub }}>
                    {formatINR(h.qty * stock.price)}, {formatAgo(h.boughtDaysAgo).toLowerCase()}
                  </p>
                  <div className="mt-1">
                    <PlanTag intent={h.intent} />
                  </div>
                </div>
                <SellButton onClick={() => onSell(h)} label={`Sell ${stock.name}`} />
              </div>
            ))}
          </div>
        )}

        <h2 className="gw-display mt-6 text-lg font-bold">Key numbers</h2>
        <div className="mt-3 space-y-3">
          <MetricCard title="3-year consistency" value={`${stock.consistency}/10`} chip={<ConsistencyBadge score={stock.consistency} />}>
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < stock.consistency ? C.mint : C.track }} />
              ))}
            </div>
            <p className="mt-2">
              Revenue grew in {stock.revenueYears} of the last 3 years and profit in {stock.profitYears} of 3. {stock.swings} price swings.
            </p>
          </MetricCard>

          <MetricCard
            title="P/E vs sector"
            value={`${stock.pe.toFixed(1)} vs ${stock.sectorPe.toFixed(1)}`}
            chip={<Tag tone="grey">{peStanding(stock)}</Tag>}
          >
            You pay about ₹{peRounded} for every ₹1 of the company's yearly profit. The sector average is about ₹{sectorRounded}.
          </MetricCard>

          <MetricCard title="Market cap" value={formatCr(stock.mcapCr)} chip={<Tag tone="grey">{stock.tier}</Tag>}>
            {stock.tier === "Large cap"
              ? "Among India's 100 biggest listed companies by total share value."
              : "Ranked 101–250 among India's listed companies by total share value."}
          </MetricCard>
        </div>

        <button onClick={onAskAI} className="mt-4 flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.mintDeep }}>
          <Sparkles size={15} />
          What do these numbers mean? Ask AI
        </button>
        <p className="mt-4 text-xs" style={{ color: C.sub }}>Fictional company and mock data for this prototype.</p>
      </SubPage>

      {sheet && (
        <OrderSheet
          stock={stock}
          onClose={() => setSheet(false)}
          onConfirm={(qty, plan) => {
            onBuy(qty, plan);
            setSheet(false);
            setOrder({ qty, plan });
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* F&O tab: locked until earned (Phases 5 and 6)                       */
/* ------------------------------------------------------------------ */

const FNO_STEPS = [
  { id: "learned", label: "Learn" },
  { id: "quizPassed", label: "Quiz" },
  { id: "acknowledged", label: "Acknowledge" },
];

function FnoTracker({ progress }) {
  const current = FNO_STEPS.findIndex((s) => !progress[s.id]);
  return (
    <ol className="flex items-start" aria-label="Steps to unlock F&O">
      {FNO_STEPS.map((s, i) => {
        const done = !!progress[s.id];
        const isCurrent = i === current;
        return (
          <li key={s.id} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className="absolute h-0.5"
                style={{ top: 13, right: "50%", width: "100%", background: progress[FNO_STEPS[i - 1].id] ? C.mint : C.track }}
                aria-hidden="true"
              />
            )}
            <span
              className="relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                zIndex: 1,
                background: done ? C.mint : "#fff",
                border: `2px solid ${done ? C.mint : isCurrent ? C.forest : C.control}`,
                color: isCurrent ? C.forest : C.sub,
              }}
            >
              {done ? <Check size={14} color="#fff" strokeWidth={3} /> : i + 1}
            </span>
            <span className="mt-1.5 text-xs font-medium" style={{ color: done || isCurrent ? C.ink : C.sub }}>
              {s.label}
              <span className="sr-only">{done ? ", done" : isCurrent ? ", current step" : ", not started"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function FnoMockScreen() {
  return (
    <section className="mx-4 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
      <p className="flex gap-1.5 text-xs leading-relaxed" style={{ color: C.amber }}>
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>Reminder: 9 in 10 individual traders lost money in F&amp;O in FY25.</span>
      </p>
      <div className="relative mt-3 overflow-hidden rounded-xl" style={{ border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold" style={{ background: C.paper }}>
          <span>NIFTY 50 options</span>
          <span style={{ color: C.sub }}>Sample data</span>
        </div>
        <table className="gw-num w-full text-xs" aria-label="Sample option chain">
          <thead>
            <tr style={{ color: C.sub }}>
              <th className="px-3 py-1.5 text-left font-medium">Call</th>
              <th className="px-3 py-1.5 text-center font-medium">Strike</th>
              <th className="px-3 py-1.5 text-right font-medium">Put</th>
            </tr>
          </thead>
          <tbody style={{ opacity: 0.55 }}>
            {FNO_SAMPLE_CHAIN.map((r) => (
              <tr key={r.strike} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="px-3 py-2 text-left">{formatINR2(r.call)}</td>
                <td className="px-3 py-2 text-center font-semibold">{r.strike.toLocaleString("en-IN")}</td>
                <td className="px-3 py-2 text-right">{formatINR2(r.put)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          className="absolute inset-x-0 bottom-0 px-3 py-2 text-center text-xs font-medium"
          style={{ background: "#fff", borderTop: `1px solid ${C.line}` }}
        >
          Mock screen. F&amp;O trading isn't part of this prototype.
        </div>
      </div>
    </section>
  );
}

function FnoTab({ isNew, progress, onStart, onReview }) {
  const unlocked = progress.acknowledged;
  const started = progress.learned || progress.quizPassed;
  const reviewLink = (
    <button onClick={onReview} className="mt-3 flex items-center gap-1 text-sm font-semibold" style={{ color: C.mintDeep }}>
      Revisit F&amp;O basics
      <ChevronRight size={15} />
    </button>
  );

  return (
    <div className="space-y-4">
      {isNew ? (
        <section
          className="mx-4 rounded-2xl bg-white p-4"
          style={{ border: unlocked ? `1px solid ${C.line}` : `1.5px dashed ${C.control}` }}
        >
          <div className="flex items-center gap-2">
            {unlocked ? <LockOpen size={18} color={C.mintDeep} aria-hidden="true" /> : <Lock size={18} color={C.sub} aria-hidden="true" />}
            <SectionTitle>Advanced: F&amp;O</SectionTitle>
            <span className="ml-auto">
              <Tag tone={unlocked ? "mint" : "grey"}>{unlocked ? "Unlocked" : "Locked"}</Tag>
            </span>
          </div>
          {!unlocked && (
            <p className="mt-3 rounded-xl p-3 text-sm leading-relaxed" style={{ background: C.amberSoft, color: C.amber }}>
              {FNO_STAT}
            </p>
          )}
          <div className="mt-4">
            <FnoTracker progress={progress} />
          </div>
          {unlocked ? (
            <>
              <p className="mt-4 text-sm" style={{ color: C.sub }}>Module completed {progress.completedOn}.</p>
              {reviewLink}
            </>
          ) : (
            <button
              onClick={onStart}
              className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold"
              style={{ border: `1.5px solid ${C.forest}`, color: C.forest }}
            >
              {started ? "Continue module" : "Start module"}
            </button>
          )}
        </section>
      ) : (
        <section className="mx-4 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2">
            <LockOpen size={18} color={C.mintDeep} aria-hidden="true" />
            <SectionTitle>F&amp;O</SectionTitle>
            <span className="ml-auto">
              <Tag tone="mint">Unlocked</Tag>
            </span>
          </div>
          <p className="mt-2 text-sm" style={{ color: C.sub }}>Module completed {progress.completedOn}</p>
          {reviewLink}
        </section>
      )}

      {unlocked && <FnoMockScreen />}
    </div>
  );
}

function ConceptCarousel({ index, setIndex }) {
  const startX = useRef(null);
  const [drag, setDrag] = useState(0);
  const n = FNO_CARDS.length;

  const end = () => {
    if (startX.current === null) return;
    if (drag < -50 && index < n - 1) setIndex(index + 1);
    else if (drag > 50 && index > 0) setIndex(index - 1);
    startX.current = null;
    setDrag(0);
  };

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        startX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (startX.current !== null) setDrag(e.clientX - startX.current);
      }}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      role="region"
      aria-roledescription="carousel"
      aria-label="F&O concepts"
    >
      <div
        className="flex"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${drag}px))`,
          transition: startX.current === null ? "transform .3s ease" : "none",
        }}
      >
        {FNO_CARDS.map((c, i) => (
          <article
            key={c.id}
            className="w-full shrink-0 select-none overflow-hidden rounded-3xl bg-white"
            style={{ border: `1px solid ${C.line}` }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}: ${c.title}`}
            aria-hidden={i !== index}
          >
            <div className="flex h-28 items-end px-5 pb-4" style={{ background: C.mintSoft }}>
              <span className="gw-display gw-num text-4xl font-bold leading-none" style={{ color: C.mintDeep }}>{c.big}</span>
            </div>
            <div className="p-5">
              <h2 className="gw-display text-xl font-bold">{c.title}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: C.sub }}>
                {c.body.map((para, k) => (
                  <p key={k} className="gw-num">{para}</p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FnoModule({ progress, onProgress, onUnlock, onBack, reviewOnly = false }) {
  const startStage = reviewOnly || !progress.learned ? "cards" : !progress.quizPassed ? "quiz" : "ack";
  const [stage, setStage] = useState(startStage); // cards → quiz → ack | fail
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ack, setAck] = useState(false);

  const allAnswered = FNO_QUIZ.every((q) => answers[q.id]);
  const wrong = FNO_QUIZ.filter((q) => answers[q.id] !== q.correct);
  const lastCard = cardIndex === FNO_CARDS.length - 1;
  const sections = [...new Set(FNO_QUIZ.map((q) => q.section))];

  const finishCards = () => {
    if (reviewOnly) return onBack();
    onProgress({ learned: true });
    setStage("quiz");
  };
  const check = () => {
    if (wrong.length === 0) {
      onProgress({ quizPassed: true });
      setStage("ack");
    } else setStage("fail");
  };
  const retry = (toCards = false) => {
    setAnswers({});
    setStage(toCards ? "cards" : "quiz");
    if (toCards) setCardIndex(0);
  };

  let footer = null;
  if (stage === "cards") {
    footer = (
      <div className="flex gap-2">
        {cardIndex > 0 && (
          <div className="w-1/3">
            <SecondaryButton onClick={() => setCardIndex(cardIndex - 1)}>Back</SecondaryButton>
          </div>
        )}
        <div className="flex-1">
          <PrimaryButton onClick={() => (lastCard ? finishCards() : setCardIndex(cardIndex + 1))}>
            {lastCard ? (reviewOnly ? "Done" : "Start the quiz") : "Next"}
          </PrimaryButton>
        </div>
      </div>
    );
  } else if (stage === "quiz") {
    footer = (
      <PrimaryButton disabled={!allAnswered} onClick={check}>
        {allAnswered ? "Check answers" : `Answer all ${FNO_QUIZ.length} to continue`}
      </PrimaryButton>
    );
  } else if (stage === "ack") {
    footer = (
      <PrimaryButton disabled={!ack} onClick={onUnlock}>
        {ack ? "Go to F&O" : "Tick the box to continue"}
      </PrimaryButton>
    );
  } else {
    footer = (
      <div className="space-y-2">
        <PrimaryButton onClick={() => retry(false)}>Try again</PrimaryButton>
        <SecondaryButton onClick={() => retry(true)}>Review the concept cards</SecondaryButton>
      </div>
    );
  }

  let qNumber = 0;

  return (
    <SubPage title={reviewOnly ? "F&O basics" : "Unlock F&O"} onBack={onBack} footer={footer}>
      {reviewOnly ? (
        <p className="text-xs font-medium" style={{ color: C.sub }}>Revisiting the basics</p>
      ) : (
        <FnoTracker progress={progress} />
      )}

      {stage === "cards" && (
        <>
          <div className="mt-4">
            <ConceptCarousel index={cardIndex} setIndex={setCardIndex} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
            {FNO_CARDS.map((c, i) => (
              <span
                key={c.id}
                className="h-1.5 rounded-full"
                style={{ width: i === cardIndex ? 20 : 6, background: i === cardIndex ? C.forest : C.control, transition: "width .2s" }}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs" style={{ color: C.sub }}>Swipe or use the buttons below</p>
        </>
      )}

      {stage === "quiz" && (
        <div className="mt-5">
          <p className="text-sm leading-relaxed" style={{ color: C.sub }}>
            Get all {FNO_QUIZ.length} right to unlock F&amp;O.
          </p>
          {sections.map((sec) => (
            <div key={sec} className="mt-5">
              <h2 className="gw-display text-base font-bold">{sec}</h2>
              <div className="mt-3 space-y-5">
                {FNO_QUIZ.filter((q) => q.section === sec).map((q) => {
                  qNumber += 1;
                  const tf = q.options === TRUE_FALSE;
                  return (
                    <fieldset key={q.id}>
                      <legend className="text-sm font-semibold leading-snug">
                        {qNumber}. {q.q}
                      </legend>
                      <div className={`mt-2 ${tf ? "grid grid-cols-2 gap-2" : "space-y-2"}`} role="radiogroup">
                        {q.options.map((o) => {
                          const active = answers[q.id] === o.id;
                          return (
                            <button
                              key={o.id}
                              role="radio"
                              aria-checked={active}
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                              className="gw-num flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
                              style={{
                                background: active ? C.mintSoft : "#fff",
                                border: `1.5px solid ${active ? C.mint : C.line}`,
                                color: active ? C.mintDeep : C.ink,
                              }}
                            >
                              <span
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                style={{ border: `1.5px solid ${active ? C.mint : C.control}`, background: "#fff" }}
                                aria-hidden="true"
                              >
                                {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.mint }} />}
                              </span>
                              {o.text}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {stage === "ack" && (
        <div className="gw-fade mt-6 flex flex-col items-center text-center">
          <div className="gw-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.mint }}>
            <Check size={30} color="#fff" strokeWidth={3} />
          </div>
          <h2 className="gw-display mt-4 text-2xl font-bold">F&amp;O unlocked</h2>
          <p className="mt-1 text-sm" style={{ color: C.sub }}>
            Quiz passed. One last step before you get access.
          </p>
          <button
            role="checkbox"
            aria-checked={ack}
            onClick={() => setAck((a) => !a)}
            className="mt-6 flex w-full items-start gap-3 rounded-xl bg-white p-3 text-left"
            style={{ border: `1.5px solid ${ack ? C.mint : C.line}` }}
          >
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ border: `1.5px solid ${ack ? C.mint : C.control}`, background: ack ? C.mint : "#fff" }}
            >
              {ack && <Check size={14} color="#fff" strokeWidth={3} />}
            </span>
            <span className="text-sm leading-relaxed">
              I understand F&amp;O is high-risk, that I can lose money quickly and sometimes more than I put in, and that about 9 in 10 individual traders lost money in FY25.
            </span>
          </button>
        </div>
      )}

      {stage === "fail" && (
        <div className="gw-fade mt-5">
          <h2 className="gw-display text-2xl font-bold">
            You got {FNO_QUIZ.length - wrong.length} of {FNO_QUIZ.length}
          </h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.sub }}>
            You need all {FNO_QUIZ.length} right to unlock F&amp;O. Here's what to look at again:
          </p>
          <div className="mt-4 space-y-3">
            {wrong.map((q) => {
              const yours = q.options.find((o) => o.id === answers[q.id]);
              const right = q.options.find((o) => o.id === q.correct);
              return (
                <div key={q.id} className="rounded-xl bg-white p-3" style={{ border: `1px solid ${C.line}` }}>
                  <p className="text-sm font-semibold leading-snug">{q.q}</p>
                  <p className="gw-num mt-2 flex gap-1.5 text-xs" style={{ color: C.loss }}>
                    <X size={14} strokeWidth={3} className="mt-0.5 shrink-0" />
                    <span>Your answer: {yours.text}</span>
                  </p>
                  <p className="gw-num mt-1 flex gap-1.5 text-xs" style={{ color: C.mintDeep }}>
                    <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0" />
                    <span>Correct answer: {right.text}</span>
                  </p>
                  <p className="gw-num mt-1.5 text-xs leading-relaxed" style={{ color: C.sub }}>{q.why}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SubPage>
  );
}

/* ------------------------------------------------------------------ */
/* Holdings and sell flow (Phase 4)                                    */
/* ------------------------------------------------------------------ */

function BottomSheet({ label, onClose, children }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end" role="dialog" aria-label={label}>
      <button aria-label="Close" onClick={onClose} className="gw-fade absolute inset-0" style={{ background: C.scrim }} />
      <div
        className="gw-rise gw-scroll relative overflow-y-auto rounded-t-3xl bg-white px-5 pt-3"
        style={{ maxHeight: "92%", paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto h-1 w-10 rounded-full" style={{ background: C.track }} />
        {children}
      </div>
    </div>
  );
}

function SellButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold"
      style={{ border: `1.5px solid ${C.line}`, color: C.ink }}
    >
      Sell
    </button>
  );
}

function HoldingsPage({ holdings, myFunds, onBack, onOpenStock, onSell }) {
  const stockTotal = holdings.reduce((sum, h) => sum + h.qty * stockById(h.stockId).price, 0);
  const mfTotal = myFunds.reduce((sum, m) => sum + m.value, 0);

  return (
    <SubPage title="Holdings" onBack={onBack}>
      <div className="flex items-baseline justify-between gap-2">
        <SectionTitle>Stocks</SectionTitle>
        <span className="gw-num text-sm font-semibold">{formatINR(stockTotal)}</span>
      </div>
      {holdings.length === 0 ? (
        <p className="mt-2 text-sm" style={{ color: C.sub }}>You don't own any stocks right now.</p>
      ) : (
        <ul className="mt-3 rounded-2xl bg-white px-4" style={{ border: `1px solid ${C.line}` }}>
          {holdings.map((h, i) => {
            const st = stockById(h.stockId);
            return (
              <li key={h.id} className="flex items-center gap-3 py-3" style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
                <button onClick={() => onOpenStock(st.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <StockLogo s={st} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{st.name}</p>
                    <p className="gw-num text-xs" style={{ color: C.sub }}>
                      {h.qty} {h.qty === 1 ? "share" : "shares"}, {formatAgo(h.boughtDaysAgo).toLowerCase()}
                    </p>
                    <div className="mt-1">
                      <PlanTag intent={h.intent} />
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <p className="gw-num text-sm font-semibold">{formatINR(h.qty * st.price)}</p>
                  <SellButton onClick={() => onSell(h)} label={`Sell ${st.name}`} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex items-baseline justify-between gap-2">
        <SectionTitle>Mutual funds</SectionTitle>
        <span className="gw-num text-sm font-semibold">{formatINR(mfTotal)}</span>
      </div>
      <ul className="mt-3 rounded-2xl bg-white px-4" style={{ border: `1px solid ${C.line}` }}>
        {myFunds.map((m, i) => {
          const f = fundById(m.fundId);
          return (
            <li key={m.fundId} className="flex items-center gap-3 py-3" style={i ? { borderTop: `1px solid ${C.line}` } : undefined}>
              <StockLogo s={f} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{f.name}</p>
                <p className="gw-num text-xs" style={{ color: C.sub }}>{m.note}</p>
              </div>
              <p className="gw-num shrink-0 text-sm font-semibold">{m.value > 0 ? formatINR(m.value) : `Starts ${FIRST_DEBIT}`}</p>
            </li>
          );
        })}
      </ul>
    </SubPage>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-7 w-12 shrink-0 rounded-full"
      style={{ background: on ? C.mint : C.control, transition: "background .2s" }}
    >
      <span
        className="absolute rounded-full bg-white"
        style={{
          top: 3,
          left: 3,
          width: 22,
          height: 22,
          transform: on ? "translateX(20px)" : "none",
          transition: "transform .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

const STEP_TAGS = {
  done: { text: "Done", tone: "mint" },
  active: { text: "In progress", tone: "neutral" },
  pending: { text: "Pending", tone: "grey" },
};

// Shown after a sell is confirmed, in place of a plain success message (Phase 7).
function SellProgress({ stock, qty, net, onDone }) {
  const [notify, setNotify] = useState(false);
  const steps = [
    {
      title: "Order executed",
      status: "done",
      detail: `Sold ${qty} ${qty === 1 ? "share" : "shares"} at ${formatINR(stock.price)}. Today, ${TODAY_LABEL}.`,
    },
    {
      title: "Exchange settlement",
      status: "active",
      detail: `Expected next working day, ${NEXT_WORKING_DAY}.`,
    },
    {
      title: "Ready to withdraw to bank",
      status: "pending",
      detail: `${formatINR(net)} becomes available to withdraw to your bank account.`,
    },
  ];

  return (
    <div className="gw-fade flex h-full flex-col" style={{ background: C.paper }}>
      <div className="gw-scroll flex-1 overflow-y-auto overflow-x-hidden px-5 pb-6 pt-8">
        <p className="text-sm" style={{ color: C.sub }}>Sell order placed</p>
        <p className="gw-display gw-num mt-1 text-4xl font-bold leading-none">{formatINR(net)}</p>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
          What you'll receive after charges, from {qty} {qty === 1 ? "share" : "shares"} of {stock.name}.
        </p>

        <ol className="mt-8 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }} aria-label="Sale progress">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            const tag = STEP_TAGS[s.status];
            return (
              <li
                key={s.title}
                className="relative flex gap-3.5"
                style={{ paddingBottom: last ? 0 : 24 }}
                aria-current={s.status === "active" ? "step" : undefined}
              >
                {!last && (
                  <span
                    className="absolute w-0.5"
                    style={{ left: 13, top: 30, bottom: 2, background: s.status === "done" ? C.mint : C.track }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: s.status === "done" ? C.mint : "#fff",
                    border: `2px solid ${s.status === "done" ? C.mint : s.status === "active" ? C.forest : C.control}`,
                  }}
                  aria-hidden="true"
                >
                  {s.status === "done" && <Check size={14} color="#fff" strokeWidth={3} />}
                  {s.status === "active" && <span className="gw-pulse h-2.5 w-2.5 rounded-full" style={{ background: C.forest }} />}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold" style={{ color: s.status === "pending" ? C.sub : C.ink }}>{s.title}</p>
                    <Tag tone={tag.tone}>{tag.text}</Tag>
                  </div>
                  <p className="gw-num mt-1 text-xs leading-relaxed" style={{ color: C.sub }}>{s.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Notify me when ready</p>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: C.sub }}>
                Get a notification when the money can be withdrawn.
              </p>
            </div>
            <Switch on={notify} onChange={setNotify} label="Notify me when ready" />
          </div>
          {notify && (
            <p className="gw-fade gw-num mt-3 flex gap-1.5 text-xs" style={{ color: C.mintDeep }} role="status">
              <Bell size={14} className="mt-px shrink-0" />
              <span>You'll get a notification when {formatINR(net)} is ready to withdraw.</span>
            </p>
          )}
        </div>
      </div>

      <div
        className="shrink-0 bg-white px-5 pt-3"
        style={{ borderTop: `1px solid ${C.line}`, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <PrimaryButton onClick={onDone}>Done</PrimaryButton>
      </div>
    </div>
  );
}

function SellFlow({ lot, onClose, onSell, onAskAI }) {
  const stock = stockById(lot.stockId);
  const plan = planById(lot.intent);
  // Gentle check: long-term plan, but bought under 30 days ago.
  const needsReminder = isLongTermPlan(lot.intent) && lot.boughtDaysAgo < SELL_REMINDER_DAYS;
  const [stage, setStage] = useState(needsReminder ? "reminder" : "sheet");
  const [qtyText, setQtyText] = useState(String(lot.qty));
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [sold, setSold] = useState(null);

  const qty = parseInt(qtyText || "0", 10);
  const valid = qty >= 1 && qty <= lot.qty;
  const value = valid ? qty * stock.price : 0;
  const ch = calcSellCharges(value);
  const step = (d) => setQtyText(String(Math.min(lot.qty, Math.max(1, (qty || 0) + d))));

  if (sold) return <SellProgress stock={stock} qty={sold.qty} net={sold.net} onDone={onClose} />;

  if (stage === "reminder") {
    return (
      <BottomSheet label="Before you sell" onClose={onClose}>
        <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-full" style={{ background: C.mintSoft, color: C.mintDeep }}>
          <Clock size={20} />
        </div>
        <h2 className="gw-display mt-3 text-xl font-bold leading-snug">You planned to hold this for {plan.horizon}</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
          You bought {stock.name} {formatAgo(lot.boughtDaysAgo).replace("Bought ", "")} with a long-term plan. Prices often move around in the first few weeks. Do you still want to sell?
        </p>
        <div className="mt-3">
          <PlanTag intent={lot.intent} />
        </div>
        <div className="mt-6 space-y-2">
          <PrimaryButton onClick={onClose}>Keep holding</PrimaryButton>
          <SecondaryButton onClick={() => setStage("sheet")}>Continue to sell</SecondaryButton>
        </div>
      </BottomSheet>
    );
  }

  const breakdown = [
    ["Sale value", ch.orderValue],
    [`DP charge (₹${SELL_CHARGES.dpChargePerStock} per stock)`, -ch.dp],
    ["Brokerage", -ch.brokerage],
    [`GST (${SELL_CHARGES.gstPct * 100}% on DP + brokerage)`, -ch.gst],
    [`STT (${SELL_CHARGES.sttPct * 100}% of sale value)`, -ch.stt],
  ];

  return (
    <BottomSheet label={`Sell ${stock.name}`} onClose={onClose}>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="gw-display text-lg font-bold leading-tight">Sell {stock.name}</h2>
          <p className="gw-num mt-0.5 text-xs" style={{ color: C.sub }}>Market price {formatINR(stock.price)} per share</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="gw-num text-xs" style={{ color: C.sub }}>
          You own {lot.qty} {lot.qty === 1 ? "share" : "shares"}
        </span>
        <PlanTag intent={lot.intent} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => step(-1)}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold"
            style={{ border: `1.5px solid ${C.line}`, color: qty <= 1 ? C.faint : C.ink }}
          >
            −
          </button>
          <input
            value={qtyText}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              setQtyText(d && parseInt(d, 10) > lot.qty ? String(lot.qty) : d);
            }}
            onBlur={() => qty < 1 && setQtyText("1")}
            inputMode="numeric"
            aria-label="Quantity to sell"
            className="gw-num w-14 rounded-xl py-2 text-center text-base font-semibold outline-none"
            style={{ border: `1.5px solid ${C.line}` }}
          />
          <button
            onClick={() => step(1)}
            disabled={qty >= lot.qty}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold"
            style={{ border: `1.5px solid ${C.line}`, color: qty >= lot.qty ? C.faint : C.ink }}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="text-sm" style={{ color: C.sub }}>Sale value</span>
        <span className="gw-num text-base font-semibold">{valid ? formatINR(value) : "—"}</span>
      </div>

      {/* Net proceeds: directly above the confirm button */}
      <div
        className="mt-4 rounded-xl p-3"
        style={{
          background: ch.isHigh ? C.amberSoft : C.paper,
          border: `1px solid ${ch.isHigh ? C.amberLine : C.line}`,
        }}
      >
        <p className="gw-num text-sm font-semibold" style={{ color: ch.isHigh ? C.amber : C.ink }}>
          {valid ? `You'll receive ${formatINR(ch.netRounded)} after ~${formatINR(ch.totalRounded)} charges` : "Enter a quantity to see what you'll receive"}
        </p>
        {valid && ch.isHigh && (
          <p className="mt-1 flex gap-1.5 text-xs leading-relaxed" style={{ color: C.amber }}>
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>Charges are high for small sales. Consider selling a larger amount at once.</span>
          </p>
        )}
        {valid && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <button
              onClick={() => setShowBreakdown((b) => !b)}
              aria-expanded={showBreakdown}
              className="flex items-center gap-0.5 text-xs font-semibold"
              style={{ color: C.ink }}
            >
              See breakdown
              <ChevronDown size={14} style={{ transform: showBreakdown ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            <button
              onClick={() =>
                onAskAI({
                  topic: "sell-charges",
                  text: "Why these charges?",
                  data: { ...ch, qty, name: stock.name },
                })
              }
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: C.mintDeep }}
            >
              <Sparkles size={13} />
              Why these charges? Ask AI
            </button>
          </div>
        )}
        {valid && showBreakdown && (
          <dl className="gw-fade gw-num mt-3 space-y-1.5 pt-3 text-xs" style={{ borderTop: `1px dashed ${ch.isHigh ? C.amberLine : C.line}` }}>
            {breakdown.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd>{v < 0 ? "−" : ""}{formatINR2(v)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 pt-1.5 font-semibold" style={{ borderTop: `1px solid ${C.line}` }}>
              <dt>Total charges</dt>
              <dd>{formatINR2(ch.total)}</dd>
            </div>
            <div className="flex justify-between gap-3 font-semibold">
              <dt>You receive</dt>
              <dd>{formatINR2(ch.net)}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-4">
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            onSell(lot.id, qty);
            setSold({ qty, net: ch.netRounded });
          }}
        >
          Confirm sell
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------------ */
/* Task pages                                                          */
/* ------------------------------------------------------------------ */

function SubPage({ title, onBack, children, footer }) {
  return (
    <div className="gw-slide flex h-full flex-col" style={{ background: C.paper }}>
      <header className="flex shrink-0 items-center gap-1 bg-white px-2 pb-2 pt-4" style={{ borderBottom: `1px solid ${C.line}` }}>
        <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="gw-display text-lg font-bold">{title}</h1>
      </header>
      <div className="gw-scroll flex-1 overflow-y-auto overflow-x-hidden px-5 py-5">{children}</div>
      {footer && (
        <div
          className="shrink-0 bg-white px-5 pt-3"
          style={{ borderTop: `1px solid ${C.line}`, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function PrimaryButton({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="gw-num w-full rounded-lg py-3 text-sm font-semibold text-white"
      style={{ background: disabled ? C.control : C.forest }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg bg-white py-3 text-sm font-semibold"
      style={{ border: `1.5px solid ${C.line}`, color: C.ink }}
    >
      {children}
    </button>
  );
}

function SuccessView({ title, body, onDone, doneLabel = "Back to Home" }) {
  return (
    <div className="gw-fade flex h-full flex-col items-center justify-center px-8 text-center" style={{ background: C.paper }}>
      <div className="gw-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.mint }}>
        <Check size={30} color="#fff" strokeWidth={3} />
      </div>
      <h2 className="gw-display mt-5 text-2xl font-bold leading-tight">{title}</h2>
      <p className="gw-num mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>{body}</p>
      <div className="mt-6 w-full">
        <PrimaryButton onClick={onDone}>{doneLabel}</PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-xs" style={{ color: C.loss }}>{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs" style={{ color: C.sub }}>{hint}</p>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  border: `1.5px solid ${hasError ? C.loss : C.line}`,
  background: "#fff",
  color: C.ink,
});

function NomineePage({ onBack, onComplete }) {
  const [form, setForm] = useState({ name: "", relation: "", dob: "", mobile: "" });
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const errors = {
    name: form.name.trim().length < 2 ? "Enter the nominee's full name." : "",
    relation: !form.relation ? "Choose how they're related to you." : "",
    dob: !form.dob ? "Enter their date of birth." : "",
    mobile: form.mobile && form.mobile.length !== 10 ? "Enter a 10-digit mobile number." : "",
  };
  const valid = !Object.values(errors).some(Boolean);
  const show = (k) => (tried ? errors[k] : "");

  const submit = () => {
    setTried(true);
    if (!valid) return;
    setSaved(true);
    onComplete();
  };

  if (saved) {
    return (
      <SuccessView
        title="Nominee added"
        body={`${form.name.trim()} is now the nominee for all your mutual funds and stocks. You can change this anytime from Account.`}
        onDone={onBack}
      />
    );
  }

  return (
    <SubPage title="Add a nominee" onBack={onBack} footer={<PrimaryButton onClick={submit}>Add nominee</PrimaryButton>}>
      <p className="text-sm leading-relaxed" style={{ color: C.sub }}>
        Your nominee can claim your investments if something happens to you. Without one, your family may need extra legal paperwork.
      </p>

      <div className="mt-5 space-y-5">
        <Field label="Full name" hint="As it appears on their PAN or Aadhaar." error={show("name")}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Priya Sharma"
            autoComplete="off"
            className="w-full rounded-xl px-3 py-3 text-sm outline-none"
            style={inputStyle(show("name"))}
          />
        </Field>

        <Field label="Relationship" error={show("relation")}>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship">
            {RELATIONS.map((r) => {
              const active = form.relation === r;
              return (
                <button
                  key={r}
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("relation", r)}
                  className="rounded-full px-3.5 py-2 text-sm font-medium"
                  style={{
                    background: active ? C.mintSoft : "#fff",
                    border: `1.5px solid ${active ? C.mint : C.line}`,
                    color: active ? C.mintDeep : C.ink,
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Date of birth" error={show("dob")}>
          <input
            type="date"
            value={form.dob}
            max="2026-10-08"
            onChange={(e) => set("dob", e.target.value)}
            className="w-full rounded-xl px-3 py-3 text-sm outline-none"
            style={inputStyle(show("dob"))}
          />
        </Field>

        <Field label="Mobile number (optional)" hint="We'll only use this to reach them about a claim." error={show("mobile")}>
          <div className="flex items-center rounded-xl" style={inputStyle(show("mobile"))}>
            <span className="pl-3 text-sm" style={{ color: C.sub }}>+91</span>
            <input
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit number"
              className="gw-num w-full min-w-0 rounded-xl bg-transparent px-2 py-3 text-sm outline-none"
            />
          </div>
        </Field>

        <div className="flex items-center justify-between rounded-xl p-3 text-sm" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <span style={{ color: C.sub }}>Share of investments</span>
          <span className="gw-num font-semibold">100%</span>
        </div>
      </div>
    </SubPage>
  );
}

function SipPage({ onBack, onComplete }) {
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <SuccessView
        title="SIP paid for October"
        body={`${formatINR(SIP.amount)} is on its way to ${SIP.fund}. Units are usually allotted in 1–2 working days. Your next auto-debit is on ${SIP.followingDate}.`}
        onDone={onBack}
      />
    );
  }

  const rows = [
    ["Fund", SIP.fund],
    ["Next auto-debit", SIP.nextDate],
    ["Pay from", SIP.bank],
    ["Streak", `${SIP.streak} months in a row`],
  ];

  return (
    <SubPage
      title="Upcoming SIP"
      onBack={onBack}
      footer={
        <div className="space-y-2">
          <PrimaryButton
            onClick={() => {
              setPaid(true);
              onComplete();
            }}
          >
            Pay {formatINR(SIP.amount)} now
          </PrimaryButton>
          <SecondaryButton onClick={onBack}>Keep auto-debit on {SIP.nextDate.slice(0, 6)}</SecondaryButton>
        </div>
      }
    >
      <div className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${C.line}` }}>
        <p className="text-sm" style={{ color: C.sub }}>Monthly SIP</p>
        <p className="gw-display gw-num mt-1 text-4xl font-bold leading-none">{formatINR(SIP.amount)}</p>
        <p className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: C.amberSoft, color: C.amber }}>Due in 3 days</p>
      </div>

      <ul className="mt-4 rounded-2xl bg-white px-4" style={{ border: `1px solid ${C.line}` }}>
        {rows.map(([k, v], i) => (
          <li
            key={k}
            className="flex items-start justify-between gap-4 py-3 text-sm"
            style={i ? { borderTop: `1px solid ${C.line}` } : undefined}
          >
            <span className="shrink-0" style={{ color: C.sub }}>{k}</span>
            <span className="gw-num text-right font-medium">{v}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2 rounded-xl p-3 text-xs leading-relaxed" style={{ background: C.amberSoft, color: C.amber }}>
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>Keep at least {formatINR(SIP.amount)} in your bank account by the night of 10 Oct. A failed auto-debit can lead to a bank charge.</span>
      </div>
    </SubPage>
  );
}

function EmergencyPage({ saved, onBack, onAdd }) {
  const [amount, setAmount] = useState("");
  const [added, setAdded] = useState(null);
  const n = parseInt(amount || "0", 10);
  const remaining = Math.max(EMERGENCY.target - saved, 0);
  const error = amount && n < 100 ? "Minimum amount is ₹100." : "";
  const valid = n >= 100;

  if (added !== null) {
    const left = Math.max(EMERGENCY.target - saved, 0);
    return (
      <SuccessView
        title={`${formatINR(added)} added`}
        body={
          left > 0
            ? `Your emergency fund is now ${formatINR(saved)} of ${formatINR(EMERGENCY.target)}. ${formatINR(left)} to go.`
            : `Your emergency fund has reached ${formatINR(EMERGENCY.target)}. That's one month of salary set aside.`
        }
        onDone={onBack}
      />
    );
  }

  return (
    <SubPage
      title="Emergency fund"
      onBack={onBack}
      footer={
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            setAdded(n);
            onAdd(n);
          }}
        >
          {valid ? `Add ${formatINR(n)}` : "Enter an amount"}
        </PrimaryButton>
      }
    >
      <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
        <p className="gw-display gw-num text-2xl font-bold">{formatINR(remaining)} to go</p>
        <Progress value={saved} max={EMERGENCY.target} />
      </div>

      <p className="mt-4 text-sm leading-relaxed" style={{ color: C.sub }}>
        Money goes into {EMERGENCY.fund}. It's low-risk, and you can withdraw anytime, usually by the next working day.
      </p>

      <div className="mt-5">
        <Field label="How much do you want to add?" error={error}>
          <div className="flex items-center rounded-xl" style={inputStyle(error)}>
            <span className="gw-display pl-4 text-2xl font-bold" style={{ color: C.sub }}>₹</span>
            <input
              value={amount ? Number(amount).toLocaleString("en-IN") : ""}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
              inputMode="numeric"
              placeholder="0"
              aria-label="Amount in rupees"
              className="gw-display gw-num w-full min-w-0 rounded-xl bg-transparent px-2 py-3 text-2xl font-bold outline-none"
            />
          </div>
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          {EMERGENCY.quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="gw-num rounded-full bg-white px-3.5 py-2 text-sm font-medium"
              style={{ border: `1.5px solid ${n === q ? C.mint : C.line}`, color: n === q ? C.mintDeep : C.ink }}
            >
              +{formatINR(q)}
            </button>
          ))}
        </div>
      </div>
    </SubPage>
  );
}

function FirstSipFlow({ onBack, onComplete, presetFund = null }) {
  // presetFund: opened from a fund page, so the fund is already chosen (Phase 6).
  const [amount, setAmount] = useState(presetFund ? FIRST_SIP_AMOUNTS.find((a) => a >= presetFund.minSip) : 100);
  const [fundId, setFundId] = useState(presetFund ? presetFund.id : null);
  const [done, setDone] = useState(null);
  const fund = presetFund || FUNDS.find((f) => f.id === fundId);

  const pickAmount = (a) => {
    setAmount(a);
    if (!presetFund && fund && a < fund.minSip) setFundId(null);
  };

  // Step 2: confirmation
  if (done) {
    return (
      <SuccessView
        title="SIP set!"
        body={`${formatINR(done.amount)} on the 5th of every month. It goes into ${done.fund.name}, starting ${FIRST_DEBIT}.`}
        doneLabel={presetFund ? "Done" : "Back to Home"}
        onDone={onBack}
      />
    );
  }

  // Step 1: amount + fund
  return (
    <SubPage
      title={presetFund ? "Start SIP" : "Start your first SIP"}
      onBack={onBack}
      footer={
        <PrimaryButton
          disabled={!fund}
          onClick={() => {
            const sip = { amount, fund };
            setDone(sip);
            onComplete(sip);
          }}
        >
          {fund ? `Start ${formatINR(amount)} monthly SIP` : "Choose a fund to continue"}
        </PrimaryButton>
      }
    >
      <p className="text-xs font-medium" style={{ color: C.sub }}>Step 1 of 2</p>
      <div className="mt-1.5 flex gap-1.5" aria-hidden="true">
        <span className="h-1 flex-1 rounded-full" style={{ background: C.mint }} />
        <span className="h-1 flex-1 rounded-full" style={{ background: C.track }} />
      </div>

      <p className="mt-5 text-sm font-medium">How much every month?</p>
      <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Monthly amount">
        {FIRST_SIP_AMOUNTS.map((a) => {
          const active = amount === a;
          const belowMin = !!presetFund && a < presetFund.minSip;
          return (
            <button
              key={a}
              role="radio"
              aria-checked={active}
              disabled={belowMin}
              onClick={() => pickAmount(a)}
              className="gw-num rounded-xl py-3 text-sm font-semibold"
              style={{
                background: active ? C.mintSoft : "#fff",
                border: `1.5px solid ${active ? C.mint : C.line}`,
                color: active ? C.mintDeep : C.ink,
                opacity: belowMin ? 0.45 : 1,
              }}
            >
              {formatINR(a)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs" style={{ color: C.sub }}>
        {presetFund && presetFund.minSip > FIRST_SIP_AMOUNTS[0]
          ? `Minimum SIP for this fund is ${formatINR(presetFund.minSip)}. You can change or pause this anytime.`
          : "You can change or pause this anytime."}
      </p>

      {presetFund ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-3" style={{ border: `1px solid ${C.line}` }}>
          <StockLogo s={presetFund} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">{presetFund.name}</p>
            <p className="gw-num mt-0.5 text-xs" style={{ color: C.sub }}>
              {presetFund.expense.toFixed(2)}% expense ratio, {presetFund.risk} risk
            </p>
          </div>
        </div>
      ) : (
      <>
      <p className="mt-6 text-sm font-medium">Choose a fund</p>
      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: C.sub }}>
        All three track the same 50 companies. The main difference is the yearly fee.
      </p>
      <div className="mt-3 space-y-2" role="radiogroup" aria-label="Fund">
        {FUNDS.map((f) => {
          const disabled = amount < f.minSip;
          const active = fundId === f.id;
          return (
            <button
              key={f.id}
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => setFundId(f.id)}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
              style={{
                background: active ? C.mintSoft : "#fff",
                border: `1.5px solid ${active ? C.mint : C.line}`,
                opacity: disabled ? 0.55 : 1,
              }}
            >
              <div
                className="gw-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{ background: C.paper, border: `1px solid ${C.line}`, color: C.ink }}
                aria-hidden="true"
              >
                {f.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{f.name}</p>
                <p className="gw-num mt-0.5 text-xs" style={{ color: C.sub }}>
                  {f.expense.toFixed(2)}% expense ratio, {f.return3y.toFixed(1)}% 3Y return
                </p>
                {disabled && (
                  <p className="gw-num mt-0.5 text-xs font-medium" style={{ color: C.amber }}>
                    Min SIP {formatINR(f.minSip)}
                  </p>
                )}
              </div>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ border: `1.5px solid ${active ? C.mint : C.control}`, background: "#fff" }}
                aria-hidden="true"
              >
                {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.mint }} />}
              </span>
            </button>
          );
        })}
      </div>
      </>
      )}

      <div className="mt-5 flex gap-2 rounded-xl bg-white p-3 text-xs leading-relaxed" style={{ border: `1px solid ${C.line}`, color: C.sub }}>
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>Debits on the 5th of every month from your linked bank account. Your first instalment is on {FIRST_DEBIT}.</span>
      </div>
    </SubPage>
  );
}

function PlaceholderPage({ title, body, onBack }) {
  return (
    <SubPage title={title} onBack={onBack} footer={<SecondaryButton onClick={onBack}>Back to Home</SecondaryButton>}>
      <div className="flex flex-col items-center px-4 pt-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.mintSoft, color: C.forest }}>
          <Sparkles size={24} />
        </div>
        <h2 className="gw-display mt-4 text-xl font-bold">Coming soon</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>{body}</p>
      </div>
    </SubPage>
  );
}

/* ------------------------------------------------------------------ */
/* Ask AI chat                                                         */
/* ------------------------------------------------------------------ */

function AiAvatar({ size = 28 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: C.mintSoft, color: C.mintDeep }}
      aria-hidden="true"
    >
      <Sparkles size={Math.round(size * 0.5)} />
    </div>
  );
}

function MessageText({ text }) {
  return (
    <div className="space-y-1.5">
      {text.split("\n").map((line, i) =>
        line.startsWith("• ") ? (
          <p key={i} className="gw-num pl-3" style={{ textIndent: "-0.7rem" }}>
            {line}
          </p>
        ) : (
          <p key={i} className="gw-num">{line}</p>
        )
      )}
    </div>
  );
}

function Bubble({ m }) {
  if (m.role === "user") {
    return (
      <div className="gw-fade flex justify-end">
        <div
          className="rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm leading-relaxed text-white"
          style={{ background: C.forest, maxWidth: "82%" }}
        >
          {m.text}
        </div>
      </div>
    );
  }
  const guard = m.kind === "guard";
  return (
    <div className="gw-fade flex items-start gap-2">
      <AiAvatar />
      <div
        className="min-w-0 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed"
        style={{
          maxWidth: "86%",
          background: guard ? C.amberSoft : "#fff",
          border: `1px solid ${guard ? C.amberLine : C.line}`,
          color: C.ink,
        }}
      >
        {guard && (
          <p className="mb-1 flex items-center gap-1 text-xs font-semibold" style={{ color: C.amber }}>
            <ShieldCheck size={13} /> Outside Beginner Mode
          </p>
        )}
        <MessageText text={m.text} />
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2" aria-label="AI is typing">
      <AiAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-3.5" style={{ border: `1px solid ${C.line}` }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="gw-dot h-1.5 w-1.5 rounded-full" style={{ background: C.sub, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ messages, setMessages, initialPrompt, ctx, onClose }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const started = useRef(false);

  const send = (text, opts = {}) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: q }]);
    setInput("");
    setTyping(true);
    const reply = getReply(q, ctx, opts);
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "ai", ...reply }]);
      setTyping(false);
    }, 750);
  };

  // Contextual entry points (e.g. the Phase 4 sell sheet) open the chat with a question already asked.
  useEffect(() => {
    if (initialPrompt && !started.current) {
      started.current = true;
      send(initialPrompt.text, initialPrompt);
    }
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const asked = messages.filter((m) => m.role === "user").map((m) => m.text);
  const suggestions = getSuggestions(ctx, asked);
  const canSend = input.trim().length > 0 && !typing;

  return (
    <div className="gw-rise flex h-full flex-col" style={{ background: C.paper }} role="dialog" aria-label="Ask AI, Beginner Mode">
      <header className="flex shrink-0 items-center gap-3 bg-white px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${C.line}` }}>
        <AiAvatar size={36} />
        <div className="min-w-0 flex-1">
          <h1 className="gw-display text-lg font-bold leading-tight">Ask AI</h1>
          <p className="text-xs" style={{ color: C.sub }}>Beginner Mode</p>
        </div>
        <button onClick={onClose} aria-label="Close Ask AI" className="flex h-10 w-10 items-center justify-center rounded-full">
          <X size={20} />
        </button>
      </header>

      <div className="flex shrink-0 items-start gap-2 px-4 py-2.5 text-xs leading-relaxed" style={{ background: C.amberSoft, color: C.amber }}>
        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
        <span>I explain concepts and your numbers. I don't recommend what to buy or sell.</span>
      </div>

      <div ref={listRef} className="gw-scroll flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4" aria-live="polite">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
        {typing && <TypingBubble />}
      </div>

      {suggestions.length > 0 && !typing && (
        <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-3" aria-label="Suggested questions">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="gw-num rounded-full bg-white px-3 py-1.5 text-left text-xs font-medium"
              style={{ border: `1.5px solid ${C.line}`, color: C.mintDeep }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex shrink-0 items-center gap-2 bg-white px-3 pt-2.5"
        style={{ borderTop: `1px solid ${C.line}`, paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSend) send(input);
          }}
          placeholder="Ask about a term or your numbers"
          aria-label="Ask a question"
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
          style={{ background: C.paper, border: `1.5px solid ${C.line}`, color: C.ink }}
        />
        <button
          onClick={() => send(input)}
          disabled={!canSend}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: canSend ? C.forest : C.control }}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function ComingSoon({ tab, onHome }) {
  const Icon = tab.icon;
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.mintSoft, color: C.forest }}>
        <Icon size={26} />
      </div>
      <h2 className="gw-display mt-4 text-xl font-bold">{tab.label} is coming soon</h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
        We're building this next. Your wealth summary is on Home.
      </p>
      <button onClick={onHome} className="mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white" style={{ background: C.forest }}>
        Go to Home
      </button>
    </div>
  );
}

function BottomNav({ active, onChange }) {
  return (
    <nav
      className="flex shrink-0 bg-white"
      style={{ borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main"
    >
      {TABS.map((t) => {
        const isActive = active === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={isActive ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1 pb-2.5 pt-3 text-xs"
            style={{ color: isActive ? C.forest : C.sub, fontWeight: isActive ? 600 : 500 }}
          >
            {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full" style={{ background: C.mint }} />}
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

function DemoToggle({ mode, onChange }) {
  const options = [
    { id: "new", label: "New user" },
    { id: "returning", label: "Returning user" },
  ];
  return (
    <div className="flex shrink-0 items-center justify-center gap-2.5 py-2.5" role="group" aria-label="Demo: choose user state">
      <span className="text-xs font-medium" style={{ color: C.sub }}>View as</span>
      <div className="flex rounded-full bg-white p-1" style={{ border: `1px solid ${C.track}` }}>
        {options.map((o) => {
          const active = mode === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
              style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.ink }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const freshChat = () => [{ id: "greet", role: "ai", text: AI_GREETING }];

export default function App() {
  const [mode, setMode] = useState("returning");
  const isNew = mode === "new";
  const [tab, setTab] = useState("home");
  const [investTab, setInvestTab] = useState("mf");
  const [hidden, setHidden] = useState(false);
  const [pages, setPages] = useState([]);
  const page = pages[pages.length - 1] || null;
  const openPage = (p) => setPages((st) => [...st, p]);
  const closePage = () => setPages((st) => st.slice(0, -1));
  const [sell, setSell] = useState(null); // { lot } snapshot, so the success screen survives a full sale

  // Returning user state
  const [completed, setCompleted] = useState({});
  const [emergencySaved, setEmergencySaved] = useState(EMERGENCY.start);

  // New user state
  const [newDone, setNewDone] = useState({});
  const [firstSip, setFirstSip] = useState(null);

  // Stock holdings per user state, each lot tagged with the plan chosen at purchase
  const [holdingsByMode, setHoldingsByMode] = useState({ returning: RETURNING_HOLDINGS, new: [] });
  const holdings = holdingsByMode[mode];
  const addHolding = (stockId, qty, intent) =>
    setHoldingsByMode((all) => {
      const list = all[mode];
      // Same stock + same plan bought today merges; otherwise it's a new lot with its own tag and date.
      const existing = list.find((h) => h.stockId === stockId && h.intent === intent && h.boughtDaysAgo === 0);
      const next = existing
        ? list.map((h) => (h === existing ? { ...h, qty: h.qty + qty } : h))
        : [...list, { id: `h-${Date.now()}`, stockId, qty, intent, boughtDaysAgo: 0 }];
      return { ...all, [mode]: next };
    });
  const removeFromLot = (lotId, qty) =>
    setHoldingsByMode((all) => ({
      ...all,
      [mode]: all[mode].map((h) => (h.id === lotId ? { ...h, qty: h.qty - qty } : h)).filter((h) => h.qty > 0),
    }));

  // Mutual funds per user state
  const [fundsByMode, setFundsByMode] = useState({ returning: RETURNING_FUNDS, new: [] });
  const myFunds = fundsByMode[mode];
  const updateFunds = (fn) => setFundsByMode((all) => ({ ...all, [mode]: fn(all[mode]) }));
  const investOnce = (fundId, amount) =>
    updateFunds((list) =>
      list.some((h) => h.fundId === fundId)
        ? list.map((h) => (h.fundId === fundId ? { ...h, value: h.value + amount } : h))
        : [...list, { fundId, value: amount, note: "Invested once" }]
    );
  const startFundSip = (sip) => {
    const fundId = sip.fund.id;
    updateFunds((list) =>
      list.some((h) => h.fundId === fundId)
        ? list.map((h) => (h.fundId === fundId ? { ...h, note: `New SIP ${formatINR(sip.amount)} a month` } : h))
        : [...list, { fundId, value: 0, note: `SIP ${formatINR(sip.amount)} a month` }]
    );
    if (isNew && !firstSip) setFirstSip(sip); // a new user's first SIP also completes the Home task
  };
  const [erTipSeen, setErTipSeen] = useState(false);

  // F&O unlock progress per user state
  const [fnoByMode, setFnoByMode] = useState(FNO_START);
  const fnoProgress = fnoByMode[mode];
  const updateFno = (patch) => setFnoByMode((all) => ({ ...all, [mode]: { ...all[mode], ...patch } }));

  // Ask AI
  const [showIntro, setShowIntro] = useState(USER.isNewToAssistant);
  const [chat, setChat] = useState(null);
  const [chatMessages, setChatMessages] = useState(freshChat);
  const activeTab = TABS.find((t) => t.id === tab);

  // Intro tooltip: shown once per session on first load, then fades out on its own.
  useEffect(() => {
    if (!USER.isNewToAssistant) return;
    const t = setTimeout(() => setShowIntro(false), 2600);
    return () => clearTimeout(t);
  }, []);

  // Contextual entry points pass a prompt, e.g. { topic: "sell-charges" | "fund", text, data }
  const openChat = (prompt = null) => {
    setShowIntro(false);
    setChat({ prompt, key: Date.now() });
  };

  // Evaluator toggle: instant switch. Each state keeps its own progress; overlays and chat history reset.
  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    setPages([]);
    setSell(null);
    setChat(null);
    setChatMessages(freshChat());
  };

  // A task leaves the list only when the action is actually done, never by self-report.
  const openTasks = TASKS.filter(
    (t) => !completed[t.id] && !(t.id === "emergency" && emergencySaved >= EMERGENCY.target)
  );
  const newTasks = NEW_TASKS.map((t) => {
    const done = t.id === "first-sip" ? !!firstSip : !!newDone[t.id];
    const doneDetail = t.id === "first-sip" && firstSip ? `${formatINR(firstSip.amount)} on the 5th of every month` : t.doneDetail;
    return { ...t, done, doneDetail };
  });
  const homeTasks = isNew ? newTasks : openTasks;

  const complete = (id) => (isNew ? setNewDone : setCompleted)((c) => ({ ...c, [id]: true }));
  const nomineeAdded = isNew ? !!newDone.nominee : !!completed.nominee;
  const aiCtx = {
    isNew,
    firstSip,
    saved: emergencySaved,
    openTaskIds: homeTasks.filter((t) => !t.done).map((t) => t.id),
  };

  let pageEl = null;
  if (page === "nominee") pageEl = <NomineePage onBack={closePage} onComplete={() => complete("nominee")} />;
  if (page === "sip") pageEl = <SipPage onBack={closePage} onComplete={() => complete("sip")} />;
  if (page === "emergency")
    pageEl = (
      <EmergencyPage saved={emergencySaved} onBack={closePage} onAdd={(amt) => setEmergencySaved((s) => s + amt)} />
    );
  if (page === "first-sip") pageEl = <FirstSipFlow onBack={closePage} onComplete={setFirstSip} />;
  if (page === "goal")
    pageEl = (
      <PlaceholderPage
        title="Set your first goal"
        body="Soon you'll be able to name a goal, set a target and date, and see how much to put aside each month."
        onBack={closePage}
      />
    );
  if (page === "risk")
    pageEl = (
      <PlaceholderPage
        title="Risk quiz"
        body="Soon you'll answer a few quick questions to understand how comfortable you are with ups and downs."
        onBack={closePage}
      />
    );
  if (page && page.startsWith("stock:")) {
    const stock = stockById(page.slice(6));
    pageEl = (
      <StockPage
        key={stock.id}
        stock={stock}
        owned={holdings.filter((h) => h.stockId === stock.id)}
        onBack={closePage}
        onBuy={(qty, intent) => addHolding(stock.id, qty, intent)}
        onAskAI={() => openChat({ text: "What do P/E and consistency score mean?" })}
        onSell={(lot) => setSell({ lot })}
        onDone={() => {
          if (pages.length <= 1) {
            setTab("invest");
            setInvestTab("stocks");
          }
          closePage();
        }}
      />
    );
  }
  if (page && page.startsWith("fund:")) {
    const f = fundById(page.slice(5));
    pageEl = (
      <FundDetail
        key={f.id}
        f={f}
        showTip={!erTipSeen}
        onTipSeen={() => setErTipSeen(true)}
        onBack={closePage}
        onStartSip={() => openPage(`fund-sip:${f.id}`)}
        onInvestOnce={(amt) => investOnce(f.id, amt)}
        onAskAI={() => openChat({ topic: "fund", text: `Tell me about the ${f.name}`, data: f })}
      />
    );
  }
  if (page && page.startsWith("fund-sip:")) {
    const f = fundById(page.slice(9));
    pageEl = <FirstSipFlow key={f.id} presetFund={f} onBack={closePage} onComplete={startFundSip} />;
  }
  if (page === "fno" || page === "fno-review")
    pageEl = (
      <FnoModule
        reviewOnly={page === "fno-review"}
        progress={fnoProgress}
        onProgress={updateFno}
        onBack={closePage}
        onUnlock={() => {
          // Only reachable after passing every quiz question AND ticking the risk acknowledgement.
          updateFno({ acknowledged: true, completedOn: TODAY_LABEL });
          closePage();
        }}
      />
    );
  if (page === "holdings")
    pageEl = (
      <HoldingsPage
        holdings={holdings}
        myFunds={myFunds}
        onBack={closePage}
        onOpenStock={(id) => openPage(`stock:${id}`)}
        onSell={(lot) => setSell({ lot })}
      />
    );

  return (
    <div className="gw flex min-h-screen w-full flex-col items-center sm:justify-center" style={{ background: "#EEEFF1" }}>
      <style>{STYLES}</style>
      <DemoToggle mode={mode} onChange={switchMode} />
      <div className="gw-phone relative flex w-full flex-col overflow-hidden" style={{ maxWidth: 400, background: C.paper }}>
        <main key={tab} className="gw-scroll flex-1 overflow-y-auto overflow-x-hidden" aria-hidden={pageEl || chat || sell ? true : undefined}>
          {tab === "home" ? (
            <HomeScreen
              hidden={hidden}
              onToggleHidden={() => setHidden((h) => !h)}
              tasks={homeTasks}
              emergencySaved={emergencySaved}
              onOpenTask={openPage}
              onOpenAI={() => openChat()}
              showIntro={showIntro}
              isNew={isNew}
              firstSip={firstSip}
              onStartFirstSip={() => openPage("first-sip")}
              onOpenHoldings={() => openPage("holdings")}
            />
          ) : tab === "invest" ? (
            <InvestScreen
              investTab={investTab}
              onInvestTab={setInvestTab}
              holdings={holdings}
              onOpenStock={(id) => openPage(`stock:${id}`)}
              myFunds={myFunds}
              onOpenFund={(id) => openPage(`fund:${id}`)}
              isNew={isNew}
              fnoProgress={fnoProgress}
              onStartFno={() => openPage("fno")}
              onReviewFno={() => openPage("fno-review")}
            />
          ) : tab === "account" ? (
            <AccountScreen
              isNew={isNew}
              fnoProgress={fnoProgress}
              nomineeAdded={nomineeAdded}
              onOpenFno={() => {
                setInvestTab("fno");
                setTab("invest");
              }}
            />
          ) : (
            <ComingSoon tab={activeTab} onHome={() => setTab("home")} />
          )}
        </main>
        <BottomNav active={tab} onChange={setTab} />
        {pageEl && <div className="absolute inset-0 z-10">{pageEl}</div>}
        {sell && (
          <div className="absolute inset-0" style={{ zIndex: 15 }}>
            <SellFlow
              key={sell.lot.id}
              lot={sell.lot}
              onClose={() => setSell(null)}
              onSell={removeFromLot}
              onAskAI={(prompt) => openChat(prompt)}
            />
          </div>
        )}
        {chat && (
          <div className="absolute inset-0 z-20">
            <ChatScreen
              key={chat.key}
              messages={chatMessages}
              setMessages={setChatMessages}
              initialPrompt={chat.prompt}
              ctx={aiCtx}
              onClose={() => setChat(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
