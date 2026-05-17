import Layout from '@theme/Layout';
import {
  ActionCard,
  MetadataPill,
  PageSection,
} from '../components/ControlSurface';

export default function Home() {
  return (
    <Layout
      title="Turn Data Into Value"
      description="An open source knowledge hub by Trilemma Foundation for our community of builders."
    >
      <main className="bt-shell">
        <div className="bt-page">
          <PageSection
            title="Turn Data Into Value"
            description="An open source knowledge hub by Trilemma Foundation for our community of builders."
            variant="hero"
          >
            <div className="bt-two-column-grid">
              <ActionCard
                title="AI agents"
                description="Hub pages with instructions, machine-readable artifacts, and workflows into templates and standards."
                actions={[
                  {
                    label: 'Open the agents hub',
                    to: '/agents',
                    description: 'Canonical web entry for contributor agents and tooling.',
                  },
                ]}
                aside={
                  <div className="bt-inline-pills">
                    <MetadataPill tone="accent">Agent-first</MetadataPill>
                    <MetadataPill>Templates + standards</MetadataPill>
                  </div>
                }
              />
              <ActionCard
                title="Humans"
                description="Understand what a microproduct is, then walk the same folder contract, archetype, template, and validation path."
                actions={[
                  {
                    label: 'Start with What is a microproduct?',
                    to: '/docs/intro/what-is-a-microproduct',
                    description: 'Definition, characteristics, and your path on this site.',
                  },
                ]}
                aside={
                  <div className="bt-inline-pills">
                    <MetadataPill>Playbook</MetadataPill>
                    <MetadataPill>Templates + standards</MetadataPill>
                  </div>
                }
              />
            </div>
          </PageSection>
        </div>
      </main>
    </Layout>
  );
}
