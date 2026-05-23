import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { PageSection } from '../components/ControlSurface';

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
            description="An open source knowledge hub by Trilemma Foundation for our community of builders"
            variant="hero"
          >
            <div className="bt-hero-actions" aria-label="Choose your path">
              <Link
                className="bt-hero-button bt-hero-button--primary"
                to="/docs/human-overview"
              >
                Humans
              </Link>
              <Link className="bt-hero-button bt-hero-button--agents" to="/agents">
                Agents
              </Link>
            </div>
          </PageSection>
        </div>
      </main>
    </Layout>
  );
}
