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
      collapsed?: boolean;
      collapsible?: boolean;
      items: GeneratedSidebarItem[];
    };

export const humanPlaybookTree: PlaybookTreeNode[] = humanPlaybookTreeData;

function nestedSidebarItem(
  node: PlaybookTreeNode,
  mapDocId: (docId: string) => string,
  options: {collapsible?: boolean} = {},
): GeneratedSidebarItem {
  if (node.children?.length) {
    return {
      type: 'category',
      label: node.title,
      collapsed: false,
      collapsible: options.collapsible,
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

  const playbookNode = root.children?.find((node) => node.id === 'playbook');
  const aboutNodes = root.children?.filter((node) => node.id !== 'playbook') ?? [];
  const items: GeneratedSidebarItem[] = [
    ...(options.leadingItems ?? []),
    {
      type: 'category',
      label: 'About',
      collapsible: false,
      items: [
        mapDocId(root.docId),
        ...aboutNodes.map((node) => nestedSidebarItem(node, mapDocId)),
      ],
    },
  ];

  if (playbookNode?.children?.length) {
    items.push(
      ...playbookNode.children.map((child) =>
        nestedSidebarItem(child, mapDocId, {collapsible: false}),
      ),
    );
  }

  if (items.length > (options.leadingItems?.length ?? 0) + 1) {
    return items;
  }

  return [
    ...(options.leadingItems ?? []),
    mapDocId(root.docId),
    ...(root.children ?? []).map((node) => ({
      type: 'category' as const,
      label: node.title,
      collapsed: false,
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
