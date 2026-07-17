'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@domains/organization/actions/onboarding'
import { ORGANIZATION_PLAN } from '@constants/enums'

type Step = 'organization' | 'branch' | 'register' | 'done'

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('organization')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ organizationId: string; branchId: string; registerId: string } | null>(null)

  const [formData, setFormData] = useState({
    organizationName: '',
    branchName: '',
    registerName: '',
    registerNumber: '1',
    plan: ORGANIZATION_PLAN.FREE,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = async () => {
    setError(null)

    if (step === 'organization' && !formData.organizationName.trim()) {
      setError('Organization name is required')
      return
    }

    if (step === 'branch' && !formData.branchName.trim()) {
      setError('Branch name is required')
      return
    }

    if (step === 'register' && !formData.registerName.trim()) {
      setError('Register name is required')
      return
    }

    if (step === 'register') {
      startTransition(async () => {
        try {
          const res = await completeOnboarding({
            organizationName: formData.organizationName,
            branchName: formData.branchName,
            registerName: formData.registerName,
            registerNumber: formData.registerNumber,
            plan: formData.plan,
            ownerUserId: 'current-user-id',
          })
          setResult(res)
          setStep('done')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      })
      return
    }

    const stepMap: Record<Step, Step> = {
      organization: 'branch',
      branch: 'register',
      register: 'done',
      done: 'done',
    }
    setStep(stepMap[step])
  }

  const handleBack = () => {
    const stepMap: Record<Step, Step> = {
      organization: 'organization',
      branch: 'organization',
      register: 'branch',
      done: 'register',
    }
    setStep(stepMap[step])
    setError(null)
  }

  if (step === 'done' && result) {
    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Set!</h1>
          <p className="mt-2 text-gray-600">Your store is ready to use</p>
        </div>

        <div className="space-y-2 rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Organization created: {formData.organizationName}
          </p>
          <p className="text-sm text-green-700">Branch: {formData.branchName}</p>
          <p className="text-sm text-green-700">Register: {formData.registerName}</p>
        </div>

        <button
          onClick={() => router.push('/app')}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleNext()
      }}
      className="space-y-6 p-8"
    >
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span className="font-medium">Step {['organization', 'branch', 'register'].indexOf(step) + 1} of 3</span>
          <span>{step === 'organization' ? 'Organization' : step === 'branch' ? 'Branch' : 'Register'}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${((['organization', 'branch', 'register'].indexOf(step) + 1) / 3) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Organization step */}
      {step === 'organization' && (
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900">Organization Details</legend>

          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
              Organization Name *
            </label>
            <input
              id="organizationName"
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleInputChange}
              required
              aria-required="true"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="My Store"
            />
          </div>

          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
              Plan
            </label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value={ORGANIZATION_PLAN.FREE}>Free</option>
              <option value={ORGANIZATION_PLAN.STARTER}>Starter</option>
              <option value={ORGANIZATION_PLAN.PRO}>Pro</option>
            </select>
          </div>
        </fieldset>
      )}

      {/* Branch step */}
      {step === 'branch' && (
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900">First Branch</legend>

          <div>
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">
              Branch Name *
            </label>
            <input
              id="branchName"
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleInputChange}
              required
              aria-required="true"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Main Branch"
            />
          </div>
        </fieldset>
      )}

      {/* Register step */}
      {step === 'register' && (
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900">First Register</legend>

          <div>
            <label htmlFor="registerName" className="block text-sm font-medium text-gray-700">
              Register Name *
            </label>
            <input
              id="registerName"
              type="text"
              name="registerName"
              value={formData.registerName}
              onChange={handleInputChange}
              required
              aria-required="true"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Register 1"
            />
          </div>

          <div>
            <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700">
              Register Number
            </label>
            <input
              id="registerNumber"
              type="text"
              name="registerNumber"
              value={formData.registerNumber}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
        </fieldset>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        {step !== 'organization' && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : step === 'register' ? 'Complete Setup' : 'Next'}
        </button>
      </div>
    </form>
  )
}
