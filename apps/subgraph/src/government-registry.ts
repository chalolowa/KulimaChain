import {
  AuthorityAdded as AuthorityAddedEvent,
  AuthorityDeactivated as AuthorityDeactivatedEvent,
  AuthorityUpdated as AuthorityUpdatedEvent,
  DocumentVerified as DocumentVerifiedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  VerificationRevoked as VerificationRevokedEvent
} from "../generated/GovernmentRegistry/GovernmentRegistry"
import {
  AuthorityAdded,
  AuthorityDeactivated,
  AuthorityUpdated,
  DocumentVerified,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  VerificationRevoked
} from "../generated/schema"

export function handleAuthorityAdded(event: AuthorityAddedEvent): void {
  let entity = new AuthorityAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.authority = event.params.authority
  entity.name = event.params.name
  entity.jurisdiction = event.params.jurisdiction

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuthorityDeactivated(
  event: AuthorityDeactivatedEvent
): void {
  let entity = new AuthorityDeactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.authority = event.params.authority

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuthorityUpdated(event: AuthorityUpdatedEvent): void {
  let entity = new AuthorityUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.authority = event.params.authority
  entity.newEndpoint = event.params.newEndpoint

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDocumentVerified(event: DocumentVerifiedEvent): void {
  let entity = new DocumentVerified(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proofHash = event.params.proofHash
  entity.authority = event.params.authority
  entity.titleDeedHash = event.params.titleDeedHash
  entity.nationalIdHash = event.params.nationalIdHash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVerificationRevoked(
  event: VerificationRevokedEvent
): void {
  let entity = new VerificationRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proofHash = event.params.proofHash
  entity.revokedBy = event.params.revokedBy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
