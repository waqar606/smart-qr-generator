
-- Create table for tracking QR code scans
CREATE TABLE public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  operating_system TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics
CREATE POLICY "Anyone can read scans" ON public.qr_scans FOR SELECT USING (true);

-- Public insert for logging scans
CREATE POLICY "Anyone can insert scans" ON public.qr_scans FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON public.qr_scans(scanned_at);
