import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Mesas from "./pages/Mesas";
import Contas from "./pages/Contas";
import ContaDetalhes from "./pages/ContaDetalhes";
import Produtos from "./pages/Produtos";
import Usuarios from "./pages/Usuarios";
import NotFound from "./pages/NotFound";
import { useRestoreSession } from "./hooks/useRestoreSession";
import { useProtocol } from "./hooks/useProtocol";

const queryClient = new QueryClient();

function ProtectedRoute({ children, restoring }: { children: React.ReactNode, restoring: boolean }) {
  const { user, loading } = useAuth();

  if (loading || restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { restoring } = useRestoreSession();
  useProtocol();

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute restoring={restoring}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mesas"
        element={
          <ProtectedRoute restoring={restoring}>
            <Mesas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mesas/:mesaId/contas"
        element={
          <ProtectedRoute restoring={restoring}>
            <Contas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mesas/:mesaId/contas/:contaId"
        element={
          <ProtectedRoute restoring={restoring}>
            <ContaDetalhes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtos"
        element={
          <ProtectedRoute restoring={restoring}>
            <Produtos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute restoring={restoring}>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;