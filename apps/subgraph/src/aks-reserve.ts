import {
  AuditorAdded as AuditorAddedEvent,
  AuditorRemoved as AuditorRemovedEvent,
  BurnRequestExecuted as BurnRequestExecutedEvent,
  CollateralRatioUpdated as CollateralRatioUpdatedEvent,
  CollateralUpdateConfirmed as CollateralUpdateConfirmedEvent,
  CollateralUpdateProposed as CollateralUpdateProposedEvent,
  CollateralUpdated as CollateralUpdatedEvent,
  EmergencyPaused as EmergencyPausedEvent,
  ExchangeRateRequested as ExchangeRateRequestedEvent,
  ExchangeRateUpdated as ExchangeRateUpdatedEvent,
  FunctionError as FunctionErrorEvent,
  MaxSingleMintUpdated as MaxSingleMintUpdatedEvent,
  MintRequestFulfilled as MintRequestFulfilledEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  RequestFulfilled as RequestFulfilledEvent,
  RequestSent as RequestSentEvent,
  Unpaused as UnpausedEvent
} from "../generated/AKSReserve/AKSReserve"
import {
  AuditorAdded,
  AuditorRemoved,
  BurnRequestExecuted,
  CollateralRatioUpdated,
  CollateralUpdateConfirmed,
  CollateralUpdateProposed,
  CollateralUpdated,
  EmergencyPaused,
  ExchangeRateRequested,
  ExchangeRateUpdated,
  FunctionError,
  MaxSingleMintUpdated,
  MintRequestFulfilled,
  OwnershipTransferred,
  Paused,
  RequestFulfilled,
  RequestSent,
  Unpaused
} from "../generated/schema"

export function handleAuditorAdded(event: AuditorAddedEvent): void {
  let entity = new AuditorAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.auditor = event.params.auditor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAuditorRemoved(event: AuditorRemovedEvent): void {
  let entity = new AuditorRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.auditor = event.params.auditor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBurnRequestExecuted(
  event: BurnRequestExecutedEvent
): void {
  let entity = new BurnRequestExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.aksAmount = event.params.aksAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollateralRatioUpdated(
  event: CollateralRatioUpdatedEvent
): void {
  let entity = new CollateralRatioUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldRatio = event.params.oldRatio
  entity.newRatio = event.params.newRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollateralUpdateConfirmed(
  event: CollateralUpdateConfirmedEvent
): void {
  let entity = new CollateralUpdateConfirmed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.updateId = event.params.updateId
  entity.auditor = event.params.auditor

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollateralUpdateProposed(
  event: CollateralUpdateProposedEvent
): void {
  let entity = new CollateralUpdateProposed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.updateId = event.params.updateId
  entity.kesAmount = event.params.kesAmount
  entity.isAddition = event.params.isAddition

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollateralUpdated(event: CollateralUpdatedEvent): void {
  let entity = new CollateralUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newTotal = event.params.newTotal
  entity.changeAmount = event.params.changeAmount
  entity.isAddition = event.params.isAddition

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEmergencyPaused(event: EmergencyPausedEvent): void {
  let entity = new EmergencyPaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.collateralRatio = event.params.collateralRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExchangeRateRequested(
  event: ExchangeRateRequestedEvent
): void {
  let entity = new ExchangeRateRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExchangeRateUpdated(
  event: ExchangeRateUpdatedEvent
): void {
  let entity = new ExchangeRateUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.rate = event.params.rate

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFunctionError(event: FunctionErrorEvent): void {
  let entity = new FunctionError(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.error = event.params.error

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxSingleMintUpdated(
  event: MaxSingleMintUpdatedEvent
): void {
  let entity = new MaxSingleMintUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldAmount = event.params.oldAmount
  entity.newAmount = event.params.newAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMintRequestFulfilled(
  event: MintRequestFulfilledEvent
): void {
  let entity = new MintRequestFulfilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.kesAmount = event.params.kesAmount
  entity.collateralRatio = event.params.collateralRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

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

export function handleRequestFulfilled(event: RequestFulfilledEvent): void {
  let entity = new RequestFulfilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRequestSent(event: RequestSentEvent): void {
  let entity = new RequestSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
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
