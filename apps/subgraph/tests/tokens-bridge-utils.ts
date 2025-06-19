import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  ChainSupportUpdated,
  DestinationBridgeSet,
  OwnershipTransferred,
  TokenMappingSet,
  TokenSupportUpdated,
  TokensReceived,
  TokensSent
} from "../generated/TokensBridge/TokensBridge"

export function createChainSupportUpdatedEvent(
  chainSelector: BigInt,
  supported: boolean
): ChainSupportUpdated {
  let chainSupportUpdatedEvent = changetype<ChainSupportUpdated>(newMockEvent())

  chainSupportUpdatedEvent.parameters = new Array()

  chainSupportUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "chainSelector",
      ethereum.Value.fromUnsignedBigInt(chainSelector)
    )
  )
  chainSupportUpdatedEvent.parameters.push(
    new ethereum.EventParam("supported", ethereum.Value.fromBoolean(supported))
  )

  return chainSupportUpdatedEvent
}

export function createDestinationBridgeSetEvent(
  chainSelector: BigInt,
  bridge: Address
): DestinationBridgeSet {
  let destinationBridgeSetEvent =
    changetype<DestinationBridgeSet>(newMockEvent())

  destinationBridgeSetEvent.parameters = new Array()

  destinationBridgeSetEvent.parameters.push(
    new ethereum.EventParam(
      "chainSelector",
      ethereum.Value.fromUnsignedBigInt(chainSelector)
    )
  )
  destinationBridgeSetEvent.parameters.push(
    new ethereum.EventParam("bridge", ethereum.Value.fromAddress(bridge))
  )

  return destinationBridgeSetEvent
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

export function createTokenMappingSetEvent(
  chainSelector: BigInt,
  sourceToken: Address,
  destToken: Address
): TokenMappingSet {
  let tokenMappingSetEvent = changetype<TokenMappingSet>(newMockEvent())

  tokenMappingSetEvent.parameters = new Array()

  tokenMappingSetEvent.parameters.push(
    new ethereum.EventParam(
      "chainSelector",
      ethereum.Value.fromUnsignedBigInt(chainSelector)
    )
  )
  tokenMappingSetEvent.parameters.push(
    new ethereum.EventParam(
      "sourceToken",
      ethereum.Value.fromAddress(sourceToken)
    )
  )
  tokenMappingSetEvent.parameters.push(
    new ethereum.EventParam("destToken", ethereum.Value.fromAddress(destToken))
  )

  return tokenMappingSetEvent
}

export function createTokenSupportUpdatedEvent(
  token: Address,
  supported: boolean
): TokenSupportUpdated {
  let tokenSupportUpdatedEvent = changetype<TokenSupportUpdated>(newMockEvent())

  tokenSupportUpdatedEvent.parameters = new Array()

  tokenSupportUpdatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokenSupportUpdatedEvent.parameters.push(
    new ethereum.EventParam("supported", ethereum.Value.fromBoolean(supported))
  )

  return tokenSupportUpdatedEvent
}

export function createTokensReceivedEvent(
  sourceChainSelector: BigInt,
  token: Address,
  receiver: Address,
  amount: BigInt,
  messageId: Bytes
): TokensReceived {
  let tokensReceivedEvent = changetype<TokensReceived>(newMockEvent())

  tokensReceivedEvent.parameters = new Array()

  tokensReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "sourceChainSelector",
      ethereum.Value.fromUnsignedBigInt(sourceChainSelector)
    )
  )
  tokensReceivedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokensReceivedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokensReceivedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  tokensReceivedEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )

  return tokensReceivedEvent
}

export function createTokensSentEvent(
  destinationChainSelector: BigInt,
  token: Address,
  receiver: Address,
  amount: BigInt,
  messageId: Bytes
): TokensSent {
  let tokensSentEvent = changetype<TokensSent>(newMockEvent())

  tokensSentEvent.parameters = new Array()

  tokensSentEvent.parameters.push(
    new ethereum.EventParam(
      "destinationChainSelector",
      ethereum.Value.fromUnsignedBigInt(destinationChainSelector)
    )
  )
  tokensSentEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokensSentEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokensSentEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  tokensSentEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )

  return tokensSentEvent
}
