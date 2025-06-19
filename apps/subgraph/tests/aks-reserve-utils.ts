import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
} from "../generated/AKSReserve/AKSReserve"

export function createAuditorAddedEvent(auditor: Address): AuditorAdded {
  let auditorAddedEvent = changetype<AuditorAdded>(newMockEvent())

  auditorAddedEvent.parameters = new Array()

  auditorAddedEvent.parameters.push(
    new ethereum.EventParam("auditor", ethereum.Value.fromAddress(auditor))
  )

  return auditorAddedEvent
}

export function createAuditorRemovedEvent(auditor: Address): AuditorRemoved {
  let auditorRemovedEvent = changetype<AuditorRemoved>(newMockEvent())

  auditorRemovedEvent.parameters = new Array()

  auditorRemovedEvent.parameters.push(
    new ethereum.EventParam("auditor", ethereum.Value.fromAddress(auditor))
  )

  return auditorRemovedEvent
}

export function createBurnRequestExecutedEvent(
  user: Address,
  aksAmount: BigInt
): BurnRequestExecuted {
  let burnRequestExecutedEvent = changetype<BurnRequestExecuted>(newMockEvent())

  burnRequestExecutedEvent.parameters = new Array()

  burnRequestExecutedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  burnRequestExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "aksAmount",
      ethereum.Value.fromUnsignedBigInt(aksAmount)
    )
  )

  return burnRequestExecutedEvent
}

export function createCollateralRatioUpdatedEvent(
  oldRatio: BigInt,
  newRatio: BigInt
): CollateralRatioUpdated {
  let collateralRatioUpdatedEvent =
    changetype<CollateralRatioUpdated>(newMockEvent())

  collateralRatioUpdatedEvent.parameters = new Array()

  collateralRatioUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldRatio",
      ethereum.Value.fromUnsignedBigInt(oldRatio)
    )
  )
  collateralRatioUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRatio",
      ethereum.Value.fromUnsignedBigInt(newRatio)
    )
  )

  return collateralRatioUpdatedEvent
}

export function createCollateralUpdateConfirmedEvent(
  updateId: Bytes,
  auditor: Address
): CollateralUpdateConfirmed {
  let collateralUpdateConfirmedEvent =
    changetype<CollateralUpdateConfirmed>(newMockEvent())

  collateralUpdateConfirmedEvent.parameters = new Array()

  collateralUpdateConfirmedEvent.parameters.push(
    new ethereum.EventParam("updateId", ethereum.Value.fromFixedBytes(updateId))
  )
  collateralUpdateConfirmedEvent.parameters.push(
    new ethereum.EventParam("auditor", ethereum.Value.fromAddress(auditor))
  )

  return collateralUpdateConfirmedEvent
}

export function createCollateralUpdateProposedEvent(
  updateId: Bytes,
  kesAmount: BigInt,
  isAddition: boolean
): CollateralUpdateProposed {
  let collateralUpdateProposedEvent =
    changetype<CollateralUpdateProposed>(newMockEvent())

  collateralUpdateProposedEvent.parameters = new Array()

  collateralUpdateProposedEvent.parameters.push(
    new ethereum.EventParam("updateId", ethereum.Value.fromFixedBytes(updateId))
  )
  collateralUpdateProposedEvent.parameters.push(
    new ethereum.EventParam(
      "kesAmount",
      ethereum.Value.fromUnsignedBigInt(kesAmount)
    )
  )
  collateralUpdateProposedEvent.parameters.push(
    new ethereum.EventParam(
      "isAddition",
      ethereum.Value.fromBoolean(isAddition)
    )
  )

  return collateralUpdateProposedEvent
}

export function createCollateralUpdatedEvent(
  newTotal: BigInt,
  changeAmount: BigInt,
  isAddition: boolean
): CollateralUpdated {
  let collateralUpdatedEvent = changetype<CollateralUpdated>(newMockEvent())

  collateralUpdatedEvent.parameters = new Array()

  collateralUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newTotal",
      ethereum.Value.fromUnsignedBigInt(newTotal)
    )
  )
  collateralUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "changeAmount",
      ethereum.Value.fromUnsignedBigInt(changeAmount)
    )
  )
  collateralUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "isAddition",
      ethereum.Value.fromBoolean(isAddition)
    )
  )

  return collateralUpdatedEvent
}

