import type {PlaybookTreeNode} from '../data/humanPlaybook';
import {flattenPlaybookNodes} from './playbookTree';

/** Generated mirror overview lives at `/agents/human` (slug `/human`). */
export const AGENT_MIRROR_OVERVIEW_SLUG = '/human';

/**
 * Omit the `/archetypes` docs island from local search. The plugin matches
 * `url` with `baseUrl` and a trailing slash stripped, so this covers both
 * `archetypes` and `/archetypes/...`. Pages remain routed.
 */
export const ARCHETYPE_SEARCH_IGNORE = /^\/?archetypes(?:\/|$)/;

function firstPathSegment(path: string): string | undefined {
  const first = path.replace(/^\//, '').split('/')[0];
  return first || undefined;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ignore generated agent-mirror routes. Mirror pages copy human slugs onto
 * `/agents` (for example `/docs/playbook/frame` → `/agents/playbook/frame`), so
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

/** Ignore patterns for `@easyops-cn/docusaurus-search-local`. */
export function searchIgnoreFiles(
  nodes: PlaybookTreeNode[],
  extraSlugs: readonly string[] = [AGENT_MIRROR_OVERVIEW_SLUG],
): RegExp[] {
  return [...agentMirrorSearchIgnoreFiles(nodes, extraSlugs), ARCHETYPE_SEARCH_IGNORE];
}
