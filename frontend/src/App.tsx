import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Family from "./pages/Family";
import Medicines from "./pages/Medicines";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import { getUnreadNotificationCount } from "./services/notificationApi";

function Dashboard() {
  return (
    <>
      <p className="text-sm font-medium text-[#B86F83]">
        FAMILY DASHBOARD
      </p>

      <h2 className="text-3xl font-bold text-slate-800 mt-1">
        Good morning, Kashi
      </h2>

      <div className="mt-8 bg-white rounded-3xl border border-[#F0E1E5] p-8">
        <h3 className="text-2xl font-semibold text-slate-800">
          Welcome to Family Copilot
        </h3>

        <p className="text-slate-500 mt-3">
          Your family information and AI assistant will appear here.
        </p>
      </div>
    </>
  );
}

function AppShell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    const handleNotificationsUpdated = () => {
      void loadUnreadCount();
    };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    void loadUnreadCount();

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, []);

  const navItems = [
    {
      icon: "🏠",
      name: "Dashboard",
      path: "/",
    },
    {
      icon: "👨‍👩‍👧",
      name: "Family",
      path: "/family",
    },
    {
      icon: "💊",
      name: "Medicines",
      path: "/medicines",
    },
    {
      icon: "📄",
      name: "Documents",
      path: "/documents",
    },
    {
      icon: "🔔",
      name: "Notifications",
      path: "/notifications",
      showUnreadCount: true,
    },
    {
      icon: "✦",
      name: "Chat",
      path: "/chat",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#F0E1E5] p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#D98FA3] text-white flex items-center justify-center text-xl">
            ✦
          </div>

          <div>
            <h1 className="font-bold text-slate-800">
              Family Copilot
            </h1>

            <p className="text-xs text-slate-400">
              Your family assistant
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block w-full px-4 py-3 rounded-xl transition ${isActive
                  ? "bg-[#FCECEF] text-[#A85F75]"
                  : "text-slate-600 hover:bg-[#FFF4F6]"
                }`
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span>
                  {item.icon} {item.name}
                </span>

                {item.showUnreadCount &&
                  unreadCount > 0 && (
                    <span className="min-w-6 rounded-full bg-[#D98FA3] px-2 py-0.5 text-center text-xs font-semibold text-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
              </div>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  // React state now tracks authentication.
  // Reading localStorage only once with the lazy initializer
  // gives us the initial authentication state.
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("access_token")
  );

  // Listen for login/logout authentication changes.
  useEffect(() => {
    const handleAuthChanged = () => {
      setToken(localStorage.getItem("access_token"));
    };

    window.addEventListener(
      "auth-changed",
      handleAuthChanged
    );

    return () => {
      window.removeEventListener(
        "auth-changed",
        handleAuthChanged
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* Protected application routes */}
        <Route
          element={
            token ? (
              <AppShell />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/family"
            element={<Family />}
          />

          <Route
            path="/medicines"
            element={<Medicines />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route path="/chat" element={<Chat />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={token ? "/" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
