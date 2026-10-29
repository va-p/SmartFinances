/**
 * Pure RevenueCat entitlement → tier mapping (feature: benefits-tiers).
 *
 * The identifiers are the entitlement names created in the RevenueCat
 * dashboard (spec P1-8 AC7 / BEN-46): `plus` → PLUS, `pro` → PRO,
 * `max` → ULTIMATE. When several are active simultaneously the highest
 * tier wins; unmapped identifiers are ignored entirely.
 */
export type Tier = 'STARTER' | 'PLUS' | 'PRO' | 'ULTIMATE';

const ENTITLEMENT_TIER: Record<string, Tier> = {
  plus: 'PLUS',
  pro: 'PRO',
  max: 'ULTIMATE',
};

const TIER_RANK: Record<Tier, number> = {
  STARTER: 1,
  PLUS: 2,
  PRO: 3,
  ULTIMATE: 4,
};

export function resolveTierFromEntitlements(
  activeEntitlementIds: readonly string[]
): Tier {
  return activeEntitlementIds.reduce<Tier>((best, id) => {
    const tier = ENTITLEMENT_TIER[id];
    return tier && TIER_RANK[tier] > TIER_RANK[best] ? tier : best;
  }, 'STARTER');
}
