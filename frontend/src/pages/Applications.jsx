
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  Send,
  Users,
  Trophy,
  XCircle,
  MapPin,
  Building2,
  ExternalLink,
  RefreshCw,
  LoaderCircle,
  CalendarDays,
  ChevronDown,
  Inbox,
} from "lucide-react";

import api from "../api/axios";

const STATUSES = [
  "Discovered",
  "Saved",
  "Interested",
  "Applied",
  "Interview",
  "Rejected",
  "Offer",
];

const STATUS_STYLES = {
  Discovered: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  Saved: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Interested: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Applied: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  Interview: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Rejected: "bg-red-500/10 text-red-300 border-red-500/20",
  Offer: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function safeUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium ${
        STATUS_STYLES[status] || STATUS_STYLES.Discovered
      }`}
    >
      {status}
    </span>
  );
}

export default function Applications() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchJobs() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs/saved");
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const activeJobs = jobs.filter((job) => job.is_active);

  const counts = {
    Applied: activeJobs.filter(
      (job) => job.application_status === "Applied"
    ).length,

    Interview: activeJobs.filter(
      (job) => job.application_status === "Interview"
    ).length,

    Offer: activeJobs.filter(
      (job) => job.application_status === "Offer"
    ).length,

    Rejected: activeJobs.filter(
      (job) => job.application_status === "Rejected"
    ).length,
  };

  const applicationStats = [
    {
      label: "Applied",
      value: counts.Applied,
      icon: Send,
      color: "text-cyan-300",
      background: "bg-cyan-500/10",
    },
    {
      label: "Interviews",
      value: counts.Interview,
      icon: Users,
      color: "text-amber-300",
      background: "bg-amber-500/10",
    },
    {
      label: "Offers",
      value: counts.Offer,
      icon: Trophy,
      color: "text-emerald-300",
      background: "bg-emerald-500/10",
    },
    {
      label: "Rejected",
      value: counts.Rejected,
      icon: XCircle,
      color: "text-red-300",
      background: "bg-red-500/10",
    },
  ];

  const filteredJobs = useMemo(() => {
    return activeJobs
      .filter((job) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
          !query ||
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          job.application_status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.discovered_at || 0) -
          new Date(a.updated_at || a.discovered_at || 0)
      );
  }, [activeJobs, search, statusFilter]);

  async function updateStatus(jobId, newStatus) {
    setUpdatingId(jobId);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/jobs/saved/${jobId}/status`,
        {
          application_status: newStatus,
        }
      );

      setJobs((previous) =>
        previous.map((job) =>
          job.id === jobId ? response.data : job
        )
      );

      setMessage("Application status updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not update application status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteJob(jobId) {
    const confirmed = window.confirm(
      "Remove this job from your saved jobs and application tracker? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(jobId);
    setError("");
    setMessage("");

    try {
      await api.delete(`/jobs/saved/${jobId}`);

      setJobs((previous) =>
        previous.filter((job) => job.id !== jobId)
      );

      setMessage("Job removed successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not remove this job."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">

        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A78BFA]">
              Career Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              My Applications
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Track and manage your job application journey.
            </p>
          </div>

          <button
            onClick={fetchJobs}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#514475] bg-[#241E35] px-4 py-3 text-sm text-[#D0C2FF] transition hover:bg-[#302548] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {applicationStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.07] bg-[#151520] p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {stat.label}
                  </p>

                  <div
                    className={`rounded-xl p-2.5 ${stat.background} ${stat.color}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>

                <h2 className="text-3xl font-bold">
                  {loading ? (
                    <LoaderCircle
                      size={25}
                      className="animate-spin"
                    />
                  ) : (
                    stat.value
                  )}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  Current application count
                </p>
              </div>
            );
          })}
        </section>

        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-[#151520] p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by job title or company..."
                className="w-full rounded-xl border border-[#30303E] bg-[#11111B] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#9B87F5]"
              />
            </div>

            <div className="relative md:w-64">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#30303E] bg-[#11111B] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-[#9B87F5]"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Showing {filteredJobs.length} of {activeJobs.length} jobs
          </p>
        </section>

        <section>
          {loading ? (
            <div className="rounded-2xl border border-[#292938] bg-[#151520] p-12 text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-violet-400"
              />
              <p className="mt-4 text-sm text-gray-400">
                Loading your applications...
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#393047] bg-[#151520]/60 p-12 text-center">
              <Inbox
                size={38}
                className="mx-auto text-gray-500"
              />

              <h3 className="mt-4 font-semibold text-white">
                {activeJobs.length === 0
                  ? "No applications yet"
                  : "No matching applications"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {activeJobs.length === 0
                  ? "Discover jobs first. Your saved opportunities will appear here automatically."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const applicationUrl = safeUrl(
                  job.application_url
                );

                return (
                  <article
                    key={job.id}
                    className="rounded-2xl border border-[#292938] bg-[#151520] p-5 transition hover:border-[#514475]"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={job.application_status}
                          />

                          <span className="rounded-lg border border-[#30303E] px-2.5 py-1 text-xs text-gray-400">
                            {job.source_name}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                          {job.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} />
                            {job.company}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {job.location || "Location unavailable"}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <BriefcaseBusiness size={14} />
                            {job.work_mode || "Work mode unspecified"}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            Discovered: {formatDate(job.discovered_at)}
                          </span>

                          <span>
                            Last updated: {formatDate(job.updated_at)}
                          </span>
                        </div>

                        {job.match_percentage != null && (
                          <p className="mt-3 text-xs text-violet-300">
                            Skill match: {job.match_percentage}%
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 lg:w-64">
                        <label className="block">
                          <span className="mb-2 block text-xs text-gray-400">
                            Application status
                          </span>

                          <select
                            value={job.application_status}
                            disabled={updatingId === job.id}
                            onChange={(event) =>
                              updateStatus(job.id, event.target.value)
                            }
                            className="w-full rounded-xl border border-[#30303E] bg-[#11111B] px-3 py-3 text-sm text-white outline-none focus:border-[#9B87F5] disabled:opacity-50"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>

                        {updatingId === job.id && (
                          <p className="flex items-center gap-2 text-xs text-violet-300">
                            <LoaderCircle
                              size={13}
                              className="animate-spin"
                            />
                            Updating status...
                          </p>
                        )}

                        {applicationUrl && (
                          <a
                            href={applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#8179FF]"
                          >
                            Open job listing
                            <ExternalLink size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => deleteJob(job.id)}
                          disabled={
                            deletingId === job.id ||
                            updatingId === job.id
                          }
                          className="rounded-xl border border-red-500/20 px-4 py-2.5 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === job.id
                            ? "Removing..."
                            : "Remove job"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-gray-600">
          <span>Job Hunter AI · Application Tracker</span>
          <span>{activeJobs.length} active saved jobs</span>
        </footer>

      </div>
    </main>
  );
}
