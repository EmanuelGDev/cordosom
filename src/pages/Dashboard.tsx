import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UtensilsCrossed, LogOut, LayoutGrid, Package, Users } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isAdmin, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">
                Mesa Manager
              </h1>
              <p className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{profile?.nome || 'Usuário'}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="btn-ghost text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Menu Principal
          </h2>

          <div className="grid gap-4">
            {/* Mesas - Available for all users */}
            <button
              onClick={() => navigate('/mesas')}
              className="nav-button group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <LayoutGrid className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Mesas</h3>
                <p className="text-sm text-muted-foreground">
                  Gerenciar mesas abertas
                </p>
              </div>
            </button>

            {/* Products - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate('/produtos')}
                className="nav-button group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Produtos</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastrar e gerenciar produtos
                  </p>
                </div>
              </button>
            )}

            {/* Users - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate('/usuarios')}
                className="nav-button group"
              >
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Usuários</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerenciar usuários do sistema
                  </p>
                </div>
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Admin:</span> Você tem acesso a todas as funcionalidades do sistema.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
