
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileCheck2,
  Send,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock3,
  ChevronRight,
  Search,
} from "lucide-react";

const stats = [
  {
    label: "Jobs Matched",
    value: "0",
    change: "Waiting for job discovery",
    icon: Sparkles,
  },
  {
    label: "Applications Sent",
    value: "0",
    change: "No applications yet",
    icon: Send,
  },
  {
    label: "Interviews",
    value: "0",
    change: "Your next opportunity awaits",
    icon: BriefcaseBusiness,
  },
  {
    label: "Profile Strength",
    value: "100%",
    change: "Profile information saved",
    icon: FileCheck2,
  },
];

const activities = [
  {
    title: "Resume analyzed",
    description: "Your resume has been successfully processed.",
    time: "Completed",
  },
  {
    title: "Candidate profile updated",
    description: "Your professional details are saved.",
    time: "Completed",
  },
];

export default function Dashboard() {
  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-8 py-8 text-white">
      <header className="mb-9 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-500">Workspace / Dashboard</p>
          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="mt-2 text-sm text-gray-400">
            Let's find your next career opportunity.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#181824] px-4 py-3 text-sm text-gray-300 hover:border-violet-400/40">
          <Search size={17} />
          Search jobs
        </button>
      </header>

      <section className="mb-8 grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-[#151520] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300">
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="text-3xl font-bold">{stat.value}</h2>
              <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-r from-[#20183B] via-[#19172D] to-[#151520] p-7">
        <div className="flex items-center justify-between">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-violet-300" />
              <span className="text-sm font-semibold text-violet-300">
                INTRODUCING YOUR AI AUTOPILOT
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              Your next opportunity starts here.
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Let AI discover relevant jobs, analyze your compatibility,
              prepare tailored applications and request your approval
              before submitting.
            </p>

            <button className="mt-6 flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
              Configure Autopilot
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="hidden h-36 w-36 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10 md:flex">
            <Sparkles size={65} className="text-violet-300" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-[#151520] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Activity</h3>
              <p className="mt-1 text-xs text-gray-500">
                Your latest career updates
              </p>
            </div>
            <Clock3 size={19} className="text-gray-500" />
          </div>

          <div className="space-y-5">
            {activities.map((activity) => (
              <div key={activity.title} className="flex gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileCheck2 size={17} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#151520] p-6">
          <h3 className="font-semibold">Career Preferences</h3>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Configure your target roles and preferred locations to improve
            job recommendations.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500">Target role</p>
              <p className="mt-1 text-sm">Not configured</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Preferred location</p>
              <p className="mt-1 text-sm">Not configured</p>
            </div>
          </div>

          <button className="mt-7 flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:border-violet-400/40">
            Set preferences
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-gray-600">
        <span>Job Hunter AI · Your career, intelligently managed.</span>
        <span className="flex items-center gap-2">
          <TrendingUp size={14} />
          AI-powered career assistant
        </span>
      </footer>
    </main>
  );
}
