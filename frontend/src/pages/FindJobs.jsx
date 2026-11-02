
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Settings2,
  MapPin,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Plus,
  X,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
  Clock,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";

const SOURCES = [
  "Company Career Pages",
  "LinkedIn",
  "Naukri",
  "Indeed",
  "Foundit",
  "Internshala",
  "Other job platforms",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Freelance",
];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Entry Level",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "Experienced",
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const EMPTY_PREFERENCES = {
  preferred_job_titles: [],
  preferred_locations: [],
  experience_level: "Entry Level",
  preferred_job_types: ["Full-time", "Internship"],
  preferred_sources: SOURCES,
  minimum_salary: null,
  maximum_salary: null,
  currency: "INR",
  willing_to_relocate: false,
  availability: "Immediately",
};

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 text-sm font-semibold text-white">
      {children}
    </h3>
  );
}

function InputField({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border border-[#30303E] bg-[#11111B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#9B87F5] ${props.className || ""}`}
      />
    </label>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </span>
      <select
        {...props}
        className="w-full rounded-xl border border-[#30303E] bg-[#11111B] px-3 py-2.5 text-sm text-white outline-none focus:border-[#9B87F5]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState("");

  function addItem(event) {
    event.preventDefault();

    const value = input.trim();

    if (!value || values.includes(value)) return;

    onChange([...values, value]);
    setInput("");
  }

  return (
    <div>
      <SectionTitle>{label}</SectionTitle>

      <div className="mb-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-2 rounded-lg border border-[#514475] bg-[#241E35] px-3 py-1.5 text-xs text-[#C9B9FF]"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="text-gray-400 hover:text-white"
              aria-label={`Remove ${value}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-[#30303E] bg-[#11111B] px-3 py-2.5 text-sm text-white outline-none focus:border-[#9B87F5]"
        />

        <button
          type="submit"
          className="rounded-xl border border-[#514475] bg-[#241E35] px-3 text-[#C9B9FF] hover:bg-[#302548]"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);

  const applicationUrl =
    typeof job.application_url === "string" &&
    /^https:\/\//i.test(job.application_url)
      ? job.application_url
      : null;

  return (
    <article className="rounded-2xl border border-[#292938] bg-[#151520] p-5 transition hover:border-[#514475]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#29243B] px-2.5 py-1 text-[11px] font-medium text-[#C9B9FF]">
              {job.source_name || "Source unavailable"}
            </span>

            <span className="rounded-md border border-[#514475] px-2.5 py-1 text-[11px] text-gray-300">
              {job.application_status || "Status unavailable"}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white">
            {job.title || "Untitled position"}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Building2 size={14} />
              {job.company || "Company unavailable"}
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
        </div>

        <div className="shrink-0 text-xs text-gray-400">
          <p>Experience</p>
          <p className="mt-1 font-medium text-gray-200">
            {job.experience_level || "Not specified"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-400">
        {expanded
          ? job.description || "No description provided."
          : `${(job.description || "No description provided.").slice(0, 190)}${(job.description || "").length > 190 ? "..." : ""}`}
      </p>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-[#B9A7FF] hover:text-white"
      >
        {expanded ? "Show less" : "Read more"}
      </button>

      {!!job.required_skills?.length && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">Required skills</p>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-lg border border-[#30303E] bg-[#11111B] px-2.5 py-1 text-xs text-gray-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {!!job.match_reasons?.length && (
        <div className="mt-4 rounded-xl bg-[#1D1A2A] p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[#C9B9FF]">
            <Sparkles size={14} />
            Why this job matches
          </p>

          <ul className="space-y-1 text-xs text-gray-400">
            {job.match_reasons.map((reason, index) => (
              <li key={index}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#292938] pt-4">
        <div className="space-y-1 text-[11px] text-gray-500">
          <p>
            Posted: {job.posted_date || "Not provided"}
          </p>
          <p>Last verified: Not available from current search API</p>
        </div>

        {applicationUrl ? (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#6C63FF] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#8179FF]"
          >
            View application
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-xs text-amber-400">
            Application link unavailable
          </span>
        )}
      </div>
    </article>
  );
}

export default function FindJobs() {
  const [preferences, setPreferences] = useState(EMPTY_PREFERENCES);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState([]);
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedSources, setSelectedSources] = useState(["All Sources"]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const availableSources = useMemo(
    () => ["All Sources", ...SOURCES],
    []
  );

  async function fetchPreferences() {
    setLoadingPreferences(true);
    setError("");

    try {
      const response = await api.get("/jobs/preferences");
      setPreferences({
        ...EMPTY_PREFERENCES,
        ...response.data,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setPreferences({
          ...EMPTY_PREFERENCES,
          preferred_locations: [],
          preferred_job_titles: [],
        });
        setPreferencesOpen(true);
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load job preferences."
        );
      }
    } finally {
      setLoadingPreferences(false);
    }
  }

  useEffect(() => {
    fetchPreferences();
  }, []);

  function updatePreference(field, value) {
    setPreferences((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function savePreferences(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...preferences,
        minimum_salary:
          preferences.minimum_salary === "" ||
          preferences.minimum_salary == null
            ? null
            : Number(preferences.minimum_salary),
        maximum_salary:
          preferences.maximum_salary === "" ||
          preferences.maximum_salary == null
            ? null
            : Number(preferences.maximum_salary),
      };

      const response = await api.put("/jobs/preferences", payload);

      setPreferences({
        ...EMPTY_PREFERENCES,
        ...response.data,
      });

      setMessage("Your job preferences have been saved.");
      setPreferencesOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to save job preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetPreferences() {
    if (!window.confirm("Delete your saved job preferences?")) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.delete("/jobs/preferences");
      setPreferences(EMPTY_PREFERENCES);
      setSelectedSources(["All Sources"]);
      setMessage("Saved preferences deleted.");
      setPreferencesOpen(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleSource(source) {
    if (source === "All Sources") {
      setSelectedSources(["All Sources"]);
      return;
    }

    setSelectedSources((previous) => {
      const withoutAll = previous.filter(
        (item) => item !== "All Sources"
      );

      const next = withoutAll.includes(source)
        ? withoutAll.filter((item) => item !== source)
        : [...withoutAll, source];

      return next.length === 0 || next.length === SOURCES.length
        ? ["All Sources"]
        : next;
    });
  }

  async function searchJobs() {
    setSearching(true);
    setError("");
    setMessage("");
    setJobs([]);
    setSearchPerformed(true);

    try {
      const sources =
        selectedSources.includes("All Sources")
          ? []
          : selectedSources;

      const response = await api.post("/jobs/search", sources);

      setJobs(response.data.jobs || []);

      setSearchInfo({
        total: response.data.total_results ?? 0,
        location: response.data.location || "",
        queries: response.data.search_queries || [],
        groundedSources: response.data.grounded_sources || [],
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Job discovery failed. Please try again."
      );
    } finally {
      setSearching(false);
    }
  }

  const activeSourceCount = selectedSources.includes("All Sources")
    ? SOURCES.length
    : selectedSources.length;

  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#A78BFA]">
              Job Discovery
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Find your next opportunity.
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Discover opportunities using your resume and job preferences.
            </p>
          </div>

          <button
            onClick={() => setPreferencesOpen(!preferencesOpen)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#514475] bg-[#241E35] px-4 py-3 text-sm text-[#D0C2FF] transition hover:bg-[#302548]"
          >
            <Settings2 size={17} />
            Job preferences
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {preferencesOpen && (
          <section className="mb-8 rounded-2xl border border-[#393047] bg-[#151520] p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Job search preferences
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Tell us what opportunities you are looking for.
                </p>
              </div>

              <button
                onClick={() => setPreferencesOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-[#292938] hover:text-white"
                aria-label="Close preferences"
              >
                <X size={19} />
              </button>
            </div>

            {loadingPreferences ? (
              <p className="text-sm text-gray-400">
                Loading preferences...
              </p>
            ) : (
              <form onSubmit={savePreferences} className="space-y-7">
                <TagInput
                  label="Preferred job titles"
                  values={preferences.preferred_job_titles}
                  onChange={(value) =>
                    updatePreference("preferred_job_titles", value)
                  }
                  placeholder="e.g. Data Analyst"
                />

                <TagInput
                  label="Preferred locations"
                  values={preferences.preferred_locations}
                  onChange={(value) =>
                    updatePreference("preferred_locations", value)
                  }
                  placeholder="e.g. Lucknow, Remote"
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Experience level"
                    value={preferences.experience_level || ""}
                    onChange={(event) =>
                      updatePreference(
                        "experience_level",
                        event.target.value || null
                      )
                    }
                    options={["", ...EXPERIENCE_LEVELS]}
                  />

                  <SelectField
                    label="Availability"
                    value={preferences.availability || ""}
                    onChange={(event) =>
                      updatePreference(
                        "availability",
                        event.target.value || null
                      )
                    }
                    options={[
                      "",
                      "Immediately",
                      "Within 15 days",
                      "Within 30 days",
                      "Within 60 days",
                      "Not currently available",
                    ]}
                  />
                </div>

                <div>
                  <SectionTitle>Employment type</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((type) => {
                      const active =
                        preferences.preferred_job_types.includes(type);

                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => {
                            const next = active
                              ? preferences.preferred_job_types.filter(
                                  (item) => item !== type
                                )
                              : [...preferences.preferred_job_types, type];

                            updatePreference("preferred_job_types", next);
                          }}
                          className={`rounded-xl border px-3 py-2 text-xs transition ${
                            active
                              ? "border-[#806BE0] bg-[#302548] text-[#D0C2FF]"
                              : "border-[#30303E] bg-[#11111B] text-gray-400 hover:border-[#514475]"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <SectionTitle>Preferred salary range</SectionTitle>
                  <div className="grid gap-4 md:grid-cols-3">
                    <SelectField
                      label="Currency"
                      value={preferences.currency}
                      onChange={(event) =>
                        updatePreference("currency", event.target.value)
                      }
                      options={CURRENCIES}
                    />

                    <InputField
                      label="Minimum salary"
                      type="number"
                      min="0"
                      value={preferences.minimum_salary ?? ""}
                      onChange={(event) =>
                        updatePreference(
                          "minimum_salary",
                          event.target.value
                        )
                      }
                      placeholder="20000"
                    />

                    <InputField
                      label="Maximum salary"
                      type="number"
                      min="0"
                      value={preferences.maximum_salary ?? ""}
                      onChange={(event) =>
                        updatePreference(
                          "maximum_salary",
                          event.target.value
                        )
                      }
                      placeholder="40000"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Salary values are annual unless the employer specifies otherwise.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#30303E] bg-[#11111B] p-4">
                  <input
                    type="checkbox"
                    checked={preferences.willing_to_relocate}
                    onChange={(event) =>
                      updatePreference(
                        "willing_to_relocate",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 accent-[#9B87F5]"
                  />
                  <span className="text-sm text-gray-300">
                    I am willing to relocate for the right opportunity.
                  </span>
                </label>

                <div className="flex flex-wrap justify-between gap-3 border-t border-[#30303E] pt-5">
                  <button
                    type="button"
                    onClick={resetPreferences}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete saved preferences
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8179FF] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save preferences"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <section className="mb-7 rounded-2xl border border-[#292938] bg-[#151520] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#B9A7FF]" />
            <h2 className="font-semibold">Choose your job sources</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSources.map((source) => {
              const active = selectedSources.includes(source);

              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${
                    active
                      ? "border-[#806BE0] bg-[#302548] text-[#D0C2FF]"
                      : "border-[#30303E] bg-[#11111B] text-gray-400 hover:border-[#514475] hover:text-white"
                  }`}
                >
                  {source}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            {activeSourceCount} source{activeSourceCount !== 1 ? "s" : ""} selected.
            All Sources is selected by default.
          </p>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#30303E] pt-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-white">
                Ready to discover jobs?
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Search uses your uploaded and analyzed resume.
              </p>
            </div>

            <button
              onClick={searchJobs}
              disabled={searching || loadingPreferences}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-[#8179FF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Find matching jobs
                </>
              )}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {searchPerformed ? "Search results" : "Job opportunities"}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {searchInfo
                  ? `${searchInfo.total} results · ${searchInfo.location}`
                  : "Run a search to discover matching opportunities."}
              </p>
            </div>

            {searchInfo && (
              <span className="rounded-lg border border-[#30303E] bg-[#151520] px-3 py-2 text-xs text-gray-400">
                {searchInfo.total} results found
              </span>
            )}
          </div>

          {searching && (
            <div className="rounded-2xl border border-[#292938] bg-[#151520] p-10 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#A78BFA]"
              />
              <p className="mt-4 font-medium text-white">
                Discovering opportunities...
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Searching publicly accessible job sources.
              </p>
            </div>
          )}

          {!searching && searchPerformed && jobs.length === 0 && !error && (
            <div className="rounded-2xl border border-[#292938] bg-[#151520] p-10 text-center">
              <Search size={30} className="mx-auto text-gray-500" />
              <h3 className="mt-4 font-semibold text-white">
                No matching jobs found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try changing your selected sources or job preferences.
              </p>
            </div>
          )}

          {!searching && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <JobCard
                  key={`${job.company}-${job.title}-${index}`}
                  job={job}
                />
              ))}
            </div>
          )}

          {!searchPerformed && (
            <div className="rounded-2xl border border-dashed border-[#393047] bg-[#151520]/60 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#29243B] text-[#B9A7FF]">
                <BriefcaseBusiness size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-white">
                Your next opportunity starts here.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Set your preferences, choose job sources and click Find matching jobs
                whenever you are ready.
              </p>
            </div>
          )}

          {searchInfo?.groundedSources?.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#292938] bg-[#151520] p-4">
              <p className="mb-2 text-xs font-semibold text-gray-300">
                Search references
              </p>
              <div className="space-y-2">
                {searchInfo.groundedSources.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-xs text-[#B9A7FF] hover:text-white"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
