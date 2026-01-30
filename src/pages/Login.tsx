import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UtensilsCrossed, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [nome, setNome] = useState('');
  const [signupCpf, setSignupCpf] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (value: string, setter: (v: string) => void) => {
    setter(formatCPF(value));
  };

  const cleanCPF = (cpf: string) => cpf.replace(/\D/g, '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanedCpf = cleanCPF(cpf);

    if (cleanedCpf.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      setLoading(false);
      return;
    }

    try {
      // Find user by CPF
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_by_cpf', { p_cpf: cleanedCpf });

      if (profileError || !profileData || profileData.length === 0) {
        toast.error('CPF não encontrado');
        setLoading(false);
        return;
      }

      // Get user email from auth
      const userProfile = profileData[0];
      
      // We need to use email for login, so we'll use CPF as part of email
      const userEmail = `${cleanedCpf}@restaurante.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Senha incorreta');
        } else {
          toast.error('Erro ao fazer login');
        }
        setLoading(false);
        return;
      }

      toast.success(`Bem-vindo, ${userProfile.nome}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanedCpf = cleanCPF(signupCpf);

    if (cleanedCpf.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      setLoading(false);
      return;
    }

    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Use CPF-based email for authentication
      const userEmail = `${cleanedCpf}@restaurante.local`;

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: userEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome,
            cpf: cleanedCpf,
          }
        }
      });

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          toast.error('Este CPF já está cadastrado');
        } else {
          toast.error('Erro ao criar conta');
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            nome: nome,
            cpf: cleanedCpf,
          });

        if (profileError) {
          console.error('Profile error:', profileError);
          toast.error('Erro ao criar perfil');
          setLoading(false);
          return;
        }

        // Create default user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user',
          });

        if (roleError) {
          console.error('Role error:', roleError);
        }

        toast.success('Conta criada com sucesso!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Mesa Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gerenciamento de Mesas
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Cadastrar
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => handleCpfChange(e.target.value, setCpf)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={signupCpf}
                  onChange={(e) => handleCpfChange(e.target.value, setSignupCpf)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
