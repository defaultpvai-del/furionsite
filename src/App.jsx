const services = [
  "Informática e manutenção",
  "Comunicação visual",
  "Envelopamento em geral",
  "Designer gráfico",
  "Cortes laser / router",
  "Impressão 3D",
  "Câmeras IP Wi-Fi",
  "Insulfilm",
];

const projects = [
  { image: "/assets/project-01.png", title: "Envelopamento automotivo", tag: "Personalização" },
  { image: "/assets/project-02.png", title: "Envelopamento de geladeira", tag: "Envelopamento" },
  { image: "/assets/project-03.png", title: "Envelopamento de móveis", tag: "Envelopamento" },
  { image: "/assets/project-04.png", title: "Peças personalizadas", tag: "Impressão 3D" },
  { image: "/assets/project-05.png", title: "Informática e manutenção", tag: "Informática" },
  { image: "/assets/project-06.png", title: "Comunicação visual", tag: "Comunicação visual" },
  { image: "/assets/project-07.png", title: "Cortes com precisão", tag: "Laser / Router" },
  { image: "/assets/project-08.png", title: "Designer gráfico", tag: "Design gráfico" },
  { image: "/assets/project-09.png", title: "Insulfilm residencial", tag: "Insulfilm" },
  { image: "/assets/project-10.png", title: "Monitoramento inteligente", tag: "Câmeras IP" },
];

export default function App() {
  function handlePointerMove(event) {
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  return (
    <main className="site-shell" onPointerMove={handlePointerMove}>
      <header className="site-header">
        <a className="brand-link brand-link-header" href="#inicio" aria-label="Furion - início">
          <img
            className="official-logo"
            src="/assets/furion-logo.svg"
            alt="Furion"
          />
        </a>
        <nav aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#projetos">Projetos</a>
          <a href="#contato">Contato</a>
        </nav>
        <a
          className="header-cta"
          href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Quero%20solicitar%20um%20or%C3%A7amento."
          target="_blank"
          rel="noreferrer"
        >
          Pedir orçamento
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="cmyk-field" aria-hidden="true">
          <span className="cmyk-blob blob-cyan" />
          <span className="cmyk-blob blob-magenta" />
          <span className="cmyk-blob blob-yellow" />
          <span className="pointer-light" />
        </div>
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow"><span /> Soluções que saem do comum</p>
          <h1 className="brand-display">
            <span className="sr-only">Furion</span>
            <img
              className="hero-logo"
              src="/assets/furion-logo.svg"
              alt=""
            />
          </h1>
          <div className="hero-copy">
            <h2>
              Você <strong className="yellow">imagina</strong>,<br />
              a gente <strong className="cyan">realiza</strong>.
            </h2>
            <p>
              Tecnologia, comunicação visual e fabricação personalizada para
              transformar boas ideias em projetos reais.
            </p>
          </div>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Vim%20pelo%20site%20e%20quero%20solicitar%20um%20or%C3%A7amento."
              target="_blank"
              rel="noreferrer"
            >
              <span>Solicitar orçamento</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-ghost" href="#servicos">
              Conhecer serviços
            </a>
          </div>
          <div className="hero-proof">
            <span className="status-dot" /> Atendimento em Paranavaí e região
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="sculpture-ring ring-one" />
          <div className="sculpture-ring ring-two" />
          <img
            className="cmyk-sculpture"
            src="/assets/cmyk-sculpture.png"
            alt=""
          />
          <span className="floating-tag tag-design">Design</span>
          <span className="floating-tag tag-tech">Tecnologia</span>
          <span className="floating-tag tag-make">Produção</span>
          <p className="visual-stamp">CRIAÇÃO EM MOVIMENTO</p>
        </div>

        <a className="scroll-hint" href="#servicos">
          <span>Explorar</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="services-preview" id="servicos">
        <div className="section-heading">
          <p className="eyebrow"><span /> O que a gente faz</p>
          <h2>Soluções para criar, proteger e conectar.</h2>
        </div>
        <div className="service-pills">
          {services.map((service, index) => (
            <article key={service}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{service}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio" id="projetos">
        <div className="portfolio-heading">
          <div>
            <p className="eyebrow"><span /> Projetos Furion</p>
            <h2>Ideias ganham forma por aqui.</h2>
          </div>
          <p>
            Do primeiro rascunho à instalação final, cada projeto recebe uma
            solução pensada para o seu espaço, sua marca e seu objetivo.
          </p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article className="project-card" key={project.title}>
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
              />
              <div className="project-overlay">
                <span>{project.tag}</span>
                <h3>{project.title}</h3>
              </div>
              <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="process">
        <div className="section-heading">
          <p className="eyebrow"><span /> Simples e direto</p>
          <h2>Do orçamento à entrega, sem complicação.</h2>
        </div>
        <div className="process-grid">
          <article>
            <span>01</span>
            <h3>Conte sua ideia</h3>
            <p>Chame no WhatsApp, envie referências e explique o que precisa.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Receba a solução</h3>
            <p>Avaliamos o projeto, os materiais e apresentamos seu orçamento.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Veja acontecer</h3>
            <p>Produzimos com cuidado e combinamos a instalação ou entrega.</p>
          </article>
        </div>
      </section>

      <section className="contact" id="contato">
        <div className="contact-spectrum" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        <div className="contact-heading">
          <div>
            <p className="contact-kicker">Seu próximo projeto começa aqui</p>
            <h2>Vamos tirar sua ideia do <em>papel?</em></h2>
          </div>
          <p>
            Conte o que você precisa e receba uma orientação direta. Sem
            formulário complicado: você fala com a Furion pelo WhatsApp.
          </p>
        </div>
        <div className="contact-bottom">
          <a
            className="contact-primary"
            href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Vim%20pelo%20site%20e%20quero%20solicitar%20um%20or%C3%A7amento."
            target="_blank"
            rel="noreferrer"
          >
            <span>
              <small>Orçamento rápido</small>
              <strong>Chamar no WhatsApp</strong>
            </span>
            <b aria-hidden="true">↗</b>
          </a>
          <div className="contact-info">
            <a href="https://www.instagram.com/furion.all/" target="_blank" rel="noreferrer">
              <small>Instagram</small>
              <strong>@furion.all</strong>
              <span aria-hidden="true">↗</span>
            </a>
            <div>
              <small>Telefone</small>
              <strong>(44) 99870-5407</strong>
            </div>
            <div>
              <small>Atendimento</small>
              <strong>Paranavaí e região</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="partners" aria-label="Marcas parceiras">
        <span>ALLTAK</span><i>•</i><span>IMPRIMAX</span><i>•</i>
        <span>AVERY DENNISON</span><i>•</i><span>ICSEE</span><i>•</i>
        <span>BAMBU LAB</span><i>•</i><span>ANYCUBIC</span><i>•</i>
        <span>MICROSOFT</span>
      </div>

      <footer>
        <a className="brand-link brand-link-footer" href="#inicio" aria-label="Furion - início">
          <img
            className="official-logo"
            src="/assets/furion-logo.svg"
            alt="Furion"
          />
        </a>
        <p>Você imagina, a gente realiza.</p>
        <p>© 2026 Furion. Todos os direitos reservados.</p>
      </footer>

      <a
        className="floating-whatsapp"
        href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Quero%20solicitar%20um%20or%C3%A7amento."
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a Furion pelo WhatsApp"
      >
        <span aria-hidden="true">◉</span>
        <strong>WhatsApp</strong>
      </a>
    </main>
  );
}
