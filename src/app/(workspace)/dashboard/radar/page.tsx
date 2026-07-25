import { redirect } from "next/navigation";

/** Radar is parked in the nav (padlock, no click). Direct URL → home workspace. */
export default function DashboardRadarPage() {
  redirect("/dashboard");
}
