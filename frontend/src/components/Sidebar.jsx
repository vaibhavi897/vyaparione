import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Sales", path: "/sales" },
    { name: "Logout", path: "/login" }
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-[250px] bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 z-30">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
          VyapariOne
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              if (item.name === "Logout") {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("name");
              }
            }}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive && item.name !== "Logout"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-xs font-semibold text-violet-400">
            VO
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300">VyapariOne Ltd</p>
            <p className="text-[10px] text-slate-500 font-medium">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
