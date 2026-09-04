-- Deliverables do not have a user_id column in the real schema.
-- RLS must therefore follow the owning collaboration.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated;

DROP POLICY IF EXISTS "deliverables_select_own" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_insert_own" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_update_own" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_delete_own" ON public.deliverables;

CREATE POLICY "deliverables_select_own"
ON public.deliverables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = deliverables.collaboration_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "deliverables_insert_own"
ON public.deliverables
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = deliverables.collaboration_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "deliverables_update_own"
ON public.deliverables
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = deliverables.collaboration_id
      AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = deliverables.collaboration_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "deliverables_delete_own"
ON public.deliverables
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.collaborations c
    WHERE c.id = deliverables.collaboration_id
      AND c.user_id = auth.uid()
  )
);