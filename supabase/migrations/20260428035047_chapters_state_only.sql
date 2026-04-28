-- Chapters represent states. Drop the city/region/lat/lng columns since
-- a state-level chapter doesn't have a single location — that's an
-- enterprise-level concern.

alter table public.chapters
  drop column if exists city,
  drop column if exists region,
  drop column if exists lat,
  drop column if exists lng;
