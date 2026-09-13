ALTER TABLE site_settings
  ADD COLUMN hero_image_url text NOT NULL DEFAULT '',
  ADD COLUMN hero_image_key text NOT NULL DEFAULT '';
