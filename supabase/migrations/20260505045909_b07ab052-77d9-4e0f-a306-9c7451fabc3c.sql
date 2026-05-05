CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  uid UUID := auth.uid();
  cnt INT;
  is_already_admin BOOLEAN;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin') INTO is_already_admin;
  IF is_already_admin THEN RETURN TRUE; END IF;
  SELECT COUNT(*) INTO cnt FROM public.user_roles WHERE role = 'admin';
  IF cnt > 0 THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN TRUE;
END $function$;