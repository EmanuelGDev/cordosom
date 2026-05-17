import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, ShoppingBag, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

interface ItemConta {
  id: string;
  nome_produto: string;
  preco: number;
  created_at: string;
}

interface Product {
  id: string;
  nome: string;
  tipo: string;
  preco: number;
}

export default function ContaDetalhes() {
  useProtocol();
  const navigate = useNavigate();
  const { mesaId, contaId } = useParams<{ mesaId: string; contaId: string }>();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [conta, setConta] = useState<Conta | null>(null);
  const [itens, setItens] = useState<ItemConta[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  const productTypes = ['Bebida', 'Cerveja', 'Porção', 'Bolinho', 'Prato'];

  const fetchData = async () => {
    if (!mesaId || !contaId) return;

    // Fetch mesa
    const { data: mesaData } = await supabase
      .from('mesas')
      .select('id, numero')
      .eq('id', mesaId)
      .maybeSingle();

    if (mesaData) setMesa(mesaData);

    // Fetch conta
    const { data: contaData } = await supabase
      .from('contas')
      .select('*')
      .eq('id', contaId)
      .maybeSingle();

    if (contaData) setConta(contaData);

    // Fetch itens
    const { data: itensData } = await supabase
      .from('itens_conta')
      .select('*')
      .eq('conta_id', contaId)
      .order('created_at', { ascending: false });

    if (itensData) setItens(itensData);

    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('nome');

    if (productsData) setProducts(productsData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [mesaId, contaId]);

  const handleAddProduct = async (product: Product) => {
    const { error } = await supabase
      .from('itens_conta')
      .insert({
        conta_id: contaId,
        product_id: product.id,
        nome_produto: product.nome,
        preco: product.preco,
      });

    if (error) {
      toast.error('Erro ao adicionar produto');
      return;
    }

    toast.success(`${product.nome} adicionado!`);
    setShowAddProduct(false);
    setSelectedType('');
    fetchData();
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from('itens_conta')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast.error('Erro ao remover item');
      return;
    }

    toast.success('Item removido');
    fetchData();
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredProducts = selectedType
    ? products.filter((p) => p.tipo === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/mesas/${mesaId}/contas`)}
              className="btn-icon flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-3xl font-display font-bold text-foreground truncate">{conta?.nome_responsavel}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Mesa {mesa?.numero}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-sm text-muted-foreground">Subtotal</p>
              <p className="text-base sm:text-xl font-bold price-tag">
                {formatCurrency(conta?.total || 0)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                +10%: {formatCurrency((conta?.total || 0) * 0.1)}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Total: {formatCurrency((conta?.total || 0) * 1.1)}
              </p>
              {conta?.fechada && (
                <span className="mt-1 inline-block text-[10px] sm:text-xs bg-muted px-2 py-0.5 rounded">Fechada</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Add Product Button/Modal */}
        {showAddProduct ? (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Adicionar Produto</h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setSelectedType('');
                }}
                className="btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <button
                onClick={() => setSelectedType('')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  selectedType === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Todos
              </button>
              {productTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                Nenhum produto encontrado
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 max-h-60 sm:max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="p-2.5 sm:p-3 bg-muted/50 hover:bg-primary/10 active:bg-primary/20 border border-border hover:border-primary rounded-lg text-left transition-all"
                  >
                    <p className="font-medium text-foreground text-xs sm:text-sm line-clamp-2">
                      {product.nome}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{product.tipo}</p>
                    <p className="text-xs sm:text-sm font-semibold price-tag mt-1">
                      {formatCurrency(product.preco)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : !conta?.fechada ? (
          <button
            onClick={() => setShowAddProduct(true)}
            className="w-full mb-4 sm:mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 active:bg-primary/5"
          >
            <Plus className="w-5 h-5" />
            Adicionar Produto
          </button>
        ) : null}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Carregando...
            </div>
          </div>
        ) : itens.length === 0 ? (
          <div className="empty-state py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Nenhum produto na conta
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione produtos para começar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {itens.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-card border border-border rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">{item.nome_produto}</p>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {formatTime(item.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="font-semibold price-tag text-sm sm:text-base">
                    {formatCurrency(item.preco)}
                  </span>
                  {!conta?.fechada && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn-icon w-8 h-8 sm:w-10 sm:h-10 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
