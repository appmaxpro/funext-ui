import {
  createHashRouter,
  Navigate,
  RouterProvider,
  useLocation,
} from "react-router";

import { Welcome } from "./pages/welcome/welcome";
import { AppLayout } from "./components/app/app-layout";
import { Panel } from "@funext/ui";
import { Card } from "@funext/ui/components";
import { ErrorBoundary } from "./components/app/error-boundary";
import { Layout } from "./layout/layout";
import LoginPage from "./pages/auth/login-page";
import Dashboard from "./pages/dashboard";
/*
import { useSession } from "@/hooks/use-session";
import { Swagger } from "@/routes/swagger";

import { ChangePassword } from "./change-password";
import { ErrorPage } from "./error";
import { Login } from "./login";
import { Root } from "./root";
import { View } from "./view";
import { ForgotPassword } from "./forgot-password";
*/
function ProtectedRoute({ children }: { children: JSX.Element }) {
  /*
  const { state, data } = useSession();
  const location = useLocation();
  if (state === "loading") return null;
  if (data?.user) {
    return children;
  }
  return <Navigate to="/login" state={{ from: location }} />;
  */
  return (
    <ErrorBoundary>
      <Layout enableAppLayout>{children}</Layout>
    </ErrorBoundary>
  );
}

const router = createHashRouter([
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/change-password",
    element: <Welcome />,
  },
  {
    path: "/auth/forgot-password",
    element: <Welcome />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <Welcome />,
    children: [
      {
        path: "/",
        element: <Welcome />,
      },
      {
        path: "/ds/[action]?/[mode]?/[id]?",
        element: <Welcome />,
      },
    ],
  },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}
