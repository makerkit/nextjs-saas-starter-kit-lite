import { describe, expect, it } from 'vitest';

import {
  type BonusTier,
  type ShowInputs,
  analyzeShow,
  blendTicketPricing,
  bonusAtTickets,
  gigFixedExpenses,
  marginalTmavAtTickets,
  marginalVenueValueAtTickets,
  sumTicketsIssued,
} from './offer-engine';

/*
 * Opening cost is a per-show FIXED cost (doors/staff/sound/light). It is NOT
 * marginal, so it must stay entirely out of TMAV, the CPA guardrails, and the
 * budget tiers — it only rides through on the result for breakeven/P&L later.
 */
describe('Opening cost — stored, but out of the marginal math', () => {
  const base: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 25,
    offer_structure: 'straight_guarantee',
    guarantee: 5000,
    fixed_show_expenses: 1000,
    conservative_attendance: 400,
    target_attendance: 700,
    sellout_attendance: 1000,
    days_remaining: 45,
    f_and_b_contribution_per_head: 12,
  };

  it('opening cost 0 vs 1806 gives identical TMAV, guardrails, and tiers', () => {
    const a = analyzeShow({ ...base, opening_cost: 0 });
    const b = analyzeShow({ ...base, opening_cost: 1806 });

    expect(b.tmav).toBe(a.tmav);
    expect(b.mrmc).toBe(a.mrmc);
    expect(b.cpa_guardrails).toEqual(a.cpa_guardrails);
    expect(b.budget_tiers).toEqual(a.budget_tiers);
    // The only difference is the echoed pass-through value.
    expect(a.opening_cost).toBe(0);
    expect(b.opening_cost).toBe(1806);
  });

  it('defaults opening_cost to 0 when unset and is independent of fixed_show_expenses', () => {
    const r = analyzeShow(base); // no opening_cost
    expect(r.opening_cost).toBe(0);
    // Changing fixed_show_expenses must not invent an opening_cost.
    const r2 = analyzeShow({ ...base, fixed_show_expenses: 9999 });
    expect(r2.opening_cost).toBe(0);
  });
});

/*
 * Breakeven attendance (read-only, pre-marketing). Two figures from existing
 * values: #1 F&B margin alone covers the open; #2 full pre-ad breakeven (TMAV
 * covers open + artist/production fixed). Round UP. Must not touch the marginal
 * math (tmav/guardrails/mrmc/tiers).
 */
describe('Breakeven attendance line', () => {
  const base: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 25, // straight_guarantee -> tmv = 25
    offer_structure: 'straight_guarantee',
    guarantee: 5000,
    fixed_show_expenses: 1000, // gigFixed = 5000 + 1000 = 6000
    conservative_attendance: 400,
    target_attendance: 700,
    sellout_attendance: 1000,
    days_remaining: 45,
    f_and_b_contribution_per_head: 17.75, // tmav = 25 + 17.75 = 42.75
  };

  it('fb-only breakeven = ceil(openCost / fb) = 102 at $1806 / $17.75', () => {
    const r = analyzeShow({ ...base, opening_cost: 1806 });
    expect(r.breakeven_fb_only).toBe(102); // ceil(1806/17.75) = ceil(101.74)
    // full = ceil((1806 + 6000) / 42.75) = ceil(182.6) = 183
    expect(r.breakeven_full).toBe(183);
  });

  it('opening cost 0 -> fb-only 0, full = ceil(gigFixed / tmav), no divide-by-zero', () => {
    const r = analyzeShow({ ...base, opening_cost: 0 });
    expect(r.breakeven_fb_only).toBe(0);
    expect(r.breakeven_full).toBe(141); // ceil(6000/42.75) = ceil(140.35)
    expect(Number.isFinite(r.breakeven_full as number)).toBe(true);
  });

  it('null (not a crash) when F&B margin is 0', () => {
    const r = analyzeShow({
      ...base,
      opening_cost: 1806,
      f_and_b_contribution_per_head: 0,
    });
    expect(r.breakeven_fb_only).toBeNull();
  });

  it('is purely additive — marginal math (tmav/guardrails/mrmc/tiers) is unchanged', () => {
    // Pin the marginal outputs for a fixed input so a regression would trip.
    const noOpen = analyzeShow({ ...base, opening_cost: 0 });
    const withOpen = analyzeShow({ ...base, opening_cost: 1806 });

    expect(withOpen.tmav).toBe(noOpen.tmav);
    expect(withOpen.mrmc).toBe(noOpen.mrmc);
    expect(withOpen.cpa_guardrails).toEqual(noOpen.cpa_guardrails);
    expect(withOpen.budget_tiers).toEqual(noOpen.budget_tiers);
    // Only the breakeven readout moves with opening cost.
    expect(withOpen.breakeven_full).not.toBe(noOpen.breakeven_full);
  });
});

