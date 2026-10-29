import { canCreateConnection } from '@utils/benefitsLimits';

// BEN-44 — new connections are gated by the plan's connection limit
describe('canCreateConnection', () => {
  it('allows a new connection below the plan limit', () => {
    expect(
      canCreateConnection({ connections: 2 }, { connections: 3 })
    ).toBe(true);
  });

  it('blocks a new connection at the plan limit', () => {
    expect(
      canCreateConnection({ connections: 3 }, { connections: 3 })
    ).toBe(false);
  });

  it('blocks a new connection above the plan limit', () => {
    expect(
      canCreateConnection({ connections: 6 }, { connections: 5 })
    ).toBe(false);
  });

  it('allows connections on an unlimited tier (null limit)', () => {
    expect(
      canCreateConnection({ connections: 25 }, { connections: null })
    ).toBe(true);
  });
});
