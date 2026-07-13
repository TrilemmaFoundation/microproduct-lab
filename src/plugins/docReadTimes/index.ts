import type {LoadContext, Plugin} from '@docusaurus/types';

import {buildDocReadTimes} from '../../../scripts/readTimeUtils.mjs';

type ReadTimes = Record<string, number>;

type DocReadTimesOptions = {
  docRoots: string[];
};

export default function docReadTimesPlugin(
  context: LoadContext,
  options: DocReadTimesOptions,
): Plugin<ReadTimes> {
  const {docRoots} = options;

  return {
    name: 'doc-read-times',
    loadContent() {
      return buildDocReadTimes({siteDir: context.siteDir, docRoots});
    },
    contentLoaded({content, actions}) {
      actions.setGlobalData({readTimes: content});
    },
  };
}