/*
 * A5: F&B contribution per head is sourced per-tenant (gross avg check × margin
 * rate), passed into the engine. There is NO fabricated default. When absent,
 * F&B is excluded (treated as 0) and flagged — never assumed.
 */
describe('A5 — F&B basis from config, no fabricated default', () => {
  const base: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 25,
    offer_structure: 'straight_guarantee',
    guarantee: 5000,
    fixed_show_expenses: 1000,
    conservative_attendance: 400,
    target_attendance: 700,
    sellout_attendance: 1000,
    days_remaining: 45,
    f_and_b_contribution_per_head: 26, // caller derived check 40 × 0.65 = 26
  };

  it('present basis rides into TMAV as check × rate', () => {
    const r = analyzeShow({ ...base, f_and_b_contribution_per_head: 26 });
    expect(r.fb_basis_missing).toBe(false);
    expect(r.tmav).toBeCloseTo(base.avg_ticket_price + 26, 10); // 25 + 26 = 51
  });

  it('absent basis excludes F&B (=0) and flags it — no assumed number', () => {
    const noFb: ShowInputs = { ...base };
    delete noFb.f_and_b_contribution_per_head; // optional -> truly unset
    const r = analyzeShow(noFb);

    expect(r.fb_basis_missing).toBe(true);
    expect(r.fb_per_head).toBe(0);
    expect(r.scenarios.target.f_and_b_contribution).toBe(0);
    // Breakeven is tickets-only, NOT computed off any fabricated 17.75.
    expect(r.breakeven_fb_only).toBeNull();
    expect(r.tmav).toBeCloseTo(base.avg_ticket_price, 10); // ticket-only floor
  });
});

/*
 * Fee precision guard (cleanup batch). A $0-fee tier still incurs the processor
 * cost, so the venue's net fee per ticket is sub-dollar NEGATIVE. The UI used to
 * round it to a whole dollar ("net fee $-1"); the internal TMAV math must use the
 * FULL decimal (-1.025), never the rounded -1.
 */
describe('blendTicketPricing / analyzeShow — $0-fee tier net fee precision', () => {
  // GA tier, $0 booking fee, default processor globals (matches the UI defaults).
  const tiers = [
    {
      name: 'GA',
      face_price: 25,
      fee: 0,
      fee_recipient: 'venue' as const,
      capacity: 1000,
    },
  ];
  const globals = {
    processor_pct: 0.029,
    processor_flat: 0.3,
    avg_tickets_per_order: 1,
  };

  // processor_cost = 0.029*25 + 0.30/1 = 1.025  ->  net fee = 0 - 1.025 = -1.025
  const EXPECTED_NET_FEE = 0 - (0.029 * 25 + 0.3 / 1); // -1.025

  it('blends the FULL decimal net fee (-1.025), not a whole-dollar -1', () => {
    const blended = blendTicketPricing(tiers, globals);

    expect(blended.net_fee_per_head).toBeCloseTo(EXPECTED_NET_FEE, 10);
    expect(blended.net_fee_per_head).toBeCloseTo(-1.025, 10);

    // The rounding the OLD readout did would collapse this to -1 — prove we don't.
    expect(Math.round(blended.net_fee_per_head)).toBe(-1);
    expect(blended.net_fee_per_head).not.toBe(-1);
  });

  it('TMAV consumes the full decimal net fee (tmv + fb - 1.025), not -1', () => {
    const blended = blendTicketPricing(tiers, globals);

    const inputs: ShowInputs = {
      venue_capacity: 1000,
      avg_ticket_price: blended.avg_ticket_price, // 25 (face only)
      net_fee_per_head: blended.net_fee_per_head, // -1.025
      offer_structure: 'straight_guarantee',
      guarantee: 5000,
      fixed_show_expenses: 1000,
      conservative_attendance: 400,
      target_attendance: 700,
      sellout_attendance: 1000,
      days_remaining: 45,
      f_and_b_contribution_per_head: 12,
    };

    const r = analyzeShow(inputs);

    // Carried through unrounded.
    expect(r.net_fee_per_head).toBeCloseTo(-1.025, 10);
    // TMAV = TMV(25) + F&B(12) + netFee(-1.025) = 35.975 — the decimal, not 36.
    expect(r.tmav).toBeCloseTo(r.tmv + r.fb_per_head + EXPECTED_NET_FEE, 10);
    expect(r.tmav).toBeCloseTo(35.975, 10);
    // If the math had used the rounded -1 it would be 36 — confirm it does NOT.
    expect(r.tmav).not.toBeCloseTo(36, 5);
  });
});

