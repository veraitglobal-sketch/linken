-- Document logoWall.background + order + overrides.
-- Shape:
-- {
--   "logoWall": {
--     "excludedCompanyIds": ["uuid"],
--     "order": ["uuid"],
--     "background": "transparent" | "light" | "dark" | "#RRGGBB",
--     "overrides": {
--       "<companyId>": {
--         "logoUrl": "https://...",
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
  'Presentation settings for website widgets. logoWall: excludedCompanyIds, order, background (transparent|light|dark|#RRGGBB), overrides (logoUrl/scale/padding/grayscale/invertOnDark/rejectToken).';
