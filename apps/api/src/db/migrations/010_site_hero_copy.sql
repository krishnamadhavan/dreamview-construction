ALTER TABLE site_settings
  ADD COLUMN hero_kicker text NOT NULL DEFAULT 'Construction practice',
  ADD COLUMN hero_heading text NOT NULL DEFAULT E'We build\n*great*\nbuildings.',
  ADD COLUMN hero_body text NOT NULL DEFAULT 'Structure first, then the rooms people inhabit. One team from the first walk of the plot to handover.';
