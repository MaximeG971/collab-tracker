-- Ajoute la valeur "ugc" à l'enum platform (nouvelle plateforme dans la liste).
-- Note Postgres : une valeur d'enum tout juste ajoutée ne peut pas être utilisée
-- dans la même transaction que l'ALTER TYPE — on l'isole donc dans sa propre
-- instruction, avant toute utilisation éventuelle ailleurs.
ALTER TYPE public.platform ADD VALUE IF NOT EXISTS 'ugc';

-- Droits d'édition/suppression pour les collaborations et les marques.
-- Les policies RLS "update_own"/"delete_own" existaient déjà, mais les GRANT
-- correspondants (nécessaires en plus des policies) n'avaient été faits que
-- pour SELECT et INSERT.
GRANT UPDATE, DELETE ON public.collaborations TO authenticated;
GRANT UPDATE, DELETE ON public.brands TO authenticated;
