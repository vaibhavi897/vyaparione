function Navbar() {
  const name = localStorage.getItem("name") || "Admin";
  const role = localStorage.getItem("role") || "admin";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-white border-b border-slate-100 px-8 flex items-center justify-between shadow-sm shadow-slate-100/50">
      {/* Title */}
      <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
        VyapariOne Inventory System
      </h2>

      {/* User Info / Profile Avatar */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-800">{name}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{role}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm text-white shadow-inner shadow-black/10 border border-violet-500">
          {initial}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
