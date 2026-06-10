GRANT SELECT, INSERT, UPDATE, DELETE ON public.laundry_invoices TO authenticated;
GRANT ALL ON public.laundry_invoices TO service_role;

CREATE POLICY "Authenticated users can read invoices"
ON public.laundry_invoices
FOR SELECT
TO authenticated
USING (true);