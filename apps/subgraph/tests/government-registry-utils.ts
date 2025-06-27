import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  AuthorityAdded,
  AuthorityDeactivated,
  AuthorityUpdated,
  DocumentVerified,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  VerificationRevoked
} from "../generated/GovernmentRegistry/GovernmentRegistry"

export function createAuthorityAddedEvent(
  authority: Address,
  name: string,
  jurisdiction: string
): AuthorityAdded {
  let authorityAddedEvent = changetype<AuthorityAdded>(newMockEvent())

  authorityAddedEvent.parameters = new Array()

  authorityAddedEvent.parameters.push(
    new ethereum.EventParam("authority", ethereum.Value.fromAddress(authority))
  )
  authorityAddedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  authorityAddedEvent.parameters.push(
    new ethereum.EventParam(
      "jurisdiction",
      ethereum.Value.fromString(jurisdiction)
    )
  )

  return authorityAddedEvent
}

export function createAuthorityDeactivatedEvent(
  authority: Address
): AuthorityDeactivated {
  let authorityDeactivatedEvent =
    changetype<AuthorityDeactivated>(newMockEvent())

  authorityDeactivatedEvent.parameters = new Array()

  authorityDeactivatedEvent.parameters.push(
    new ethereum.EventParam("authority", ethereum.Value.fromAddress(authority))
  )

  return authorityDeactivatedEvent
}

export function createAuthorityUpdatedEvent(
  authority: Address,
  newEndpoint: string
): AuthorityUpdated {
  let authorityUpdatedEvent = changetype<AuthorityUpdated>(newMockEvent())

  authorityUpdatedEvent.parameters = new Array()

  authorityUpdatedEvent.parameters.push(
    new ethereum.EventParam("authority", ethereum.Value.fromAddress(authority))
  )
  authorityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newEndpoint",
      ethereum.Value.fromString(newEndpoint)
    )
  )

  return authorityUpdatedEvent
}

export function createDocumentVerifiedEvent(
  proofHash: Bytes,
  authority: Address,
  titleDeedHash: Bytes,
  nationalIdHash: Bytes
): DocumentVerified {
  let documentVerifiedEvent = changetype<DocumentVerified>(newMockEvent())

  documentVerifiedEvent.parameters = new Array()

  documentVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "proofHash",
      ethereum.Value.fromFixedBytes(proofHash)
    )
  )
  documentVerifiedEvent.parameters.push(
    new ethereum.EventParam("authority", ethereum.Value.fromAddress(authority))
  )
  documentVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "titleDeedHash",
      ethereum.Value.fromFixedBytes(titleDeedHash)
    )
  )
  documentVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "nationalIdHash",
      ethereum.Value.fromFixedBytes(nationalIdHash)
    )
  )

  return documentVerifiedEvent
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

export function createVerificationRevokedEvent(
  proofHash: Bytes,
  revokedBy: Address
): VerificationRevoked {
  let verificationRevokedEvent = changetype<VerificationRevoked>(newMockEvent())

  verificationRevokedEvent.parameters = new Array()

  verificationRevokedEvent.parameters.push(
    new ethereum.EventParam(
      "proofHash",
      ethereum.Value.fromFixedBytes(proofHash)
    )
  )
  verificationRevokedEvent.parameters.push(
    new ethereum.EventParam("revokedBy", ethereum.Value.fromAddress(revokedBy))
  )

  return verificationRevokedEvent
}
