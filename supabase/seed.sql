-- Local-only seed data. Applied by `supabase db reset`.
-- Real data is created via the app's forms.

insert into public.chapters (name, notes) values
  ('Illinois', 'Founding chapter.'),
  ('Texas',    null),
  ('Oregon',   null);

insert into public.enterprises
  (chapter_id, name, outline, category, stage, location_name, lat, lng, resources_needed)
select
  c.id,
  e.name, e.outline, e.category, e.stage::public.enterprise_stage,
  e.location_name, e.lat, e.lng, e.resources_needed
from public.chapters c
join (values
  ('Illinois', 'Capitol City Coffee Roasters',
   'Small-batch coffee roastery and tasting room downtown.',
   'food-beverage', 'building',
   'Old Capitol Plaza, Springfield', 39.7980, -89.6540,
   'Roaster equipment financing; barista training program.'),
  ('Illinois', 'Riverbend Greenhouse Co-op',
   'Year-round produce greenhouse run as a member co-op.',
   'agriculture', 'validating',
   'Riverside Park edge, Springfield', 39.7700, -89.6300,
   'Land lease; greenhouse construction grant.'),
  ('Texas', 'East Side Maker Hub',
   'Shared fabrication space with CNC, laser, and 3D printing.',
   'services', 'launched',
   'East 6th St, Austin', 30.2630, -97.7250,
   'Equipment maintenance budget.'),
  ('Oregon', 'Stumptown Repair Cafe',
   'Volunteer-staffed appliance and electronics repair drop-in.',
   'services', 'idea',
   'Hawthorne District, Portland', 45.5120, -122.6230,
   'Volunteer recruitment; tool donations.')
) as e(chapter_name, name, outline, category, stage, location_name, lat, lng, resources_needed)
  on c.name = e.chapter_name;
