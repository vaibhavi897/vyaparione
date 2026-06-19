function ForecastCard({ title, value, subtitle, icon, status = "info" }) {
  let statusClasses = "";
  let iconContainerClasses = "";

  switch (status) {
    case "danger":
      statusClasses = "border-rose-100 shadow-rose-50/50 hover:shadow-rose-100/60";
      iconContainerClasses = "bg-rose-50 text-rose-600";
      break;
    case "warning":
      statusClasses = "border-amber-100 shadow-amber-50/50 hover:shadow-amber-100/60";
      iconContainerClasses = "bg-amber-50 text-amber-600";
      break;
    case "success":
      statusClasses = "border-emerald-100 shadow-emerald-50/50 hover:shadow-emerald-100/60";
      iconContainerClasses = "bg-emerald-50 text-emerald-600";
      break;
    case "info":
    default:
      statusClasses = "border-violet-100 shadow-violet-50/50 hover:shadow-violet-100/60";
      iconContainerClasses = "bg-violet-50 text-violet-600";
      break;
  }

  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between ${statusClasses}`}>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconContainerClasses}`}>
        {icon}
      </div>
    </div>
  );
}

export default ForecastCard;
