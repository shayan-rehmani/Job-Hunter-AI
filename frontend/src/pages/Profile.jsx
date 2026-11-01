
import { useEffect, useState } from "react";
import {
  UserRound, Code2, GraduationCap, BriefcaseBusiness,
  FolderGit2, Award, Languages, MapPin, Mail, Phone,
  Globe, Pencil, Save, X, Plus, Code, Globe2,
  Trash2, LoaderCircle, CalendarDays, AlertCircle,
  CheckCircle2, FileCheck, Building2
} from "lucide-react";

import api from "../api/axios";

const inputClass =
  "w-full rounded-xl border border-[#30303D] bg-[#11111B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9B87F5]";

const emptyProfileForm = {
  full_name: "",
  date_of_birth: "",
  phone: "",
  location: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  professional_summary: "",
};

const sections = {
  education: {
    title: "Education",
    endpoint: "/profile/me/education",
    fields: [
      { name: "qualification_level", label: "Qualification Level", required: true, placeholder: "Graduation, Post Graduation, 12th..." },
      { name: "degree", label: "Degree", placeholder: "B.Tech, BCA, MBA..." },
      { name: "institution", label: "Institution" },
      { name: "board_or_university", label: "Board / University" },
      { name: "stream", label: "Stream" },
      { name: "specialization", label: "Specialization" },
      { name: "start_year", label: "Start Year", placeholder: "2022" },
      { name: "end_year", label: "End Year", placeholder: "2026" },
      { name: "passing_year", label: "Passing Year", placeholder: "2026" },
      { name: "grade", label: "Grade / CGPA / Percentage" },
      { name: "grade_type", label: "Grade Type", placeholder: "CGPA, Percentage..." },
    ],
    icon: GraduationCap,
    empty: "No education records added yet.",
  },
  experience: {
    title: "Work Experience",
    endpoint: "/profile/me/experience",
    fields: [
      { name: "job_title", label: "Job Title" },
      { name: "company", label: "Company" },
      { name: "location", label: "Location" },
      { name: "start_date", label: "Start Date", placeholder: "Jan 2025" },
      { name: "end_date", label: "End Date", placeholder: "Present" },
      { name: "responsibilities", label: "Responsibilities", type: "textarea", full: true },
    ],
    icon: BriefcaseBusiness,
    empty: "No work experience added yet.",
  },
  projects: {
    title: "Projects",
    endpoint: "/profile/me/projects",
    fields: [
      { name: "name", label: "Project Name", required: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "technologies", label: "Technologies", placeholder: "Python, SQL, Power BI..." },
    ],
    icon: FolderGit2,
    empty: "No projects added yet.",
  },
  certifications: {
    title: "Certifications",
    endpoint: "/profile/me/certifications",
    fields: [
      { name: "name", label: "Certification Name", required: true },
      { name: "issuing_organization", label: "Issuing Organization" },
      { name: "date", label: "Date", placeholder: "October 2026" },
    ],
    icon: Award,
    empty: "No certifications added yet.",
  },
};

