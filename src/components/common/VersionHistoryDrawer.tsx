"use client";

import { useEffect, useState } from "react";
import {
  History,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  User,
  Sparkles,
  RefreshCw,
  GitCommit,
} from "lucide-react";

type VersionEntry = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  title: string;
  description: string | null;
  version_num: number;
  snapshot: any;
  created_at: string;
  user?: { name: string | null; email: string } | null;
};

export function VersionHistoryDrawer({
  entityType,
  entityId,
  onRestore,
}: {
  entityType: "TEMPLATE" | "INVITATION";
  entityId: string;
  onRestore?: (snapshot: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, entityId]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/activity-history?entityType=${entityType}&entityId=${entityId}`);
      const data = await res.json();
      if (data.logs) {
        setHistory(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(entry: VersionEntry) {
    if (!confirm(`Restore to Version ${entry.version_num} from ${new Date(entry.created_at).toLocaleDateString()}?`)) return;
    setRestoringId(entry.id);
    setToast(null);
    try {
      const res = await fetch(`/api/activity-history/${entry.id}/restore`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore version");

      setToast({ type: "success", message: `Reverted to Version ${entry.version_num} successfully!` });
      if (onRestore && data.snapshot) {
        onRestore(data.snapshot);
      }
      await fetchHistory();
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error restoring version" });
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors shadow-2xs cursor-pointer"
        title="View version history & activity log"
      >
        <History className="h-3.5 w-3.5 text-stone-500" />
        <span>Version History</span>
      </button>

      {/* DRAWER MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between text-stone-900 border-l border-stone-200 animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                    <History className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Version History & Activity Log
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Track all edits, palette updates, and restore past revisions.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Toast */}
              {toast && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs ${
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

              {/* Timeline List */}
              <div className="mt-5 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-stone-400">Loading version logs...</div>
                ) : history.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-400 border border-dashed rounded-2xl p-6">
                    <GitCommit className="mx-auto h-8 w-8 text-stone-300" />
                    <p className="mt-2 font-semibold text-stone-600">No revisions logged yet</p>
                    <p className="text-[11px] text-stone-400 mt-1">Changes are automatically saved as new versions.</p>
                  </div>
                ) : (
                  history.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="relative pl-6 pb-4 border-l border-violet-100 last:border-none"
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-violet-600 ring-4 ring-white" />

                      <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-3.5 space-y-1.5 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                            Version {entry.version_num}
                          </span>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.created_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-stone-900">{entry.title}</h4>
                        {entry.description && (
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {entry.description}
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400">
                            By: {entry.user?.name || entry.user?.email.split("@")[0] || "Author"}
                          </span>

                          {entry.snapshot && (
                            <button
                              type="button"
                              onClick={() => handleRestore(entry)}
                              disabled={restoringId === entry.id}
                              className="inline-flex items-center gap-1 font-bold text-violet-700 hover:text-violet-900 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className={`h-3 w-3 ${restoringId === entry.id ? "animate-spin" : ""}`} />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={fetchHistory}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-stone-200 px-4 py-1.5 font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
