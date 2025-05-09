
-- Migration Schema para Supabase
-- Gerado em: 2025-05-09

-- Tabelas
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_id UUID NOT NULL REFERENCES public.admins(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.configuracao_campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  series_numericas INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  documento TEXT NOT NULL,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  genero TEXT,
  idade TEXT,
  id_participante TEXT,
  rua TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  uf TEXT,
  senha TEXT,
  numeros_sorte TEXT,
  quantidade_numeros INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.numeros_sorte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  numero INTEGER NOT NULL,
  documento TEXT NOT NULL,
  obs TEXT
);

CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dataDaVenda TEXT,
  documento TEXT,
  documentoFiscal TEXT,
  formaDePagamento TEXT,
  imagemCupom TEXT,
  itemProcessado TEXT DEFAULT '',
  loja TEXT,
  valorTotal NUMERIC
);

-- Views
CREATE OR REPLACE VIEW public.numeros_cada_participante AS
SELECT
  p.id,
  p.documento,
  p.nome,
  p.email,
  p.telefone,
  p.rua,
  p.numero,
  p.complemento,
  p.cidade,
  p.cep,
  p.uf,
  p.senha,
  p.quantidade_numeros,
  ARRAY_AGG(ns.numero) AS numeros_sorte
FROM
  participantes p
LEFT JOIN
  numeros_sorte ns ON p.documento = ns.documento
GROUP BY
  p.id,
  p.documento,
  p.nome,
  p.email,
  p.telefone,
  p.rua,
  p.numero,
  p.complemento,
  p.cidade,
  p.cep,
  p.uf,
  p.senha,
  p.quantidade_numeros;

-- Funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_participante_quantidade_numeros()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the quantidade_numeros for the participant
    UPDATE public.participantes
    SET quantidade_numeros = (
        SELECT COUNT(*)
        FROM public.numeros_sorte
        WHERE documento = NEW.documento
    )
    WHERE documento = NEW.documento;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_login(admin_email text, admin_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_record RECORD;
    token TEXT;
BEGIN
    -- Verificar se as credenciais estão corretas
    SELECT * INTO admin_record FROM public.admins 
    WHERE email = admin_email AND password = admin_password;
    
    IF admin_record IS NULL THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Credenciais inválidas'
        );
    END IF;
    
    -- Gerar um token simples (em produção usaria algo mais seguro)
    token := encode(digest(admin_record.id::text || now()::text, 'sha256'), 'hex');
    
    -- Inserir ou atualizar o token na tabela de sessões de administrador
    INSERT INTO admin_sessions (admin_id, token, expires_at)
    VALUES (
        admin_record.id, 
        token, 
        now() + interval '24 hours'
    )
    ON CONFLICT (admin_id) 
    DO UPDATE SET 
        token = EXCLUDED.token,
        expires_at = EXCLUDED.expires_at;
    
    RETURN json_build_object(
        'success', TRUE,
        'token', token
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admin(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Verificar se o token existe e não expirou
    SELECT * INTO session_record FROM admin_sessions 
    WHERE admin_sessions.token = token AND expires_at > now();
    
    RETURN session_record IS NOT NULL;
END;
$$;

-- Triggers
CREATE TRIGGER update_configuracao_campanha_updated_at
BEFORE UPDATE ON public.configuracao_campanha
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participante_quantidade
AFTER INSERT OR UPDATE OR DELETE ON public.numeros_sorte
FOR EACH ROW
EXECUTE FUNCTION public.update_participante_quantidade_numeros();

-- Restrições e Índices
ALTER TABLE admin_sessions ADD CONSTRAINT admin_sessions_admin_id_key UNIQUE (admin_id);
CREATE INDEX IF NOT EXISTS idx_numeros_sorte_documento ON numeros_sorte (documento);
CREATE INDEX IF NOT EXISTS idx_participantes_documento ON participantes (documento);

-- Inserir admin inicial (opcional - ajuste as credenciais conforme necessário)
INSERT INTO public.admins (email, password)
VALUES ('admin@exemplo.com', 'senha_segura') 
ON CONFLICT (email) DO NOTHING;

-- Inserir configuração inicial (opcional)
INSERT INTO public.configuracao_campanha (series_numericas)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
