-- Add currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN currency text DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR', 'JPY'));