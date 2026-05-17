import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, User, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProtocol } from '@/hooks/useProtocol';

interface Mesa {
  id: string;
  numero: number;
}

interface Conta {
  id: string;
  nome_responsavel: string;
  total: number;
  created_at: string;
  fechada: boolean;
}

export default function Contas() {
  useProtocol();
  const navigate = useNavigate();
  const { mesaId } = useParams<{ mesaId: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConta, setShowNewConta] = useState(false);
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [contaToClose, setContaToClose] = useState<Conta | null>(null);

  const fetchData = async () => {
    if (!mesaId) return;

    // Fetch mesa
    const { data: mesaData, error: mesaError } = await supabase
      .from('mesas')
      .select('id, numero')
      .eq('id', mesaId)
      .maybeSingle();

    if (mesaError || !mesaData) {
      toast.error('Mesa não encontrada');
      navigate('/mesas');
      return;
    }
    setMesa(mesaData);

    // Fetch contas
    const { data: contasData, error: contasError } = await supabase
      .from('contas')
      .select('*')
      .eq('mesa_id', mesaId)
      .order('created_at', { ascending: true });

    if (contasError) {
      toast.error('Erro ao carregar contas');
    } else {
      setContas(contasData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [mesaId]);

  const handleCreateConta = async () => {
    if (!nomeResponsavel.trim()) {
      toast.error('Nome do responsável é obrigatório');
      return;
    }

    const { error } = await supabase
      .from('contas')
      .insert({
        mesa_id: mesaId,
        nome_responsavel: nomeResponsavel.trim(),
        total: 0,
      });

    if (error) {
      toast.error('Erro ao criar conta');
      return;
    }

    toast.success('Conta criada com sucesso!');
    setNomeResponsavel('');
    setShowNewConta(false);
    fetchData();
  };

  const handleCloseConta = async () => {
    if (!contaToClose) return;

    const { error } = await supabase
      .from('contas')
      .update({ fechada: true })
      .eq('id', contaToClose.id);

    if (error) {
      toast.error('Erro ao fechar conta');
      return;
    }

    toast.success(`Conta de ${contaToClose.nome_responsavel} fechada!`);
    setContaToClose(null);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mesas')}
              className="btn-icon flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-display font-bold text-foreground truncate">Mesa {mesa?.numero}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Contas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* New Conta Form */}
        {showNewConta ? (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Nova Conta</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={nomeResponsavel}
                onChange={(e) => setNomeResponsavel(e.target.value)}
                placeholder="Nome do responsável"
                className="input-field flex-1 text-base"
              />
              <div className="flex gap-2 sm:gap-3">
                <button onClick={handleCreateConta} className="btn-primary flex-1 sm:flex-none py-3 sm:py-2">
                  Criar
                </button>
                <button
                  onClick={() => {
                    setShowNewConta(false);
                    setNomeResponsavel('');
                  }}
                  className="btn-secondary flex-1 sm:flex-none py-3 sm:py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewConta(true)}
            className="w-full mb-4 sm:mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 active:bg-primary/5"
          >
            <Plus className="w-5 h-5" />
            Nova Conta
          </button>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Carregando contas...
            </div>
          </div>
        ) : contas.length === 0 ? (
          <div className="empty-state py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Nenhuma conta nesta mesa
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione uma conta para começar
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contas.map((conta, index) => (
              <div
                key={conta.id}
                className={`conta-card animate-fade-in p-3 sm:p-4 ${conta.fechada ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => navigate(`/mesas/${mesaId}/contas/${conta.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        conta.fechada ? 'bg-muted' : 'bg-conta-active/10'
                      }`}>
                        {conta.fechada ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-conta-active" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {conta.nome_responsavel}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formatDate(conta.created_at)}</span>
                          {conta.fechada && (
                            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded flex-shrink-0">Fechada</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-base sm:text-lg font-bold price-tag">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatCurrency(conta.total)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        +10%: {formatCurrency(conta.total * 0.1)}
                      </div>
                    </div>
                  </div>
                </button>
                {!conta.fechada && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContaToClose(conta);
                    }}
                    className="mt-3 w-full py-2.5 sm:py-2 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Fechar Conta
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Close Conta Dialog */}
      <AlertDialog open={!!contaToClose} onOpenChange={() => setContaToClose(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Fechar conta de {contaToClose?.nome_responsavel}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Subtotal: {formatCurrency(contaToClose?.total || 0)}</p>
                <p>10% Serviço: {formatCurrency((contaToClose?.total || 0) * 0.1)}</p>
                <p className="font-semibold text-foreground text-base">
                  Total: {formatCurrency((contaToClose?.total || 0) * 1.1)}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConta}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fechar Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
