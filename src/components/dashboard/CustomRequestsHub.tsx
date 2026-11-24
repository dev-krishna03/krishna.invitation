"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Plus,
  Send,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  User,
  ExternalLink,
} from "lucide-react";

type Bid = {
  id: string;
  amount: number;
  proposal: string;
  delivery_days: number;
  status: string;
  creator: { name: string | null; email: string };
};

type CustomRequest = {
  id: string;
  title: string;
  event_type: string;
  description: string;
  budget: number;
  status: string;
  deadline: string | null;
  created_at: string;
  host: { name: string | null; email: string };
  bids: Bid[];
};

export function CustomRequestsHub({ currentUserId }: { currentUserId: string }) {
  const [tab, setTab] = useState<"browse" | "post">("browse");
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [budget, setBudget] = useState(3000);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Bid submission state
  const [activeBidRequestId, setActiveBidRequestId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(2500);
  const [bidProposal, setBidProposal] = useState("");
  const [bidDays, setBidDays] = useState(3);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/custom-requests");
      const d = await res.json();
      if (d.requests) setRequests(d.requests);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, event_type: eventType, budget, description, deadline }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("Custom design request posted! Creators will now submit their proposals.");
        setTitle("");
        setDescription("");
        setTab("browse");
        await loadRequests();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitBid(requestId: string) {
    if (!bidProposal || !bidAmount) return;
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_bid",
          amount: bidAmount,
          proposal: bidProposal,
          delivery_days: bidDays,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("Your bid has been submitted to the host!");
        setActiveBidRequestId(null);
        setBidProposal("");
        await loadRequests();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAcceptBid(requestId: string, bidId: string) {
    try {
      const res = await fetch(`/api/custom-requests/${requestId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_bid", bid_id: bidId }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("Bid accepted! The creator has been notified to begin your design.");
        await loadRequests();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12042F] flex items-center gap-2">
            <Palette className="h-6 w-6 text-[#6520EE]" />
            Request a Design &amp; Creator Bidding Hub
          </h1>
          <p className="mt-1 text-xs text-[#7A7387]">
            Need a bespoke cultural theme or customized Gujarati/Hindi calligraphy? Post a brief or bid on open projects.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("browse")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              tab === "browse"
                ? "bg-[#6520EE] text-white"
                : "bg-white border border-[#E5D9FC] text-stone-700 hover:bg-[#F5F1FE]"
            }`}
          >
            Browse Requests
          </button>
          <button
            onClick={() => setTab("post")}
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              tab === "post"
                ? "bg-[#6520EE] text-white"
                : "bg-white border border-[#E5D9FC] text-stone-700 hover:bg-[#F5F1FE]"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post a Brief</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-4 text-xs font-medium text-[#6520EE] flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)}>✕</button>
        </div>
      )}

      {/* POST A BRIEF */}
      {tab === "post" && (
        <form
          onSubmit={handleCreateRequest}
          className="max-w-xl rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4"
        >
          <h2 className="text-base font-bold text-[#12042F]">Post a Custom Design Brief</h2>
          <p className="text-xs text-[#7A7387]">
            Describe your celebration requirements. Creators will submit their bids and portfolios. Platform protects payments with escrow.
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Occasion Title *</label>
            <input
              placeholder="e.g. Royal Rajasthani & Gujarati Wedding Suite with Pichwai Art"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Occasion Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
              >
                <option value="wedding">Wedding &amp; Sangeet</option>
                <option value="engagement">Engagement &amp; Roka</option>
                <option value="housewarming">Griha Pravesh</option>
                <option value="birthday">Birthday Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Budget (₹ INR)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
              Design Requirements &amp; Functions Needed *
            </label>
            <textarea
              placeholder="Explain preferred colors, ceremonies (Haldi, Mehendi, Vivah), languages needed (Gujarati, Hindi), and any specific background music or motifs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#6520EE] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#5213D2] transition-colors"
          >
            {submitting ? "Posting..." : "Publish Brief to Creators"}
          </button>
        </form>
      )}

      {/* BROWSE REQUESTS & BIDS */}
      {tab === "browse" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E5D9FC] p-12 text-center bg-white">
              <Sparkles className="h-8 w-8 mx-auto text-[#6520EE] mb-2" />
              <h3 className="font-bold text-[#12042F]">No open design requests right now</h3>
              <p className="text-xs text-stone-500 mt-1">Be the first to post a custom design request!</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#12042F]">{req.title}</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                        {req.event_type}
                      </span>
                    </div>
                    <span className="text-xs text-[#7A7387]">
                      Host: {req.host.name ?? req.host.email} • Budget: ₹{req.budget.toLocaleString()}
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold self-start">
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-stone-700 bg-[#FAF9FD] p-3.5 rounded-2xl border border-[#E5D9FC] leading-relaxed">
                  {req.description}
                </p>

                {/* Bids list */}
                <div className="space-y-2 pt-2 border-t border-[#F5F1FE]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#12042F]">
                      Creator Bids ({req.bids.length})
                    </span>

                    {req.status === "OPEN" && (
                      <button
                        onClick={() => setActiveBidRequestId(activeBidRequestId === req.id ? null : req.id)}
                        className="rounded-full border border-[#E5D9FC] px-4 py-1 text-xs font-semibold text-[#6520EE] hover:bg-[#F5F1FE]"
                      >
                        {activeBidRequestId === req.id ? "Cancel" : "Submit a Bid"}
                      </button>
                    )}
                  </div>

                  {/* Creator bid form */}
                  {activeBidRequestId === req.id && (
                    <div className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 space-y-3">
                      <h4 className="text-xs font-bold text-[#12042F]">Submit Your Proposal as a Creator</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-stone-500 block">Your Price (₹)</label>
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(Number(e.target.value))}
                            className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2 text-xs text-[#12042F]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-stone-500 block">Delivery Days</label>
                          <input
                            type="number"
                            value={bidDays}
                            onChange={(e) => setBidDays(Number(e.target.value))}
                            className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2 text-xs text-[#12042F]"
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder="Explain your approach, design tools, and Indian font calligraphy expertise..."
                        value={bidProposal}
                        onChange={(e) => setBidProposal(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2 text-xs text-[#12042F]"
                      />
                      <button
                        onClick={() => handleSubmitBid(req.id)}
                        className="rounded-full bg-[#6520EE] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5213D2]"
                      >
                        Send Proposal
                      </button>
                    </div>
                  )}

                  {req.bids.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#FAF9FD] p-3.5 border border-[#E5D9FC] text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#12042F]">
                          {b.creator.name ?? b.creator.email} — ₹{b.amount.toLocaleString()} ({b.delivery_days} days)
                        </span>
                        <p className="text-[11px] text-stone-600 mt-0.5">{b.proposal}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-50 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                          {b.status}
                        </span>
                        {req.status === "OPEN" && b.status === "PENDING" && (
                          <button
                            onClick={() => handleAcceptBid(req.id, b.id)}
                            className="rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Accept Bid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
