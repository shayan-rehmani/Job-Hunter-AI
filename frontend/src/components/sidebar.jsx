
import {
  LayoutDashboard,
  UserRound,
  FileText,
  Search,
  Sparkles,
  BriefcaseBusiness,
  Bot,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "My Profile", icon: UserRound, path: "/profile" },
  { label: "Resume Manager", icon: FileText, path: "/resume" },
  { label: "Find Jobs", icon: Search, path: "/jobs" },
  { label: "AI Job Matches", icon: Sparkles, path: "/matches" },
  { label: "Applications", icon: BriefcaseBusiness, path: "/applications" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("user_email") || "Candidate";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-[#11111B] px-5 py-6">

      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500">
          <Bot size={23} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Job Hunter AI</h1>
          <p className="text-xs text-gray-500">Your career autopilot</p>
        </div>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Workspace
      </p>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-violet-500/15 font-semibold text-violet-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mb-5 rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={17} className="text-violet-300" />
          <span className="text-sm font-semibold text-white">AI Autopilot</span>
        </div>
        <p className="text-xs leading-5 text-gray-400">
          Your career assistant is ready to find matching opportunities.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-300">Ready to configure</span>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
            {userEmail.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">My Account</p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </aside>
  );
}
