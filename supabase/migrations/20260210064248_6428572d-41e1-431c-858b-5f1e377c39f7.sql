
-- QR codes table (publicly readable for scanning)
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled QR Code',
  type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  style JSONB NOT NULL DEFAULT '{}',
  paused BOOLEAN NOT NULL DEFAULT false,
  file_url TEXT,
  file_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-paused QR codes (needed for scanning)
CREATE POLICY "QR codes are publicly readable"
  ON public.qr_codes FOR SELECT
  USING (true);

-- Anyone can insert QR codes (no auth for now)
CREATE POLICY "Anyone can create QR codes"
  ON public.qr_codes FOR INSERT
  WITH CHECK (true);

-- Anyone can update QR codes
CREATE POLICY "Anyone can update QR codes"
  ON public.qr_codes FOR UPDATE
  USING (true);

-- Anyone can delete QR codes
CREATE POLICY "Anyone can delete QR codes"
  ON public.qr_codes FOR DELETE
  USING (true);

-- Storage bucket for QR code files
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-files', 'qr-files', true);

-- Public read access for QR files
CREATE POLICY "QR files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-files');

-- Anyone can upload QR files
CREATE POLICY "Anyone can upload QR files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'qr-files');
