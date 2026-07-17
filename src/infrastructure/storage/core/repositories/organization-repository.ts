// eslint-disable-next-line boundaries/no-unknown
import type { OrganizationRepository } from '@domains/organization/repository'
import type { Organization } from '@domains/organization/entities/organization'
import type { Branch } from '@domains/organization/entities/branch'
import type { Register } from '@domains/organization/entities/register'
import type { Membership } from '@domains/organization/entities/membership'
import type { BranchAssignment } from '@domains/organization/entities/branch-assignment'
import type { Invite } from '@domains/organization/entities/invite'
import { Collection } from '../collection'
import type { DriverTransaction } from '../driver'

export class CoreOrganizationRepository implements OrganizationRepository {
  private organizationCollection: Collection<Organization>
  private branchCollection: Collection<Branch>
  private registerCollection: Collection<Register>
  private membershipCollection: Collection<Membership>
  private branchAssignmentCollection: Collection<BranchAssignment>
  private inviteCollection: Collection<Invite>

  constructor(tx: DriverTransaction) {
    this.organizationCollection = new Collection<Organization>(tx, 'organizations')
    this.branchCollection = new Collection<Branch>(tx, 'branches')
    this.registerCollection = new Collection<Register>(tx, 'registers')
    this.membershipCollection = new Collection<Membership>(tx, 'memberships')
    this.branchAssignmentCollection = new Collection<BranchAssignment>(tx, 'branchAssignments')
    this.inviteCollection = new Collection<Invite>(tx, 'invites')
  }

  // Organizations
  async saveOrganization(org: Organization): Promise<void> {
    await this.organizationCollection.put(org)
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    return (await this.organizationCollection.get(id)) ?? null
  }

  async findOrganizationBySlug(slug: string): Promise<Organization | null> {
    return this.organizationCollection.find((o) => o.slug === slug)
  }

  async listOrganizations(): Promise<Organization[]> {
    return this.organizationCollection.getAll()
  }

  // Branches
  async saveBranch(branch: Branch): Promise<void> {
    await this.branchCollection.put(branch)
  }

  async findBranchById(id: string): Promise<Branch | null> {
    return (await this.branchCollection.get(id)) ?? null
  }

  async listBranchesForOrg(orgId: string): Promise<Branch[]> {
    return this.branchCollection.filter((b) => b.orgId === orgId)
  }

  // Registers
  async saveRegister(register: Register): Promise<void> {
    await this.registerCollection.put(register)
  }

  async findRegisterById(id: string): Promise<Register | null> {
    return (await this.registerCollection.get(id)) ?? null
  }

  async listRegistersForBranch(branchId: string): Promise<Register[]> {
    return this.registerCollection.filter((r) => r.branchId === branchId)
  }

  // Memberships
  async saveMembership(m: Membership): Promise<void> {
    await this.membershipCollection.put(m)
  }

  async findMembership(orgId: string, userId: string): Promise<Membership | null> {
    return this.membershipCollection.find((m) => m.orgId === orgId && m.userId === userId)
  }

  async listMembershipsForOrg(orgId: string): Promise<Membership[]> {
    return this.membershipCollection.filter((m) => m.orgId === orgId)
  }

  async listMembershipsForUser(userId: string): Promise<Membership[]> {
    return this.membershipCollection.filter((m) => m.userId === userId)
  }

  // Branch Assignments
  async saveBranchAssignment(a: BranchAssignment): Promise<void> {
    await this.branchAssignmentCollection.put(a)
  }

  async listAssignmentsForMembership(membershipId: string): Promise<BranchAssignment[]> {
    return this.branchAssignmentCollection.filter((a) => a.membershipId === membershipId)
  }

  async listAssignmentsForBranch(branchId: string): Promise<BranchAssignment[]> {
    return this.branchAssignmentCollection.filter((a) => a.branchId === branchId)
  }

  async deleteBranchAssignment(id: string): Promise<void> {
    await this.branchAssignmentCollection.delete(id)
  }

  // Invites
  async saveInvite(i: Invite): Promise<void> {
    await this.inviteCollection.put(i)
  }

  async findInviteByToken(token: string): Promise<Invite | null> {
    return this.inviteCollection.find((inv) => inv.token === token)
  }

  async listInvitesForOrg(orgId: string): Promise<Invite[]> {
    return this.inviteCollection.filter((inv) => inv.orgId === orgId)
  }
}
