import type { Metadata } from 'next'
import { OnboardingWizard } from './_components/onboarding-wizard'

export const metadata: Metadata = {
  title: 'Set Up Your Store',
  description: 'Create your organization, branch, and first register',
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
