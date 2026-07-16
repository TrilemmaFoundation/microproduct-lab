import humanPlaybookTreeData from './humanPlaybook.data.json';

export type PlaybookTreeNode = {
  id: string;
  title: string;
  description: string;
  docId?: string;
  to?: string;
  children?: PlaybookTreeNode[];
};

export type GeneratedSidebarItem =
  | string
  | {
      type: 'category';
      label: string;
      items: GeneratedSidebarItem[];
    };

export const humanPlaybookTree: PlaybookTreeNode[] = humanPlaybookTreeData;

function nestedSidebarItem(
  node: PlaybookTreeNode,
  mapDocId: (docId: string) => string,
): GeneratedSidebarItem {
  if (node.children?.length) {
    return {
      type: 'category',
      label: node.title,
      items: node.children.map((child) => nestedSidebarItem(child, mapDocId)),
    };
  }
  if (!node.docId) {
    throw new Error(`Playbook leaf '${node.id}' is missing docId`);
  }
  return mapDocId(node.docId);
}

function buildPlaybookSidebar(
  root: PlaybookTreeNode,
  options: {
    leadingItems?: GeneratedSidebarItem[];
    mapDocId?: (docId: string) => string;
  } = {},
): GeneratedSidebarItem[] {
  const mapDocId = options.mapDocId ?? ((docId: string) => docId);

  if (!root.docId) {
    throw new Error('Playbook root is missing docId');
  }

  return [
    ...(options.leadingItems ?? []),
    mapDocId(root.docId),
    ...(root.children ?? []).map((node) => ({
      type: 'category' as const,
      label: node.title,
      items: node.children?.length
        ? node.children.map((child) => nestedSidebarItem(child, mapDocId))
        : [nestedSidebarItem(node, mapDocId)],
    })),
  ];
}

export function buildHumanPlaybookSidebar(
  root = humanPlaybookTree[0],
): GeneratedSidebarItem[] {
  return buildPlaybookSidebar(root);
}

export function buildAgentPlaybookSidebar(
  root = humanPlaybookTree[0],
): GeneratedSidebarItem[] {
  return buildPlaybookSidebar(root, {
    leadingItems: ['index', 'human/index'],
    mapDocId: (docId) => `human/${docId}`,
  });
}
