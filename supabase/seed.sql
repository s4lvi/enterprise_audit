-- Local-only seed data. Applied by `supabase db reset`.
-- Real data is created via the app's forms.

insert into public.chapters (name, city, region, lat, lng, notes) values
  ('Springfield Chapter', 'Springfield', 'IL', 39.7817, -89.6501, 'Founding chapter.'),
  ('Austin Chapter',     'Austin',      'TX', 30.2672, -97.7431, null),
  ('Portland Chapter',   'Portland',    'OR', 45.5152, -122.6784, null);

insert into public.enterprises
  (chapter_id, name, outline, category, stage, location_name, lat, lng, resources_needed)
select
  c.id,
  e.name, e.outline, e.category, e.stage::public.enterprise_stage,
  e.location_name, e.lat, e.lng, e.resources_needed
from public.chapters c
join (values
  ('Springfield Chapter', 'Capitol City Coffee Roasters',
   'Small-batch coffee roastery and tasting room downtown.',
   'food-beverage', 'building',
   'Old Capitol Plaza', 39.7980, -89.6540,
   'Roaster equipment financing; barista training program.'),
  ('Springfield Chapter', 'Riverbend Greenhouse Co-op',
   'Year-round produce greenhouse run as a member co-op.',
   'agriculture', 'validating',
   'Riverside Park edge', 39.7700, -89.6300,
   'Land lease; greenhouse construction grant.'),
  ('Austin Chapter', 'East Side Maker Hub',
   'Shared fabrication space with CNC, laser, and 3D printing.',
   'services', 'launched',
   'East 6th St', 30.2630, -97.7250,
   'Equipment maintenance budget.'),
  ('Portland Chapter', 'Stumptown Repair Cafe',
   'Volunteer-staffed appliance and electronics repair drop-in.',
   'services', 'idea',
   'Hawthorne District', 45.5120, -122.6230,
   'Volunteer recruitment; tool donations.')
) as e(chapter_name, name, outline, category, stage, location_name, lat, lng, resources_needed)
  on c.name = e.chapter_name;
