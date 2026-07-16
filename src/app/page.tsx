export default function MarketingPage() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to POS System</h1>
        <p className="text-lg text-gray-600 mb-8">
          A local-first, offline-capable point of sale system built with Next.js
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
          <a
            href="/app"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Try Demo
          </a>
        </div>
      </div>
    </section>
  )
}
