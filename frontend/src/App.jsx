import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ContextProvider from "./context/Context";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import MemoryPage from "./pages/MemoryPage";
import Main from "./components/main/Main";
import Sidebar from "./components/sidebar/Sidebar";

// Loading screen while session is being validated
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      color: "var(--text-muted)",
      fontSize: "0.95rem",
    }}>
      Loading...
    </div>
  );
}

// Chat layout: sidebar + main with shared collapse state
function ChatLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Main sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
    </>
  );
}

// Protected: requires auth
function ProtectedChat() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <ContextProvider>
      <ChatLayout />
    </ContextProvider>
  );
}

// Protected: any auth-required page
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Guest: redirects logged-in users to /chat
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/chat" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route
        path="/login"
        element={<GuestRoute><LoginPage /></GuestRoute>}
      />
      <Route
        path="/signup"
        element={<GuestRoute><SignupPage /></GuestRoute>}
      />
      <Route
        path="/forgot-password"
        element={<GuestRoute><ForgotPasswordPage /></GuestRoute>}
      />
      <Route
        path="/reset-password"
        element={<GuestRoute><ResetPasswordPage /></GuestRoute>}
      />
      <Route path="/chat" element={<ProtectedChat />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/memory" element={
           <ProtectedRoute>
             <MemoryPage />
           </ProtectedRoute>
         }
       />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
