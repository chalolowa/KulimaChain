import {
  OwnershipTransferRequested as OwnershipTransferRequestedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PayoutTriggered as PayoutTriggeredEvent,
  PolicyCreated as PolicyCreatedEvent,
  RequestFulfilled as RequestFulfilledEvent,
  RequestFulfilled1 as RequestFulfilled1Event,
  RequestSent as RequestSentEvent
} from "../generated/InsuranceFund/InsuranceFund"
import {
  OwnershipTransferRequested,
  OwnershipTransferred,
  PayoutTriggered,
  PolicyCreated,
  RequestFulfilled,
  RequestFulfilled1,
  RequestSent
} from "../generated/schema"

export function handleOwnershipTransferRequested(
  event: OwnershipTransferRequestedEvent
): void {
  let entity = new OwnershipTransferRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to

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
  entity.from = event.params.from
  entity.to = event.params.to

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePayoutTriggered(event: PayoutTriggeredEvent): void {
  let entity = new PayoutTriggered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePolicyCreated(event: PolicyCreatedEvent): void {
  let entity = new PolicyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer

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

export function handleRequestFulfilled1(event: RequestFulfilled1Event): void {
  let entity = new RequestFulfilled1(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.requestId = event.params.requestId
  entity.response = event.params.response
  entity.err = event.params.err

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
