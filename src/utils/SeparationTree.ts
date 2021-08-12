import { forEachKey } from './object'

export type TreeNode = {
  timestamp: number
  children: Record<string, TreeNode>
}

export class SeparationTree {
  private readonly _rootKey: string
  private _tree: TreeNode['children'] = {}
  private _index: Record<string, string[]> = {}

  constructor(rootKey: string) {
    this._rootKey = rootKey
  }

  add(key1: string, key2: string, timestamp = Date.now()): void {
    if (key1 === key2) {
      console.error('Two same keys passed to SeparationTree')
      return
    }
    if (this.isNodeInTree(key1) && this.isNodeInTree(key2)) {
      const comparison = this.compareNodeDistances(key1, key2)
      if (comparison < 0) {
        this.addKeyAndUpdateIndex(key2, key1, timestamp)
      } else if (comparison > 0) {
        this.addKeyAndUpdateIndex(key1, key2, timestamp)
      } else {
        // nodes have the same distance
        return
      }
    } else if (this.isNodeInTree(key1)) {
      this.addNewKeyToParent(key2, key1, timestamp)
    } else if (this.isNodeInTree(key2)) {
      this.addNewKeyToParent(key1, key2, timestamp)
    } else {
      return
    }
  }

  clear(): void {
    this._tree = {}
    this._index = {}
  }

  getLatest(timeout: number): string[] {
    const keys: string[] = []
    let baseTimestamp = 0
    forEachKey(this._tree, (node) => {
      if (node.timestamp > baseTimestamp) {
        baseTimestamp = node.timestamp
      }
    })
    const getWithinTimeoutRecursively = (node: TreeNode, key: string) => {
      if (baseTimestamp - node.timestamp < timeout) {
        keys.push(key)
        forEachKey(node.children, (nextNode, nextKey) => {
          getWithinTimeoutRecursively(nextNode, nextKey)
        })
      }
    }
    forEachKey(this._tree, (node, key) => {
      getWithinTimeoutRecursively(node, key)
    })
    return keys
  }

  private addNewKeyToParent(
    key: string,
    parent: string,
    timestamp: number,
  ): void {
    if (parent === this._rootKey) {
      this._tree[key] = {
        timestamp,
        children: {},
      }
      this._index[key] = [key]
    } else {
      const parentNode = this.resolveNode(parent)
      if (parentNode) {
        parentNode.children[key] = {
          timestamp,
          children: {},
        }
        this._index[key] = [...this._index[parent], key]
      }
    }
  }

  private addKeyAndUpdateIndex(
    key: string,
    parent: string,
    timestamp: number,
  ): void {
    const oldParentNode = this.resolveParentNode(key)
    const newParentNode = this.resolveNode(parent)
    if (oldParentNode && newParentNode) {
      const keyNode = oldParentNode.children[key]
      delete oldParentNode.children[key]
      newParentNode.children[key] = keyNode
      keyNode.timestamp = timestamp
      this.updateIndexRecursively(keyNode, key, this.getIndex(parent))
    } else {
      console.error('oldParentNode or newParentNode not resolved')
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
    const timestamps1 = this.getTimestamps(key1).sort()
    const timestamps2 = this.getTimestamps(key2).sort()
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
      console.error('Attempting to resolve parent of root')
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
      console.error('SeparationTree parent node not resolved')
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
      console.error('SeparationTree node not resolved')
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
