import { segments } from '@/core/segments';

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero-panel">
        <span className="eyebrow">WEBAPPCAP V2</span>
        <h1>Base limpa para os próximos sites.</h1>
        <p>Segmentos separados de templates, onboarding previsível e uma única lógica para preview, publicação e domínio.</p>
      </section>
      <section className="segment-grid">
        {Object.values(segments).map(segment => (
          <article className="segment-card" key={segment.key}>
            <span>{segment.templates.length} modelos</span>
            <h2>{segment.name}</h2>
            <p>{segment.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
