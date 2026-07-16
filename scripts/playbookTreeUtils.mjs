/**
 * Playbook tree helpers shared by UI, generators, and validators.
 */

/** @param {import('../src/data/humanPlaybook').PlaybookTreeNode[]} nodes */
export function flattenPlaybookNodes(nodes) {
  return nodes.flatMap((node) => [node, ...flattenPlaybookNodes(node.children ?? [])]);
}
