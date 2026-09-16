import { CATEGORY_GROUPS_A } from "@/features/categories/groups-a";
import { CATEGORY_GROUPS_B } from "@/features/categories/groups-b";
import { CATEGORY_GROUPS_C } from "@/features/categories/groups-c";
import { CATEGORY_GROUPS_D } from "@/features/categories/groups-d";

export type { CategoryGroup } from "@/features/categories/group-types";
export const CATEGORY_GROUPS = [
  ...CATEGORY_GROUPS_A,
  ...CATEGORY_GROUPS_B,
  ...CATEGORY_GROUPS_C,
  ...CATEGORY_GROUPS_D,
];
