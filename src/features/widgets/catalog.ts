export type {
  WidgetDefinition,
  WidgetPlacement,
  WidgetSection,
  WidgetTheme,
  WidgetVariant,
} from "@/features/widgets/catalog-types";

export type {
  LogoMotion,
  LogoSize,
} from "@/features/widgets/logo-motion";
export {
  LOGO_MOTION_OPTIONS,
  LOGO_SIZE_PX,
  logoWallHeight,
  parseLogoMotion,
  parseLogoSize,
} from "@/features/widgets/logo-motion";

export { WIDGET_CATALOG } from "@/features/widgets/catalog-items";

export {
  buildCaseStampSnippet,
  buildEmbedSnippet,
  buildEmbedSrc,
  widgetHeight,
} from "@/features/widgets/embed-snippet";
