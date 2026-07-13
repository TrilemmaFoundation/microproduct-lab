import {buildDocReadTimes} from '../../../scripts/readTimeUtils.mjs';

export default function docReadTimesPlugin(context, options) {
  return {
    name: 'doc-read-times',
    loadContent() {
      return buildDocReadTimes({
        siteDir: context.siteDir,
        docRoots: options.docRoots,
      });
    },
    contentLoaded({content, actions}) {
      actions.setGlobalData({readTimes: content});
    },
  };
}
