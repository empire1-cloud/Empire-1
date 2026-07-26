import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';
import EcosystemNavigator from '@/components/public/EcosystemNavigator';

export const metadata: Metadata = {
  title: 'Ecosystem — Empire-1',
  description: 'Navigate the finished products, public systems, factory, and independent universes inside Empire-1.',
};

export default function EcosystemPage() {
  return (
    <PublicPageShell>
      <section className="hero wrap">
        <div className="eyebrow">ECOSYSTEM</div>
        <h1>Every universe has a real place to go.</h1>
        <p>
          Empire-1 is a federated ecosystem of independent products and businesses. Use the navigator below to move between finished products, public experiences, internal operating systems, and active builds without flattening their identities.
        </p>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">PRODUCT NAVIGATOR</div>
          <h2>Choose a universe. Open the actual product.</h2>
          <EcosystemNavigator />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">PRODUCT TRUTH</div>
          <h2>Finished means finished. Development means development.</h2>
          <p>
            Hybrid Intelligence Core and Cultura Vibe Forge are finished products. Revenue OS is a public product. SLA113 is an internal operational product. Other universes retain their current public-proof, active-development, or in-development status until their own release gates are complete.
          </p>
          <div className="cta-row">
            <a href="/revenue-os" className="btn btn-primary">Open Revenue OS →</a>
            <a href="/cultura" className="btn btn-ghost">Enter Cultura →</a>
            <a href="/licensing" className="btn btn-ghost">View Licensing →</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
