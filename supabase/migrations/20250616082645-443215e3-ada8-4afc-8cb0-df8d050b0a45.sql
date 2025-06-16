
-- Create enum for media types
CREATE TYPE public.media_type AS ENUM ('movie', 'tvshow');

-- Create media table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type media_type NOT NULL,
  year INTEGER NOT NULL,
  poster TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  watched BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  director TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for many-to-many relationship between collections and media
CREATE TABLE public.collection_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, media_id)
);

-- Create related_media table for media relationships (sequels, prequels, etc.)
CREATE TABLE public.related_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  related_media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, related_media_id),
  CHECK (media_id != related_media_id)
);

-- Create indexes for better performance
CREATE INDEX idx_media_type ON public.media(type);
CREATE INDEX idx_media_watched ON public.media(watched);
CREATE INDEX idx_media_year ON public.media(year);
CREATE INDEX idx_collection_media_collection_id ON public.collection_media(collection_id);
CREATE INDEX idx_collection_media_media_id ON public.collection_media(media_id);
CREATE INDEX idx_related_media_media_id ON public.related_media(media_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
