import { forEachKey } from './object'
import { randomInteger } from './random'
import { SeparationTree, TreeNode } from './SeparationTree'

const buildExpectedIndex = (tree: SeparationTree) => {
  const expectedIndex: Record<string, string[]> = {}
  const buildExpectedIndexRecursively = (
    node: TreeNode,
    key: string,
    parentIndex: string[],
  ) => {
    const thisIndex = [...parentIndex, key]
    expectedIndex[key] = thisIndex
    forEachKey(node.children, (nextNode, nextKey) => {
      buildExpectedIndexRecursively(nextNode, nextKey, thisIndex)
    })
  }
  // eslint-disable-next-line @typescript-eslint/dot-notation
  forEachKey(tree['_tree'], (node, key) => {
    buildExpectedIndexRecursively(node, key, [])
  })
  return expectedIndex
}

describe('SeparationTree', () => {
  it('should add keys to the first level', () => {
    const tree = new SeparationTree('root')
    tree.add('root', 'node1', 1)
    tree.add('node2', 'root', 2)
    tree.add('node3', 'root', 3)
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_tree']).toEqual({
      node1: {
        timestamp: 1,
        children: {},
      },
      node2: {
        timestamp: 2,
        children: {},
      },
      node3: {
        timestamp: 3,
        children: {},
      },
    })
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_index']).toEqual({
      node1: ['node1'],
      node2: ['node2'],
      node3: ['node3'],
    })
  })

  it('should add keys to nested levels', () => {
    const tree = new SeparationTree('root')
    tree.add('node1', 'root', 1)
    tree.add('node1', 'node2', 2)
    tree.add('node3', 'node2', 3)
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_tree']).toEqual({
      node1: {
        timestamp: 1,
        children: {
          node2: {
            timestamp: 2,
            children: {
              node3: {
                timestamp: 3,
                children: {},
              },
            },
          },
        },
      },
    })
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_index']).toEqual({
      node1: ['node1'],
      node2: ['node1', 'node2'],
      node3: ['node1', 'node2', 'node3'],
    })
  })

  it('should move node when a better distance is found', () => {
    const tree = new SeparationTree('root')
    tree.add('root', 'node1', 1)
    tree.add('node1', 'node2', 2)
    tree.add('node2', 'node3', 3)
    tree.add('node3', 'node4', 4)
    tree.add('node3', 'node1', 5)
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_tree']).toEqual({
      node1: {
        timestamp: 1,
        children: {
          node2: {
            timestamp: 2,
            children: {},
          },
          node3: {
            timestamp: 5,
            children: {
              node4: {
                timestamp: 4,
                children: {},
              },
            },
          },
        },
      },
    })
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_index']).toEqual({
      node1: ['node1'],
      node2: ['node1', 'node2'],
      node3: ['node1', 'node3'],
      node4: ['node1', 'node3', 'node4'],
    })
  })

  it('should handle very complex cases', () => {
    const tree = new SeparationTree('root')
    tree.add('root', 'node1', 1)
    tree.add('node1', 'node2', 2)
    tree.add('node2', 'node3', 3)
    tree.add('node2', 'node4', 4)
    tree.add('root', 'node5', 5)
    tree.add('node5', 'node6', 6)
    tree.add('root', 'node1', 7)
    tree.add('node5', 'node1', 8)
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_tree']).toEqual({
      node1: {
        timestamp: 7,
        children: {
          node2: {
            timestamp: 2,
            children: {
              node3: {
                timestamp: 3,
                children: {},
              },
              node4: {
                timestamp: 4,
                children: {},
              },
            },
          },
          node5: {
            timestamp: 8,
            children: {
              node6: {
                timestamp: 6,
                children: {},
              },
            },
          },
        },
      },
    })
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_index']).toEqual({
      node1: ['node1'],
      node2: ['node1', 'node2'],
      node3: ['node1', 'node2', 'node3'],
      node4: ['node1', 'node2', 'node4'],
      node5: ['node1', 'node5'],
      node6: ['node1', 'node5', 'node6'],
    })
  })

  it('should maintain a consistent index', () => {
    const tree = new SeparationTree('0')
    for (let i = 0; i < 1000; i++) {
      const rand1 = randomInteger(50).toString()
      const rand2 = randomInteger(50).toString()
      if (rand1 === rand2) continue
      tree.add(rand1, rand2)
    }
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(tree['_index']).toEqual(buildExpectedIndex(tree))
  })
})
