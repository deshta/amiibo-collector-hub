-- Permitir que admins possam inserir/deletar roles de outros usuários
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam todos os roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam todos os profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins possam deletar amiibos
CREATE POLICY "Only admins can delete amiibos"
ON public.amiibos
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));