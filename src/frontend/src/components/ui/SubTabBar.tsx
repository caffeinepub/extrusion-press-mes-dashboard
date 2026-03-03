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
        background: "#060b14",
        borderColor: "#162030",
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
              color: isActive ? "#67e8f9" : "#475569",
              background: isActive ? "#0a1628" : "transparent",
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