/*
 * A3-revise — the gig model keyed to how the venue actually deals (Prism):
 * ticket-sold threshold bonuses (incremental / only-one) and itemized
 * planned/actual gig expenses. Validated against the real Fozzy settlement.
 */
describe('A3 — gig model: threshold bonuses + itemized expenses (Fozzy)', () => {
  const fozzy: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 30,
    offer_structure: 'bonus_escalator',
    guarantee: 7000,
    bonus_mode: 'incremental',
    bonus_tiers: [500, 550, 600, 650, 700, 750, 800, 850].map((n) => ({
      at_tickets: n,
      bonus: 500,
    })),
    gig_expenses: [
      { label: 'Production Manager', planned: 250 },
      { label: 'Equipment Maintenance', planned: 90 },
      { label: 'LD', planned: 275 },
      { label: 'Catering', planned: 40 },
      { label: 'Security', planned: 750 },
      { label: 'Box Office Staff', planned: 100 },
      { label: 'Marketing', planned: 800 },
      { label: 'Hospitality', planned: 400 },
    ], // = 2705
    fixed_show_expenses: 0,
    conservative_attendance: 300,
    target_attendance: 600,
    sellout_attendance: 1000,
    days_remaining: 30,
  };

  it('reproduces the Prism settlement: 434 sold => gig cost 9705, gig profit $4,920', () => {
    expect(gigFixedExpenses(fozzy)).toBe(2705);
    // at 434 sold, lowest tier (500) not met -> bonus 0
    const bonus = bonusAtTickets(434, fozzy.bonus_tiers!, fozzy.bonus_mode);
    expect(bonus).toBe(0);
    const gigCost = (fozzy.guarantee ?? 0) + bonus + gigFixedExpenses(fozzy);
    expect(gigCost).toBe(9705); // 7000 + 0 + 2705
    const GIG_GROSS = 14625; // Prism settlement gross (artist-deal P&L only)
    expect(GIG_GROSS - gigCost).toBe(4920); // matches Prism exactly
  });

  it('incremental vs only_one at 600 sold', () => {
    // met thresholds: 500, 550, 600
    expect(bonusAtTickets(600, fozzy.bonus_tiers!, 'incremental')).toBe(1500);
    expect(bonusAtTickets(600, fozzy.bonus_tiers!, 'only_one')).toBe(500);
  });

  it('legacy from_attendance/bonus_paid tiers still read (normalized)', () => {
    const legacy: BonusTier[] = [
      {
        from_attendance: 500,
        to_attendance: 750,
        bonus_paid: 1000,
      } as BonusTier,
    ];
    expect(bonusAtTickets(600, legacy, 'incremental')).toBe(1000);
    expect(bonusAtTickets(400, legacy, 'incremental')).toBe(0);
  });

  it('artistCost (via analyzeShow) keys the bonus on tickets_sold, not scenario attendance', () => {
    const r = analyzeShow({ ...fozzy, tickets_sold: 434 });
    // target scenario attendance is 600, but tickets_sold 434 drives the bonus -> 0.
    expect(r.scenarios.target.artist_cost).toBe(7000); // guarantee + 0
    // itemized expenses flow into the scenario's fixed cost.
    expect(r.scenarios.target.fixed_show_expenses).toBe(2705);
  });
});

/*
 * H2 — deal-structure correctness (spec-H2-deal-structure-fixes.md). Every number
 * traces to the two real Fireside Collective Gigwell sheets (PLUS and VS) at
 * sellout R = $25,425, artist share 0.70 (venue keep 0.30). avg_ticket_price 33.9
 * × sellout 750 reproduces R exactly (33.9 × 750 = 25425).
 *
 *   PLUS (backend):  split = g + E + P = 2000 + 1120 + 156 = 3276
 *                    artist = 2000 + (25425 − 3276) × 0.70 = 17504.30
 *   VS   (vs_deal):  split = g + E + P = 8000 + 1820 + 191 = 10011
 *                    artist = MAX(8000, (25425 − 10011) × 0.70) = 10789.80
 *                    (H2b: vs_deal recoups the guarantee in the split base; the
 *                    earlier 16389.80 deducted expenses+profit only — superseded.
 *                    Canonical vs_deal calibration is Warped, in the H2b block.)
 */
