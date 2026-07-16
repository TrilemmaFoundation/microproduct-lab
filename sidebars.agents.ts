import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import {buildAgentPlaybookSidebar} from './src/data/humanPlaybook';

const sidebars: SidebarsConfig = {
  agentsSidebar: buildAgentPlaybookSidebar(),
};

export default sidebars;
