import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferRequested,
  OwnershipTransferred,
  PayoutTriggered,
  PolicyCreated,
  RequestFulfilled,
  RequestFulfilled1,
  RequestSent
} from "../generated/InsuranceFund/InsuranceFund"

export function createOwnershipTransferRequestedEvent(
  from: Address,
  to: Address
): OwnershipTransferRequested {
  let ownershipTransferRequestedEvent =
    changetype<OwnershipTransferRequested>(newMockEvent())

  ownershipTransferRequestedEvent.parameters = new Array()

  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferRequestedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferRequestedEvent
}

export function createOwnershipTransferredEvent(
  from: Address,
  to: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )

  return ownershipTransferredEvent
}

export function createPayoutTriggeredEvent(
  policyId: Bytes,
  amount: BigInt
): PayoutTriggered {
  let payoutTriggeredEvent = changetype<PayoutTriggered>(newMockEvent())

  payoutTriggeredEvent.parameters = new Array()

  payoutTriggeredEvent.parameters.push(
    new ethereum.EventParam("policyId", ethereum.Value.fromFixedBytes(policyId))
  )
  payoutTriggeredEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return payoutTriggeredEvent
}

export function createPolicyCreatedEvent(
  policyId: Bytes,
  farmer: Address
): PolicyCreated {
  let policyCreatedEvent = changetype<PolicyCreated>(newMockEvent())

  policyCreatedEvent.parameters = new Array()

  policyCreatedEvent.parameters.push(
    new ethereum.EventParam("policyId", ethereum.Value.fromFixedBytes(policyId))
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )

  return policyCreatedEvent
}

export function createRequestFulfilledEvent(id: Bytes): RequestFulfilled {
  let requestFulfilledEvent = changetype<RequestFulfilled>(newMockEvent())

  requestFulfilledEvent.parameters = new Array()

  requestFulfilledEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestFulfilledEvent
}

export function createRequestFulfilled1Event(
  requestId: Bytes,
  response: Bytes,
  err: Bytes
): RequestFulfilled1 {
  let requestFulfilled1Event = changetype<RequestFulfilled1>(newMockEvent())

  requestFulfilled1Event.parameters = new Array()

  requestFulfilled1Event.parameters.push(
    new ethereum.EventParam(
      "requestId",
      ethereum.Value.fromFixedBytes(requestId)
    )
  )
  requestFulfilled1Event.parameters.push(
    new ethereum.EventParam("response", ethereum.Value.fromBytes(response))
  )
  requestFulfilled1Event.parameters.push(
    new ethereum.EventParam("err", ethereum.Value.fromBytes(err))
  )

  return requestFulfilled1Event
}

export function createRequestSentEvent(id: Bytes): RequestSent {
  let requestSentEvent = changetype<RequestSent>(newMockEvent())

  requestSentEvent.parameters = new Array()

  requestSentEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )

  return requestSentEvent
}
