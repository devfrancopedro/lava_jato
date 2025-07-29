-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  modelo_veiculo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de tipos de serviços
CREATE TABLE public.tipos_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  tempo_medio_minutos INTEGER NOT NULL,
  valor_padrao DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir tipos de serviços padrão
INSERT INTO public.tipos_servicos (nome, tempo_medio_minutos, valor_padrao) VALUES
('Lavagem Simples', 30, 20.00),
('Lavagem Completa', 60, 35.00),
('Enceramento', 120, 80.00),
('Polimento', 180, 120.00),
('Lavagem + Enceramento', 150, 100.00),
('Lavagem + Polimento', 200, 140.00);

-- Criar tabela de histórico de serviços
CREATE TABLE public.historico_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_servico_id UUID NOT NULL REFERENCES public.tipos_servicos(id),
  valor DECIMAL(10,2) NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  tempo_real_minutos INTEGER,
  funcionario_responsavel TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'andamento' CHECK (status IN ('andamento', 'finalizado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_servicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (acesso público por enquanto - sem autenticação)
CREATE POLICY "Acesso público a clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público a tipos de serviços" ON public.tipos_servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público a histórico de serviços" ON public.historico_servicos FOR ALL USING (true) WITH CHECK (true);

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar timestamps
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_historico_servicos_updated_at
  BEFORE UPDATE ON public.historico_servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_clientes_telefone ON public.clientes(telefone);
CREATE INDEX idx_historico_servicos_cliente_id ON public.historico_servicos(cliente_id);
CREATE INDEX idx_historico_servicos_data_inicio ON public.historico_servicos(data_inicio);
CREATE INDEX idx_historico_servicos_status ON public.historico_servicos(status);