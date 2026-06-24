"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
        <h1 className="text-6xl font-bold text-gray-700 mb-4">Error</h1>
        <p className="text-gray-400 mb-8">{error.message || "Something went wrong"}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#5865F2] text-white rounded-lg"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
