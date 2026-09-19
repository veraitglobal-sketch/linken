import { CsvDownloadButton } from "@/components/partners/csv-download-button";

type Props = {
  partnerCsv?: string;
  referenceCsv?: string;
};

export function ConfirmedCsvBar({ partnerCsv = "", referenceCsv = "" }: Props) {
  if (!partnerCsv && !referenceCsv) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CsvDownloadButton
        csv={partnerCsv}
        filename="hansala-partners.csv"
        label="Partners CSV"
      />
      <CsvDownloadButton
        csv={referenceCsv}
        filename="hansala-references.csv"
        label="References CSV"
      />
    </div>
  );
}
