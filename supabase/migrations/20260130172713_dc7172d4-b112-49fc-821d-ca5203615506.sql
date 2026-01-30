-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('Bebida', 'Cerveja', 'Porção', 'Bolinho', 'Prato');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo product_type NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tables (mesas) table
CREATE TABLE public.mesas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero INTEGER NOT NULL,
    aberta BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts (contas) table
CREATE TABLE public.contas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mesa_id UUID REFERENCES public.mesas(id) ON DELETE CASCADE NOT NULL,
    nome_responsavel TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create account items (itens_conta) table
CREATE TABLE public.itens_conta (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conta_id UUID REFERENCES public.contas(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    nome_produto TEXT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_conta ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user profile by CPF
CREATE OR REPLACE FUNCTION public.get_user_by_cpf(p_cpf TEXT)
RETURNS TABLE (
    user_id UUID,
    nome TEXT,
    cpf TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT p.user_id, p.nome, p.cpf
    FROM public.profiles p
    WHERE p.cpf = p_cpf;
END;
$$;

-- Function to update account total
CREATE OR REPLACE FUNCTION public.update_conta_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.contas
        SET total = total + NEW.preco
        WHERE id = NEW.conta_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.contas
        SET total = total - OLD.preco
        WHERE id = OLD.conta_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger to auto-update account total
CREATE TRIGGER trigger_update_conta_total
AFTER INSERT OR DELETE ON public.itens_conta
FOR EACH ROW
EXECUTE FUNCTION public.update_conta_total();

-- RLS Policies for profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Authenticated users can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for mesas
CREATE POLICY "Authenticated users can view mesas"
ON public.mesas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage mesas"
ON public.mesas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for contas
CREATE POLICY "Authenticated users can view contas"
ON public.contas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage contas"
ON public.contas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for itens_conta
CREATE POLICY "Authenticated users can view itens"
ON public.itens_conta FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage itens"
ON public.itens_conta FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);