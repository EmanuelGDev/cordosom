import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, User, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Mesa {
  id: string;
  numero: number;
}

interface Conta {
  id: string;
  nome_responsavel: string;
  total: number;
  created_at: string;
}

export default function Contas() {
  const navigate = useNavigate();
  const { mesaId } = useParams<{ mesaId: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConta, setShowNewConta] = useState(false);
  const [nomeResponsavel, setNomeResponsavel] = useState('');

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
              <button
                key={conta.id}
                onClick={() => navigate(`/mesas/${mesaId}/contas/${conta.id}`)}
                className="conta-card w-full text-left animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-conta-active/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-conta-active" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {conta.nome_responsavel}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(conta.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold price-tag">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(conta.total)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
