/**
 * Benefits store (feature: benefits-tiers) — the `/benefits/me` payload plus
 * the actions around it. Mirrors the userStorage zustand conventions.
 *
 * Defaults are the STARTER plan (fail-closed): until the backend answers (or
 * when it cannot be reached), gating logic sees the most restrictive limits.
 */
import { create } from 'zustand';

import api from '@api/api';

// GET /api/v1/benefits/me payload (backend benefits DTO, design.md §Key DTOs)
export interface BenefitsNotice {
  state: 'PENDING' | 'ACKNOWLEDGED';
  message: string;
  grace_deadline: string | null;
}

export interface BenefitsPayload {
  plan: { tier: number; code: string; name: string };
  // null image_storage_bytes = unlimited
  limits: { image_storage_bytes: number | null; connections: number };
  usage: { image_storage_bytes: number; connections: number };
  premium: boolean;
  notice: BenefitsNotice | null;
  restricted_integration_ids: number[];
}

interface BenefitsState extends BenefitsPayload {
  fetchBenefits: () => Promise<void>;
  acknowledgeNotice: () => Promise<void>;
}

// STARTER: 50 MB image storage, no connections (spec P1-1 AC1).
const STARTER_DEFAULTS: BenefitsPayload = {
  plan: { tier: 1, code: 'STARTER', name: 'Starter' },
  limits: { image_storage_bytes: 52_428_800, connections: 0 },
  usage: { image_storage_bytes: 0, connections: 0 },
  premium: false,
  notice: null,
  restricted_integration_ids: [],
};

export const useBenefits = create<BenefitsState>((set, get) => ({
  ...STARTER_DEFAULTS,

  fetchBenefits: async () => {
    try {
      const { data } = await api.get('/benefits/me');
      set({
        plan: data.plan,
        limits: data.limits,
        usage: data.usage,
        premium: data.premium,
        notice: data.notice,
        restricted_integration_ids: data.restricted_integration_ids,
      });
    } catch {
      // Fail closed: safe STARTER defaults keep the gating restrictive.
      set({ ...STARTER_DEFAULTS });
    }
  },

  acknowledgeNotice: async () => {
    await api.post('/benefits/acknowledge');
    // Refetch so the notice state reflects the recorded acknowledgment.
    await get().fetchBenefits();
  },
}));
