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

      <h2 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
        Nice to see you again!
      </h2>

      <div className="mt-6 rounded-3xl border border-[#F0E1E5] bg-white p-5 sm:mt-8 sm:p-8">
        <h3 className="text-xl font-semibold text-slate-800 sm:text-2xl">
          Welcome to FamilyMate
        </h3>

        <p className="text-slate-500 mt-3">
          Keep track of your family, reminders, and important information in one place.
        </p>
      </div>
    </>
  );
}

function AppShell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    <div className="min-h-screen bg-[#FFF9FA] flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-[#F0E1E5] p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#D98FA3] text-white flex items-center justify-center text-xl">
            ✦
          </div>

          <div>
            <h1 className="font-bold text-slate-800">
              FamilyMate
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

      {/* Mobile and tablet drawer */}
      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] shrink-0 bg-white border-r border-[#F0E1E5] p-6 shadow-xl transition-transform duration-200 lg:hidden ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#F0E1E5] text-slate-600 hover:bg-[#FFF4F6]"
          onClick={() => setIsDrawerOpen(false)}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ✕
          </span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 pr-10">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#D98FA3] text-white flex items-center justify-center text-xl">
            ✦
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-slate-800">
              FamilyMate
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
              onClick={() => setIsDrawerOpen(false)}
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
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#F0E1E5] bg-white px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isDrawerOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F0E1E5] text-slate-600 hover:bg-[#FFF4F6]"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ☰
            </span>
          </button>

          <div className="ml-3 min-w-0">
            <p className="truncate font-bold text-slate-800">FamilyMate</p>
          </div>
        </header>

        <div className="min-w-0 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
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
