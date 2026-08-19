/**
 * Guard the deploy-quickstart Hobby section against retired Vercel quota copy.
 * Canonical sources: https://vercel.com/docs/plans/hobby
 * and https://vercel.com/docs/limits/fair-use-guidelines
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEPLOY_QUICKSTART_RELATIVE_PATH =
  'docs/human/playbook/build/deploy-quickstart.md';

export const OBSOLETE_HOBBY_QUOTA_PATTERNS = [
  {
    id: 'build-minutes-heading',
    pattern: /Build minutes/i,
    message: "must not list a Hobby 'Build minutes' monthly quota",
  },
  {
    id: 'six-thousand-per-month',
    pattern: /6,?000 per month/i,
    message: 'must not claim a 6,000-per-month Hobby quota',
  },
  {
    id: 'serverless-execution-heading',
    pattern: /Serverless execution/i,
    message: "must not list a Hobby 'Serverless execution' quota",
  },
  {
    id: 'hundred-gb-hours',
    pattern: /100 GB[ -]hours/i,
    message: 'must not claim 100 GB-hours of Hobby serverless execution',
  },
];

export const REQUIRED_HOBBY_LIMIT_MARKERS = [
  {
    needle: 'Fast Data Transfer',
    message: 'must mention Fast Data Transfer',
  },
  {
    needle: 'Active CPU',
    message: 'must mention Active CPU',
  },
  {
    needle: 'Provisioned Memory',
    message: 'must mention Provisioned Memory',
  },
  {
    needle: 'https://vercel.com/docs/plans/hobby',
    message: 'must link to the Vercel Hobby plan docs',
  },
  {
    needle: 'https://vercel.com/docs/limits/fair-use-guidelines',
    message: 'must link to the Vercel fair use guidelines',
  },
];

/**
 * @param {string} markdown
 * @param {string} [label]
 * @returns {string[]}
 */
export function collectHobbyLimitDocErrors(
  markdown,
  label = DEPLOY_QUICKSTART_RELATIVE_PATH,
) {
  const errors = [];
  for (const {pattern, message} of OBSOLETE_HOBBY_QUOTA_PATTERNS) {
    if (pattern.test(markdown)) {
      errors.push(`${label}: ${message}`);
    }
  }
  for (const {needle, message} of REQUIRED_HOBBY_LIMIT_MARKERS) {
    if (!markdown.includes(needle)) {
      errors.push(`${label}: ${message}`);
    }
  }
  return errors;
}

/**
 * @param {string} root repository root
 * @returns {string[]}
 */
export function collectDeployQuickstartHobbyLimitErrors(root) {
  const filePath = path.join(root, DEPLOY_QUICKSTART_RELATIVE_PATH);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return collectHobbyLimitDocErrors(fs.readFileSync(filePath, 'utf8'), filePath);
}
