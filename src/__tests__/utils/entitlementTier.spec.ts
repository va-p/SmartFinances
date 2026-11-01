import { resolveTierFromEntitlements } from '@utils/entitlementTier';

// BEN-46 — active entitlements map to tiers: plus→PLUS, pro→PRO, max→ULTIMATE
describe('resolveTierFromEntitlements', () => {
  it('maps each entitlement alone to its tier', () => {
    expect(resolveTierFromEntitlements(['plus'])).toBe('PLUS');
    expect(resolveTierFromEntitlements(['pro'])).toBe('PRO');
    expect(resolveTierFromEntitlements(['max'])).toBe('ULTIMATE');
  });

  it('resolves the highest tier when several entitlements are active', () => {
    expect(resolveTierFromEntitlements(['pro', 'max'])).toBe('ULTIMATE');
    expect(resolveTierFromEntitlements(['plus', 'pro'])).toBe('PRO');
    expect(resolveTierFromEntitlements(['max', 'plus', 'pro'])).toBe('ULTIMATE');
  });

  it('ignores unknown entitlement identifiers', () => {
    expect(resolveTierFromEntitlements(['team_plan', 'lifetime'])).toBe('STARTER');
    // Unknown ids never win over a mapped one
    expect(resolveTierFromEntitlements(['plus', 'team_plan'])).toBe('PLUS');
  });

  it('resolves STARTER for an empty entitlement set', () => {
    expect(resolveTierFromEntitlements([])).toBe('STARTER');
  });
});
