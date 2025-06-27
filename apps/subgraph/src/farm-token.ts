import {
  ApprovalForAll as ApprovalForAllEvent,
  FarmDeactivated as FarmDeactivatedEvent,
  FarmPriceProposed as FarmPriceProposedEvent,
  FarmReclaimed as FarmReclaimedEvent,
  FarmTokenized as FarmTokenizedEvent,
  FarmValuationUpdated as FarmValuationUpdatedEvent,
  Fractionalized as FractionalizedEvent,
  GovernmentRegistryUpdated as GovernmentRegistryUpdatedEvent,
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  URI as URIEvent,
  Unpaused as UnpausedEvent
} from "../generated/FarmToken/FarmToken"
import {
  ApprovalForAll,
  FarmDeactivated,
  FarmPriceProposed,
  FarmReclaimed,
  FarmTokenized,
  FarmValuationUpdated,
  Fractionalized,
  GovernmentRegistryUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TransferBatch,
  TransferSingle,
  URI,
  Unpaused
} from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmDeactivated(event: FarmDeactivatedEvent): void {
  let entity = new FarmDeactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.reason = event.params.reason

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmPriceProposed(event: FarmPriceProposedEvent): void {
  let entity = new FarmPriceProposed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.proposedPrice = event.params.proposedPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmReclaimed(event: FarmReclaimedEvent): void {
  let entity = new FarmReclaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmTokenized(event: FarmTokenizedEvent): void {
  let entity = new FarmTokenized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.beneficiary = event.params.beneficiary
  entity.valuation = event.params.valuation
  entity.titleDeedCID = event.params.titleDeedCID
  entity.documentProofHash = event.params.documentProofHash
  entity.verifier = event.params.verifier

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmValuationUpdated(
  event: FarmValuationUpdatedEvent
): void {
  let entity = new FarmValuationUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.newValuation = event.params.newValuation
  entity.verifier = event.params.verifier

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFractionalized(event: FractionalizedEvent): void {
  let entity = new Fractionalized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmId = event.params.farmId
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovernmentRegistryUpdated(
  event: GovernmentRegistryUpdatedEvent
): void {
  let entity = new GovernmentRegistryUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRegistry = event.params.newRegistry

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

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

export function handleTransferBatch(event: TransferBatchEvent): void {
  let entity = new TransferBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ids = event.params.ids
  entity.values = event.params.values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let entity = new TransferSingle(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.internal_id = event.params.id
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleURI(event: URIEvent): void {
  let entity = new URI(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.value = event.params.value
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
