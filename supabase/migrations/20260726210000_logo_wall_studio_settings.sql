-- Document extended logoWall shape (order + per-partner overrides).
-- Backwards compatible: existing rows may only have excludedCompanyIds.
-- Shape:
-- {
--   "logoWall": {
--     "excludedCompanyIds": ["uuid"],
--     "order": ["uuid", "uuid"],
--     "overrides": {
--       "<companyId>": {
--         "logoUrl": "https://.../storage/...",
--         "scale": 1.0,
--         "padding": 0,
--         "grayscale": false,
--         "invertOnDark": false,
--         "rejectToken": "uuid"
--       }
--     }
--   }
-- }

comment on column public.companies.widget_settings is
  'Presentation settings for website widgets. logoWall: excludedCompanyIds, order, overrides (logoUrl/scale/padding/grayscale/invertOnDark/rejectToken). Evidence stays free on the profile; this only controls Logo wall presentation.';
