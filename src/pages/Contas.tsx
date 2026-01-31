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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="page-header">
            <button
              onClick={() => navigate('/mesas')}
              className="btn-icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="page-title">Mesa {mesa?.numero}</h1>
              <p className="text-sm text-muted-foreground">Contas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* New Conta Form */}
        {showNewConta ? (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Nova Conta</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={nomeResponsavel}
                onChange={(e) => setNomeResponsavel(e.target.value)}
                placeholder="Nome do responsável"
                className="input-field flex-1"
              />
              <button onClick={handleCreateConta} className="btn-primary">
                Criar
              </button>
              <button
                onClick={() => {
                  setShowNewConta(false);
                  setNomeResponsavel('');
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewConta(true)}
            className="w-full mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
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
          <div className="empty-state">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma conta nesta mesa
            </h3>
            <p className="text-muted-foreground">
              Adicione uma conta para começar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contas.map((conta, index) => (
              <div
                key={conta.id}
                className={`conta-card animate-fade-in ${conta.fechada ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => navigate(`/mesas/${mesaId}/contas/${conta.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        conta.fechada ? 'bg-muted' : 'bg-conta-active/10'
                      }`}>
                        {conta.fechada ? (
                          <CheckCircle className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <User className="w-6 h-6 text-conta-active" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {conta.nome_responsavel}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(conta.created_at)}
                          {conta.fechada && (
                            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">Fechada</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold price-tag">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(conta.total)}
                      </div>
                      <div className="text-xs text-muted-foreground">
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
                    className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fechar conta de {contaToClose?.nome_responsavel}?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>Subtotal: {formatCurrency(contaToClose?.total || 0)}</p>
                <p>10% Serviço: {formatCurrency((contaToClose?.total || 0) * 0.1)}</p>
                <p className="font-semibold text-foreground">
                  Total: {formatCurrency((contaToClose?.total || 0) * 1.1)}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConta}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fechar Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