function Section({ title, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl border border-[#252533] bg-[#151520] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#9B87F5]/10 p-2.5 text-[#9B87F5]">
            <Icon size={19} />
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <p className="rounded-xl border border-dashed border-[#343442] px-4 py-6 text-center text-sm text-gray-500">
      {message}
    </p>
  );
}

function RecordModal({
  type,
  initialData,
  onClose,
  onSave,
  saving,
}) {
  const config = sections[type];

  const [form, setForm] = useState(() => {
    const values = {};
    config.fields.forEach((field) => {
      values[field.name] = initialData?.[field.name] || "";
    });
    return values;
  });

  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const field of config.fields) {
      if (field.required && !form[field.name]?.trim()) {
        setFormError(`${field.label} is required.`);
        return;
      }
    }

    if (
      type === "experience" &&
      !form.job_title?.trim() &&
      !form.company?.trim()
    ) {
      setFormError("Enter at least a job title or company.");
      return;
    }

    setFormError("");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#30303D] bg-[#151520] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? "Edit" : "Add"} {config.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your professional details below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-[#252533] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            {config.fields.map((field) => (
              <div
                key={field.name}
                className={field.full ? "md:col-span-2" : ""}
              >
                <label className="mb-2 block text-sm text-gray-400">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-400">*</span>
                  )}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={form[field.name]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={field.placeholder || field.label}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[field.name]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={field.placeholder || field.label}
                  />
                )}
              </div>
            ))}
          </div>

          {formError && (
            <p className="mt-4 text-sm text-red-400">{formError}</p>
          )}

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#39364F] px-5 py-3 text-sm text-gray-300 hover:bg-[#252533]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-3 text-sm font-medium text-white hover:bg-[#8279FF] disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {initialData ? "Update Record" : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyProfileForm);

  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);

  const [modal, setModal] = useState(null);
  const [savingRecord, setSavingRecord] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState("");

  const [languageInput, setLanguageInput] = useState("");
  const [editingLanguageId, setEditingLanguageId] = useState(null);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [deletingLanguageId, setDeletingLanguageId] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const notify = (message) => {
    setError("");
    setSuccess(message);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/profile/me");
      setProfile(response.data);

      setFormData({
        full_name: response.data.full_name || "",
        date_of_birth: response.data.date_of_birth || "",
        phone: response.data.phone || "",
        location: response.data.location || "",
        linkedin_url: response.data.linkedin_url || "",
        github_url: response.data.github_url || "",
        portfolio_url: response.data.portfolio_url || "",
        professional_summary: response.data.professional_summary || "",
      });

      setSkillsDraft(response.data.skills || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // Personal information
  const handlePersonalSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put("/profile/me", formData);

      setProfile(response.data);
      setIsEditing(false);
      notify("Personal information updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Skills
  const addSkill = () => {
    const value = newSkill.trim();
    if (!value) return;

    if (
      skillsDraft.some(
        (skill) => skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setNewSkill("");
      return;
    }

    setSkillsDraft((prev) => [...prev, value]);
    setNewSkill("");
  };

  const saveSkills = async () => {
    try {
      setSavingSkills(true);
      setError("");

      const response = await api.post("/profile/me/skills", {
        skills: skillsDraft,
      });

      setProfile((prev) => ({
        ...prev,
        skills: response.data.skills || skillsDraft,
      }));

      setEditingSkills(false);
      notify("Skills updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save skills."
      );
    } finally {
      setSavingSkills(false);
    }
  };

  // Add or update records
  const saveRecord = async (type, data, recordId) => {
    const config = sections[type];

    try {
      setSavingRecord(true);
      setError("");

      if (recordId) {
        await api.put(`${config.endpoint}/${recordId}`, data);
      } else {
        await api.post(config.endpoint, data);
      }

      setModal(null);
      await fetchProfile();

      notify(
        `${config.title} ${recordId ? "updated" : "added"} successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          `Unable to save ${config.title.toLowerCase()}.`
      );
    } finally {
      setSavingRecord(false);
    }
  };

  // Delete records
  const deleteRecord = async (type, recordId) => {
    const config = sections[type];

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${config.title.toLowerCase()} record?`
    );

    if (!confirmed) return;

    try {
      setDeletingRecord(`${type}-${recordId}`);
      setError("");

      await api.delete(`${config.endpoint}/${recordId}`);
      await fetchProfile();

      notify(`${config.title} record deleted successfully.`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          `Unable to delete ${config.title.toLowerCase()}.`
      );
    } finally {
      setDeletingRecord("");
    }
  };

  const handleLanguageSave = async () => {
  const name = languageInput.trim();
  if (!name) return;

  try {
    setSavingLanguage(true);
    setError("");
    setSuccess("");

    if (editingLanguageId !== null) {
      await api.put(`/profile/me/languages/${editingLanguageId}`, { name });
    } else {
      await api.post("/profile/me/languages", { name });
    }

    setLanguageInput("");
    setEditingLanguageId(null);

    await fetchProfile();
    notify("Language saved successfully.");
  } catch (err) {
    setError(err.response?.data?.detail || "Unable to save language.");
  } finally {
    setSavingLanguage(false);
  }
};

const handleLanguageEdit = (language) => {
  setLanguageInput(language.name);
  setEditingLanguageId(language.id);
};

const handleLanguageDelete = async (languageId) => {
  if (!window.confirm("Are you sure you want to delete this language?")) return;

  try {
    setDeletingLanguageId(languageId);
    setError("");

    await api.delete(`/profile/me/languages/${languageId}`);

    if (editingLanguageId === languageId) {
      setEditingLanguageId(null);
      setLanguageInput("");
    }

    await fetchProfile();
    notify("Language deleted successfully.");
  } catch (err) {
    setError(err.response?.data?.detail || "Unable to delete language.");
  } finally {
    setDeletingLanguageId(null);
  }
};

  const renderRecordSection = (type) => {
    const config = sections[type];
    const Icon = config.icon;
    const records = profile?.[type] || [];

    return (
      <Section
        key={type}
        title={`${config.title} (${records.length})`}
        icon={Icon}
        action={
          <button
            onClick={() =>
              setModal({ type, record: null })
            }
            className="flex items-center gap-2 rounded-lg bg-[#6C63FF] px-3 py-2 text-sm font-medium text-white hover:bg-[#8279FF]"
          >
            <Plus size={15} />
            Add New
          </button>
        }
      >
        {records.length === 0 ? (
          <EmptyState message={config.empty} />
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              let title = "";
              let subtitle = "";
              let description = "";
              let date = "";
              let extra = "";

              if (type === "education") {
                title = record.degree || record.qualification_level;
                subtitle = record.institution;
                date = [
                  record.start_year,
                  record.end_year || record.passing_year,
                ].filter(Boolean).join(" â€“ ");
                description = [
                  record.qualification_level,
                  record.stream,
                  record.specialization,
                ].filter(Boolean).join(" â€¢ ");
                extra = [
                  record.grade,
                  record.grade_type,
                ].filter(Boolean).join(" ");
              }

              if (type === "experience") {
                title = record.job_title || record.company;
                subtitle = record.company;
                date = [
                  record.start_date,
                  record.end_date || "Present",
                ].filter(Boolean).join(" â€“ ");
                description = record.responsibilities;
                extra = record.location;
              }

              if (type === "projects") {
                title = record.name;
                description = record.description;
                extra = record.technologies;
              }

              if (type === "certifications") {
                title = record.name;
                subtitle = record.issuing_organization;
                date = record.date;
              }

              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-[#30303D] bg-[#11111B] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white">
                        {title || "Untitled"}
                      </h3>

                      {subtitle && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-[#B7A8FF]">
                          {type === "experience" && (
                            <Building2 size={13} />
                          )}
                          {subtitle}
                        </p>
                      )}

                      {date && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <CalendarDays size={13} />
                          {date}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setModal({ type, record })
                        }
                        title="Edit record"
                        className="rounded-lg border border-[#39364F] p-2 text-[#B7A8FF] hover:bg-[#9B87F5]/10"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() =>
                          deleteRecord(type, record.id)
                        }
                        disabled={
                          deletingRecord === `${type}-${record.id}`
                        }
                        title="Delete record"
                        className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingRecord === `${type}-${record.id}` ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  {description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-400">
                      {description}
                    </p>
                  )}

                  {extra && (
                    <p className="mt-3 text-xs text-gray-500">
                      {extra}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    );
  };

  if (loading) {
    return (
      <main className="ml-64 min-h-screen bg-[#0B0B12] p-8 text-white">
        <div className="flex min-h-[70vh] items-center justify-center gap-3 text-gray-400">
          <LoaderCircle className="animate-spin text-[#9B87F5]" />
          Loading your profile...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="ml-64 min-h-screen bg-[#0B0B12] p-8 text-white">
        <p className="text-red-400">{error || "Profile not found."}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 rounded-lg bg-[#6C63FF] px-4 py-2 text-sm"
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-8 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Page heading */}
        <div>
          <p className="mb-2 text-sm text-[#9B87F5]">
            Workspace / Profile
          </p>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your professional information and career details.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
            <CheckCircle2 size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile overview */}
        <section className="relative overflow-hidden rounded-2xl border border-[#29283A] bg-gradient-to-br from-[#1B1930] to-[#151520] p-7">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#9B87F5]/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#9B87F5]/15 text-3xl font-bold text-[#B7A8FF]">
              {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold">
                {profile.full_name || "Your Name"}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {profile.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Code2 size={14} />
                  {profile.skills?.length || 0} Skills
                </span>
              </div>
            </div>

            <span className="rounded-xl border border-[#9B87F5]/20 bg-[#9B87F5]/10 px-4 py-2 text-xs font-medium text-[#B7A8FF]">
              Candidate Profile
            </span>
          </div>
        </section>

        {/* Personal information */}
        <Section
          title="Personal Information"
          icon={UserRound}
          action={
            !isEditing ? (
              <button
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-[#39364F] px-3 py-2 text-sm text-[#B7A8FF] hover:bg-[#9B87F5]/10"
              >
                <Pencil size={15} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-[#39364F] px-3 py-2 text-sm text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePersonalSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#6C63FF] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Save
                </button>
              </div>
            )
          }
        >
          {isEditing ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ["full_name", "Full Name"],
                ["date_of_birth", "Date of Birth (DD/MM/YYYY)"],
                ["phone", "Phone"],
                ["location", "Location"],
                ["linkedin_url", "LinkedIn URL"],
                ["github_url", "GitHub URL"],
                ["portfolio_url", "Portfolio URL"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm text-gray-400">
                    {label}
                  </label>
                  <input
                    value={formData[name]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder={label}
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-400">
                  Professional Summary
                </label>
                <textarea
                  rows={4}
                  value={formData.professional_summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      professional_summary: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Write your professional summary..."
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { label: "Full Name", value: profile.full_name, icon: UserRound },
                { label: "Email", value: profile.email, icon: Mail },
                { label: "Date of Birth", value: profile.date_of_birth, icon: CalendarDays },
                { label: "Phone", value: profile.phone, icon: Phone },
                { label: "Location", value: profile.location, icon: MapPin },
                { label: "LinkedIn", value: profile.linkedin_url, icon:  Globe2},
                { label: "GitHub", value: profile.github_url, icon: Code},
                { label: "Portfolio", value: profile.portfolio_url, icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex min-w-0 gap-3">
                    <div className="h-fit rounded-lg bg-[#9B87F5]/10 p-2 text-[#9B87F5]">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      {item.value ? (
                        <p className="mt-1 break-all text-sm text-gray-200">
                          {item.value}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-600">Not added</p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-[#30303D] pt-5 md:col-span-2">
                <p className="mb-2 text-xs text-gray-500">
                  Professional Summary
                </p>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                  {profile.professional_summary || "No summary added yet."}
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* Skills */}
        <Section
          title={`Technical Skills (${profile.skills?.length || 0})`}
          icon={Code2}
          action={
            !editingSkills ? (
              <button
                onClick={() => {
                  setSkillsDraft(profile.skills || []);
                  setEditingSkills(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-[#39364F] px-3 py-2 text-sm text-[#B7A8FF] hover:bg-[#9B87F5]/10"
              >
                <Pencil size={15} /> Manage Skills
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSkills(false)}
                  className="rounded-lg border border-[#39364F] px-3 py-2 text-sm text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSkills}
                  disabled={savingSkills}
                  className="flex items-center gap-2 rounded-lg bg-[#6C63FF] px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {savingSkills ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Save
                </button>
              </div>
            )
          }
        >
          {editingSkills && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className={inputClass}
                placeholder="Enter a skill, e.g. Python"
              />
              <button
                onClick={addSkill}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-3 text-sm text-white"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          )}

          {(editingSkills ? skillsDraft : profile.skills || []).length ? (
            <div className="flex flex-wrap gap-3">
              {(editingSkills ? skillsDraft : profile.skills || []).map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="flex items-center gap-2 rounded-xl border border-[#9B87F5]/20 bg-[#9B87F5]/10 px-4 py-2 text-sm text-[#D0C7FF]"
                  >
                    {skill}
                    {editingSkills && (
                      <button
                        onClick={() =>
                          setSkillsDraft((prev) =>
                            prev.filter((item) => item !== skill)
                          )
                        }
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                )
              )}
            </div>
          ) : (
            <EmptyState message="No skills added yet." />
          )}
        </Section>

        {/* CRUD sections */}
        {renderRecordSection("education")}
        {renderRecordSection("experience")}
        {renderRecordSection("projects")}
        {renderRecordSection("certifications")}

        {/* Languages */}
        <Section
          title={`Languages (${profile.languages?.length || 0})`}
          icon={Languages}
        >
          {/* Add / Edit Language */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLanguageSave();
                }
              }}
              className={inputClass}
              placeholder="Enter a language, e.g. English"
            />

            <button
              type="button"
              onClick={handleLanguageSave}
              disabled={savingLanguage || !languageInput.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {savingLanguage ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : editingLanguageId !== null ? (
                <Save size={16} />
              ) : (
                <Plus size={16} />
              )}

              {editingLanguageId !== null ? "Update" : "Add"}
            </button>

            {editingLanguageId !== null && (
              <button
                type="button"
                onClick={() => {
                  setLanguageInput("");
                  setEditingLanguageId(null);
                }}
                className="rounded-xl border border-[#39364F] px-4 py-3 text-sm text-gray-300"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Language List */}
          {profile.languages?.length > 0 ? (
            <div className="space-y-3">
              {profile.languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center justify-between rounded-xl border border-[#30303D] bg-[#11111B] px-4 py-3"
                >
                  <span className="text-sm text-gray-200">
                    {language.name}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLanguageEdit(language)}
                      className="rounded-lg border border-[#39364F] p-2 text-[#B7A8FF]"
                      title="Edit language"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLanguageDelete(language.id)}
                      disabled={deletingLanguageId === language.id}
                      className="rounded-lg border border-red-500/20 p-2 text-red-400 disabled:opacity-50"
                      title="Delete language"
                    >
                      {deletingLanguageId === language.id ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No languages added yet." />
          )}
        </Section>

        {/* Resume */}
        <Section title="Resume Information" icon={FileCheck}>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#30303D] bg-[#11111B] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#9B87F5]/10 p-3 text-[#9B87F5]">
                <FileCheck size={21} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {profile.resume_filename || "No resume uploaded"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Resume information and analysis
                </p>
              </div>
            </div>
            <span className="rounded-lg border border-[#30303D] px-3 py-2 text-xs text-gray-400">
              {profile.resume_filename ? "Uploaded" : "Not uploaded"}
            </span>
          </div>
        </Section>

      </div>

      {/* Add/Edit modal */}
      {modal && (
        <RecordModal
          type={modal.type}
          initialData={modal.record}
          saving={savingRecord}
          onClose={() => !savingRecord && setModal(null)}
          onSave={(data) =>
            saveRecord(modal.type, data, modal.record?.id)
          }
        />
      )}
    </main>
  );
}

export default Profile;
