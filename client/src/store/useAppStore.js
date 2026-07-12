import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  role: null,
  currentCaseId: null,
  cases: [],
  setRole: (role) => set({ role }),
  setCurrentCaseId: (id) => set({ currentCaseId: id }),
  setCases: (cases) => set({ cases }),
  logout: () => set({ role: null, currentCaseId: null, cases: [] }),
  openDoctorView: (navigate, caseId) => {
    const id = caseId || get().currentCaseId;
    set({ role: "doctor" });
    navigate(id ? `/doctor/case/${id}` : "/doctor/dashboard");
  },
}));
