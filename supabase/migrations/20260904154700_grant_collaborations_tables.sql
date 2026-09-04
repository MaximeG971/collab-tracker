-- Avec security_invoker = true sur la vue, le user connecté doit aussi
-- avoir SELECT sur les tables lues par la vue (sinon : permission denied for table ...)

GRANT SELECT ON public.collaborations TO authenticated;
GRANT SELECT ON public.deliverables TO authenticated;
GRANT SELECT ON public.brands TO authenticated;

-- Tables lues ailleurs dans l'app (liste / détail / tâches / fichiers)
GRANT SELECT ON public.tasks TO authenticated;
GRANT SELECT ON public.files TO authenticated;
