interface GrafanaSubTabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function GrafanaSubTabBar({
  tabs,
  active,
  onChange,
}: GrafanaSubTabBarProps) {
  return (
    <div
      className="flex items-end gap-0 border-b overflow-x-auto shrink-0"
      style={{
        background: "#f7f8fa",
        borderColor: "#e4e7ed",
        scrollbarWidth: "none",
        minHeight: "30px",
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
              color: isActive ? "#ff6600" : "#6e7783",
              background: isActive ? "#ffffff" : "transparent",
              borderTop: isActive
                ? "2px solid #ff6600"
                : "2px solid transparent",
              borderBottom: isActive ? "1px solid #ffffff" : "none",
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
