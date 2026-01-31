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
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                Cor Do Som
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Olá, <span className="font-medium text-foreground">{profile?.nome || 'Usuário'}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="btn-ghost text-muted-foreground hover:text-destructive p-2 sm:px-4 sm:py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline ml-2">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6">
            Menu Principal
          </h2>

          <div className="grid gap-3 sm:gap-4">
            {/* Mesas - Available for all users */}
            <button
              onClick={() => navigate('/mesas')}
              className="nav-button group p-4 sm:px-6 sm:py-4"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Mesas</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Gerenciar mesas abertas
                </p>
              </div>
            </button>

            {/* Products - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate('/produtos')}
                className="nav-button group p-4 sm:px-6 sm:py-4"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Produtos</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Cadastrar e gerenciar produtos
                  </p>
                </div>
              </button>
            )}

            {/* Users - Admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate('/usuarios')}
                className="nav-button group p-4 sm:px-6 sm:py-4"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Usuários</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Gerenciar usuários do sistema
                  </p>
                </div>
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium text-primary">Admin:</span> Você tem acesso a todas as funcionalidades do sistema.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
