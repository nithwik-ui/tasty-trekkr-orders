
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  cnt INT;
BEGIN
  IF uid IS NULL THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO cnt FROM public.user_roles WHERE role = 'admin';
  IF cnt > 0 THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN TRUE;
END $$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
