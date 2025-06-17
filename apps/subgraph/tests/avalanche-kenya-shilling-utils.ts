import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval,
  BridgeBurn,
  BridgeMint,
  BridgeUpdated,
  EIP712DomainChanged,
  OwnershipTransferred,
  Paused,
  ReserveBurn,
  ReserveMint,
  ReserveUpdated,
  Transfer,
  Unpaused
} from "../generated/AvalancheKenyaShilling/AvalancheKenyaShilling"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createBridgeBurnEvent(
  from: Address,
  amount: BigInt
): BridgeBurn {
  let bridgeBurnEvent = changetype<BridgeBurn>(newMockEvent())

  bridgeBurnEvent.parameters = new Array()

  bridgeBurnEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  bridgeBurnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bridgeBurnEvent
}

export function createBridgeMintEvent(to: Address, amount: BigInt): BridgeMint {
  let bridgeMintEvent = changetype<BridgeMint>(newMockEvent())

  bridgeMintEvent.parameters = new Array()

  bridgeMintEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  bridgeMintEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bridgeMintEvent
}

export function createBridgeUpdatedEvent(
  previousBridge: Address,
  newBridge: Address
): BridgeUpdated {
  let bridgeUpdatedEvent = changetype<BridgeUpdated>(newMockEvent())

  bridgeUpdatedEvent.parameters = new Array()

  bridgeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "previousBridge",
      ethereum.Value.fromAddress(previousBridge)
    )
  )
  bridgeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newBridge", ethereum.Value.fromAddress(newBridge))
  )

  return bridgeUpdatedEvent
}

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
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

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createReserveBurnEvent(
  from: Address,
  amount: BigInt
): ReserveBurn {
  let reserveBurnEvent = changetype<ReserveBurn>(newMockEvent())

  reserveBurnEvent.parameters = new Array()

  reserveBurnEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  reserveBurnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return reserveBurnEvent
}

export function createReserveMintEvent(
  to: Address,
  amount: BigInt
): ReserveMint {
  let reserveMintEvent = changetype<ReserveMint>(newMockEvent())

  reserveMintEvent.parameters = new Array()

  reserveMintEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  reserveMintEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return reserveMintEvent
}

export function createReserveUpdatedEvent(
  previousReserve: Address,
  newReserve: Address
): ReserveUpdated {
  let reserveUpdatedEvent = changetype<ReserveUpdated>(newMockEvent())

  reserveUpdatedEvent.parameters = new Array()

  reserveUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "previousReserve",
      ethereum.Value.fromAddress(previousReserve)
    )
  )
  reserveUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newReserve",
      ethereum.Value.fromAddress(newReserve)
    )
  )

  return reserveUpdatedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
