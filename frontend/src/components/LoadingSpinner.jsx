function LoadingSpinner({ type = "spinner" }) {
  if (type === "card") {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse flex flex-col gap-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-full"></div>
        <div className="h-12 bg-slate-100 rounded w-full"></div>
        <div className="h-12 bg-slate-100 rounded w-full"></div>
        <div className="h-12 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12 w-full min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-slate-500">Loading data...</span>
      </div>
    </div>
  );
}

export default LoadingSpinner;
