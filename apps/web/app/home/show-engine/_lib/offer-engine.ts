/**
 * Show Profitability Engine — pure calculation core (UI-agnostic).
 * Implements offer-engine-spec.md §4–§9, §15–§21.
 * Internal math stays decimal; round only for display.
 */

export type OfferStructure =
  | 'straight_guarantee'
  | 'backend'
  | 'hybrid'
  | 'bonus_escalator'
  | 'vs_deal'
  | 'pure_door';

export interface BonusTier {
  at_tickets: number; // bonus applies once tickets_sold >= this threshold
  bonus: number; // flat $ added at this threshold
  // legacy (old saved shows) — read-only fallback, not written going forward:
  from_attendance?: number;
  to_attendance?: number;
  bonus_paid?: number;
}

export type BonusMode = 'incremental' | 'only_one';

export interface GigExpense {
  label: string; // "Security", "Hospitality", "LD"...
  planned: number;
  actual?: number; // null until settled
  note?: string; // "5 @ $150", "10 meals @ $10"
}

export interface ShowInputs {
  venue_capacity: number;
  avg_ticket_price: number;
  offer_structure: OfferStructure;
  guarantee?: number;
  // Promoter's profit line on the offer sheet — sits in the split point alongside
  // the guarantee + expenses (backend/hybrid) or alongside expenses with the
  // guarantee excluded (vs_deal/pure_door). Dollars; absent => 0.
  promoter_profit?: number;
  backend_promoter_share?: number; // e.g. 0.80
  backend_artist_share?: number; // e.g. 0.20
  fixed_show_expenses: number;
  // Per-show FIXED cost to open the doors: FOH/BOH wages, bar + door staff,
  // sound, light. SEPARATE from fixed_show_expenses (the gig/artist-deal cost).
  // Fixed, not marginal — does NOT enter TMAV. Used for breakeven + P&L only.
  opening_cost?: number;
  bonus_tiers?: BonusTier[];
  bonus_mode?: BonusMode; // default 'incremental' (matches Prism)
  gig_expenses?: GigExpense[]; // itemized; when present, derives fixed_show_expenses
  tickets_sold?: number; // actuals settlement; falls back to scenario attendance
  conservative_attendance: number;
  target_attendance: number;
  sellout_attendance: number;
  baseline_attendance?: number;
  days_remaining: number;
  f_and_b_contribution_per_head?: number;
  net_fee_per_head?: number; // venue-kept booking fee net of processor — rides into TMAV, NOT avg_ticket_price
  historical_cpa?: number;
  // SOURCE OF TRUTH for the blend: the full per-tier ticket structure and the
  // processor globals used. avg_ticket_price / net_fee_per_head above are the
  // computed result; these reproduce them exactly on reload. (TicketTier /
  // TicketPricingGlobals are declared below — TS hoists type references.)
  ticket_tiers?: TicketTier[];
  ticket_pricing_globals?: TicketPricingGlobals;
}

export interface BudgetTier {
  name: string;
  cpa_assumption: number;
  total_budget: number;
  daily_budget: number;
  purchase_budget: number;
  support_budget: number;
}

export interface ScenarioResult {
  attendance: number;
  ticket_revenue: number;
  f_and_b_contribution: number;
  total_revenue: number;
  artist_cost: number;
  fixed_show_expenses: number;
  marketing_budget: number;
  total_cost: number;
  net_profit: number;
}

