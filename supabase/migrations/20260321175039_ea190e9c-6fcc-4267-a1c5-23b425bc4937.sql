
-- Create companies table for tour/travel company registration
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  registration_number text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  profile_photo_url text,
  verification_status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(registration_number)
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert their own company" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company if pending or rejected" ON public.companies
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id AND verification_status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all companies" ON public.companies
  FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can view verified companies (for company pages)
CREATE POLICY "Public can view verified companies" ON public.companies
  FOR SELECT TO anon USING (verification_status = 'approved');

-- Allow authenticated to view verified companies too
CREATE POLICY "Authenticated can view verified companies" ON public.companies
  FOR SELECT TO authenticated USING (verification_status = 'approved');

-- Updated at trigger
CREATE TRIGGER handle_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
