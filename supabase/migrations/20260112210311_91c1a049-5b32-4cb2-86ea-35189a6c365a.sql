-- Add value_payed column to user_amiibos table (stores value in BRL cents)
ALTER TABLE public.user_amiibos 
ADD COLUMN value_payed numeric(10,2) DEFAULT NULL;