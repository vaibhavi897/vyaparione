function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default StatCard;
