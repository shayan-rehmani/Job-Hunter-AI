
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileCheck2,
  Send,
  TrendingUp,
  Sparkles,
  Clock3,
  ChevronRight,
  Search,
  MapPin,
  LoaderCircle,
} from "lucide-react";

import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          api.get("/jobs/saved"),
          api.get("/profile/me/completion"),
          api.get("/jobs/preferences"),
        ]);

        if (results[0].status === "fulfilled") {
          setJobs(Array.isArray(results[0].value.data)
            ? results[0].value.data
            : []);
        } else {
          throw new Error("Could not load your saved jobs.");
        }

        if (results[1].status === "fulfilled") {
          setProfileCompletion(
            results[1].value.data.completion_percentage ?? 0
          );
        }

        if (results[2].status === "fulfilled") {
          setPreferences(results[2].value.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          err.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeJobs = jobs.filter((job) => job.is_active);

  const applicationsSent = activeJobs.filter((job) =>
    ["Applied", "Interview", "Rejected", "Offer"].includes(
      job.application_status
    )
  ).length;

  const interviews = activeJobs.filter(
    (job) => job.application_status === "Interview"
  ).length;

  const stats = [
    {
      label: "Jobs Discovered",
      value: activeJobs.length,
      change: "Total active saved jobs",
      icon: Sparkles,
    },
    {
      label: "Applications Sent",
      value: applicationsSent,
      change: "Jobs marked as applied or beyond",
      icon: Send,
    },
    {
      label: "Interviews",
      value: interviews,
      change: "Interview-stage applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "Profile Strength",
      value: `${profileCompletion}%`,
      change: "Based on required profile fields",
      icon: FileCheck2,
    },
  ];

  const recentJobs = [...activeJobs]
    .sort(
      (a, b) =>
        new Date(b.discovered_at || 0) -
        new Date(a.discovered_at || 0)
    )
    .slice(0, 4);

  const targetRoles = preferences?.preferred_job_titles;
  const locations = preferences?.preferred_locations;

  const formatPreference = (value) => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return "Not configured";
    }

    return Array.isArray(value) ? value.join(", ") : value;
  };

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString();
  };

  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-8 py-8 text-white">

      <header className="mb-9 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-500">
            Workspace / Dashboard
          </p>
          <h1 className="text-3xl font-bold">Welcome back 👋</h1>
          <p className="mt-2 text-sm text-gray-400">
            Let's find your next career opportunity.
          </p>
        </div>

        <button
          onClick={() => navigate("/jobs")}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#181824] px-4 py-3 text-sm text-gray-300 hover:border-violet-400/40"
        >
          <Search size={17} />
          Search jobs
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

              <h2 className="text-3xl font-bold">
                {loading ? (
                  <LoaderCircle className="animate-spin" size={25} />
                ) : (
                  stat.value
                )}
              </h2>

              <p className="mt-2 text-xs text-gray-500">
                {stat.change}
              </p>
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
                YOUR AI AUTOPILOT
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              Your next opportunity starts here.
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Discover relevant vacancies, review your compatibility,
              and manage your applications from one workspace.
            </p>

            <button
              onClick={() => navigate("/jobs")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Find opportunities
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="hidden h-36 w-36 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10 md:flex">
            <Sparkles size={65} className="text-violet-300" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <div className="rounded-2xl border border-white/[0.07] bg-[#151520] p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recently Discovered Jobs</h3>
              <p className="mt-1 text-xs text-gray-500">
                Your latest saved opportunities
              </p>
            </div>
            <Clock3 size={19} className="text-gray-500" />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle className="animate-spin text-violet-400" />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="py-8 text-center">
              <BriefcaseBusiness
                size={32}
                className="mx-auto mb-3 text-gray-600"
              />
              <p className="text-sm text-gray-400">
                No jobs discovered yet.
              </p>
              <button
                onClick={() => navigate("/jobs")}
                className="mt-4 text-sm font-medium text-violet-300 hover:text-violet-200"
              >
                Start discovering jobs →
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {job.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {job.company}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {job.location || "Location unavailable"}
                      </span>
                      <span>
                        {formatDate(job.discovered_at)}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs text-violet-300">
                    {job.application_status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:border-violet-400/40"
          >
            View all jobs
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#151520] p-6">
          <h3 className="font-semibold">Career Preferences</h3>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Your saved target roles and preferred locations.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs text-gray-500">Target roles</p>
              <p className="mt-2 text-sm text-white">
                {formatPreference(targetRoles)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Preferred locations</p>
              <p className="mt-2 text-sm text-white">
                {formatPreference(locations)}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/jobs")}
            className="mt-7 flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:border-violet-400/40"
          >
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
