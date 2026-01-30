import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Package, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  nome: string;
  tipo: string;
  preco: number;
  created_at: string;
}

const productTypes = ['Bebida', 'Cerveja', 'Porção', 'Bolinho', 'Prato'] as const;

export default function Produtos() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  
  // Form state
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [preco, setPreco] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('tipo')
      .order('nome');

    if (error) {
      toast.error('Erro ao carregar produtos');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleCreateProduct = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!tipo) {
      toast.error('Tipo é obrigatório');
      return;
    }
    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) {
      toast.error('Preço inválido');
      return;
    }

    const { error } = await supabase
      .from('products')
      .insert([{
        nome: nome.trim(),
        tipo: tipo as 'Bebida' | 'Cerveja' | 'Porção' | 'Bolinho' | 'Prato',
        preco: precoNum,
      }]);

    if (error) {
      toast.error('Erro ao criar produto');
      return;
    }

    toast.success('Produto criado com sucesso!');
    resetForm();
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string, productName: string) => {
    if (!confirm(`Deseja excluir "${productName}"?`)) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir produto');
      return;
    }

    toast.success('Produto excluído');
    fetchProducts();
  };

  const resetForm = () => {
    setNome('');
    setTipo('');
    setPreco('');
    setShowNewProduct(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const groupedProducts = productTypes.reduce((acc, type) => {
    acc[type] = products.filter((p) => p.tipo === type);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="page-header">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="page-title">Produtos</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'grouped'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Por Tipo
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Lista
          </button>
        </div>

        {/* New Product Form */}
        {showNewProduct ? (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Novo Produto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do produto"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo
                </label>
                <div className="flex flex-wrap gap-2">
                  {productTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipo(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tipo === t
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preço
                </label>
                <input
                  type="text"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0,00"
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateProduct} className="btn-primary">
                  Criar Produto
                </button>
                <button onClick={resetForm} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewProduct(true)}
            className="w-full mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Carregando produtos...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-muted-foreground">
              Adicione produtos para começar
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-6">
            {productTypes.map((type) => {
              const typeProducts = groupedProducts[type];
              if (typeProducts.length === 0) return null;
              
              return (
                <div key={type} className="animate-fade-in">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {type}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({typeProducts.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {typeProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {product.nome}
                          </p>
                          <p className="text-sm font-semibold price-tag">
                            {formatCurrency(product.preco)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.nome)}
                          className="btn-icon hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{product.nome}</p>
                    <p className="text-sm text-muted-foreground">{product.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold price-tag">
                    {formatCurrency(product.preco)}
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.nome)}
                    className="btn-icon hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
