import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";
import { WorkspaceProvider } from "./data/WorkspaceProvider";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { EmptyState } from "./components/ui";
import { ShellSkeleton } from "./components/Skeleton";
import { PortalShell } from "./PortalShell";
import { Overview } from "./pages/Overview";
import { ContentEditor, ContentList } from "./pages/Content";
import { Applications } from "./pages/Applications";
import { ContactInbox } from "./pages/ContactInbox";
import { ContactDetail } from "./pages/ContactDetail";
import { ApplicationForm } from "./pages/ApplicationForm";
import { ApplicationDetail } from "./pages/ApplicationDetail";
import { Staff } from "./pages/Staff";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";

function SignedInWorkspace() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const person = useQuery(api.staff.me, isAuthenticated ? {} : "skip");
  const location = useLocation();
  if (isLoading || (isAuthenticated && person === undefined)) return <ShellSkeleton path={location.pathname} />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{from:location.pathname + location.search + location.hash}} />;
  if (!person) return <EmptyState title="Staff access is inactive" action={<button className="btn" onClick={() => void signOut()}>Log out</button>}>Contact your administrator to restore access.</EmptyState>;
  return <WorkspaceProvider user={person}><PortalShell /></WorkspaceProvider>;
}

const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { path: "login", element: <Login /> },
      {
        element: <SignedInWorkspace />,
        children: [
          { index: true, element: <Overview /> },
          { path: "profile", element: <Profile /> },
          { path: "content", element: <ContentList /> },
          { path: "content/:id", element: <ContentEditor /> },
          { path: "applications", element: <Applications /> },
          { path: "applications/new", element: <ApplicationForm /> },
          { path: "applications/:id", element: <ApplicationDetail /> },
          { path: "applications/:id/edit", element: <ApplicationForm /> },
          { path: "contact", element: <ContactInbox /> },
          { path: "contact/:id", element: <ContactDetail /> },
          { path: "staff", element: <Staff /> },
          { path: "settings", element: <Settings /> },
          {
            path: "*",
            element: (
              <EmptyState
                title="A small detour"
                action={
                  <Link className="btn" to="/">
                    Back to overview
                  </Link>
                }
              >
                This page doesn’t exist. Let’s get you back on track.
              </EmptyState>
            ),
          },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
