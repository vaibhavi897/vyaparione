import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Products", path: "/products" },
    { name: "Sales", path: "/sales" },
    ...(isAdmin ? [{ name: "Demand Intelligence", path: "/forecast" }] : []),
    { name: "Logout", path: "/login" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          item.name === "Logout" ? (
            <button
              key={item.name}
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
            >
              {item.name}
            </button>
          ) : (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`
              }
            >
              {item.name}
              {item.name === "Demand Intelligence" && (
                <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold uppercase bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">
                  AI
                </span>
              )}
            </NavLink>
          )
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
