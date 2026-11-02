
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Dashboard from "./components/Dashboard";

import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Auth from "./pages/Auth";
import FindJobs from "./pages/FindJobs";
import JobMatches from "./pages/JobMatches";

function Placeholder({ title, description }) {
  return (
    <main className="ml-64 min-h-screen bg-[#0B0B12] p-8 text-white">
      <p className="mb-3 text-sm text-gray-500">Workspace</p>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-gray-400">{description}</p>
    </main>
  );
}

function ProtectedLayout({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth />} />

        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedLayout>
              <Resume />
            </ProtectedLayout>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedLayout>
              <FindJobs />
            </ProtectedLayout>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedLayout>
              <JobMatches />
            </ProtectedLayout>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedLayout>
              <Placeholder
                title="Applications"
                description="Track your job applications."
              />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
