
import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileCheck,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Trash2,
  GraduationCap,
  BriefcaseBusiness,
  FolderGit2,
  Award,
  Code2,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";

const cardClass =
  "rounded-2xl border border-[#252533] bg-[#151520] p-6";

function Resume() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/resume/me");
      setResume(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load resume information."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selectedFile) => {
    setError("");
    setSuccess("");

    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setFile(null);
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("File size must not exceed 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    const confirmed = window.confirm(
      "Uploading this resume may replace your existing profile skills, education, experience, projects, certifications and languages with information extracted from the resume. Do you want to continue?"
    );

    if (!confirmed) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchResume();
      setSuccess("Resume uploaded and analyzed successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Resume upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const analysis =
    resume?.analysis ||
    resume?.resume_analysis ||
    {};

  const skills = analysis.skills || [];
  const education = analysis.education || [];
  const experience = analysis.experience || [];
  const projects = analysis.projects || [];
  const certifications = analysis.certifications || [];
  const languages = analysis.languages || [];

  const sections = [
    {
      title: "Technical Skills",
      icon: Code2,
      items: skills,
    },
    {
      title: "Education",
      icon: GraduationCap,
      items: education,
    },
    {
      title: "Work Experience",
      icon: BriefcaseBusiness,
      items: experience,
    },
    {
      title: "Projects",
      icon: FolderGit2,
      items: projects,
    },
    {
      title: "Certifications",
      icon: Award,
      items: certifications,
    },
    {
      title: "Languages",
      icon: FileText,
      items: languages,
    },
  ];

  const renderValue = (item) => {
    if (typeof item === "string") return item;

    if (typeof item === "object" && item !== null) {
      return Object.entries(item)
        .filter(([, value]) => value !== null && value !== "")
        .map(([key, value]) => {
          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

          return `${label}: ${
            Array.isArray(value) ? value.join(", ") : value
          }`;
        })
        .join(" • ");
    }

    return String(item);
  };

  if (loading) {
    return (
      <main className="ml-64 min-h-screen bg-[#0B0B12] p-8 text-white">
        <div className="flex min-h-[70vh] items-center justify-center gap-3 text-gray-400">
          <LoaderCircle className="animate-spin text-[#9B87F5]" />
          Loading resume manager...
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] px-8 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-7">

        <div>
          <p className="mb-2 text-sm text-[#9B87F5]">
            Workspace / Resume Manager
          </p>
          <h1 className="text-3xl font-bold">Resume Manager</h1>
          <p className="mt-2 text-sm text-gray-400">
            Upload your resume and let AI understand your professional profile.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-400">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <section className={cardClass}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#9B87F5]/10 p-3 text-[#9B87F5]">
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Upload Resume</h2>
              <p className="text-sm text-gray-500">
                PDF or DOCX · Maximum file size 10 MB
              </p>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-[#39364F] bg-[#11111B] px-6 py-12 text-center transition hover:border-[#9B87F5]"
          >
            <UploadCloud
              size={38}
              className="mx-auto mb-4 text-[#9B87F5]"
            />
            <p className="font-medium text-white">
              Drop your resume here or click to browse
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: PDF and DOCX
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#30303D] bg-[#11111B] p-4">
              <div className="flex items-center gap-3">
                <FileText className="text-[#9B87F5]" size={22} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="rounded-lg border border-[#39364F] p-2 text-gray-400 hover:text-red-400"
                  title="Remove selected file"
                >
                  <Trash2 size={17} />
                </button>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#8279FF] disabled:opacity-50"
                >
                  {uploading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {uploading ? "Analyzing..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          )}

          {uploading && (
            <p className="mt-4 text-sm text-[#B7A8FF]">
              AI is analyzing your resume. This may take a little while.
            </p>
          )}
        </section>

        <section className={cardClass}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileCheck className="text-[#9B87F5]" size={22} />
              <div>
                <h2 className="font-semibold text-white">Current Resume</h2>
                <p className="text-sm text-gray-500">
                  Your uploaded resume
                </p>
              </div>
            </div>

            <button
              onClick={fetchResume}
              className="flex items-center gap-2 rounded-lg border border-[#39364F] px-3 py-2 text-sm text-gray-300 hover:bg-[#252533]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {resume?.filename || resume?.resume_filename ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#30303D] bg-[#11111B] p-4">
              <FileCheck className="text-green-400" size={23} />
              <div>
                <p className="text-sm font-medium text-white">
                  {resume.filename || resume.resume_filename}
                </p>
                <p className="text-xs text-green-400">
                  Resume uploaded
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#343442] p-6 text-center text-sm text-gray-500">
              No resume uploaded yet.
            </p>
          )}
        </section>

        <section className={cardClass}>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#9B87F5]/10 p-3 text-[#9B87F5]">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-white">AI Resume Analysis</h2>
              <p className="text-sm text-gray-500">
                Information extracted by Gemini AI
              </p>
            </div>
          </div>

          {Object.keys(analysis).length > 0 ? (
            <div className="space-y-5">
              {analysis.professional_summary && (
                <div className="rounded-xl border border-[#30303D] bg-[#11111B] p-5">
                  <h3 className="mb-2 font-medium text-[#B7A8FF]">
                    Professional Summary
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                    {analysis.professional_summary}
                  </p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <div
                      key={section.title}
                      className="rounded-xl border border-[#30303D] bg-[#11111B] p-5"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <Icon size={18} className="text-[#9B87F5]" />
                        <h3 className="font-medium text-white">
                          {section.title}
                        </h3>
                        <span className="ml-auto text-xs text-gray-500">
                          {section.items.length}
                        </span>
                      </div>

                      {section.items.length > 0 ? (
                        <ul className="space-y-3">
                          {section.items.map((item, index) => (
                            <li
                              key={index}
                              className="border-b border-[#252533] pb-3 text-sm leading-6 text-gray-300 last:border-0 last:pb-0"
                            >
                              {renderValue(item)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">
                          No information extracted.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#343442] p-8 text-center">
              <Sparkles
                size={30}
                className="mx-auto mb-3 text-gray-600"
              />
              <p className="text-sm text-gray-400">
                AI analysis will appear here after you upload a resume.
              </p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default Resume;
