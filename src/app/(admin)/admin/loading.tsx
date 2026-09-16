import { LoadingState } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <div className="home-wash bg-wash">
      <LoadingState label="Opening admin…" className="min-h-[70vh]" />
    </div>
  );
}