export function createEmergencyPausedEvent(
  collateralRatio: BigInt
): EmergencyPaused {
  let emergencyPausedEvent = changetype<EmergencyPaused>(newMockEvent())

  emergencyPausedEvent.parameters = new Array()

  emergencyPausedEvent.parameters.push(
    new ethereum.EventParam(
      "collateralRatio",
      ethereum.Value.fromUnsignedBigInt(collateralRatio)
    )
  )

  return emergencyPausedEvent
}

export function createExchangeRateRequestedEvent(
  requestId: Bytes
): ExchangeRateRequested {
  let exchangeRateRequestedEvent =
    changetype<ExchangeRateRequested>(newMockEvent())

  exchangeRateRequestedEvent.parameters = new Array()

  exchangeRateRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromFixedBytes(requestId)
    )
  )

  return exchangeRateRequestedEvent
}

export function createExchangeRateUpdatedEvent(
  rate: BigInt
): ExchangeRateUpdated {
  let exchangeRateUpdatedEvent = changetype<ExchangeRateUpdated>(newMockEvent())

  exchangeRateUpdatedEvent.parameters = new Array()

  exchangeRateUpdatedEvent.parameters.push(
    new ethereum.EventParam("rate", ethereum.Value.fromUnsignedBigInt(rate))
  )

  return exchangeRateUpdatedEvent
}

export function createFunctionErrorEvent(
  requestId: Bytes,
  error: Bytes
): FunctionError {
  let functionErrorEvent = changetype<FunctionError>(newMockEvent())

  functionErrorEvent.parameters = new Array()

  functionErrorEvent.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromFixedBytes(requestId)
    )
  )
  functionErrorEvent.parameters.push(
    new ethereum.EventParam("error", ethereum.Value.fromBytes(error))
  )

  return functionErrorEvent
}

export function createMaxSingleMintUpdatedEvent(
  oldAmount: BigInt,
  newAmount: BigInt
): MaxSingleMintUpdated {
  let maxSingleMintUpdatedEvent =
    changetype<MaxSingleMintUpdated>(newMockEvent())

  maxSingleMintUpdatedEvent.parameters = new Array()

  maxSingleMintUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldAmount",
      ethereum.Value.fromUnsignedBigInt(oldAmount)
    )
  )
  maxSingleMintUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newAmount",
      ethereum.Value.fromUnsignedBigInt(newAmount)
    )
  )

  return maxSingleMintUpdatedEvent
}

export function createMintRequestFulfilledEvent(
  user: Address,
  kesAmount: BigInt,
  collateralRatio: BigInt
): MintRequestFulfilled {
  let mintRequestFulfilledEvent =
    changetype<MintRequestFulfilled>(newMockEvent())

  mintRequestFulfilledEvent.parameters = new Array()

  mintRequestFulfilledEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  mintRequestFulfilledEvent.parameters.push(
    new ethereum.EventParam(
      "kesAmount",
      ethereum.Value.fromUnsignedBigInt(kesAmount)
    )
  )
  mintRequestFulfilledEvent.parameters.push(
    new ethereum.EventParam(
      "collateralRatio",
      ethereum.Value.fromUnsignedBigInt(collateralRatio)
    )
  )

  return mintRequestFulfilledEvent
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

export function createRequestFulfilledEvent(id: Bytes): RequestFulfilled {
  let requestFulfilledEvent = changetype<RequestFulfilled>(newMockEvent())

  requestFulfilledEvent.parameters = new Array()

  requestFulfilledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestFulfilledEvent
}

export function createRequestSentEvent(id: Bytes): RequestSent {
  let requestSentEvent = changetype<RequestSent>(newMockEvent())

  requestSentEvent.parameters = new Array()

  requestSentEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestSentEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
