"use client";

type Props = {
  csv: string;
  filename: string;
  label: string;
};

export function CsvDownloadButton({ csv, filename, label }: Props) {
  if (!csv.trim()) return null;

  function download() {
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex shrink-0 items-center rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-colors hover:border-ink/25"
    >
      {label}
    </button>
  );
}
