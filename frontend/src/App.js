import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppHeader from "./components/AppHeader";
import SystemStatusBanner from "./components/SystemStatusBanner";
import SettingsSidebar from "./components/SettingsSidebar";
import { Toaster } from "./components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ProfilePage from "./pages/ProfilePage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import BillingPage from "./pages/BillingPage";
import APIKeysPage from "./pages/APIKeysPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import EnginesPage from "./pages/EnginesPage";
import MoneyPipelinePage from "./pages/MoneyPipelinePage";
import PipelineComposerPage from "./pages/PipelineComposerPage";
import ExecutionHistoryPage from "./pages/ExecutionHistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";

const routeEntries = [
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/oauth/callback", element: <OAuthCallbackPage /> },
  { path: "/invite/accept", element: <AcceptInvitePage /> },
  { path: "/", element: <ProtectedRoute><HomePage /></ProtectedRoute> },
  { path: "/engines", element: <ProtectedRoute><EnginesPage /></ProtectedRoute> },
  { path: "/money-pipeline", element: <ProtectedRoute><MoneyPipelinePage /></ProtectedRoute> },
  { path: "/pipeline-composer", element: <ProtectedRoute><PipelineComposerPage /></ProtectedRoute> },
  { path: "/history", element: <ProtectedRoute><ExecutionHistoryPage /></ProtectedRoute> },
  { path: "/analytics", element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute> },
  { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: "/team/settings", element: <ProtectedRoute><TeamSettingsPage /></ProtectedRoute> },
  { path: "/billing", element: <ProtectedRoute><BillingPage /></ProtectedRoute> },
  { path: "/settings/api-keys", element: <ProtectedRoute><APIKeysPage /></ProtectedRoute> },
  { path: "/admin/overview", element: <ProtectedRoute><AdminOverviewPage /></ProtectedRoute> },
];

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppHeader />
          <div className="universe-context-banner">
            <span className="banner-label">Parent</span>
            <span className="banner-value">SLA113 Factory</span>
            <span className="banner-separator">/</span>
            <span className="banner-label">Universe</span>
            <span className="banner-value">Empire</span>
          </div>
          <SystemStatusBanner />
          <div className="app-layout">
            <SettingsSidebar />
            <main className="app-main">
              <Routes>
                {routeEntries.map(({ path, element }) => (
                  <Route key={`legacy-${path}`} path={path} element={element} />
                ))}
                {routeEntries.map(({ path, element }) => (
                  <Route key={`empire-${path}`} path={`/empire${path}`} element={element} />
                ))}
                <Route path="/empire" element={<Navigate to="/empire/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
