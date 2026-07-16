export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">POS System</h1>
        </nav>
      </header>
      {children}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
          © 2024 POS System
        </div>
      </footer>
    </div>
  )
}
