import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  UtensilsCrossed,
  LogIn,
  ArrowRight,
  Coffee,
  Clock,
  ShieldCheck,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { useProtocol } from '@/hooks/useProtocol';

export default function Landing() {
  useProtocol();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Cor Do Som
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-sm py-2.5 px-4"
              >
                <span className="hidden sm:inline">Acessar Sistema</span>
                <span className="sm:hidden">Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-sm py-2.5 px-4"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Coffee className="w-4 h-4" />
              Sistema de Gerenciamento de Mesas
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Cor Do Som
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Gerencie suas mesas, contas e produtos com praticidade.
              Uma solução moderna e eficiente para o seu restaurante.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto"
                >
                  Acessar o Sistema
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto"
                  >
                    Entrar no Sistema
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollToSection('funcionalidades')}
                    className="btn-secondary text-base py-3.5 px-8 w-full sm:w-auto"
                  >
                    Saiba Mais
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Scroll hint */}
          {!user && (
            <button
              onClick={() => scrollToSection('funcionalidades')}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-16 sm:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground">
              Funcionalidades pensadas para agilizar o atendimento e simplificar a gestão do seu restaurante.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={<LayoutGrid className="w-6 h-6" />}
              title="Gerenciamento de Mesas"
              description="Abra, feche e acompanhe o status de todas as mesas em tempo real."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6" />}
              title="Contas Individuais"
              description="Crie múltiplas contas por mesa com cálculo automático de totais e taxa de 10%."
            />
            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Catálogo de Produtos"
              description="Cadastre produtos e categorize para agilizar o atendimento."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Rápido e Intuitivo"
              description="Interface otimizada para touch e uso no dia a dia do restaurante."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Seguro e Confiável"
              description="Autenticação por CPF e controle de acessos com perfis de usuário."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6" />}
              title="100% Responsivo"
              description="Funciona perfeitamente em celulares, tablets e computadores."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-muted-foreground">
              Em poucos passos, seu restaurante está organizado e pronto para atender.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <StepCard
              step="1"
              title="Abra a Mesa"
              description="Selecione uma mesa disponível e inicie o atendimento."
            />
            <StepCard
              step="2"
              title="Adicione Produtos"
              description="Escolha os itens do cardápio e inclua na conta da mesa."
            />
            <StepCard
              step="3"
              title="Feche a Conta"
              description="Finalize com cálculo automático dos totais e taxa de serviço."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Acesse o sistema agora mesmo e comece a gerenciar seu restaurante de forma eficiente.
            </p>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn-primary text-base py-3.5 px-8"
            >
              {user ? 'Acessar o Sistema' : 'Entrar no Sistema'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">
              Cor Do Som
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Sistema de Gerenciamento de Mesas
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 card-hover">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
        {step}
      </div>
      <h3 className="font-semibold text-foreground text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}

/* Inline icon wrappers to avoid importing missing icons from lucide-react */
function LayoutGrid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function Receipt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6" />
      <path d="M16 12h-6" />
      <path d="M16 16h-6" />
    </svg>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