describe('H2 — promoter_profit in split + vs_deal / pure_door', () => {
  const PRICE = 33.9;
  const SELLOUT = 750; // 33.9 × 750 = 25425 = R at sellout

  const plus: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: PRICE,
    offer_structure: 'backend',
    guarantee: 2000,
    promoter_profit: 156, // P
    backend_artist_share: 0.7, // Fireside aShare
    fixed_show_expenses: 1120, // E
    conservative_attendance: 300,
    target_attendance: 600,
    sellout_attendance: SELLOUT,
    days_remaining: 45,
  };

  const vs: ShowInputs = {
    ...plus,
    offer_structure: 'vs_deal',
    guarantee: 8000,
    promoter_profit: 191, // P
    fixed_show_expenses: 1820, // E
  };

  it('PENNY — PLUS artist_total = 17504.30 (split 3276.00)', () => {
    const r = analyzeShow(plus);
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(17504.3, 2);
  });

  it('vs_deal artist_total = 10789.80 (H2b: split 10011 = g + E + P, guarantee recouped)', () => {
    const r = analyzeShow(vs);
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(10789.8, 2);
  });

  it('promoter_profit defaults to 0 — old backend deals are unchanged', () => {
    const noP: ShowInputs = { ...plus };
    delete noP.promoter_profit;
    const r = analyzeShow(noP);
    // split without P = 2000 + 1120 = 3120 -> 2000 + (25425 − 3120) × 0.7
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(2000 + 22305 * 0.7, 2);
  });

  it('vs_deal: below crossover artist = guarantee exactly; above = share', () => {
    const r = analyzeShow(vs);
    // conservative R = 33.9 × 300 = 10170 < crossover 21439.57 -> guarantee wins
    expect(r.scenarios.conservative.artist_cost).toBe(8000);
    // sellout R = 25425 > crossover -> share wins
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(10789.8, 2);
  });

  it('pure_door with g=0 reduces to share-only (no guarantee floor)', () => {
    const pure: ShowInputs = {
      ...vs,
      offer_structure: 'pure_door',
      guarantee: 0,
    };
    const r = analyzeShow(pure);
    // share only: (25425 − (1820 + 191)) × 0.70 = 23414 × 0.70 = 16389.80
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(16389.8, 2);
    // at zero draw there is no guarantee floor -> cost 0
    const zero = analyzeShow({ ...pure, conservative_attendance: 0 });
    expect(zero.scenarios.conservative.artist_cost).toBe(0);
  });

  it('marginalVenueValueAtTickets — zone-aware (below split full price, above × vKeep)', () => {
    // backend (PLUS): split 3276, vKeep 0.30
    expect(marginalVenueValueAtTickets(10, plus)).toBeCloseTo(PRICE, 10); // R 339 < 3276
    expect(marginalVenueValueAtTickets(200, plus)).toBeCloseTo(PRICE * 0.3, 10); // R 6780 > 3276
    // vs_deal: crossover (revenue) = splitPoint 10011 + 8000/0.7 = 21439.57 (~633 tix)
    expect(marginalVenueValueAtTickets(300, vs)).toBeCloseTo(PRICE, 10); // R 10170 < crossover
    expect(marginalVenueValueAtTickets(700, vs)).toBeCloseTo(PRICE * 0.3, 10); // R 23730 > crossover
    // pure_door: split = E + P = 2011
    const pure: ShowInputs = {
      ...vs,
      offer_structure: 'pure_door',
      guarantee: 0,
    };
    expect(marginalVenueValueAtTickets(10, pure)).toBeCloseTo(PRICE, 10); // R 339 < 2011
    expect(marginalVenueValueAtTickets(300, pure)).toBeCloseTo(PRICE * 0.3, 10); // R 10170 > 2011
  });

  it('marginalVenueValueAtTickets — bonus_escalator steps down AT a tier crossing', () => {
    const bonus: ShowInputs = {
      ...plus,
      offer_structure: 'bonus_escalator',
      bonus_tiers: [{ at_tickets: 500, bonus: 500 }],
    };
    // next ticket (500) crosses the tier -> price − bonus
    expect(marginalVenueValueAtTickets(499, bonus)).toBeCloseTo(
      PRICE - 500,
      10,
    );
    // no tier at 101 -> full price between tiers
    expect(marginalVenueValueAtTickets(100, bonus)).toBeCloseTo(PRICE, 10);
  });
});

