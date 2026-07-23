'use server'

import { cookies } from 'next/headers'
import { getServerStorageProvider } from '@infra/auth/server-storage-provider'
import { createDefaultStorageProvider } from '@infra/storage/default-provider'
import { tokenSigner, cookieSessionStore } from '@infra/auth/auth-container'
import { requireSession } from '@domains/auth/actions/session'
import { sessionTtlSeconds } from '@domains/auth/services/session-timeout'
import { DEFAULT_SETTINGS } from '@domains/organization/entities/settings'
import { UuidIdGenerator } from '@infra/adapters/uuid-id-generator'
import { SystemClock } from '@infra/adapters/system-clock'
import type { Organization } from '../entities/organization'
import type { Branch } from '../entities/branch'
import type { Register } from '../entities/register'
import type { Membership } from '../entities/membership'
import { ORGANIZATION_PLAN, ORGANIZATION_STATUS, MEMBERSHIP_STATUS, MEMBERSHIP_ROLE } from '@constants/enums'

export interface OnboardingInput {
  organizationName: string
  branchName: string
  registerName: string
  registerNumber?: string
  plan?: string
}

export interface OnboardingResult {
  organizationId: string
  branchId: string
  registerId: string
  membershipId: string
}

/**
 * Complete onboarding: create organization + first branch + first register + OWNER membership
 * in a single atomic transaction, owned by the currently signed-in user.
 * Also sets the current-branch-id cookie so the new branch is active immediately.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const session = await requireSession()
  const provider = await getServerStorageProvider()
  const idGen = new UuidIdGenerator()
  const clock = new SystemClock()
  const now = clock.now()

  const result = await provider.withTransaction(async (repos) => {
    // Create organization
    const orgId = idGen.next()
    const organization: Organization = {
      id: orgId,
      name: input.organizationName,
      slug: input.organizationName.toLowerCase().replace(/\s+/g, '-'),
      plan: (input.plan ?? ORGANIZATION_PLAN.FREE) as any,
      status: ORGANIZATION_STATUS.ACTIVE,
      settings: {},
      createdAt: now,
      updatedAt: now,
    }
    await repos.organization.saveOrganization(organization)

    // Create first branch
    const branchId = idGen.next()
    const branch: Branch = {
      id: branchId,
      orgId,
      name: input.branchName,
      settings: {},
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    await repos.organization.saveBranch(branch)

    // Create first register
    const registerId = idGen.next()
    const register: Register = {
      id: registerId,
      orgId,
      branchId,
      number: input.registerNumber ?? '1',
      name: input.registerName,
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    await repos.organization.saveRegister(register)

    // Create OWNER membership for the actual signed-in user
    const membershipId = idGen.next()
    const membership: Membership = {
      id: membershipId,
      orgId,
      userId: session.sub,
      role: MEMBERSHIP_ROLE.OWNER,
      status: MEMBERSHIP_STATUS.ACTIVE,
      createdAt: now,
      updatedAt: now,
    }
    await repos.organization.saveMembership(membership)

    // Re-issue the session token with the new orgId — the session that existed
    // before onboarding was created with no organization, since none existed yet.
    // Without this, every org-scoped lookup on /app keeps querying with the old
    // (empty) orgId and silently falls back to the most restrictive persona.
    const newSessionId = idGen.next()
    const ttlSeconds = sessionTtlSeconds(DEFAULT_SETTINGS)
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)
    const newToken = await tokenSigner.sign(
      {
        sub: session.sub,
        sessionId: newSessionId,
        orgId,
        roles: session.roles,
      },
      { ttlSeconds },
    )
    await repos.auth.saveSession({
      id: newSessionId,
      userId: session.sub,
      token: newToken,
      expiresAt,
      createdAt: now,
    })

    return { organizationId: orgId, branchId, registerId, membershipId, newToken, expiresAt }
  })

  await cookieSessionStore.set(result.newToken, result.expiresAt)

  const cookieStore = await cookies()
  cookieStore.set('current-branch-id', result.branchId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return {
    organizationId: result.organizationId,
    branchId: result.branchId,
    registerId: result.registerId,
    membershipId: result.membershipId,
  }
}

/**
 * Create an organization without a branch (for advanced flows).
 * Returns the organization ID.
 */
export async function createOrganization(
  name: string,
  plan?: string,
): Promise<string> {
  const provider = await createDefaultStorageProvider()
  const idGen = new UuidIdGenerator()
  const clock = new SystemClock()

  try {
    const orgId = await provider.withTransaction(async (repos) => {
      const id = idGen.next()
      const organization: Organization = {
        id,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        plan: (plan ?? ORGANIZATION_PLAN.FREE) as any,
        status: ORGANIZATION_STATUS.ACTIVE,
        settings: {},
        createdAt: clock.now(),
        updatedAt: clock.now(),
      }
      await repos.organization.saveOrganization(organization)
      return id
    })

    return orgId
  } finally {
    await provider.close()
  }
}

/**
 * Create a branch in an organization.
 * Returns the branch ID.
 */
export async function createBranch(
  orgId: string,
  name: string,
): Promise<string> {
  const provider = await createDefaultStorageProvider()
  const idGen = new UuidIdGenerator()
  const clock = new SystemClock()

  try {
    const branchId = await provider.withTransaction(async (repos) => {
      const id = idGen.next()
      const branch: Branch = {
        id,
        orgId,
        name,
        settings: {},
        active: true,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      }
      await repos.organization.saveBranch(branch)
      return id
    })

    return branchId
  } finally {
    await provider.close()
  }
}

/**
 * Create a register in a branch.
 * Returns the register ID.
 */
export async function createRegister(
  orgId: string,
  branchId: string,
  name: string,
  number?: string,
): Promise<string> {
  const provider = await createDefaultStorageProvider()
  const idGen = new UuidIdGenerator()
  const clock = new SystemClock()

  try {
    const registerId = await provider.withTransaction(async (repos) => {
      const id = idGen.next()
      const register: Register = {
        id,
        orgId,
        branchId,
        name,
        number: number ?? '1',
        active: true,
        createdAt: clock.now(),
        updatedAt: clock.now(),
      }
      await repos.organization.saveRegister(register)
      return id
    })

    return registerId
  } finally {
    await provider.close()
  }
}
