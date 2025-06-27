import {
  ChainSupportUpdated as ChainSupportUpdatedEvent,
  DestinationBridgeSet as DestinationBridgeSetEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TokenMappingSet as TokenMappingSetEvent,
  TokenSupportUpdated as TokenSupportUpdatedEvent,
  TokensReceived as TokensReceivedEvent,
  TokensSent as TokensSentEvent
} from "../generated/TokensBridge/TokensBridge"
import {
  ChainSupportUpdated,
  DestinationBridgeSet,
  OwnershipTransferred,
  TokenMappingSet,
  TokenSupportUpdated,
  TokensReceived,
  TokensSent
} from "../generated/schema"

export function handleChainSupportUpdated(
  event: ChainSupportUpdatedEvent
): void {
  let entity = new ChainSupportUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.chainSelector = event.params.chainSelector
  entity.supported = event.params.supported

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDestinationBridgeSet(
  event: DestinationBridgeSetEvent
): void {
  let entity = new DestinationBridgeSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.chainSelector = event.params.chainSelector
  entity.bridge = event.params.bridge

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

export function handleTokenMappingSet(event: TokenMappingSetEvent): void {
  let entity = new TokenMappingSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.chainSelector = event.params.chainSelector
  entity.sourceToken = event.params.sourceToken
  entity.destToken = event.params.destToken

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenSupportUpdated(
  event: TokenSupportUpdatedEvent
): void {
  let entity = new TokenSupportUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.supported = event.params.supported

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensReceived(event: TokensReceivedEvent): void {
  let entity = new TokensReceived(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sourceChainSelector = event.params.sourceChainSelector
  entity.token = event.params.token
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount
  entity.messageId = event.params.messageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensSent(event: TokensSentEvent): void {
  let entity = new TokensSent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.destinationChainSelector = event.params.destinationChainSelector
  entity.token = event.params.token
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount
  entity.messageId = event.params.messageId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