export interface AnalysisResult {
  tmv: number;
  // tmav = Contribution per attendee: ticket marginal + F&B/head + net fee, BEFORE Opening Cost.
  tmav: number;
  fb_per_head: number;
  /** True when no F&B basis was supplied — F&B was excluded (treated as 0), not assumed. */
  fb_basis_missing: boolean;
  net_fee_per_head: number;
  opening_cost: number; // pass-through of the per-show fixed open cost (0 if unset)
  breakeven_fb_only: number | null; // attendees for F&B margin to cover Opening Cost
  breakeven_full: number | null; // attendees for the show to break even pre-ads
  cpa_guardrails: { early: number; mid: number; late: number; ceiling: number };
  incremental_attendees: number;
  mrmc: number;
  budget_tiers: BudgetTier[];
  scenarios: {
    conservative: ScenarioResult;
    target: ScenarioResult;
    sellout: ScenarioResult;
  };
  risk_flags: string[];
  deal_score: 'A' | 'B' | 'C' | 'D';
  executive_recommendation: string;
  // Campaign build plan (IC-first reconciliation flagged here)
  campaign_plan: {
    optimization_note: string;
    purchase_budget_share: number;
    support_budget_share: number;
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Gig fixed cost (artist-deal only). Sum of itemized gig_expenses (actual ??
 * planned) when present, else the legacy single fixed_show_expenses. The
 * per-show Opening Cost (opening_cost; informally "the nut") and F&B are layered
 * SEPARATELY and are not included here.
 * Marketing is owned by the ad engine's marketingBudget — never entered here.
 */
export function gigFixedExpenses(i: ShowInputs): number {
  if (i.gig_expenses && i.gig_expenses.length > 0)
    return i.gig_expenses.reduce((s, e) => s + (e.actual ?? e.planned ?? 0), 0);
  return i.fixed_show_expenses ?? 0;
}

/**
 * Expenses + promoter profit — the door-split floor for vs_deal / pure_door,
 * where the guarantee is NOT recouped before the split (per the real sheets).
 */
function expenseFloor(i: ShowInputs): number {
  return gigFixedExpenses(i) + (i.promoter_profit ?? 0);
}

/**
 * Backend / hybrid split point = guarantee + expenses + promoter profit. The real
 * Fireside sheets prove promoter_profit sits in the split alongside the guarantee
 * and expenses; omitting it overpays the artist by promoter_profit × artist_share.
 */
function splitPoint(i: ShowInputs): number {
  return (i.guarantee ?? 0) + expenseFloor(i);
}

/*
 * A5: there is NO fabricated F&B default. F&B contribution per head is sourced
 * per-tenant (gross avg check × margin rate) and passed in on
 * f_and_b_contribution_per_head. When it is absent (null/undefined), F&B is
 * EXCLUDED from the planning math (treated as 0) and the result flags
 * fb_basis_missing — never assumed.
 */
const artistShare = (i: ShowInputs) =>
  i.backend_artist_share ??
  (i.backend_promoter_share != null ? 1 - i.backend_promoter_share : 0.2);
const promoterShare = (i: ShowInputs) =>
  i.backend_promoter_share ??
  (i.backend_artist_share != null ? 1 - i.backend_artist_share : 0.8);

/**
 * Bonus paid at a given tickets-sold count. Thresholds, not ranges. The venue
 * keys bonuses on tickets SOLD as flat step thresholds ("@500 -> $500"), and Rod
 * uses tickets-sold (not check-ins) as the attendance basis. Normalizes legacy
 * range tiers so old saved shows still read.
 */
export function bonusAtTickets(
  ticketsSold: number,
  tiers: BonusTier[],
  mode: BonusMode = 'incremental',
): number {
  const norm = (tiers ?? [])
    .map((t) => ({
      at: t.at_tickets ?? t.from_attendance ?? 0,
      amt: t.bonus ?? t.bonus_paid ?? 0,
    }))
    .filter((t) => t.amt > 0);
  const met = norm.filter((t) => ticketsSold >= t.at);
  if (met.length === 0) return 0;
  if (mode === 'only_one') return Math.max(...met.map((t) => t.amt));
  return met.reduce((s, t) => s + t.amt, 0); // incremental
}

function artistCost(attendance: number, i: ShowInputs): number {
  const ticketRevenue = attendance * i.avg_ticket_price;
  const guarantee = i.guarantee ?? 0;
  switch (i.offer_structure) {
    case 'straight_guarantee':
      return guarantee;
    case 'backend':
    case 'hybrid': {
      const above = Math.max(0, ticketRevenue - splitPoint(i));
      return guarantee + above * artistShare(i);
    }
    case 'vs_deal': {
      // Greater of guarantee OR door share — a MAX, not a SUM. The share base is
      // the FULL split point (guarantee + expenses + promoter_profit): the
      // guarantee IS recouped before the split, per the printed Gigwell Split
      // Point. Verified vs Providence Warped.
      const share = Math.max(0, ticketRevenue - splitPoint(i)) * artistShare(i);
      return Math.max(guarantee, share);
    }
    case 'pure_door':
      // Door split only, no guarantee (split = expenses + profit).
      return Math.max(0, ticketRevenue - expenseFloor(i)) * artistShare(i);
    case 'bonus_escalator':
      // Attendance basis = tickets sold (Rod's rule); fall back to scenario figure.
      return (
        guarantee +
        bonusAtTickets(
          i.tickets_sold ?? attendance,
          i.bonus_tiers ?? [],
          i.bonus_mode ?? 'incremental',
        )
      );
    default:
      return guarantee;
  }
}

/**
 * Per-tier descriptor for threshold (step) bonuses. With ticket-sold thresholds
 * the bonus is a discrete step at its `at_tickets`, not amortized over a band —
 * so the marginal ticket value between thresholds is just avg_ticket_price.
 * Normalizes legacy range tiers (from_attendance/bonus_paid) so old shows read.
 */
export function tierTMVs(
  i: ShowInputs,
): { at_tickets: number; bonus: number; marginal_tmv: number }[] {
  return (i.bonus_tiers ?? [])
    .map((t) => ({
      at_tickets: t.at_tickets ?? t.from_attendance ?? 0,
      bonus: t.bonus ?? t.bonus_paid ?? 0,
      marginal_tmv: i.avg_ticket_price,
    }))
    .filter((t) => t.bonus > 0);
}

/**
 * Planning-view venue value per incremental ticket for a door-split deal,
 * weighted across the band pre- vs post-split. Below the split point the venue
 * keeps the full face; above it the venue keeps only its share. Shared by the
 * backend and hybrid cases so neither ever returns a flat venue-keep rate that
 * ignores the 100%-keep tickets below the split.
 */
function weightedSplitTMV(i: ShowInputs): number {
  const lower = i.baseline_attendance ?? i.conservative_attendance;
  const totalIncr = Math.max(0, i.target_attendance - lower);
  if (totalIncr === 0) return i.avg_ticket_price;
  const splitTickets = splitPoint(i) / i.avg_ticket_price;
  const preTickets = Math.max(
    0,
    Math.min(i.target_attendance, splitTickets) - lower,
  );
  const postTickets = Math.max(0, totalIncr - preTickets);
  const tmvPre = i.avg_ticket_price;
  const tmvPost = i.avg_ticket_price * promoterShare(i);
  return (preTickets * tmvPre + postTickets * tmvPost) / totalIncr;
}

export function calculateTMV(i: ShowInputs): number {
  switch (i.offer_structure) {
    case 'straight_guarantee':
      return i.avg_ticket_price;
    case 'backend':
    case 'hybrid':
      // Weighted across the incremental tickets, pre- vs post-split. backend
      // used to return a flat venue-keep rate, understating the below-split
      // tickets where the venue keeps 100% — now it weights like hybrid.
      return weightedSplitTMV(i);
    case 'bonus_escalator':
      // Threshold bonuses are discrete step costs, not amortized over a band —
      // the marginal value of an incremental ticket is the full ticket price.
      return i.avg_ticket_price;
    default:
      return i.avg_ticket_price;
  }
}

/**
 * Marginal venue value of the NEXT ticket at the current ticket count — zone-aware.
 * This is what the LIVE ad-scaling decision must use (NOT calculateTMV, which is the
 * planning/band view): below the split the venue keeps the full face, above it only
 * its share. The vs crossover is revenue-based — tiered DOS/premium pricing moves it,
 * so it is never a hardcoded ticket count.
 */
export function marginalVenueValueAtTickets(
  currentTicketsSold: number,
  i: ShowInputs,
): number {
  const price = i.avg_ticket_price;
  const R = currentTicketsSold * price;
  const vKeep = 1 - artistShare(i);
  const g = i.guarantee ?? 0;
  switch (i.offer_structure) {
    case 'straight_guarantee':
      return price; // venue keeps 100% always
    case 'backend':
    case 'hybrid':
      return R < splitPoint(i) ? price : price * vKeep;
    case 'vs_deal': {
      // Where the door share overtakes the guarantee (revenue-based, not a count).
      // Base is the full split point now — the guarantee is recouped first.
      const aShare = artistShare(i);
      const crossover = splitPoint(i) + (aShare > 0 ? g / aShare : 0);
      return R < crossover ? price : price * vKeep;
    }
    case 'pure_door':
      return R < expenseFloor(i) ? price : price * vKeep;
    case 'bonus_escalator': {
      // Full price between tiers; a steep negative step AT a tier crossing.
      const nextTier = tierTMVs(i)
        .filter((t) => t.at_tickets === currentTicketsSold + 1)
        .sort((a, b) => a.bonus - b.bonus)[0];
      return nextTier ? price - nextTier.bonus : price;
    }
    default:
      return price;
  }
}

/**
 * F&B contribution per head used in TMAV. A5: absent basis => excluded (0), never
 * assumed. Single source so result.tmav and marginalTmavAtTickets stay identical.
 */
function fbPerHead(i: ShowInputs): number {
  return i.f_and_b_contribution_per_head ?? 0;
}

/** Venue-kept booking fee per head (net of processor); rides into TMAV like F&B. */
function netFeePerHead(i: ShowInputs): number {
  return i.net_fee_per_head ?? 0;
}

/**
 * Zone-aware TMAV at a ticket count — the value the LIVE scaling decision should
 * compare CPA against, instead of the flat planning result.tmav. Same F&B/head and
 * net-fee/head terms as result.tmav; only the ticket-side term changes with zone
 * (full price below recoup/split, venue-keep share above, negative step at a bonus
 * tier). Below recoup this is >= the flat planning TMAV; past recoup it steps down.
 */
export function marginalTmavAtTickets(
  currentTicketsSold: number,
  i: ShowInputs,
): number {
  return (
    marginalVenueValueAtTickets(currentTicketsSold, i) +
    fbPerHead(i) +
    netFeePerHead(i)
  );
}

/**
 * Live tickets sold for a show = the SUM of total_issued across its TicketTailor
 * event rows. A single show splits into multiple rows by event_role (advance +
 * day_of_sale), so summing — not taking one row — is what avoids undercounting.
 * Returns null on no rows or a zero sum, so the caller falls back to the flat
 * planning TMAV rather than trusting a false 0. (Pure helper, separated from the
 * DB query in getTicketsSoldForShow so it's unit-testable without Supabase.)
 */
export function sumTicketsIssued(
  rows: { total_issued: number | null }[] | null | undefined,
): number | null {
  if (!rows || rows.length === 0) return null;
  const sum = rows.reduce((s, r) => s + Number(r.total_issued ?? 0), 0);
  return sum === 0 ? null : sum;
}

function modelScenario(
  attendance: number,
  i: ShowInputs,
  marketingBudget: number,
): ScenarioResult {
  const fb = i.f_and_b_contribution_per_head ?? 0; // A5: absent => F&B excluded
  const netFee = i.net_fee_per_head ?? 0;
  const ticket_revenue = attendance * i.avg_ticket_price;
  const f_and_b_contribution = attendance * fb;
  // Booking fee is real venue revenue, parallel to F&B. artistCost() below uses
  // avg_ticket_price (face only), so the artist never shares the fee.
  const fee_revenue = attendance * netFee;
  const total_revenue = ticket_revenue + f_and_b_contribution + fee_revenue;
  const cost = artistCost(attendance, i);
  const gigFixed = gigFixedExpenses(i);
  const total_cost = cost + gigFixed + marketingBudget;
  return {
    attendance,
    ticket_revenue,
    f_and_b_contribution,
    total_revenue,
    artist_cost: cost,
    fixed_show_expenses: gigFixed,
    marketing_budget: marketingBudget,
    total_cost,
    net_profit: total_revenue - total_cost,
  };
}

function detectRiskFlags(i: ShowInputs, tmv: number, tmav: number): string[] {
  const flags: string[] = [];
  const fb = i.f_and_b_contribution_per_head ?? 0; // A5: absent => F&B excluded

  // (No amortized "bonus cliff" with threshold bonuses — a step bonus does not
  // dilute the marginal ticket value across a band the way a range tier did.)
  if (tmv < fb)
    flags.push(
      `F&B dependency: marginal ticket value ($${round2(tmv)}) is below F&B/head ($${fb}) — profit leans on food & beverage.`,
    );
  if (i.offer_structure === 'backend' || i.offer_structure === 'hybrid') {
    const sp = splitPoint(i);
    const expectedTicketRev = i.target_attendance * i.avg_ticket_price;
    if (sp > expectedTicketRev * 0.9)
      flags.push(
        `Backend risk: split point ($${Math.round(sp)}) is high vs expected ticket revenue ($${Math.round(expectedTicketRev)}).`,
      );
  }
  if (i.historical_cpa != null && i.historical_cpa >= tmav)
    flags.push(
      `Marketing ceiling: historical CPA ($${round2(i.historical_cpa)}) is at/above contribution per attendee ($${round2(tmav)}) — paid acquisition is unprofitable at past efficiency.`,
    );
  if (i.target_attendance > i.conservative_attendance * 2)
    flags.push(
      `Attendance risk: target (${i.target_attendance}) is more than double the conservative case (${i.conservative_attendance}).`,
    );
  if (!gigFixedExpenses(i))
    flags.push(
      'Expense uncertainty: gig expenses total $0 — model is incomplete.',
    );

  return flags;
}

function calculateDealScore(
  i: ShowInputs,
  tmv: number,
  tmav: number,
  flags: string[],
  conservative: ScenarioResult,
  target: ScenarioResult,
  sellout: ScenarioResult,
): 'A' | 'B' | 'C' | 'D' {
  const fb = i.f_and_b_contribution_per_head ?? 0; // A5: absent => F&B excluded
  const fbDependent = tmv < fb;
  const bonusCliff = flags.some((f) => f.startsWith('Bonus cliff'));
  const profitConservative = conservative.net_profit >= 0;
  const profitTarget = target.net_profit >= 0;
  const profitSellout = sellout.net_profit >= 0;
  const cpaRoom = i.historical_cpa == null || i.historical_cpa <= 0.75 * tmav;

  if (
    profitConservative &&
    profitTarget &&
    !fbDependent &&
    !bonusCliff &&
    cpaRoom
  )
    return 'A';
  if (profitTarget && !fbDependent && !bonusCliff) return 'B';
  if (profitTarget || profitSellout) return 'C';
  return 'D';
}

function buildExecutiveRecommendation(
  score: 'A' | 'B' | 'C' | 'D',
  i: ShowInputs,
  tmav: number,
  tiers: BudgetTier[],
): string {
  const t1 = Math.round(tiers[0]!.total_budget);
  const t2 = Math.round(tiers[1]!.total_budget);
  const t3 = Math.round(tiers[2]!.total_budget);

  if (i.historical_cpa != null && i.historical_cpa >= tmav)
    return `Historical CPA ($${round2(i.historical_cpa)}) is at/above contribution per attendee ($${round2(tmav)}). Do NOT scale paid spend at past efficiency — fix tracking/creative first or pass.`;

  switch (score) {
    case 'A':
      return `Strong economics. Scale with the Aggressive ($${t1}) or Core ($${t2}) tier. Healthy CPA room — push budget while cost/purchase stays under the early target.`;
    case 'B':
      return `Good deal, manageable risk. Run the Core plan ($${t2}). Hold budget once CPA reaches the mid target; only scale if it stays in the healthy zone.`;
    case 'C':
      return `Thin but workable. Use the Defense tier ($${t3}) and watch CPA tightly — pause if it approaches the ceiling ($${round2(tmav)}).`;
    case 'D':
    default:
      return `Poor/dangerous economics. Renegotiate the offer or pass unless there's strategic value worth a planned loss. Do not deploy aggressive paid spend.`;
  }
}

export function analyzeShow(inputs: ShowInputs): AnalysisResult {
  // A5: F&B basis comes from tenant config (passed in). Absent => exclude + flag.
  const fbProvided = inputs.f_and_b_contribution_per_head != null;
  const fb = fbPerHead(inputs);
  const netFee = netFeePerHead(inputs);
  const tmv = calculateTMV(inputs);
  const tmav = tmv + fb + netFee; // booking fee adds to TMAV, parallel to F&B

  // Breakeven attendance (read-only, pre-marketing). Computed from values already
  // in scope — no new economic assumptions. Round UP: a partial person doesn't
  // cover cost. Does NOT touch tmav/guardrails/mrmc/tiers below.
  const openCost = inputs.opening_cost ?? 0;
  const gigFixed = (inputs.guarantee ?? 0) + gigFixedExpenses(inputs);

  // #1 — F&B margin alone covers the cost of opening the doors (Bart's ~101).
  const breakeven_fb_only = fb > 0 ? Math.ceil(openCost / fb) : null;

  // #2 — full show breakeven before ad spend: per-head total contribution (TMAV =
  // ticket + F&B + net fee) covers the open + the artist/production fixed costs.
  // No double-count: tmv already reflects the offer structure (door-split share is
  // in tmv; the guarantee is the fixed floor here, not in tmv).
  const breakeven_full =
    tmav > 0 ? Math.ceil((openCost + gigFixed) / tmav) : null;

  const conservative = modelScenario(inputs.conservative_attendance, inputs, 0);
  const target = modelScenario(inputs.target_attendance, inputs, 0);
  const sellout = modelScenario(inputs.sellout_attendance, inputs, 0);

  let incremental_attendees =
    inputs.baseline_attendance != null
      ? inputs.target_attendance - inputs.baseline_attendance
      : inputs.target_attendance - inputs.conservative_attendance;
  if (incremental_attendees < 0) incremental_attendees = 0;

  const mrmc = incremental_attendees * tmav;
  const days = Math.max(1, inputs.days_remaining);

  const budget_tiers: BudgetTier[] = (
    [
      ['Aggressive Scale', 0.6],
      ['Core Plan', 0.75],
      ['Defense / Margin Protection', 0.9],
    ] as [string, number][]
  ).map(([name, rate]) => {
    const cpa = rate * tmav;
    const total = Math.min(mrmc, incremental_attendees * cpa);
    return {
      name,
      cpa_assumption: cpa,
      total_budget: total,
      daily_budget: total / days,
      purchase_budget: total * 0.8,
      support_budget: total * 0.2,
    };
  });

  const risk_flags = detectRiskFlags(inputs, tmv, tmav);
  const deal_score = calculateDealScore(
    inputs,
    tmv,
    tmav,
    risk_flags,
    conservative,
    target,
    sellout,
  );

  return {
    tmv,
    tmav,
    fb_per_head: fb,
    fb_basis_missing: !fbProvided,
    net_fee_per_head: netFee,
    // Pass-through only — opening_cost never touches tmav/guardrails/tiers above.
    opening_cost: inputs.opening_cost ?? 0,
    breakeven_fb_only,
    breakeven_full,
    cpa_guardrails: {
      early: 0.6 * tmav,
      mid: 0.75 * tmav,
      late: 0.9 * tmav,
      ceiling: tmav,
    },
    incremental_attendees,
    mrmc,
    budget_tiers,
    scenarios: { conservative, target, sellout },
    risk_flags,
    deal_score,
    executive_recommendation: buildExecutiveRecommendation(
      deal_score,
      inputs,
      tmav,
      budget_tiers,
    ),
    campaign_plan: {
      // IC-FIRST RECONCILIATION (overrides offer-spec §10/§13 "Purchase").
      optimization_note:
        'Optimize on INITIATE CHECKOUT first (single-show campaigns rarely reach Purchase volume). Switch an ad set to Purchase optimization only once it individually paces ~50 purchases per 7-day window. Lookalikes off first-party seeds remain valid; the 100-purchase lookalike threshold from the offer spec does not gate single shows.',
      purchase_budget_share: 0.8,
      support_budget_share: 0.2,
    },
  };
}

/* ===========================================================================
 * Ticket tier pricing + booking-fee handling (ticket-tier-input-spec).
 * FACE price -> avg_ticket_price (feeds the artist deal). Booking fee (net of
 * processor) -> net_fee_per_head, which rides into TMAV like F&B. The fee is
 * ALWAYS the venue's — never shared with the artist or promoter.
 * ======================================================================== */

export interface TicketTier {
  name: string;
  face_price: number;
  fee: number;
  fee_recipient: 'venue' | 'pass_through'; // fee is ALWAYS the venue's — never the artist's
  capacity: number;
  expected_mix_pct?: number; // 0..1
}

export interface TicketPricingGlobals {
  processor_pct?: number; // default 0.029
  processor_flat?: number; // default 0.30
  avg_tickets_per_order?: number; // default 1
}

export interface BlendedPricing {
  avg_ticket_price: number; // FACE only, capacity/mix-weighted -> feeds artist deal
  net_fee_per_head: number; // venue-kept fee net of processor, weighted -> adds to TMAV
  per_tier: {
    name: string;
    face_price: number;
    fee: number;
    processor_cost: number;
    venue_net_fee: number; // what the venue actually keeps from the fee (can be negative)
    weight: number; // share used in the blend
  }[];
  warnings: string[];
}

export function blendTicketPricing(
  tiers: TicketTier[],
  g: TicketPricingGlobals = {},
): BlendedPricing {
  const pct = g.processor_pct ?? 0.029;
  const flat = g.processor_flat ?? 0.3;
  const basket = Math.max(1, g.avg_tickets_per_order ?? 1);
  const warnings: string[] = [];

  if (tiers.length === 0) {
    return { avg_ticket_price: 0, net_fee_per_head: 0, per_tier: [], warnings };
  }

  // weights: explicit mix if given, else by capacity
  const haveMix = tiers.every((t) => t.expected_mix_pct != null);
  const capTotal = tiers.reduce((s, t) => s + Math.max(0, t.capacity), 0);
  const rawWeights = tiers.map((t) =>
    haveMix
      ? (t.expected_mix_pct as number)
      : capTotal > 0
        ? Math.max(0, t.capacity) / capTotal
        : 1 / tiers.length,
  );
  const wSum = rawWeights.reduce((s, w) => s + w, 0) || 1;
  const weights = rawWeights.map((w) => w / wSum);

  const per_tier = tiers.map((t, i) => {
    const gross = t.face_price + t.fee;
    // A free ticket (gross 0) triggers no payment -> no processor cost. A PAID tier
    // with fee 0 still incurs Stripe (the venue absorbs it) — that's real, not a bug.
    const processor_cost = gross === 0 ? 0 : pct * gross + flat / basket;
    // The fee is always the venue's. 'venue' = keep remainder after the processor.
    // 'pass_through' = the fee only offsets processing, so the venue keeps ~0.
    // The artist NEVER receives any of the fee under either option.
    let venue_net_fee = 0;
    if (gross > 0 && t.fee_recipient === 'venue')
      venue_net_fee = t.fee - processor_cost;
    else if (t.fee_recipient === 'pass_through') venue_net_fee = 0;

    if (t.fee_recipient === 'venue' && venue_net_fee < 0)
      warnings.push(
        `Tier "${t.name}": fee $${t.fee.toFixed(2)} does not cover the processor cost ($${processor_cost.toFixed(2)}) — you lose $${(-venue_net_fee).toFixed(2)}/ticket on the fee.`,
      );

    return {
      name: t.name,
      face_price: t.face_price,
      fee: t.fee,
      processor_cost,
      venue_net_fee,
      weight: weights[i]!,
    };
  });

  const avg_ticket_price = per_tier.reduce(
    (s, t) => s + t.face_price * t.weight,
    0,
  );
  const net_fee_per_head = per_tier.reduce(
    (s, t) => s + t.venue_net_fee * t.weight,
    0,
  );

  return { avg_ticket_price, net_fee_per_head, per_tier, warnings };
}
