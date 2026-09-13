import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/Login";
import { ProjectEditorPage } from "./pages/ProjectEditor";
import { ProjectsPage } from "./pages/Projects";
import { EnquiriesPage } from "./pages/Enquiries";
import { SitePage } from "./pages/Site";
import { HomePage } from "./public/HomePage";
import { ProjectDetailPage } from "./public/ProjectDetailPage";
import { PublicProjectsPage } from "./public/ProjectsPage";
import { SiteContentProvider } from "./public/siteContent";

function RequireAuth({ children }: { children: ReactNode }) {
  const { admin, ready } = useAuth();
  if (!ready) {
    return (
      <div className="admin-app flex min-h-screen items-center justify-center text-sm text-sand/70">
        Loading…
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}

export function App() {
  return (
    <SiteContentProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<PublicProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <div className="admin-app min-h-screen">
                <AppShell />
              </div>
            </RequireAuth>
          }
        >
          <Route index element={<ProjectsPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="site" element={<SitePage />} />
          <Route path="projects/new" element={<ProjectEditorPage />} />
          <Route path="projects/:id" element={<ProjectEditorPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteContentProvider>
  );
}
