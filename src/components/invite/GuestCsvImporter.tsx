"use client";

import { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";

type ParsedGuest = {
  name: string;
  phone?: string;
  email?: string;
  plus_ones?: number;
  dietary_preference?: string;
  notes?: string;
};

export function GuestCsvImporter({
  invitationId,
  onImportComplete,
}: {
  invitationId: string;
  onImportComplete?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGuest[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDownloadSample() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Name,Phone,PlusOnes,DietaryPreference,Notes",
        "Rajesh Sharma & Family,+919876543210,2,Jain,Bride Uncle",
        "Pooja Patel,+919811223344,1,Pure Veg,College Friend",
        "Vikram & Sunita Malhotra,+919922334455,3,Pure Veg,VIP Guest",
        "Anand Joshi,+919877112233,0,Vegan,Colleague",
        "Meena Kothari,+919866554433,1,Pure Veg,Family",
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "balcony_sample_guest_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function parseCSV(text: string): ParsedGuest[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
    const rows: ParsedGuest[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Split by comma ignoring commas inside quotes
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
        v.replace(/^"(.*)"$/, "$1").trim()
      );

      const guest: any = { plus_ones: 0 };
      headers.forEach((h, idx) => {
        const val = values[idx] || "";
        if (h.includes("name")) guest.name = val;
        else if (h.includes("phone") || h.includes("mobile") || h.includes("whatsapp")) guest.phone = val;
        else if (h.includes("email")) guest.email = val;
        else if (h.includes("plus") || h.includes("guest") || h.includes("count")) guest.plus_ones = parseInt(val) || 0;
        else if (h.includes("diet") || h.includes("food") || h.includes("meal")) guest.dietary_preference = val;
        else if (h.includes("note") || h.includes("group")) guest.notes = val;
      });

      if (guest.name && guest.name.length > 0) {
        rows.push(guest);
      }
    }
    return rows;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setToast(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setToast({ type: "error", message: "Could not parse guests from CSV. Check column headers." });
      } else {
        setParsedRows(parsed);
      }
    };
    reader.readAsText(f);
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    setToast(null);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests/bulk-csv`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guests: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import guests");

      setToast({
        type: "success",
        message: `Successfully imported ${data.importedCount} guests! Personalised links created.`,
      });
      setTimeout(() => {
        setIsOpen(false);
        setFile(null);
        setParsedRows([]);
        if (onImportComplete) onImportComplete();
      }, 1800);
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Failed to import guests" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 hover:bg-violet-100/70 px-4 py-2 text-xs font-bold text-violet-900 transition-colors shadow-2xs cursor-pointer"
      >
        <FileSpreadsheet className="h-4 w-4 text-violet-700" />
        <span>Import Guest List via CSV</span>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 text-stone-900 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-800 shadow-2xs">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Bulk Import Guest List (100+ Guests)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload a CSV file to automatically create personalised guest links & WhatsApp invites.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {toast && (
              <div
                className={`flex items-center gap-3 rounded-2xl p-3.5 text-xs font-medium ${
                  toast.type === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-3xl border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/40 hover:bg-violet-50/70 p-6 sm:p-8 text-center cursor-pointer transition-all space-y-2"
              >
                <Upload className="mx-auto h-8 w-8 text-violet-600" />
                <p className="text-sm font-bold text-stone-900">
                  {file ? file.name : "Click or drag & drop your guest list CSV file"}
                </p>
                <p className="text-xs text-stone-500">
                  Columns supported: Name, Phone (with WhatsApp), PlusOnes, DietaryPreference, Notes
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Need formatting reference?</span>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 font-bold text-violet-800 hover:text-violet-950 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-violet-700" />
                    Previewing {parsedRows.length} Guests Ready to Import
                  </span>
                  <span className="text-[11px] text-stone-500">Showing first 5 rows</span>
                </div>

                <div className="rounded-2xl border border-stone-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[10px] uppercase font-bold text-stone-500 border-b border-stone-200">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Guest Name</th>
                        <th className="px-3 py-2">Phone / WhatsApp</th>
                        <th className="px-3 py-2">+Ones</th>
                        <th className="px-3 py-2">Dietary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50/50">
                          <td className="px-3 py-2 text-stone-400 font-mono">{i + 1}</td>
                          <td className="px-3 py-2 font-bold text-stone-900">{row.name}</td>
                          <td className="px-3 py-2 font-mono text-stone-600">{row.phone || "—"}</td>
                          <td className="px-3 py-2 text-stone-700">+{row.plus_ones || 0}</td>
                          <td className="px-3 py-2 text-stone-600">{row.dietary_preference || "Standard"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={parsedRows.length === 0 || isUploading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Import {parsedRows.length > 0 ? `${parsedRows.length} Guests` : "Guests"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
