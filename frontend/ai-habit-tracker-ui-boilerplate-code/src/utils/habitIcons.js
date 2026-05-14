const ICON_MAP = {
  water: "💧",
  run: "🏃",
  book: "📚",
  meditate: "🧘",
  journal: "✍️",
  strength: "🏋️",
  "phone-off": "📵",
  code: "💻",
};

export const displayHabitIcon = (icon) => ICON_MAP[icon] || icon || "🎯";
