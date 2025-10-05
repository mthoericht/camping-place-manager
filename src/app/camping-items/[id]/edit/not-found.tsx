import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-4">🎒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Camping Item Not Found</h1>
        <p className="text-gray-600 mb-8">
          The camping item you're trying to edit doesn't exist or has been removed.
        </p>
        <Link
          href="/camping-items"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Camping Items
        </Link>
      </div>
    </div>
  );
}
