import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import {useMemo, useState} from 'react';
import styles from './styles.module.css';

export type PlaybookTreeNode = {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  description: string;
  to?: string;
  children?: PlaybookTreeNode[];
};

export type PlaybookTreeProps = {
  nodes: PlaybookTreeNode[];
  defaultExpandedIds?: string[];
  initialSelectedId?: string;
};

export const humanPlaybookTree: PlaybookTreeNode[] = [
  {
    id: 'human-overview',
    title: 'Human Overview',
    level: 1,
    to: '/docs/human-overview',
    description:
      'The interactive guide to the knowledge hub, helping you understand its structure and explore how ideas connect across the ecosystem.',
    children: [
      {
        id: 'playbook',
        title: 'Playbook',
        level: 2,
        description:
          'A living collection of contributor-built modules for building microproducts that turn data into value, moving from shared foundations into the analytics development lifecycle: frame, build, and operate.',
        children: [
          {
            id: 'intro',
            title: 'Intro Section',
            level: 3,
            description:
              'Start with the shared concepts and mission behind the Build Trilemma docs.',
            children: [
              {
                id: 'what-is-a-microproduct',
                title: 'What Is a Microproduct?',
                level: 4,
                description:
                  'The core definition: a focused product that turns data into value through an experience, workflow, or utility.',
                to: '/docs/intro/what-is-a-microproduct',
              },
              {
                id: 'mission',
                title: 'Mission',
                level: 4,
                description:
                  'The reason this open knowledge hub exists and the outcomes it is meant to create.',
                to: '/docs/intro/mission',
              },
            ],
          },
          {
            id: 'frame-section',
            title: 'Frame Section',
            level: 3,
            description:
              'The planning layer of the analytics development lifecycle, organizing content around defining opportunities, understanding users, scoping microproducts, and analyzing whether an idea is worth building.',
            children: [
              {
                id: 'frame',
                title: 'Frame',
                level: 4,
                description:
                  'Validate whether a microproduct is worth building and feasible to deliver before execution.',
                to: '/docs/playbook/frame',
              },
              {
                id: 'ideation',
                title: 'Ideation',
                level: 4,
                description:
                  'Identify demand, available data, and the minimum useful outcome before the product shape hardens.',
                to: '/docs/playbook/ideation',
              },
              {
                id: 'architecture',
                title: 'Architecture',
                level: 4,
                description:
                  'Choose the pipeline, storage, serving model, and operating constraints that can support the product.',
                to: '/docs/playbook/architecture',
              },
              {
                id: 'analytics-engineering',
                title: 'Data Stack & Analytics Engineering',
                level: 4,
                description:
                  'Apply software engineering discipline to data workflows so the product can be tested, refreshed, observed, and reused.',
                to: '/docs/playbook/data-stack-analytics-engineering',
              },
            ],
          },
          {
            id: 'build-section',
            title: 'Build Section',
            level: 3,
            description:
              'The development layer of the analytics development lifecycle, organizing content around designing, developing, testing, and deploying microproducts through iterative implementation.',
            children: [
              {
                id: 'build',
                title: 'Build',
                level: 4,
                description:
                  'Execute, validate quality, and deliver a reliable MVP through focused delivery workflows.',
                to: '/docs/playbook/build',
              },
              {
                id: 'build-module',
                title: 'Build Module',
                level: 4,
                description:
                  'Translate architecture and acceptance criteria into focused build tasks and working product slices.',
                to: '/docs/playbook/build-module',
              },
              {
                id: 'qa-methodology',
                title: 'QA Methodology',
                level: 4,
                description:
                  'Use quality gates, behavior-driven checks, and review norms to keep AI-assisted builds reliable.',
                to: '/docs/playbook/qa-methodology',
              },
            ],
          },
          {
            id: 'operate-section',
            title: 'Operate Section',
            level: 3,
            description:
              'The operational layer of the analytics development lifecycle, organizing content around operating, observing, learning from, and improving shipped microproducts over time.',
            children: [
              {
                id: 'operate',
                title: 'Operate',
                level: 4,
                description:
                  'Own distribution, learning, and iteration after launch so the product keeps improving.',
                to: '/docs/playbook/operate',
              },
            ],
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        level: 2,
        description:
          'Curated references that help builders execute faster without changing the playbook hierarchy.',
        to: '/docs/resources',
      },
      {
        id: 'authors',
        title: 'Authors',
        level: 2,
        description:
          'The people and organizations listed in the shared author registry for the docs.',
        to: '/docs/authors',
      },
    ],
  },
];

function flattenNodes(nodes: PlaybookTreeNode[]): PlaybookTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children ?? [])]);
}

function findNode(nodes: PlaybookTreeNode[], id?: string): PlaybookTreeNode {
  const flatNodes = flattenNodes(nodes);
  return flatNodes.find((node) => node.id === id) ?? flatNodes[0];
}

function TreeNode({
  node,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
}: {
  node: PlaybookTreeNode;
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
          styles[`nodeRowLevel${node.level}`],
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
