import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
} from "../generated/FarmToken/FarmToken"

export function createApprovalForAllEvent(
  account: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createFarmDeactivatedEvent(
  farmId: BigInt,
  reason: string
): FarmDeactivated {
  let farmDeactivatedEvent = changetype<FarmDeactivated>(newMockEvent())

  farmDeactivatedEvent.parameters = new Array()

  farmDeactivatedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  farmDeactivatedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )

  return farmDeactivatedEvent
}

export function createFarmPriceProposedEvent(
  farmId: BigInt,
  proposedPrice: BigInt
): FarmPriceProposed {
  let farmPriceProposedEvent = changetype<FarmPriceProposed>(newMockEvent())

  farmPriceProposedEvent.parameters = new Array()

  farmPriceProposedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  farmPriceProposedEvent.parameters.push(
    new ethereum.EventParam(
      "proposedPrice",
      ethereum.Value.fromUnsignedBigInt(proposedPrice)
    )
  )

  return farmPriceProposedEvent
}

export function createFarmReclaimedEvent(
  farmId: BigInt,
  owner: Address
): FarmReclaimed {
  let farmReclaimedEvent = changetype<FarmReclaimed>(newMockEvent())

  farmReclaimedEvent.parameters = new Array()

  farmReclaimedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  farmReclaimedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return farmReclaimedEvent
}

export function createFarmTokenizedEvent(
  farmId: BigInt,
  beneficiary: Address,
  valuation: BigInt,
  titleDeedCID: string,
  documentProofHash: Bytes,
  verifier: Address
): FarmTokenized {
  let farmTokenizedEvent = changetype<FarmTokenized>(newMockEvent())

  farmTokenizedEvent.parameters = new Array()

  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam(
      "beneficiary",
      ethereum.Value.fromAddress(beneficiary)
    )
  )
  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam(
      "valuation",
      ethereum.Value.fromUnsignedBigInt(valuation)
    )
  )
  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam(
      "titleDeedCID",
      ethereum.Value.fromString(titleDeedCID)
    )
  )
  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam(
      "documentProofHash",
      ethereum.Value.fromFixedBytes(documentProofHash)
    )
  )
  farmTokenizedEvent.parameters.push(
    new ethereum.EventParam("verifier", ethereum.Value.fromAddress(verifier))
  )

  return farmTokenizedEvent
}

export function createFarmValuationUpdatedEvent(
  farmId: BigInt,
  newValuation: BigInt,
  verifier: Address
): FarmValuationUpdated {
  let farmValuationUpdatedEvent =
    changetype<FarmValuationUpdated>(newMockEvent())

  farmValuationUpdatedEvent.parameters = new Array()

  farmValuationUpdatedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  farmValuationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newValuation",
      ethereum.Value.fromUnsignedBigInt(newValuation)
    )
  )
  farmValuationUpdatedEvent.parameters.push(
    new ethereum.EventParam("verifier", ethereum.Value.fromAddress(verifier))
  )

  return farmValuationUpdatedEvent
}

export function createFractionalizedEvent(
  farmId: BigInt,
  owner: Address
): Fractionalized {
  let fractionalizedEvent = changetype<Fractionalized>(newMockEvent())

  fractionalizedEvent.parameters = new Array()

  fractionalizedEvent.parameters.push(
    new ethereum.EventParam("farmId", ethereum.Value.fromUnsignedBigInt(farmId))
  )
  fractionalizedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return fractionalizedEvent
}

export function createGovernmentRegistryUpdatedEvent(
  newRegistry: Address
): GovernmentRegistryUpdated {
  let governmentRegistryUpdatedEvent =
    changetype<GovernmentRegistryUpdated>(newMockEvent())

  governmentRegistryUpdatedEvent.parameters = new Array()

  governmentRegistryUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRegistry",
      ethereum.Value.fromAddress(newRegistry)
    )
  )

  return governmentRegistryUpdatedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTransferBatchEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent())

  transferBatchEvent.parameters = new Array()

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "values",
      ethereum.Value.fromUnsignedBigIntArray(values)
    )
  )

  return transferBatchEvent
}

export function createTransferSingleEvent(
  operator: Address,
  from: Address,
  to: Address,
  id: BigInt,
  value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent())

  transferSingleEvent.parameters = new Array()

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferSingleEvent
}

export function createURIEvent(value: string, id: BigInt): URI {
  let uriEvent = changetype<URI>(newMockEvent())

  uriEvent.parameters = new Array()

  uriEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromString(value))
  )
  uriEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return uriEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
