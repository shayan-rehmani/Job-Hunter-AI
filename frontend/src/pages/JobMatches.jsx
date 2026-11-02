import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Search,
  RefreshCw,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  TrendingUp,
  Building2,
  Clock3,
  ArrowUpRight,
  FileSearch,
} from "lucide-react";

import api from "../api/axios";

function safeHttpsUrl(value) {
  if (!value || typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getScoreColor(score) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#151520] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon size={18} className="text-[#A78BFA]" />
      </div>

      <h3 className="text-3xl font-semibold text-white">{value}</h3>

      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function SkillTag({ children, type }) {
  const styles =
    type === "matched"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-rose-500/20 bg-rose-500/10 text-rose-300";

  return (
    <span className={`rounded-lg border px-2.5 py-1 text-xs ${styles}`}>
      {children}
    </span>
  );
}

function JobCard({ job, index }) {
  const score = job.match_percentage;
  const hasScore = Number.isFinite(score);

  const employerLink = safeHttpsUrl(job.employer_application_url);
  const thirdPartyLink = safeHttpsUrl(job.third_party_application_url);
  const applicationLink =
    employerLink || thirdPartyLink || safeHttpsUrl(job.application_url);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#151520] p-5 transition hover:border-violet-500/30 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
              Match #{index + 1}
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
              {job.source_name || "Unknown source"}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white">
            {job.title || "Untitled position"}
          </h3>

          <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            <Building2 size={15} />
            {job.company || "Company not listed"}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {job.location || "Location not available"}
            </span>

            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness size={14} />
              {job.work_mode || "Work mode not specified"}
            </span>

            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              Posted: {formatDate(job.posted_date)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500">Skills match</p>

            <p
              className={`mt-1 text-3xl font-bold ${
                hasScore ? getScoreColor(score) : "text-gray-400"
              }`}
            >
              {hasScore ? `${score}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {job.description && (
        <p className="mt-5 text-sm leading-6 text-gray-400">
          {job.description}
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-300">
            <CheckCircle2 size={16} />
            Matched skills ({job.matched_skills?.length || 0})
          </h4>

          <div className="flex flex-wrap gap-2">
            {job.matched_skills?.length ? (
              job.matched_skills.map((skill) => (
                <SkillTag key={skill} type="matched">
                  {skill}
                </SkillTag>
              ))
            ) : (
              <p className="text-xs text-gray-500">No matched skills found.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-rose-300">
            <XCircle size={16} />
            Skills to improve ({job.missing_skills?.length || 0})
          </h4>

          <div className="flex flex-wrap gap-2">
            {job.missing_skills?.length ? (
              job.missing_skills.map((skill) => (
                <SkillTag key={skill} type="missing">
                  {skill}
                </SkillTag>
              ))
            ) : (
              <p className="text-xs text-gray-500">
                No missing skills reported.
              </p>
            )}
          </div>
        </div>
      </div>

      {job.match_reasons?.length > 0 && (
        <div className="mt-5 rounded-xl bg-white/[0.03] p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-200">
            <Sparkles size={15} className="text-violet-400" />
            Why this job was recommended
          </h4>

          <ul className="space-y-1.5">
            {job.match_reasons.map((reason, i) => (
              <li key={i} className="text-xs leading-5 text-gray-400">
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
        <div className="text-xs text-gray-500">
          <p>{job.source_type || "Source type unavailable"}</p>
          <p className="mt-1">
            Last checked: {formatDate(job.last_checked_at)}
          </p>
          <p className="mt-1">
            {job.application_status || "Verification status unavailable"}
          </p>
        </div>

        {applicationLink ? (
          <a
            href={applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            View original listing
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <span className="text-xs text-amber-400">
            Application link unavailable
          </span>
        )}
      </div>
    </div>
  );
}

export default function JobMatches() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchSavedMatches();
  }, []);

  const stats = useMemo(() => {
    const scoredJobs = jobs.filter((job) =>
      Number.isFinite(job.match_percentage)
    );

    const average = scoredJobs.length
      ? Math.round(
          scoredJobs.reduce(
            (total, job) => total + job.match_percentage,
            0
          ) / scoredJobs.length
        )
      : null;

    return {
      total: jobs.length,
      scored: scoredJobs.length,
      average,
      strong: scoredJobs.filter((job) => job.match_percentage >= 75).length,
    };
  }, [jobs]);

  async function fetchSavedMatches() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs/matches/saved");
      const results = response.data?.jobs || [];

      const formattedJobs = results.map((job) => ({
        ...job,
        employer_application_url: job.employer_url || null,
        third_party_application_url: job.employer_url
          ? job.application_url
          : null,
        source_type: job.employer_url ? "Employer Direct" : "Third-party",
        last_checked_at: job.last_verified_at,
      }));

      setJobs(
       formattedJobs.sort(
          (a, b) => (b.match_percentage || 0) - (a.match_percentage || 0)
        )
      );
  
      setHasSearched(true);
      setMessage(response.data?.message || "Saved matches loaded.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load saved job matches."
      );
    } finally {
      setLoading(false);
    }
  }

  async function findMatches() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/jobs/matches", null);
      const results = response.data?.jobs || [];

      setJobs(
        [...results].sort((a, b) => {
          const scoreA = Number.isFinite(a.match_percentage)
            ? a.match_percentage
            : -1;
          const scoreB = Number.isFinite(b.match_percentage)
            ? b.match_percentage
            : -1;

          return scoreB - scoreA;
        })
      );

      setMessage(response.data?.message || "Job matching completed.");
      setHasSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to find job matches. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ml-64 min-h-screen space-y-8 bg-[#0B0B12] p-5 text-white sm:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
            <Sparkles size={17} />
            AI-powered recommendations
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            AI Job Matches
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Discover jobs that align with your resume. Compare your skills,
            identify gaps, and understand why each opportunity is recommended.
          </p>
        </div>

        <button
          onClick={findMatches}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <RefreshCw size={17} className="animate-spin" />
          ) : (
            <Search size={17} />
          )}

          {loading ? "Finding matches..." : hasSearched ? "Refresh Matches" : "Find New Matches"}
        </button>
      </div>

      {/* Explanation */}
      <div className="flex gap-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-violet-300"
        />

        <p className="text-xs leading-6 text-gray-300">
          Match percentages represent the proportion of explicitly listed
          job skills found in your resume. They are not guarantees of
          selection. Jobs without available skill requirements are shown
          without a percentage.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Jobs discovered"
          value={stats.total}
          description="Listings returned by the search"
        />

        <StatCard
          icon={Target}
          label="Scored jobs"
          value={stats.scored}
          description="Jobs with available skill requirements"
        />

        <StatCard
          icon={TrendingUp}
          label="Average skills match"
          value={stats.average === null ? "N/A" : `${stats.average}%`}
          description="Average across scored jobs"
        />

        <StatCard
          icon={CheckCircle2}
          label="Strong matches"
          value={stats.strong}
          description="Jobs with 75% or higher skill coverage"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Results message */}
      {message && !error && (
        <p className="text-sm text-gray-400">{message}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#151520] py-16">
          <RefreshCw size={30} className="animate-spin text-violet-400" />
          <p className="mt-4 font-medium text-white">
            Analyzing job opportunities
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Comparing job requirements with your resume...
          </p>
        </div>
      )}

      {/* Initial state */}
      {!loading && !hasSearched && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#151520] px-5 py-16 text-center">
          <div className="rounded-2xl bg-violet-500/10 p-4">
            <FileSearch size={32} className="text-violet-300" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Ready to find your next opportunity?
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
            Click Find New Matches to search for jobs using your uploaded
            resume and saved job preferences.
          </p>
        </div>
      )}

      {/* Empty results */}
      {!loading && hasSearched && jobs.length === 0 && !error && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#151520] px-5 py-14 text-center">
          <Search size={30} className="mx-auto text-gray-500" />

          <h2 className="mt-4 font-semibold">No jobs found</h2>

          <p className="mt-2 text-sm text-gray-400">
            Try updating your job preferences or search again later.
          </p>
        </div>
      )}

      {/* Job results */}
      {!loading && jobs.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Recommended opportunities</h2>
              <p className="mt-1 text-xs text-gray-500">
                Sorted by skills match, highest first
              </p>
            </div>

            <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-400">
              {jobs.length} jobs
            </span>
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard
                key={`${job.company}-${job.title}-${index}`}
                job={job}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}