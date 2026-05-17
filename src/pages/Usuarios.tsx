import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Users, Shield, User, Pencil, Trash2, X, Check } from 'lucide-react';
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

interface UserProfile {
  user_id: string;
  nome: string;
  cpf: string;
  created_at: string;
  role?: string;
}

export default function Usuarios() {
  useProtocol();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUser, setShowNewUser] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [isNewAdmin, setIsNewAdmin] = useState(false);

  // Edit state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // Delete state
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('nome');

    if (profilesError) {
      toast.error('Erro ao carregar usuários');
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const usersWithRoles = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role || 'user',
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const cleanCPF = (cpf: string) => cpf.replace(/\D/g, '');

  const handleCreateUser = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const cleanedCpf = cleanCPF(cpf);
    if (cleanedCpf.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    if (password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      // Create user with CPF-based email
      const userEmail = `${cleanedCpf}@restaurante.local`;

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signupError) {
        if (signupError.message.includes('already registered')) {
          toast.error('Este CPF já está cadastrado');
        } else {
          toast.error('Erro ao criar usuário');
        }
        return;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            nome: nome.trim(),
            cpf: cleanedCpf,
          });

        if (profileError) {
          toast.error('Erro ao criar perfil');
          return;
        }

        // Create role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: isNewAdmin ? 'admin' : 'user',
          });

        if (roleError) {
          console.error('Role error:', roleError);
        }

        toast.success('Usuário criado com sucesso!');
        resetForm();
        fetchUsers();
      }
    } catch (err) {
      toast.error('Erro ao criar usuário');
    }
  };

  const resetForm = () => {
    setNome('');
    setCpf('');
    setPassword('');
    setIsNewAdmin(false);
    setShowNewUser(false);
  };

  const displayCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const startEditing = (user: UserProfile) => {
    setEditingUser(user);
    setEditNome(user.nome);
    setEditIsAdmin(user.role === 'admin');
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditNome('');
    setEditIsAdmin(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editNome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    // Update profile name
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nome: editNome.trim() })
      .eq('user_id', editingUser.user_id);

    if (profileError) {
      toast.error('Erro ao atualizar nome');
      return;
    }

    // Update role if changed
    const currentIsAdmin = editingUser.role === 'admin';
    if (editIsAdmin !== currentIsAdmin) {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.user_id);

      // Insert new role
      await supabase
        .from('user_roles')
        .insert({
          user_id: editingUser.user_id,
          role: editIsAdmin ? 'admin' : 'user',
        });
    }

    toast.success('Usuário atualizado!');
    cancelEditing();
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Delete from user_roles first (due to potential FK)
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userToDelete.user_id);

    // Delete from profiles
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userToDelete.user_id);

    if (error) {
      toast.error('Erro ao excluir usuário');
      return;
    }

    toast.success('Usuário excluído!');
    setUserToDelete(null);
    fetchUsers();
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
            <h1 className="text-xl sm:text-3xl font-display font-bold text-foreground">Usuários</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* New User Form */}
        {showNewUser ? (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do usuário"
                  className="input-field text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="input-field text-base"
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
                  placeholder="Mínimo 6 caracteres"
                  className="input-field text-base"
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={isNewAdmin}
                    onChange={(e) => setIsNewAdmin(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Administrador
                  </span>
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={handleCreateUser} className="btn-primary py-3 sm:py-2">
                  Criar Usuário
                </button>
                <button onClick={resetForm} className="btn-secondary py-3 sm:py-2">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewUser(true)}
            className="w-full mb-4 sm:mb-6 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 active:bg-primary/5"
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </button>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">
              Carregando usuários...
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione usuários para começar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => (
              <div
                key={user.user_id}
                className="p-3 sm:p-4 bg-card border border-border rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {editingUser?.user_id === user.user_id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="input-field text-base"
                      placeholder="Nome"
                    />
                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={editIsAdmin}
                        onChange={(e) => setEditIsAdmin(e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Administrador
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={handleUpdateUser} className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-2">
                        <Check className="w-4 h-4" />
                        Salvar
                      </button>
                      <button onClick={cancelEditing} className="btn-secondary flex items-center justify-center gap-2 py-3 sm:py-2">
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.role === 'admin' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        ) : (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{user.nome}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          CPF: {displayCPF(user.cpf)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <span className={`status-badge text-[10px] sm:text-xs hidden sm:inline-flex ${
                        user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </span>
                      <button
                        onClick={() => startEditing(user)}
                        className="btn-icon w-8 h-8 sm:w-10 sm:h-10 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="btn-icon w-8 h-8 sm:w-10 sm:h-10 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete User Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Excluir {userToDelete?.nome}?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Essa ação irá excluir permanentemente o usuário. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
