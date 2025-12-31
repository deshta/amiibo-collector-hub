-- Add type column to amiibos table
ALTER TABLE public.amiibos ADD COLUMN type text;

-- Update existing records based on first byte of amiibo_hex_id
UPDATE public.amiibos 
SET type = CASE 
  WHEN LEFT(amiibo_hex_id, 4) = '0x00' OR amiibo_hex_id LIKE '00%' THEN 'Figure'
  WHEN LEFT(amiibo_hex_id, 4) = '0x01' OR amiibo_hex_id LIKE '01%' THEN 'Card'
  WHEN LEFT(amiibo_hex_id, 4) = '0x02' OR amiibo_hex_id LIKE '02%' THEN 'Yarn'
  WHEN LEFT(amiibo_hex_id, 4) = '0x03' OR amiibo_hex_id LIKE '03%' THEN 'Band'
  WHEN LEFT(amiibo_hex_id, 4) = '0x04' OR amiibo_hex_id LIKE '04%' THEN 'Block'
  ELSE 'Figure'
END
WHERE type IS NULL;