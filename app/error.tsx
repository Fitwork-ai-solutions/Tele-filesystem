"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
      <h1 className="text-6xl font-bold text-gray-700 mb-4">500</h1>
      <p className="text-xl text-gray-400 mb-2">Something went wrong</p>
      <p className="text-sm text-gray-600 mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
      >
        Try again
      </button>
    </main>
  );
}