/*
 * Wire-into-scaling — marginalTmavAtTickets is the zone-aware floor the live
 * decision compares CPA against. It reuses the SAME F&B/head and net-fee/head
 * terms as result.tmav; only the ticket-side term changes with zone. Backend
 * split here = g(2000) + E(1120) + P(156) = 3276 -> ~96.6 tickets at $33.90.
 */
describe('marginalTmavAtTickets — zone-aware floor vs flat planning TMAV', () => {
  const PRICE = 33.9;
  const backend: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: PRICE,
    offer_structure: 'backend',
    guarantee: 2000,
    promoter_profit: 156,
    backend_artist_share: 0.7, // vKeep 0.30
    fixed_show_expenses: 1120,
    conservative_attendance: 50, // band 50->200 straddles the ~96.6-ticket split
    target_attendance: 200,
    sellout_attendance: 1000,
    days_remaining: 45,
  };

  it('past the split point: marginal floor is BELOW the flat planning TMAV', () => {
    const flat = analyzeShow(backend).tmav;
    const zone = marginalTmavAtTickets(500, backend); // R 16950 > split -> venue-keep
    expect(zone).toBeLessThan(flat);
    expect(zone).toBeCloseTo(PRICE * 0.3, 10); // no F&B/fee here -> 10.17
  });

  it('below the split point: marginal floor is the full price (>= flat planning TMAV)', () => {
    const flat = analyzeShow(backend).tmav;
    const zone = marginalTmavAtTickets(10, backend); // R 339 < split -> full face
    expect(zone).toBeCloseTo(PRICE, 10);
    expect(zone).toBeGreaterThanOrEqual(flat);
  });

  it('reuses the same F&B + net-fee terms as result.tmav', () => {
    // straight_guarantee marginal = full price, so marginalTmav must equal result.tmav.
    const sg: ShowInputs = {
      ...backend,
      offer_structure: 'straight_guarantee',
      f_and_b_contribution_per_head: 12,
      net_fee_per_head: -1.025,
    };
    expect(marginalTmavAtTickets(10, sg)).toBeCloseTo(analyzeShow(sg).tmav, 10);
  });

  it('passes the bonus-tier negative spike through (price − bonus, plus F&B/fee)', () => {
    const bonus: ShowInputs = {
      ...backend,
      offer_structure: 'bonus_escalator',
      bonus_tiers: [{ at_tickets: 500, bonus: 500 }],
      f_and_b_contribution_per_head: 12,
    };
    // one ticket before the tier: (price − bonus) + fb = (33.9 − 500) + 12
    expect(marginalTmavAtTickets(499, bonus)).toBeCloseTo(PRICE - 500 + 12, 10);
  });
});

/*
 * sumTicketsIssued — a show splits across multiple ticket_tailor_events rows by
 * event_role (advance + day_of_sale), so the live tickets-sold count is the SUM
 * across all rows for the date, never a single row (which undercounts).
 */
describe('sumTicketsIssued — sums all event rows, never one slice', () => {
  it('sums an advance row AND a day_of_sale row on the same date', () => {
    // advance 320 + day_of_sale 95 = 415 (taking one row would read 320 or 95).
    const rows = [{ total_issued: 320 }, { total_issued: 95 }];
    expect(sumTicketsIssued(rows)).toBe(415);
  });

  it('a single row returns that row (no behaviour change for one-row shows)', () => {
    expect(sumTicketsIssued([{ total_issued: 240 }])).toBe(240);
  });

  it('treats null total_issued as 0 within the sum', () => {
    expect(
      sumTicketsIssued([{ total_issued: 200 }, { total_issued: null }]),
    ).toBe(200);
  });

  it('returns null on no rows (-> caller falls back to flat TMAV)', () => {
    expect(sumTicketsIssued([])).toBeNull();
    expect(sumTicketsIssued(null)).toBeNull();
    expect(sumTicketsIssued(undefined)).toBeNull();
  });

  it('returns null when the sum is 0 (a false 0 must not beat the flat TMAV)', () => {
    expect(
      sumTicketsIssued([{ total_issued: 0 }, { total_issued: 0 }]),
    ).toBeNull();
    expect(sumTicketsIssued([{ total_issued: null }])).toBeNull();
  });
});

