"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    if (!res.ok) {
      setError("Failed to send");
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      {sent ? (
        <p className="mt-6">Thank you — we'll be in touch.</p>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={submit}>
          <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          <input required type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          <textarea required placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} className="h-28 w-full rounded-md border px-3 py-2" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="rounded-md bg-black px-4 py-2 text-white">Send</button>
        </form>
      )}
    </main>
  );
}
