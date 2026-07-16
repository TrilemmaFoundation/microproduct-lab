import type {PlaybookTreeNode} from '../data/humanPlaybook';

export function flattenPlaybookNodes(nodes: PlaybookTreeNode[]): PlaybookTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenPlaybookNodes(node.children ?? [])]);
}
