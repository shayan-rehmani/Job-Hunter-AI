
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Dashboard from "./components/Dashboard";

import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import Auth from "./pages/Auth";
import FindJobs from "./pages/FindJobs";
import Applications from "./pages/Applications";

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
          path="/applications"
          element={
            <ProtectedLayout>
              <Applications />
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
