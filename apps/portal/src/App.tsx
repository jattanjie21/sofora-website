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
import { PortalShell } from "./PortalShell";
import { Overview } from "./pages/Overview";
import { ContentEditor, ContentList } from "./pages/Content";
import { Applications } from "./pages/Applications";
import { ApplicationForm } from "./pages/ApplicationForm";
import { ApplicationDetail } from "./pages/ApplicationDetail";
import { Staff } from "./pages/Staff";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";

function SignedInWorkspace() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const person = useQuery(api.staff.me, isAuthenticated ? {} : "skip");
  const location = useLocation();
  if (isLoading || (isAuthenticated && person === undefined)) return <p className="panel-empty" role="status">Checking your session…</p>;
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
          { path: "staff", element: <Staff /> },
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
                This page isn’t in your workspace. Let’s get you back on track.
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
