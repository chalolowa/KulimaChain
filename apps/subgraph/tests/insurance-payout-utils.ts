import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  FarmerPayout,
  OwnershipTransferred
} from "../generated/InsurancePayout/InsurancePayout"

export function createFarmerPayoutEvent(
  farmer: Address,
  amount: BigInt,
  policyId: Bytes
): FarmerPayout {
  let farmerPayoutEvent = changetype<FarmerPayout>(newMockEvent())

  farmerPayoutEvent.parameters = new Array()

  farmerPayoutEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  farmerPayoutEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  farmerPayoutEvent.parameters.push(
    new ethereum.EventParam("policyId", ethereum.Value.fromFixedBytes(policyId))
  )

  return farmerPayoutEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
