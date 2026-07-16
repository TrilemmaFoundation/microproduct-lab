import { defineConfig } from 'cspell';

/**
 * from https://github.com/johno/domain-regex
 */
const domainNameRegex = '((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}';

export default defineConfig({
    version: '0.2',
    dictionaryDefinitions: [
        {
            name: 'project-words',
            path: './project-words.txt',
            addWords: true,
        },
    ],
    dictionaries: ['project-words'],
    ignorePaths: ['node_modules', '/project-words.txt', 'docs/agents/human/**'],
    patterns: [
        /**
         * cspell is not ignoring domain names (URLs without the prefix)
         * in markdown links by default. We might want to scope this
         * to just markdown links in the future.
         */
        {
            name: 'domain-name',
            pattern: domainNameRegex
        }
    ],
    ignoreRegExpList: ['domain-name']
});