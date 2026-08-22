import {humanPlaybookTree} from '../../data/humanPlaybook';
import {agentMirrorSearchIgnoreFiles} from '../agentMirrorSearchIgnore';

function matches(pattern: RegExp, route: string): boolean {
  return pattern.test(route);
}

describe('agentMirrorSearchIgnoreFiles', () => {
  it('ignores generated mirror routes and keeps the agents hub searchable', () => {
    const [pattern] = agentMirrorSearchIgnoreFiles(humanPlaybookTree);
    expect(pattern).toBeDefined();
    expect(matches(pattern, '/agents/')).toBe(false);
    expect(matches(pattern, '/agents')).toBe(false);
    expect(matches(pattern, '/agents/runbooks')).toBe(false);
    expect(matches(pattern, '/agents/human')).toBe(true);
    expect(matches(pattern, '/agents/human-overview')).toBe(true);
    expect(matches(pattern, 'agents/playbook/frame')).toBe(true);
    expect(matches(pattern, '/agents/playbook/frame')).toBe(true);
    expect(matches(pattern, '/agents/authors')).toBe(true);
    expect(matches(pattern, '/agents/resources')).toBe(false);
  });

  it('returns no patterns when nothing can be derived', () => {
    expect(agentMirrorSearchIgnoreFiles([], [])).toEqual([]);
  });

  it('skips empty extra slugs and non-human playbook routes', () => {
    const [pattern] = agentMirrorSearchIgnoreFiles(
      [
        {id: 'skip', title: 'Skip', description: 'No route'},
        {
          id: 'agents',
          title: 'Agents',
          description: 'Wrong island',
          to: '/agents/custom',
        },
        {
          id: 'docs-root',
          title: 'Docs root',
          description: 'No first segment',
          to: '/docs/',
        },
        {
          id: 'faq',
          title: 'FAQ',
          description: 'New human section',
          to: '/docs/faq/intro',
        },
      ],
      ['/', '', '/faq-extra'],
    );
    expect(matches(pattern, '/agents/faq/intro')).toBe(true);
    expect(matches(pattern, '/agents/faq-extra')).toBe(true);
    expect(matches(pattern, '/agents/custom')).toBe(false);
  });

  it('escapes regex metacharacters in slug segments', () => {
    const [pattern] = agentMirrorSearchIgnoreFiles(
      [
        {
          id: 'dotted',
          title: 'Dotted',
          description: 'Literal dot',
          to: '/docs/foo.bar/page',
        },
      ],
      [],
    );
    expect(matches(pattern, '/agents/foo.bar/page')).toBe(true);
    expect(matches(pattern, '/agents/fooXbar/page')).toBe(false);
  });
});
