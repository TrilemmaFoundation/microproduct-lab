import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import {useMemo, useState} from 'react';
import styles from './styles.module.css';

export type PlaybookTreeNode = {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  summary: string;
  to?: string;
  contributorHint?: string;
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
    summary:
      'The top-level map for humans reading, using, and contributing to the Build Trilemma knowledge hub.',
    contributorHint:
      'Keep this orientation aligned with the sidebar, the playbook branches, and the reader journey for new human contributors.',
    children: [
      {
        id: 'intro',
        title: 'Intro',
        level: 2,
        summary:
          'Start with the shared concepts, mission, and people behind the Build Trilemma docs.',
        contributorHint:
          'Keep the introductory branch welcoming, current, and easy to understand before readers enter the playbook.',
        children: [
          {
            id: 'what-is-a-microproduct',
            title: 'What Is a Microproduct?',
            level: 3,
            summary:
              'The core definition: a focused product that turns data into value through an experience, workflow, or utility.',
            to: '/docs/intro/what-is-a-microproduct',
            contributorHint:
              'Refine the definition when new examples reveal clearer language for first-time readers.',
          },
          {
            id: 'mission',
            title: 'Mission',
            level: 3,
            summary:
              'The reason this open knowledge hub exists and the outcomes it is meant to create.',
            to: '/docs/intro/mission',
            contributorHint:
              'Keep mission language aligned with the foundation model and the practical builder community.',
          },
          {
            id: 'authors',
            title: 'Authors',
            level: 3,
            summary:
              'The people and organizations listed in the shared author registry for the docs.',
            to: '/docs/intro/authors',
            contributorHint:
              'Keep author metadata in the shared registry so this page and document bylines stay synchronized.',
          },
        ],
      },
      {
        id: 'playbook',
        title: 'Playbook',
        level: 2,
        summary:
          'The build path for turning a microproduct idea into a shipped, operated product.',
        contributorHint:
          'Keep the playbook branches practical, sequenced, and grounded in repeatable contributor workflows.',
        children: [
          {
            id: 'frame',
            title: 'Frame',
            level: 3,
            summary:
              'Frame the opportunity, define the user, understand what a microproduct is, and decide whether the idea is worth building.',
            to: '/docs/playbook/frame',
            contributorHint:
              'Add examples, validation prompts, and decision criteria that help builders choose the right problem before implementation.',
            children: [
              {
                id: 'ideation',
                title: 'Ideation',
                level: 4,
                summary:
                  'Identify demand, available data, and the minimum useful outcome before the product shape hardens.',
                to: '/docs/playbook/ideation',
                contributorHint:
                  'Contribute sharper discovery questions, interview patterns, and example opportunity briefs.',
              },
              {
                id: 'architecture',
                title: 'Architecture',
                level: 4,
                summary:
                  'Choose the pipeline, storage, serving model, and operating constraints that can support the product.',
                to: '/docs/playbook/architecture',
                contributorHint:
                  'Add architecture tradeoffs, reference diagrams, and constraints from real projects.',
              },
              {
                id: 'analytics-engineering',
                title: 'Data Stack & Analytics Engineering',
                level: 4,
                summary:
                  'Apply software engineering discipline to data workflows so the product can be tested, refreshed, observed, and reused.',
                to: '/docs/playbook/data-stack-analytics-engineering',
                contributorHint:
                  'Contribute stack patterns, data quality checks, and deployment notes for maintainable analytics systems.',
              },
            ],
          },
          {
            id: 'build',
            title: 'Build',
            level: 3,
            summary:
              'Build the MVP in small vertical slices, keep humans accountable for review, and install quality gates before release.',
            to: '/docs/playbook/build',
            contributorHint:
              'Add delivery workflows, prompt specs, QA practices, and examples of strong implementation tasks.',
            children: [
              {
                id: 'build-module',
                title: 'Build Module',
                level: 4,
                summary:
                  'Translate architecture and acceptance criteria into focused build tasks and working product slices.',
                to: '/docs/playbook/build-module',
                contributorHint:
                  'Add examples of task specs, implementation handoffs, and MVP slicing decisions.',
              },
              {
                id: 'qa-methodology',
                title: 'QA Methodology',
                level: 4,
                summary:
                  'Use quality gates, behavior-driven checks, and review norms to keep AI-assisted builds reliable.',
                to: '/docs/playbook/qa-methodology',
                contributorHint:
                  'Contribute test scenarios, acceptance criteria examples, and review rubrics.',
              },
            ],
          },
          {
            id: 'operate',
            title: 'Operate',
            level: 3,
            summary:
              'Operate the shipped microproduct as an outcome-focused product with distribution, learning, and iteration loops.',
            to: '/docs/playbook/operate',
            contributorHint:
              'Add operating rhythms, launch learnings, metrics reviews, and ownership practices from real products.',
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        level: 2,
        summary:
          'Curated references that help builders execute faster without changing the playbook hierarchy.',
        to: '/docs/resources',
        contributorHint:
          'Add practical resources with direct relevance to shipping microproducts.',
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
        <p className={styles.detailSummary}>{selectedNode.summary}</p>
        {selectedNode.contributorHint ? (
          <div className={styles.contributorHint}>
            <span className={styles.contributorLabel}>Contributor focus</span>
            <p>{selectedNode.contributorHint}</p>
          </div>
        ) : null}
        {selectedNode.to ? (
          <Link className={styles.openLink} to={selectedNode.to}>
            Open module
          </Link>
        ) : null}
      </aside>
    </div>
  );
}
