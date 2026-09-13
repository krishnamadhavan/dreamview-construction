CREATE TYPE site_entry_kind AS ENUM ('person', 'voice', 'award', 'journal', 'faq', 'client');

CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_heading text NOT NULL DEFAULT 'A construction practice that still draws.',
  studio_body text NOT NULL DEFAULT '',
  territory_heading text NOT NULL DEFAULT 'Where we work',
  territory_body text NOT NULL DEFAULT '',
  enquire_heading text NOT NULL DEFAULT 'Tell us about the site.',
  enquire_body text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  studio_note text NOT NULL DEFAULT 'By appointment',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind site_entry_kind NOT NULL,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_entries_kind_sort_idx ON site_entries (kind, sort_order);

INSERT INTO site_settings (
  studio_heading,
  studio_body,
  territory_heading,
  territory_body,
  enquire_heading,
  enquire_body,
  phone,
  email,
  studio_note
) VALUES (
  'A construction practice that still draws.',
  E'We are builders first. The drawing office sits next to the site diary on purpose: every line we put down has to be set out, poured, and stood under.\n\nDreamview takes a project from the first walk of the plot through structure, envelope, and interiors. One team holds the brief, the programme, and the finish.\n\nMaterials stay honest. Joints stay quiet. We would rather leave a wall that will age well than one that photographs well for a week.',
  'Where we work',
  'Bengaluru and the plots we can reach in a morning — Mysore road, the east, and jobs we take on by appointment farther out.',
  'Tell us about the site.',
  'A plot, a conversion, a building that needs to be taken apart and put back properly — write with the brief as you have it. We will tell you if we are the right contractor.',
  '+91 80 0000 0000',
  'studio@dreamviewconstructions.com',
  'By appointment'
);

INSERT INTO site_entries (kind, title, subtitle, body, sort_order) VALUES
  ('person', 'Krishna', 'Principal', 'KM', 0),
  ('person', 'Site lead', 'Superintendent', 'ST', 1),
  ('person', 'Drawings', 'Studio', 'DR', 2),
  ('voice', 'One team, one story, no competing drawings.', 'Client · residence', '', 0),
  ('voice', 'They stayed on site after the plan was signed.', 'Architect · restoration', '', 1),
  ('award', 'Master Builders mention', '2024 · Residence', '', 0),
  ('award', 'Published restoration', '2023 · Journal', '', 1),
  ('award', 'Civic works shortlist', '2022 · City', '', 2),
  ('journal', 'A wall that will age well', 'June 2026 · Process', 'Lime, not paint, where the sun hits the west face. The first year is the test.', 0),
  ('journal', 'Joints that stay quiet', 'March 2026 · Material', 'Stone to timber without a cover strip. The detail is the meeting, not the object.', 1),
  ('faq', 'Do you take small jobs?', '', 'Yes, if the work is considered — a single room, a stair, a wall that has to last. We do not take volume fit-outs.', 0),
  ('faq', 'Do we need an architect first?', '', 'Not always. We can start from a brief and bring a drawing set, or work under an architect you already have.', 1),
  ('faq', 'How long to a first visit?', '', 'Usually within two weeks of a clear note about the site. We will say if we are not the right contractor.', 2),
  ('faq', 'Where do you work?', '', 'Bengaluru first. Farther jobs by appointment when the brief is right.', 3),
  ('client', 'Private residences', '', '', 0),
  ('client', 'Architects', '', '', 1),
  ('client', 'Civic works', '', '', 2),
  ('client', 'Restorations', '', '', 3);
