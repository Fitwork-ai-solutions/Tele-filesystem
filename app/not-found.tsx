import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white">
      <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">Page not found</p>
      <Link
        href="/drive"
        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
      >
        Go to My Drive
      </Link>
    </main>
  );
}
