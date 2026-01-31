import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, LayoutGrid, Clock, XCircle } from 'lucide-react';
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
  aberta: boolean;
  created_at: string;
}

export default function Mesas() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMesa, setShowNewMesa] = useState(false);
  const [mesaToClose, setMesaToClose] = useState<Mesa | null>(null);
  const [newMesaNumero, setNewMesaNumero] = useState('');

  const fetchMesas = async () => {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .eq('aberta', true)
      .order('numero', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar mesas');
      console.error(error);
    } else {
      setMesas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const handleCreateMesa = async () => {
    const numero = parseInt(newMesaNumero);
    
    if (isNaN(numero) || numero <= 0) {
      toast.error('Número da mesa inválido');
      return;
    }

    const { error } = await supabase
      .from('mesas')
      .insert({ numero, aberta: true });

    if (error) {
      if (error.code === '23505') {
        toast.error('Já existe uma mesa com este número');
      } else {
        toast.error('Erro ao criar mesa');
      }
      return;
    }

    toast.success(`Mesa ${numero} criada com sucesso!`);
    setNewMesaNumero('');
    setShowNewMesa(false);
    fetchMesas();
  };

  const handleCloseMesa = async () => {
    if (!mesaToClose) return;

    const { error } = await supabase
      .from('mesas')
      .update({ aberta: false })
      .eq('id', mesaToClose.id);

    if (error) {
      toast.error('Erro ao fechar mesa');
      return;
    }

    // Close all accounts of this table
    await supabase
      .from('contas')
      .update({ fechada: true })
      .eq('mesa_id', mesaToClose.id);

    toast.success(`Mesa ${mesaToClose.numero} fechada!`);
    setMesaToClose(null);
    fetchMesas();
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-icon flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-3xl font-display font-bold text-foreground">Mesas Abertas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* New Mesa Form */}
        {showNewMesa ? (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Nova Mesa</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={newMesaNumero}
                onChange={(e) => setNewMesaNumero(e.target.value)}
                placeholder="Número da mesa"
                className="input-field flex-1 text-base"
                min="1"
              />
              <div className="flex gap-2 sm:gap-3">
                <button onClick={handleCreateMesa} className="btn-primary flex-1 sm:flex-none py-3 sm:py-2">
                  Criar
                </button>
                <button
                  onClick={() => {
                    setShowNewMesa(false);
                    setNewMesaNumero('');
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
            onClick={() => setShowNewMesa(true)}
            className="w-full mb-4 sm:mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 active:bg-primary/5"
          >
            <Plus className="w-5 h-5" />
            Abrir Nova Mesa
          </button>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Carregando mesas...
            </div>
          </div>
        ) : mesas.length === 0 ? (
          <div className="empty-state py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Nenhuma mesa aberta
            </h3>
            <p className="text-sm text-muted-foreground">
              Clique em "Abrir Nova Mesa" para começar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mesas.map((mesa, index) => (
              <div
                key={mesa.id}
                className="mesa-card animate-fade-in p-4 sm:p-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => navigate(`/mesas/${mesa.id}/contas`)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-mesa-open/10 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-mesa-open" />
                    </div>
                    <span className="status-badge status-badge-open text-xs">
                      Aberta
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-1 sm:mb-2">
                    Mesa {mesa.numero}
                  </h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatDate(mesa.created_at)}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMesaToClose(mesa);
                  }}
                  className="mt-3 sm:mt-4 w-full py-2.5 sm:py-2 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 active:bg-destructive/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Fechar Mesa
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Close Mesa Dialog */}
      <AlertDialog open={!!mesaToClose} onOpenChange={() => setMesaToClose(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Fechar Mesa {mesaToClose?.numero}?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Essa ação irá fechar a mesa e todas as contas vinculadas a ela.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseMesa}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fechar Mesa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
