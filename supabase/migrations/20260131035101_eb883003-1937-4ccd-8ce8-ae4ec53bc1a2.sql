-- Add fechada column to contas table
ALTER TABLE public.contas ADD COLUMN IF NOT EXISTS fechada boolean NOT NULL DEFAULT false;