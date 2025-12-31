
-- Reestruturar a tabela amiibos para o novo formato JSON
-- Primeiro, remover as colunas antigas
ALTER TABLE public.amiibos 
  DROP COLUMN IF EXISTS series,
  DROP COLUMN IF EXISTS character_name,
  DROP COLUMN IF EXISTS release_date,
  DROP COLUMN IF EXISTS image_url;

-- Adicionar as novas colunas
ALTER TABLE public.amiibos
  ADD COLUMN amiibo_hex_id text UNIQUE,
  ADD COLUMN release_au date,
  ADD COLUMN release_na date,
  ADD COLUMN release_eu date,
  ADD COLUMN release_jp date,
  ADD COLUMN image_path text;

-- Criar índice para busca pelo hex id
CREATE INDEX IF NOT EXISTS idx_amiibos_hex_id ON public.amiibos(amiibo_hex_id);
