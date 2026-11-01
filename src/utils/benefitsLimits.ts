/**
 * Pure benefits-limit decisions (feature: benefits-tiers) — jest-testable
 * without any React Native render. The screens only wire these.
 */
export interface ConnectionUsage {
  connections: number;
}

export interface ConnectionLimits {
  // null = unlimited connections (defensive: mirrors the nullable storage
  // limit semantics of the /benefits/me DTO).
  connections: number | null;
}

/**
 * Whether the user may create a new bank connection: strictly below the
 * plan's connection limit (spec P1-8 AC5 / BEN-44). At the limit the app
 * shows the upgrade CTA instead of opening the connect flow.
 */
export function canCreateConnection(
  usage: ConnectionUsage,
  limits: ConnectionLimits
): boolean {
  if (limits.connections === null) {
    return true;
  }
  return usage.connections < limits.connections;
}
