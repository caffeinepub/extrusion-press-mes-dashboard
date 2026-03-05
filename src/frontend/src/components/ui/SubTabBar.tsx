interface SubTabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function SubTabBar({ tabs, active, onChange }: SubTabBarProps) {
  return (
    <div
      className="flex items-end gap-0 border-b overflow-x-auto"
      style={{
        background: "#ffffff",
        borderColor: "#e2e8f0",
        scrollbarWidth: "none",
        minHeight: "32px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className="relative px-3 py-1.5 font-semibold tracking-wide transition-colors whitespace-nowrap shrink-0 uppercase"
            style={{
              fontSize: "10px",
              color: isActive ? "#0e7490" : "#64748b",
              background: isActive ? "#ecfeff" : "transparent",
              borderBottom: isActive
                ? "2px solid #06b6d4"
                : "2px solid transparent",
              letterSpacing: "0.05em",
            }}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
