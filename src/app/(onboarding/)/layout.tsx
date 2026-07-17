import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Set up your store',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-md">{children}</div>
    </div>
  )
}
