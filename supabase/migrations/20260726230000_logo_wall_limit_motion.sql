-- logoWall: limit, motion, size (+ existing order/background/overrides).
-- Shape:
-- {
--   "logoWall": {
--     "excludedCompanyIds": ["uuid"],
--     "order": ["uuid"],
--     "background": "transparent" | "light" | "dark" | "#RRGGBB",
--     "limit": 12,
--     "motion": "grid" | "row" | "stack" | "fade" | "swap-batch" | "swap-random",
--     "size": "sm" | "md" | "lg" | "xl",
--     "overrides": { "<companyId>": { "logoUrl", "scale", "padding", "grayscale", "invertOnDark", "rejectToken" } }
--   }
-- }
-- Selection is exclusion-based: default shows every confirmed partner/client.
-- limit = how many included entries render (order first, then evidence sort).

comment on column public.companies.widget_settings is
  'Presentation settings for website widgets. logoWall: excludedCompanyIds (exclusion-based), order, background (transparent|light|dark|#RRGGBB), limit (1–30, default 12), motion, size, overrides.';
