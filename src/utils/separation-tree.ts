import { log } from '@app/utils/log'
import { forEachKey } from './object'

type NodeInteraction = {
  name: string
  initiator: boolean
}

export type TreeNode = {
  timestamp: number
  interaction?: NodeInteraction
  children: Record<string, TreeNode>
}

export type ChainNode = {
  key: string
  timestamp: number
  interaction?: NodeInteraction
}

export class SeparationTree {
  private readonly _rootKey: string
  private _tree: TreeNode['children'] = {}
  private _index: Record<string, string[]> = {}

  constructor(rootKey: string) {
    this._rootKey = rootKey
  }

  add(
    initiator: string,
    other: string,
    interaction?: string,
    timestamp = Date.now(),
  ): void {
    if (initiator === other) {
      log.error('Two same keys passed to SeparationTree')
      return
    }
    if (this.isNodeInTree(initiator) && this.isNodeInTree(other)) {
      const comparison = this.compareNodeDistances(initiator, other)
      if (comparison < 0) {
        const keyNode = this.addKeyAndUpdateIndex(other, initiator, timestamp)
        this.updateInteraction(keyNode, interaction, false)
      } else if (comparison > 0) {
        const keyNode = this.addKeyAndUpdateIndex(initiator, other, timestamp)
        this.updateInteraction(keyNode, interaction, true)
      } else {
        // nodes have the same distance
      }
    } else if (this.isNodeInTree(initiator)) {
      const keyNode = this.addNewKeyToParent(other, initiator, timestamp)
      this.updateInteraction(keyNode, interaction, false)
    } else if (this.isNodeInTree(other)) {
      const keyNode = this.addNewKeyToParent(initiator, other, timestamp)
      this.updateInteraction(keyNode, interaction, true)
    }
  }

  clear(): void {
    this._tree = {}
    this._index = {}
  }

  getShortestChain(key: string): ChainNode[] {
    const index = key in this._index ? this._index[key] : []
    const interactions: ChainNode[] = []
    let node = this.getRootNodeObject()
    for (const step of index) {
      node = node.children[step]
      interactions.push({
        key: step,
        timestamp: node.timestamp,
        interaction: node.interaction
          ? {
              name: node.interaction.name,
              initiator: node.interaction.initiator,
            }
          : undefined,
      })
    }
    return interactions
  }

  private addNewKeyToParent(
    key: string,
    parent: string,
    timestamp: number,
  ): TreeNode | null {
    if (parent === this._rootKey) {
      const keyNode = {
        timestamp,
        children: {},
      }
      this._tree[key] = keyNode
      this._index[key] = [key]
      return keyNode
    } else {
      const parentNode = this.resolveNode(parent)
      if (parentNode) {
        const keyNode = {
          timestamp,
          children: {},
        }
        parentNode.children[key] = keyNode
        this._index[key] = [...this._index[parent], key]
        return keyNode
      } else {
        return null
      }
    }
  }

  private addKeyAndUpdateIndex(
    key: string,
    parent: string,
    timestamp: number,
  ): TreeNode | null {
    const oldParentNode = this.resolveParentNode(key)
    const newParentNode = this.resolveNode(parent)
    if (oldParentNode && newParentNode) {
      const keyNode = oldParentNode.children[key]
      delete oldParentNode.children[key]
      newParentNode.children[key] = keyNode
      keyNode.timestamp = timestamp
      this.updateIndexRecursively(keyNode, key, this.getIndex(parent))
      return keyNode
    } else {
      log.error('oldParentNode or newParentNode not resolved')
      return null
    }
  }

  private updateIndexRecursively(
    node: TreeNode,
    key: string,
    parentIndex: string[],
  ): void {
    const thisIndex = [...parentIndex, key]
    this._index[key] = thisIndex
    forEachKey(node.children, (nextNode, nextKey) => {
      this.updateIndexRecursively(nextNode, nextKey, thisIndex)
    })
  }

  private updateInteraction(
    node: TreeNode | null,
    interaction: string | undefined,
    initiator: boolean,
  ) {
    if (node && interaction) {
      node.interaction = {
        name: interaction,
        initiator,
      }
    }
  }

  private isNodeInTree(key: string): boolean {
    return key === this._rootKey || key in this._index
  }

  private getIndex(key: string) {
    if (key === this._rootKey) return []
    return this._index[key]
  }

  private getTimestamps(key: string) {
    const index = this.getIndex(key)
    const timestamps: number[] = []
    let node = this.getRootNodeObject()
    for (const step of index) {
      node = node.children[step]
      timestamps.push(node.timestamp)
    }
    return timestamps
  }

  /**
   * Returns a negative value if the first node has lower distance than the
   * second node, zero if they're equal and a positive value otherwise.
   */
  private compareNodeDistances(key1: string, key2: string): -1 | 0 | 1 {
    const timestamps1 = this.getTimestamps(key1).sort((a, b) => a - b)
    const timestamps2 = this.getTimestamps(key2).sort((a, b) => a - b)
    const length = Math.max(timestamps1.length, timestamps2.length)
    for (let i = 0; i < length; i++) {
      const timestamp1 = timestamps1[i]
      const timestamp2 = timestamps2[i]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (timestamp1 === undefined && timestamp2 === undefined) {
        return 0
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (timestamp1 === undefined) {
        return -1
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (timestamp2 === undefined) {
        return 1
      } else if (timestamp1 > timestamp2) {
        return -1
      } else if (timestamp1 < timestamp2) {
        return 1
      } else {
        // timestamps are equal, continue to next
        continue
      }
    }
    return 0
  }

  private resolveParentNode(key: string): TreeNode | null {
    if (key === this._rootKey) {
      log.error('Attempting to resolve parent of root')
      return null
    } else if (key in this._index) {
      const index = this._index[key]
      if (index.length === 1) {
        return this.getRootNodeObject()
      }
      let node = this._tree[index[0]]
      for (let i = 1; i < index.length - 1; i++) {
        node = node.children[index[i]]
      }
      return node
    } else {
      log.error('SeparationTree parent node not resolved')
      return null
    }
  }

  private resolveNode(key: string): TreeNode | null {
    if (key === this._rootKey) {
      return this.getRootNodeObject()
    } else if (key in this._index) {
      const index = this._index[key]
      let node = this._tree[index[0]]
      for (let i = 1; i < index.length; i++) {
        node = node.children[index[i]]
      }
      return node
    } else {
      log.error('SeparationTree node not resolved')
      return null
    }
  }

  private getRootNodeObject(): TreeNode {
    return {
      timestamp: Infinity,
      children: this._tree,
    }
  }
}
