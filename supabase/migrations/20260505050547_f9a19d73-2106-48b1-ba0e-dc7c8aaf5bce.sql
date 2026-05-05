
-- Grant admin role to the designated admin email (idempotent)
INSERT INTO public.user_roles (user_id, role)
VALUES ('83717369-207a-4275-9052-1e4bf59c81f1', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove the public self-claim function — admin assignment is now hard-coded server-side
DROP FUNCTION IF EXISTS public.claim_first_admin();
