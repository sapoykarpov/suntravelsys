-- =============================================================
-- Travel Asset Engine — Database Schema
-- =============================================================
-- Run this SQL in your Supabase SQL Editor to create the tables.
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. clients — Brand / Travel Agent profiles
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,  -- e.g. 'luxetravel' → URL: yourdomain.com/luxetravel/...
  brand_name      TEXT NOT NULL,
  tagline         TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#D4AF37',
  secondary_color TEXT NOT NULL DEFAULT '#1A1A1A',
  logo_url        TEXT,

  -- Contact info
  phone           TEXT,
  whatsapp        TEXT,  -- full URL: https://wa.me/6281234567890
  email           TEXT,
  website         TEXT,

  -- Social links — explicit columns per platform
  instagram       TEXT,  -- https://instagram.com/username
  facebook        TEXT,  -- https://facebook.com/pagename
  tiktok          TEXT,  -- https://tiktok.com/@username
  twitter_x       TEXT,  -- https://x.com/username
  youtube         TEXT,  -- https://youtube.com/@channel
  linkedin        TEXT,  -- https://linkedin.com/in/username

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 2. itineraries — Parsed trip data
-- ---------------------------------------------------------
CREATE TYPE itinerary_status AS ENUM ('pending', 'draft', 'published', 'archived');
CREATE TYPE itinerary_language AS ENUM ('id', 'en');
CREATE TYPE itinerary_style AS ENUM ('original', 'friendly', 'persuasive', 'energetic');

CREATE TABLE IF NOT EXISTS itineraries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status              itinerary_status NOT NULL DEFAULT 'pending',
  theme               TEXT NOT NULL DEFAULT 'amazing-black',
  version             TEXT NOT NULL DEFAULT '1.0',
  language            itinerary_language NOT NULL DEFAULT 'id',
  style               itinerary_style NOT NULL DEFAULT 'original',

  -- Core trip metadata
  meta                JSONB NOT NULL DEFAULT '{}',
  -- meta shape: { title, subtitle, durationDays, durationNights, startDate, endDate, groupSize, price, priceNote }

  -- Content
  highlights          JSONB DEFAULT '[]',
  itinerary_summary   JSONB DEFAULT '[]',
  inclusions          JSONB DEFAULT '[]',
  exclusions          JSONB DEFAULT '[]',
  days                JSONB NOT NULL DEFAULT '[]',
  hotels              JSONB DEFAULT '[]',

  -- Original Tally.so submission (raw payload for audit)
  original_submission JSONB,

  -- Itinerary slug for reverse-slug URL pattern
  -- Full URL: yourdomain.com/{client.slug}/{itinerary.slug}
  -- e.g.    yourdomain.com/luxetravel/kyoto-zen-experience
  slug                TEXT NOT NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------
CREATE INDEX idx_clients_slug ON clients(slug);
CREATE INDEX idx_itineraries_client_id ON itineraries(client_id);
CREATE INDEX idx_itineraries_status ON itineraries(status);
CREATE INDEX idx_itineraries_slug ON itineraries(slug);
-- Unique combo: one slug per client (different clients can reuse itinerary slugs)
CREATE UNIQUE INDEX idx_itineraries_client_slug ON itineraries(client_id, slug);

-- ---------------------------------------------------------
-- 4. Auto-update updated_at trigger
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_itineraries_updated_at
  BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------
-- 5. Row Level Security (RLS) — basic policies
-- ---------------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Public can read published itineraries (for the DMI viewer)
CREATE POLICY "Public can view published itineraries"
  ON itineraries FOR SELECT
  USING (status = 'published');

-- Service role (webhook/admin) has full access — handled by SUPABASE_SERVICE_ROLE_KEY
-- Anon/authenticated users only see published content via the policy above

-- ---------------------------------------------------------
-- 6. theme_presets — Saved admin configurations for reuse
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS theme_presets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  preset_name     TEXT NOT NULL,
  theme_id        TEXT NOT NULL, -- e.g., 'ThemeAmazingBlack'
  font_pairing    TEXT NOT NULL, -- e.g., 'Playfair+Lato'
  color_palette   JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for theme_presets
CREATE TRIGGER set_timestamp_theme_presets
BEFORE UPDATE ON theme_presets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

-- Service role has full access