/*
 * H2b — vs_deal must recoup the guarantee in the split base (verified vs the real
 * Providence Warped 6/19/26 Gigwell sheet). Full gross potential $23,595 at
 * avg face $24.20 × 975 sellout. Printed Split Point = g + E + P = 2000 + 1860 +
 * 193 = 4053. Artist = 0.60 × (23595 − 4053) = 11725.20 (NOT 12925.20, which
 * deducts expenses+profit only). Venue keep = 0.40.
 */
describe('H2b — vs_deal recoups the guarantee (Providence Warped)', () => {
  const warped: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 24.2,
    offer_structure: 'vs_deal',
    guarantee: 2000,
    promoter_profit: 193, // P
    backend_artist_share: 0.6, // venue keep 0.40
    fixed_show_expenses: 1860, // E
    conservative_attendance: 150, // R 3630 < split 4053 -> guarantee floor
    target_attendance: 600,
    sellout_attendance: 975, // 24.20 × 975 = 23595 gross potential
    days_remaining: 30,
  };

  it('PENNY — Warped sellout artist_total = 11725.20 (split 4053 = g + E + P)', () => {
    const r = analyzeShow(warped);
    expect(r.scenarios.sellout.artist_cost).toBeCloseTo(11725.2, 2);
  });

  it('below split (150 tix, R 3630 < 4053) -> guarantee floor 2000 holds', () => {
    const r = analyzeShow(warped);
    expect(r.scenarios.conservative.artist_cost).toBe(2000);
  });

  it('marginal crossover = splitPoint + g/aShare = 7386.33 (~305 tickets)', () => {
    // just below: R 7260 < 7386.33 -> full price; just above: R 7502 > -> price × vKeep
    expect(marginalVenueValueAtTickets(300, warped)).toBeCloseTo(24.2, 10);
    expect(marginalVenueValueAtTickets(310, warped)).toBeCloseTo(
      24.2 * 0.4,
      10,
    );
  });

  it('regression: pure_door still deducts expenseFloor only (no guarantee recoup)', () => {
    // same inputs as vs_deal but pure_door: split = E + P = 2053, guarantee ignored.
    // (23595 − 2053) × 0.60 = 12925.20 — unchanged by H2b. This is exactly the
    // amount vs_deal used to (wrongly) pay before the guarantee was recouped.
    const pure = analyzeShow({ ...warped, offer_structure: 'pure_door' });
    expect(pure.scenarios.sellout.artist_cost).toBeCloseTo(12925.2, 2);
  });
});

/*
 * H2b Part 2 — a free ticket triggers no payment, so it carries zero processor
 * cost. A PAID tier with a $0 fee still has the venue absorb Stripe (real cost,
 * intended — that's the ~−$1.00/head on Warped), which must NOT change.
 */
describe('H2b Part 2 — free tickets carry zero processor cost', () => {
  const globals = {
    processor_pct: 0.029,
    processor_flat: 0.3,
    avg_tickets_per_order: 1,
  };

  it('a free tier (face 0, fee 0, venue) -> net_fee_per_head 0 and no warnings', () => {
    const b = blendTicketPricing(
      [
        {
          name: 'Free RSVP',
          face_price: 0,
          fee: 0,
          fee_recipient: 'venue' as const,
          capacity: 100,
        },
      ],
      globals,
    );
    expect(b.net_fee_per_head).toBe(0);
    expect(b.warnings).toHaveLength(0);
  });

  it('regression: a PAID venue tier with $0 fee still absorbs Stripe (~ −1.00/head)', () => {
    // Warped GA face $24.20: processor = 0.029×24.20 + 0.30 = 1.0018 -> net −1.0018.
    const b = blendTicketPricing(
      [
        {
          name: 'GA',
          face_price: 24.2,
          fee: 0,
          fee_recipient: 'venue' as const,
          capacity: 975,
        },
      ],
      globals,
    );
    expect(b.net_fee_per_head).toBeCloseTo(-1.0018, 4);
    expect(b.warnings.length).toBeGreaterThan(0); // negative net fee still warns
  });
});

