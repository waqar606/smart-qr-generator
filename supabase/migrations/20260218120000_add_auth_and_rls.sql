-- Add ownership and tighten RLS for authenticated dashboards.
-- Public scanning is handled via the Edge Function `track-scan`.

-- 1) Ownership columns
ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.qr_codes
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.qr_scans
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Best-effort backfill (only works for rows that already have a user_id)
UPDATE public.qr_scans s
SET owner_id = c.user_id
FROM public.qr_codes c
WHERE s.qr_code_id = c.id
  AND s.owner_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_owner_id ON public.qr_scans(owner_id);

-- 2) Replace permissive policies with ownership-based policies

-- qr_codes
DROP POLICY IF EXISTS "QR codes are publicly readable" ON public.qr_codes;
DROP POLICY IF EXISTS "Anyone can create QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Anyone can update QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Anyone can delete QR codes" ON public.qr_codes;

CREATE POLICY "qr_codes_select_own"
  ON public.qr_codes FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "qr_codes_insert_own"
  ON public.qr_codes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "qr_codes_update_own"
  ON public.qr_codes FOR UPDATE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "qr_codes_delete_own"
  ON public.qr_codes FOR DELETE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- qr_scans
DROP POLICY IF EXISTS "Anyone can read scans" ON public.qr_scans;
DROP POLICY IF EXISTS "Anyone can insert scans" ON public.qr_scans;

CREATE POLICY "qr_scans_select_owner"
  ON public.qr_scans FOR SELECT
  USING (auth.role() = 'authenticated' AND owner_id = auth.uid());

-- 3) Storage: keep public reads, require auth for uploads
DROP POLICY IF EXISTS "Anyone can upload QR files" ON storage.objects;

CREATE POLICY "Authenticated can upload QR files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'qr-files' AND auth.role() = 'authenticated');

