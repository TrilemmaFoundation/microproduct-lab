import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import {buildHumanPlaybookSidebar} from './src/data/humanPlaybook';

const sidebars: SidebarsConfig = {
  incubatorSidebar: buildHumanPlaybookSidebar(),
};

export default sidebars;
