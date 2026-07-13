import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import {useMemo, useState} from 'react';
import {
  humanPlaybookTree,
  type PlaybookTreeNode,
} from '../../data/humanPlaybook';
import styles from './styles.module.css';

export {humanPlaybookTree};
export type {PlaybookTreeNode};

export type PlaybookTreeProps = {
  nodes: PlaybookTreeNode[];
  defaultExpandedIds?: string[];
  initialSelectedId?: string;
};

function flattenNodes(nodes: PlaybookTreeNode[]): PlaybookTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

function findNode(nodes: PlaybookTreeNode[], id?: string): PlaybookTreeNode {
  const flatNodes = flattenNodes(nodes);
  return flatNodes.find((node) => node.id === id) ?? flatNodes[0];
}

function TreeNode({
  node,
  depth,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: PlaybookTreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <li className={styles.treeItem}>
      <div
        className={clsx(
          styles.nodeRow,
          styles[`nodeRowLevel${depth}`],
          isSelected && styles.nodeRowSelected,
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => onToggle(node.id)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.title}`}
          >
            {isExpanded ? '-' : '+'}
          </button>
        ) : (
          <span className={styles.toggleSpacer} aria-hidden />
        )}
        <button
          type="button"
          className={styles.nodeButton}
          onClick={() => onSelect(node.id)}
          aria-pressed={isSelected}
          aria-label={node.title}
        >
          <span className={styles.nodeTitle}>{node.title}</span>
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul className={styles.childList}>
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PlaybookTree({
  nodes,
  defaultExpandedIds,
  initialSelectedId,
}: PlaybookTreeProps) {
  const initialNode = useMemo(
    () => findNode(nodes, initialSelectedId),
    [initialSelectedId, nodes],
  );
  const [expandedIds, setExpandedIds] = useState(
    () => new Set(defaultExpandedIds ?? nodes.map((node) => node.id)),
  );
  const [selectedId, setSelectedId] = useState(initialNode.id);
  const selectedNode = findNode(nodes, selectedId);
  const isCurrentPage = selectedNode.id === 'human-overview';

  function toggleNode(id: string) {
    setExpandedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  }

  return (
    <div className={styles.playbookTree}>
      <div className={styles.treePanel}>
        <ul className={styles.rootList} aria-label="Human playbook tree">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={toggleNode}
              onSelect={setSelectedId}
            />
          ))}
        </ul>
      </div>
      <aside className={styles.detailPanel} aria-live="polite">
        <Heading as="h2" className={styles.detailTitle}>
          {selectedNode.title}
        </Heading>
        <p className={styles.detailSummary}>{selectedNode.description}</p>
        {isCurrentPage ? (
          <button
            type="button"
            className={clsx(styles.openLink, styles.currentPageButton)}
            disabled
          >
            You are here
          </button>
        ) : selectedNode.to ? (
          <Link className={styles.openLink} to={selectedNode.to}>
            Open module
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
