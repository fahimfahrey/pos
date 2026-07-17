import type { Organization } from '@domains/organization/entities/organization'
import type { Branch } from '@domains/organization/entities/branch'
import type { Register } from '@domains/organization/entities/register'
import type { Membership } from '@domains/organization/entities/membership'
import type { BranchAssignment } from '@domains/organization/entities/branch-assignment'
import type { Invite } from '@domains/organization/entities/invite'

export interface OrganizationRepository {
  // organizations
  saveOrganization(org: Organization): Promise<void>
  findOrganizationById(id: string): Promise<Organization | null>
  findOrganizationBySlug(slug: string): Promise<Organization | null>
  listOrganizations(): Promise<Organization[]>
  // branches
  saveBranch(branch: Branch): Promise<void>
  findBranchById(id: string): Promise<Branch | null>
  listBranchesForOrg(orgId: string): Promise<Branch[]>
  // registers
  saveRegister(register: Register): Promise<void>
  findRegisterById(id: string): Promise<Register | null>
  listRegistersForBranch(branchId: string): Promise<Register[]>
  // memberships
  saveMembership(m: Membership): Promise<void>
  findMembership(orgId: string, userId: string): Promise<Membership | null>
  listMembershipsForOrg(orgId: string): Promise<Membership[]>
  listMembershipsForUser(userId: string): Promise<Membership[]>
  // branch assignments
  saveBranchAssignment(a: BranchAssignment): Promise<void>
  listAssignmentsForMembership(membershipId: string): Promise<BranchAssignment[]>
  listAssignmentsForBranch(branchId: string): Promise<BranchAssignment[]>
  deleteBranchAssignment(id: string): Promise<void>
  // invites
  saveInvite(i: Invite): Promise<void>
  findInviteByToken(token: string): Promise<Invite | null>
  listInvitesForOrg(orgId: string): Promise<Invite[]>
}
