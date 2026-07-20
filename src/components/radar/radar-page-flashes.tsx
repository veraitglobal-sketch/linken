import { RadarFlash } from "@/components/radar/radar-flash";

type FlashParams = {
  error?: string;
  introSent?: string;
  searchSaved?: string;
  searchDeleted?: string;
};

export function RadarPageFlashes({ params }: { params: FlashParams }) {
  return (
    <>
      {params.error ? (
        <RadarFlash tone="error">{params.error}</RadarFlash>
      ) : null}
      {params.introSent === "1" ? (
        <RadarFlash>Intro sent via Linken Radar (2 credits).</RadarFlash>
      ) : null}
      {params.searchSaved === "1" ? (
        <RadarFlash>
          Search saved. Matching firms appear in Company leads.
        </RadarFlash>
      ) : null}
      {params.searchDeleted === "1" ? (
        <RadarFlash>Saved search deleted.</RadarFlash>
      ) : null}
    </>
  );
}
