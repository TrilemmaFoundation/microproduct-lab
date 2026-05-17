import {buildDocReadTimes} from '../../../scripts/readTimeUtils.mjs';

export default function docReadTimesPlugin(_context, options) {
  return {
    name: 'doc-read-times',
    loadContent() {
      return buildDocReadTimes({
        siteDir: options.siteDir,
        docRoots: options.docRoots,
      });
    },
    contentLoaded({content, actions}) {
      actions.setGlobalData({readTimes: content});
    },
  };
}
