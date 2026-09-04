-- Policies RLS : chaque user ne voit et ne crée que ses propres lignes (user_id = auth.uid())

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- brands
CREATE POLICY "brands_select_own"
ON public.brands
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "brands_insert_own"
ON public.brands
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brands_update_own"
ON public.brands
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brands_delete_own"
ON public.brands
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- collaborations
CREATE POLICY "collaborations_select_own"
ON public.collaborations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "collaborations_insert_own"
ON public.collaborations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "collaborations_update_own"
ON public.collaborations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "collaborations_delete_own"
ON public.collaborations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- deliverables
CREATE POLICY "deliverables_select_own"
ON public.deliverables
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "deliverables_insert_own"
ON public.deliverables
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deliverables_update_own"
ON public.deliverables
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deliverables_delete_own"
ON public.deliverables
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
