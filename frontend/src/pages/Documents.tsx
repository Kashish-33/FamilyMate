import { useEffect, useState } from "react";
import type { FamilyMember } from "../types/family";
import type { DocumentItem } from "../types/document";


import DocumentCard from "../components/documents/DocumentCard";
import EditDocumentModal from "../components/documents/EditDocumentModal";
import UploadDocumentModal from "../components/documents/UploadDocumentModal";
import { deleteDocument } from "../services/documentApi";



// ======================================================
// MAIN
// ======================================================

function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Details
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  // Edit
  const [editingDocument, setEditingDocument] =
    useState<DocumentItem | null>(null);

  // Delete
  const [deletingDocumentId, setDeletingDocumentId] =
    useState<number | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadMembers();
  }, []);

  // ====================================================
  // LOAD MEMBERS
  // ====================================================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/family-members/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Could not load family members."
          )
        );
      }

      setMembers(data);

      if (data.length > 0) {
        const firstId = String(data[0].id);

        setSelectedMemberId(firstId);

        await loadDocuments(
          Number(firstId)
        );
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load family members."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOAD DOCUMENTS
  // ====================================================

  const loadDocuments = async (
    memberId: number
  ) => {
    try {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/documents/member/${memberId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Could not load documents."
          )
        );
      }

      setDocuments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load documents."
      );
    }
  };

  // ====================================================
  // MEMBER CHANGE
  // ====================================================

  const handleMemberChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = event.target.value;

    setSelectedMemberId(id);
    setError("");

    if (!id) {
      setDocuments([]);
      return;
    }

    setLoading(true);

    await loadDocuments(
      Number(id)
    );

    setLoading(false);
  };

  // ====================================================
  // PARSE RESPONSE
  // ====================================================

  const parseResponse = async (
    response: Response
  ) => {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    try {
      return await response.text();
    } catch {
      return null;
    }
  };

  // ====================================================
  // ERROR MESSAGE
  // ====================================================

  const getErrorMessage = (
    data: any,
    fallback: string
  ) => {
    if (!data) {
      return fallback;
    }

    if (
      typeof data.detail ===
      "string"
    ) {
      return data.detail;
    }

    if (
      Array.isArray(data.detail)
    ) {
      return data.detail
        .map((item: any) =>
          item?.msg || String(item)
        )
        .join(", ");
    }

    if (
      typeof data.message ===
      "string"
    ) {
      return data.message;
    }

    return fallback;
  };

  // ====================================================
  // DATE
  // ====================================================

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "Not available";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN"
    );
  };

  // ====================================================
  // MEMBER NAME
  // ====================================================

  const getMemberName = (
    memberId: number
  ) => {
    const member =
      members.find(
        (item) =>
          item.id === memberId
      );

    return (
      member?.name ||
      `Member ${memberId}`
    );
  };

  // ====================================================
  // STATUS
  // ====================================================

  const getStatusClass = (
    status: string
  ) => {
    if (
      status === "EXPIRED"
    ) {
      return "border-red-200 bg-red-50 text-red-600";
    }

    if (
      status ===
      "EXPIRING_SOON"
    ) {
      return "border-amber-200 bg-amber-50 text-amber-600";
    }

    return "border-green-200 bg-green-50 text-green-600";
  };

  // ====================================================
  // DELETE DOCUMENT
  // ====================================================

  const handleDelete = async () => {
    if (
      deletingDocumentId === null
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setActionMessage("");

      await deleteDocument(deletingDocumentId);

      setSelectedDocument(null);
      setDeletingDocumentId(null);

      setActionMessage(
        "Document deleted successfully."
      );

      if (selectedMemberId) {
        await loadDocuments(
          Number(selectedMemberId)
        );
      }

      setTimeout(() => {
        setActionMessage("");
      }, 2000);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete document."
      );
    } finally {
      setActionLoading(false);
    }
  };



  // ====================================================
  // LOADING
  // ====================================================

  if (
    loading &&
    documents.length === 0
  ) {
    return (
      <div className="min-h-screen bg-[#FFF9FA] p-10">

        <p className="text-sm font-semibold text-[#B86F83]">
          FAMILY RECORDS
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-800">
          Documents
        </h1>

        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white p-10 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#FCECEF] border-t-[#D98FA3]" />

          <p className="mt-4 text-slate-500">
            Loading documents...
          </p>

        </div>

      </div>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="min-h-screen bg-[#FFF9FA] p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>

          <p className="text-sm font-semibold tracking-wide text-[#B86F83]">
            FAMILY RECORDS
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Documents
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your family's important documents organized and accessible.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowUploadModal(true);
          }}
          className="rounded-2xl bg-[#D98FA3] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#C97F94]"
        >
          + Upload Document
        </button>

      </div>

      {/* SUCCESS */}

      {actionMessage && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-medium text-green-700">
          âœ“ {actionMessage}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600">
          âš  {error}
        </div>
      )}

      {/* MEMBER SELECTOR */}

      {members.length > 0 && (
        <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white p-5">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="font-semibold text-slate-800">
                Family Member
              </h2>

              <p className="text-sm text-slate-400">
                Select whose documents you want to view.
              </p>

            </div>

            <select
              value={selectedMemberId}
              onChange={
                handleMemberChange
              }
              className="rounded-2xl border border-[#E9D5DA] bg-white px-5 py-3 text-slate-700 outline-none focus:border-[#D98FA3] focus:ring-2 focus:ring-[#FCECEF]"
            >
              {members.map(
                (member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name}
                    {member.relation
                      ? ` (${member.relation})`
                      : ""}
                  </option>
                )
              )}
            </select>

          </div>

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        documents.length === 0 && (
          <div className="mt-8 rounded-3xl border border-[#F0E1E5] bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FCECEF] text-4xl">
              ðŸ“„
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Upload an important family document and it will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowUploadModal(true)
              }
              className="mt-6 rounded-2xl bg-[#D98FA3] px-6 py-3 font-semibold text-white hover:bg-[#C97F94]"
            >
              Upload your first document
            </button>

          </div>
        )}

      {/* DOCUMENT CARDS */}

      {documents.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">

          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              memberName={getMemberName(document.member_id)}
              getStatusClass={getStatusClass}
              formatDate={formatDate}
              onClick={() => setSelectedDocument(document)}
            />
          ))}

        </div>
      )}

      {/* ==================================================
          DETAILS MODAL
      ================================================== */}

      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-[#F0E1E5] px-7 py-6">

              <div>

                <p className="text-sm font-semibold text-[#B86F83]">
                  DOCUMENT DETAILS
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {selectedDocument.custom_document_name ||
                    selectedDocument.document_type ||
                    "Document"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F4] text-2xl text-[#B86F83] hover:bg-[#FCE3E9]"
              >
                Ã—
              </button>

            </div>

            {/* BODY */}

            <div className="space-y-6 p-7">

              {/* STATUS */}

              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9FA] p-5">

                <div>

                  <p className="text-sm text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 font-semibold text-slate-700">
                    {selectedDocument.status.replaceAll(
                      "_",
                      " "
                    )}
                  </p>

                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
                    selectedDocument.status
                  )}`}
                >
                  {selectedDocument.status.replaceAll(
                    "_",
                    " "
                  )}
                </span>

              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <InfoBox
                  label="Document Type"
                  value={
                    selectedDocument.document_type ||
                    "Not available"
                  }
                />

                <InfoBox
                  label="Family Member"
                  value={getMemberName(
                    selectedDocument.member_id
                  )}
                />

                <InfoBox
                  label="Issue Date"
                  value={formatDate(
                    selectedDocument.issue_date
                  )}
                />

                <InfoBox
                  label="Expiry Date"
                  value={formatDate(
                    selectedDocument.expiry_date
                  )}
                />

                <InfoBox
                  label="Reminder"
                  value={`${selectedDocument.reminder_days_before} days before`}
                />

                <InfoBox
                  label="Uploaded"
                  value={formatDate(
                    selectedDocument.uploaded_at
                  )}
                />

              </div>

              {/* EXTRACTED DATA */}

              {selectedDocument.extracted_data &&
                Object.keys(
                  selectedDocument.extracted_data
                ).length > 0 && (
                  <div className="rounded-3xl border border-[#F0E1E5] bg-[#FFFBFC] p-5">

                    <h3 className="font-bold text-slate-800">
                      Extracted Details
                    </h3>

                    <div className="mt-4 space-y-3">

                      {Object.entries(
                        selectedDocument.extracted_data
                      ).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex flex-col rounded-2xl bg-white p-4 sm:flex-row sm:justify-between"
                          >

                            <span className="font-medium capitalize text-slate-500">
                              {key.replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                            <span className="font-semibold text-slate-700">
                              {String(value)}
                            </span>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

            </div>

            {/* FOOTER */}

            <div className="flex flex-col gap-3 border-t border-[#F0E1E5] p-7 sm:flex-row">

              <button
                type="button"
                onClick={() => {
                  setEditingDocument(
                    selectedDocument
                  );
                  setSelectedDocument(
                    null
                  );
                }}
                className="flex-1 rounded-2xl bg-[#D98FA3] px-5 py-3.5 font-semibold text-white hover:bg-[#C97F94]"
              >
                Edit Document
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeletingDocumentId(
                    selectedDocument.id
                  );
                }}
                className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 font-semibold text-red-600 hover:bg-red-100"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

       {editingDocument && (
          <EditDocumentModal
            document={editingDocument}
            onClose={() => setEditingDocument(null)}
            onSuccess={async () => {
              setEditingDocument(null);
              setActionMessage("Document updated successfully.");

              if (selectedMemberId) {
                  await loadDocuments(Number(selectedMemberId));
              }

              setTimeout(() => {
                setActionMessage("");
              }, 2000);
            }}
          />
        )}

      {/* ==================================================
          DELETE CONFIRMATION
      ================================================== */}

      {deletingDocumentId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4">

          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              ðŸ—‘ï¸
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Delete this document?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action cannot be undone. The document will be permanently removed.
            </p>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  setDeletingDocumentId(
                    null
                  )
                }
                className="flex-1 rounded-2xl border border-[#E9D5DA] px-5 py-3.5 font-semibold text-slate-600 hover:bg-[#FFF9FA]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={
                  handleDelete
                }
                className="flex-1 rounded-2xl bg-red-500 px-5 py-3.5 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          UPLOAD MODAL
          ================================================== */}

     {showUploadModal && (
        <UploadDocumentModal
          members={members}
          defaultMemberId={selectedMemberId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={async () => {
            if (selectedMemberId) {
              await loadDocuments(
                Number(selectedMemberId)
              );
            }
          }}
        />
      )}

    </div>
  );
}

// ======================================================
// INFO BOX
// ======================================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FFF9FA] p-4">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}


export default Documents;
