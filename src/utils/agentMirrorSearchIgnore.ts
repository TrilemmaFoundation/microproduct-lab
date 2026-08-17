import type {PlaybookTreeNode} from '../data/humanPlaybook';
import {flattenPlaybookNodes} from './playbookTree';

/** Generated mirror overview lives at `/agents/human` (slug `/human`). */
export const AGENT_MIRROR_OVERVIEW_SLUG = '/human';

function firstPathSegment(path: string): string | undefined {
  const first = path.replace(/^\//, '').split('/')[0];
  return first || undefined;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ignore generated agent-mirror routes. Mirror pages copy human slugs onto
 * `/agents` (for example `/docs/intro/mission` → `/agents/intro/mission`), so
 * exclusion follows playbook `to` paths plus the generated overview slug.
 */
export function agentMirrorSearchIgnoreFiles(
  nodes: PlaybookTreeNode[],
  extraSlugs: readonly string[] = [AGENT_MIRROR_OVERVIEW_SLUG],
): RegExp[] {
  const segments = new Set<string>();

  for (const slug of extraSlugs) {
    const first = firstPathSegment(slug);
    if (first) {
      segments.add(first);
    }
  }

  for (const node of flattenPlaybookNodes(nodes)) {
    if (!node.to?.startsWith('/docs/')) {
      continue;
    }
    const first = firstPathSegment(node.to.slice('/docs'.length));
    if (first) {
      segments.add(first);
    }
  }

  if (segments.size === 0) {
    return [];
  }

  const alternation = [...segments].sort().map(escapeRegex).join('|');
  return [new RegExp(`^/?agents/(?:${alternation})(?:/|$)`)];
}