/*
 * breakeven_full — cumulative and split-aware. The replaced bug divided the fixed
 * floor by the MARGINAL (door-split-discounted, band-dependent) tmav, overstating
 * the floor and making it move with the target. Below the split the venue keeps
 * 100% of face; above it pays the artist's share. Cost floor = openCost + guarantee
 * + gig expenses (promoter_profit is venue target profit, NOT a cash cost, so it is
 * out of the floor — though it IS in splitPoint).
 */
describe('breakeven_full — cumulative, split-aware, target-independent', () => {
  // Buckcherry / Black Stone Cherry (8/19): backend, breakeven below the split.
  const buckcherry: ShowInputs = {
    venue_capacity: 1000,
    avg_ticket_price: 40.65,
    offer_structure: 'backend',
    guarantee: 22500,
    promoter_profit: 1000,
    backend_artist_share: 0.7,
    fixed_show_expenses: 2615, // gig expenses
    opening_cost: 1806,
    conservative_attendance: 600,
    target_attendance: 900,
    sellout_attendance: 1000,
    days_remaining: 30,
    f_and_b_contribution_per_head: 17.75,
  };

  it('Buckcherry below-split floor = 461 (not the inflated marginal ~828)', () => {
    // costFloor 26921 / belowPerHead 58.40 = 460.97 -> 461; 461 <= splitTickets ~642.
    expect(analyzeShow(buckcherry).breakeven_full).toBe(461);
  });

  it('is target-independent (the real bug): same floor at target 700 and 1000', () => {
    const at700 = analyzeShow({ ...buckcherry, target_attendance: 700 });
    const at1000 = analyzeShow({ ...buckcherry, target_attendance: 1000 });
    expect(at700.breakeven_full).toBe(461);
    expect(at1000.breakeven_full).toBe(461);
    expect(at700.breakeven_full).toBe(at1000.breakeven_full);
  });

  it('straight_guarantee unaffected: ceil(costFloor / (face + fb + netFee))', () => {
    const sg: ShowInputs = {
      venue_capacity: 1000,
      avg_ticket_price: 25,
      offer_structure: 'straight_guarantee',
      guarantee: 5000,
      fixed_show_expenses: 1000,
      opening_cost: 1806,
      conservative_attendance: 400,
      target_attendance: 700,
      sellout_attendance: 1000,
      days_remaining: 45,
      f_and_b_contribution_per_head: 17.75,
    };
    // costFloor 7806 / 42.75 = 182.6 -> 183 (identical to before the fix)
    expect(analyzeShow(sg).breakeven_full).toBe(183);
  });

  it('above-split case exercises segment two (result > splitTickets)', () => {
    // tiny face + large open cost -> the below-split solve exceeds splitTickets.
    const aboveSplit: ShowInputs = {
      venue_capacity: 100000,
      avg_ticket_price: 5,
      offer_structure: 'backend',
      guarantee: 100,
      backend_artist_share: 0.7,
      fixed_show_expenses: 0,
      opening_cost: 5000,
      conservative_attendance: 10,
      target_attendance: 50,
      sellout_attendance: 100000,
      days_remaining: 30,
    };
    // splitTickets 20; below solve 5100/5 = 1020 > 20 -> segment two.
    // covered@split 20×5=100; remaining 5000; abovePerHead 5×0.30=1.5; 20 + 5000/1.5 -> 3354.
    const r = analyzeShow(aboveSplit).breakeven_full;
    expect(r).toBe(3354);
    expect(r!).toBeGreaterThan(20); // landed above the split point
  });

  it('degenerate guards: face 0 -> null; zero cost floor -> 0; no throws', () => {
    const zeroFace: ShowInputs = {
      venue_capacity: 1000,
      avg_ticket_price: 0,
      offer_structure: 'straight_guarantee',
      guarantee: 5000,
      fixed_show_expenses: 1000,
      opening_cost: 1806,
      conservative_attendance: 400,
      target_attendance: 700,
      sellout_attendance: 1000,
      days_remaining: 45,
    };
    expect(analyzeShow(zeroFace).breakeven_full).toBeNull();

    const zeroFloor: ShowInputs = {
      ...zeroFace,
      avg_ticket_price: 25,
      guarantee: 0,
      fixed_show_expenses: 0,
      opening_cost: 0,
    };
    expect(analyzeShow(zeroFloor).breakeven_full).toBe(0);
  });
});
