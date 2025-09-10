-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Create site settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'كامب',
  site_description TEXT NOT NULL DEFAULT 'أول منصة عراقية للماركة في الفعاليات والأحداث',
  meta_keywords TEXT,
  logo_url TEXT,
  default_language TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND membership_type = 'admin'
));

CREATE POLICY "Admins can insert site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND membership_type = 'admin'
));

-- Create storage policies for logos
CREATE POLICY "Logo images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'logos' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND membership_type = 'admin'
  )
);

CREATE POLICY "Admins can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'logos' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND membership_type = 'admin'
  )
);

-- Insert default settings
INSERT INTO public.site_settings (site_name, site_description, meta_keywords, default_language)
VALUES (
  'كامب',
  'أول منصة عراقية للماركة في الفعاليات والأحداث',
  'فعاليات، أحداث، عراق، منصة، كامب',
  'ar'
);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();