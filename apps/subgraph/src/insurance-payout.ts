import {
  FarmerPayout as FarmerPayoutEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/InsurancePayout/InsurancePayout"
import { FarmerPayout, OwnershipTransferred } from "../generated/schema"

export function handleFarmerPayout(event: FarmerPayoutEvent): void {
  let entity = new FarmerPayout(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmer = event.params.farmer
  entity.amount = event.params.amount
  entity.policyId = event.params.policyId

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
