"use client";

import dynamic from "next/dynamic";

const ConfirmDrop = dynamic(
  () =>
    import("@/components/marketing/confirm-drop").then((m) => m.ConfirmDrop),
  {
    ssr: false,
    loading: () => <div className="h-28" aria-hidden />,
  },
);

export function HomeIconLine() {
  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl pl-8 sm:pl-10">
        <ConfirmDrop />
      </div>
    </section>
  );
}
