import type { DocumentItem } from "../../types/document";

type DocumentCardProps = {
  document: DocumentItem;
  memberName: string;
  getStatusClass: (status: string) => string;
  formatDate: (date: string | null) => string;
  onClick: () => void;
};

function DocumentCard({
  document,
  memberName,
  getStatusClass,
  formatDate,
  onClick,
}: DocumentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-[#F0E1E5] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FCECEF] text-2xl">
          📄
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-slate-800">
            {document.custom_document_name ||
              document.document_type ||
              "Unnamed Document"}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {document.document_type}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
            document.status
          )}`}
        >
          {document.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <InfoBox label="Member" value={memberName} />

        <InfoBox
          label="Issue Date"
          value={formatDate(document.issue_date)}
        />

        <InfoBox
          label="Expiry Date"
          value={formatDate(document.expiry_date)}
        />

        <InfoBox
          label="Reminder"
          value={`${document.reminder_days_before} days before`}
        />
      </div>

      <div className="mt-5 text-sm font-semibold text-[#B86F83] opacity-0 transition group-hover:opacity-100">
        Click to view details →
      </div>
    </button>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FFF9FA] p-4">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

export default DocumentCard;