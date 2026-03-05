import { type ReactNode, createContext, useContext, useState } from "react";

export type Shift = "A" | "B" | "C";
export type Period = "Today" | "Week" | "Month";

export interface FilterState {
  shift: Shift;
  period: Period;
  date: string; // ISO date string YYYY-MM-DD
}

interface FilterContextValue extends FilterState {
  setShift: (s: Shift) => void;
  setPeriod: (p: Period) => void;
  setDate: (d: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [shift, setShift] = useState<Shift>("A");
  const [period, setPeriod] = useState<Period>("Today");
  const [date, setDate] = useState<string>(todayISO());

  return (
    <FilterContext.Provider
      value={{ shift, period, date, setShift, setPeriod, setDate }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
}
