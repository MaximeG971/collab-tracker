-- La vue existe mais le rôle Supabase "authenticated" n'a pas le GRANT SELECT.
-- Sans ça, PostgREST renvoie : permission denied for view collaborations_with_status

GRANT SELECT ON public.collaborations_with_status TO authenticated;

-- Applique les policies RLS des tables sous-jacentes au user connecté (PG 15+).
-- Nécessite aussi GRANT SELECT sur ces tables → voir migration 20260904154700.
ALTER VIEW public.collaborations_with_status SET (security_invoker = true);
