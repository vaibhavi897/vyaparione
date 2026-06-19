function RiskBadge({ level }) {
  let badgeClasses = "";
  let dotClasses = "";

  switch (level?.toLowerCase()) {
    case "high":
      badgeClasses = "bg-rose-50 text-rose-700 border-rose-200";
      dotClasses = "bg-rose-500 animate-pulse";
      break;
    case "moderate":
      badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
      dotClasses = "bg-amber-500";
      break;
    case "low":
    default:
      badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotClasses = "bg-emerald-500";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`}></span>
      {level}
    </span>
  );
}

export default RiskBadge;
