"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-500">{error.digest ?? error.message}</p>
          <button onClick={reset} className="mt-6 rounded-md bg-black px-4 py-2 text-white">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
