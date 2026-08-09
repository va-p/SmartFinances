import { create } from 'zustand';

type CurrentInstitutionSelected = {
  institutionId: string | null;
  setInstitutionId: (institutionId: string | null) => void;
  institutionName: string | null;
  setInstitutionName: (institutionName: string | null) => void;
  clearInstitution: () => void;
};

export const useCurrentInstitutionSelected =
  create<CurrentInstitutionSelected>((set) => ({
    institutionId: null,
    setInstitutionId: (institutionId) =>
      set(() => ({ institutionId: institutionId })),
    institutionName: null,
    setInstitutionName: (institutionName) =>
      set(() => ({ institutionName: institutionName })),
    clearInstitution: () =>
      set(() => ({ institutionId: null, institutionName: null })),
  }));
