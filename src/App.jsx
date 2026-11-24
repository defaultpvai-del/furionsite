import { useState, useEffect } from "react";
function CategoryIcon({index}) {
 const paths=[<><circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="15" cy="7" r="1"/><circle cx="16" cy="14" r="1"/><path d="M12 21v-4l-4-1"/></>,<><path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/></>,<><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m9 9-3 3 3 3m6-6 3 3-3 3"/></>,<><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-5 0h10"/></>,<><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8C3 8 5 0 9 4l3 4c9 0 7-8 3-4z"/></>,<><path d="M12 3 3 7v5c0 5 4 8 9 10 5-2 9-5 9-10V7z"/><rect x="7" y="9" width="8" height="6" rx="1"/><path d="m15 11 3-2v6l-3-2"/></>];
 return <div className={'category-icon icon-'+index}><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg></div>;
}
const services = [
  {name:"Comunicação Visual",items:"Design gráfico, comunicação visual, envelopamento, insulfilm e cortes a laser e fresagem."},
  {name:"Impressão 3D",items:"Impressão 3D sob demanda, chaveiros, placas PIX, protótipos e peças funcionais."},
  {name:"Soluções Digitais",items:"Sites, páginas de divulgação, catálogos digitais e sistemas personalizados."},
  {name:"Tecnologia e Informática",items:"Informática, manutenção e atualizações de hardware."},
  {name:"Personalizados",items:"Brindes e projetos especiais. Disponibilidade mediante consulta.",consult:true},
  {name:"Segurança e Tecnologia",items:"Câmeras IP Wi-Fi, dispositivos inteligentes e soluções de monitoramento."},
];

const projects = [
  { image: "./assets/project-01.png", title: "Envelopamento automotivo", tag: "Personalização" },
  { image: "./assets/project-02.png", title: "Envelopamento de geladeira", tag: "Envelopamento" },
  { image: "./assets/project-03.png", title: "Envelopamento de móveis", tag: "Envelopamento" },
  { image: "./assets/project-04.png", title: "Peças personalizadas", tag: "Impressão 3D" },
  { image: "./assets/project-05.png", title: "Informática e manutenção", tag: "Informática" },
  { image: "./assets/project-06.png", title: "Comunicação visual", tag: "Comunicação visual" },
  { image: "./assets/project-07.png", title: "Cortes com precisão", tag: "Corte a laser e fresagem" },
  { image: "./assets/project-08.png", title: "Design gráfico", tag: "Design gráfico" },
  { image: "./assets/project-09.png", title: "Insulfilm residencial", tag: "Insulfilm" },
  { image: "./assets/project-10.png", title: "Monitoramento inteligente", tag: "Câmeras IP" },
];

function ToolsPanel(){const [grams,G]=useState("50"),[kg,K]=useState("100"),[hours,H]=useState("2"),[rate,R]=useState("2"),[extra,E]=useState("0"),[margin,M]=useState("30"),[phone,P]=useState(""),[message,T]=useState("");const cost=Number(grams)*Number(kg)/1000+Number(hours)*Number(rate)+Number(extra);const link="https://wa.me/"+phone.replace(/\D/g,"")+"?text="+encodeURIComponent(message);return <section className="quote-section" id="ferramentas"><p className="eyebrow"><span/> Ferramentas gratuitas</p><h2>Facilite seu dia.</h2><div className="security-grid"><article><h3>Calculadora de impressão 3D</h3><p>Estimativa de custo e preço com margem sobre o custo.</p><div className="tool-fields">{[["Peso (g)",grams,G],["Filamento (R$/kg)",kg,K],["Tempo (horas)",hours,H],["Custo por hora (R$)",rate,R],["Outros custos (R$)",extra,E],["Acréscimo (%)",margin,M]].map(([label,value,set])=><label key={label}>{label}<input type="number" min="0" step="any" value={value} onChange={e=>set(e.target.value)}/></label>)}</div><p>Custo estimado: {cost.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</p><strong>Preço sugerido: {(cost*(1+Number(margin)/100)).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</strong></article><article><h3>Gerador de link do WhatsApp</h3><div className="tool-fields"><label>Telefone com código do país e DDD<input type="tel" value={phone} onChange={e=>P(e.target.value)} placeholder="5544999999999"/></label><label>Mensagem<textarea value={message} onChange={e=>T(e.target.value)}/></label></div>{/^\d{10,15}$/.test(phone.replace(/\D/g,""))&&<><input readOnly value={link} aria-label="Link gerado" onFocus={e=>e.target.select()}/><a className="sector-link" href={link} target="_blank" rel="noreferrer">Testar link ↗</a></>}</article></div></section>}
export default function App() {
  const [dark,setDark]=useState(()=>{try{return localStorage.getItem("furion-theme-v2")!=="light"}catch{return true}});
  const [filter,setFilter]=useState("Todos");
 const [menu,setMenu]=useState(false);
 const [selected,setSelected]=useState([]);
 const [details,setDetails]=useState("");
 const [customer,setCustomer]=useState("");
 const quoteUrl="https://wa.me/5544998705407?text="+encodeURIComponent("Olá! Gostaria de solicitar um orçamento.\nNome: "+customer+"\nServiços: "+selected.join(", ")+"\nDetalhes: "+details);
  useEffect(()=>{try{localStorage.setItem("furion-theme-v2",dark?"dark":"light");}catch{}},[dark]);
 useEffect(()=>{if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("revealed");observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll(".service-pills article,.print-grid article,.process-grid article,.security-grid article").forEach(el=>observer.observe(el));return()=>observer.disconnect();},[]);
  function handlePointerMove(event) {
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  return (
    <main className={`site-shell ${dark?"dark-theme":""}`} onPointerMove={handlePointerMove}>
      <header className="site-header">
        <a className="brand-link brand-link-header" href="#inicio" aria-label="Furion - início">
          <img
            className="official-logo"
            src="./assets/furion-logo.svg"
            alt="Furion"
          />
        </a>
        <nav aria-label="Navegação principal" className={menu?"mobile-open":""} onClick={()=>setMenu(false)}>
          <a href="#servicos">Serviços</a>
          <a href="#impressao3d">Impressão 3D</a>
          <a href="#projetos">Projetos</a>
          <a href="#seguranca">Segurança</a><a href="#contato">Contato</a>
        </nav>
        <div className="header-actions"><button className="mobile-menu" type="button" aria-label={menu?"Fechar menu":"Abrir menu"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?"×":"☰"}</button><button type="button" className="theme-toggle" aria-label={dark?"Ativar tema claro":"Ativar tema escuro"} aria-pressed={dark} onClick={()=>setDark(!dark)}>{dark?"☀":"☾"}</button><a
          className="header-cta"
          href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noreferrer"
        >
          Pedir orçamento
        </a></div>
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
              src="./assets/furion-logo.svg"
              alt=""
            />
          </h1>
          <div className="hero-copy">
            <h2>
              Do digital<br /> ao <strong className="cyan">real.</strong>
            </h2>
            <p>
              Tecnologia, comunicação visual, impressão 3D e soluções digitais para
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
            src="./assets/cmyk-sculpture.png"
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
            <article key={service.name}>
              <CategoryIcon index={index}/>
              <h3>{service.name}</h3>{service.consult && <small className="consult-label">Sob consulta</small>}
              <p>{service.items}</p>
              <a className="sector-link" href={`https://wa.me/5544998705407?text=${encodeURIComponent("Olá! Gostaria de consultar os serviços de " + service.name)}`} target="_blank" rel="noreferrer">{service.consult ? "Consultar disponibilidade" : "Solicitar orçamento"} ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="print-section" id="impressao3d">
        <p className="eyebrow"><span /> Impressão 3D</p>
        <h2>Do digital ao real.</h2>
        <p>Impressão sob demanda com Bambu Lab A1. Envie sua ideia ou arquivo para avaliação de viabilidade, material e orçamento.</p>
        <div className="print-grid">{[{"title":"Chaveiros e brindes","desc":"Sua marca em cada detalhe. Lembranças, brindes e peças personalizadas.","image":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20360%20220%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%3E%3Cstop%20stop-color%3D%22%2323495b%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2312151d%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22360%22%20height%3D%22220%22%20fill%3D%22url(%23g)%22%2F%3E%3Cellipse%20cx%3D%22180%22%20cy%3D%22196%22%20rx%3D%22130%22%20ry%3D%2212%22%20fill%3D%22%23000%22%20opacity%3D%22.35%22%2F%3E%3Cg%20transform%3D%22rotate(-12%20180%20105)%22%3E%3Crect%20x%3D%2285%22%20y%3D%2269%22%20width%3D%22188%22%20height%3D%2282%22%20rx%3D%2225%22%20fill%3D%22%23007b91%22%2F%3E%3Crect%20x%3D%2285%22%20y%3D%2260%22%20width%3D%22188%22%20height%3D%2282%22%20rx%3D%2225%22%20fill%3D%22%2348dce8%22%2F%3E%3Ccircle%20cx%3D%22111%22%20cy%3D%22100%22%20r%3D%229%22%20fill%3D%22%2314232e%22%2F%3E%3Ctext%20x%3D%22184%22%20y%3D%22111%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2229%22%20font-weight%3D%22900%22%20fill%3D%22%2312303b%22%3EFURION%3C%2Ftext%3E%3Ccircle%20cx%3D%2279%22%20cy%3D%22100%22%20r%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%227%22%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%22rotate(13%20225%20155)%22%3E%3Crect%20x%3D%22173%22%20y%3D%22133%22%20width%3D%22110%22%20height%3D%2250%22%20rx%3D%2215%22%20fill%3D%22%23b52a83%22%2F%3E%3Crect%20x%3D%22173%22%20y%3D%22126%22%20width%3D%22110%22%20height%3D%2250%22%20rx%3D%2215%22%20fill%3D%22%23fa72c4%22%2F%3E%3Ccircle%20cx%3D%22190%22%20cy%3D%22150%22%20r%3D%225%22%20fill%3D%22%23562044%22%2F%3E%3Ctext%20x%3D%22235%22%20y%3D%22157%22%20font-family%3D%22sans-serif%22%20font-size%3D%2217%22%20text-anchor%3D%22middle%22%20font-weight%3D%22bold%22%20fill%3D%22%23562044%22%3E3D%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E"},{"title":"Placas PIX e expositores","desc":"Destaque seu negócio com soluções para balcões e pontos de atendimento.","image":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20360%20220%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%3E%3Cstop%20stop-color%3D%22%23214b48%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2312151d%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22360%22%20height%3D%22220%22%20fill%3D%22url(%23g)%22%2F%3E%3Cellipse%20cx%3D%22180%22%20cy%3D%22196%22%20rx%3D%22130%22%20ry%3D%2212%22%20fill%3D%22%23000%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M95%20180%20258%20180%20289%20194%20126%20194Z%22%20fill%3D%22%230d8796%22%2F%3E%3Crect%20x%3D%22119%22%20y%3D%2229%22%20width%3D%22133%22%20height%3D%22154%22%20rx%3D%2212%22%20fill%3D%22%23147c85%22%2F%3E%3Crect%20x%3D%22111%22%20y%3D%2224%22%20width%3D%22133%22%20height%3D%22154%22%20rx%3D%2212%22%20fill%3D%22%23d5faf5%22%2F%3E%3Ctext%20x%3D%22177%22%20y%3D%2252%22%20text-anchor%3D%22middle%22%20font-size%3D%2220%22%20font-family%3D%22sans-serif%22%20font-weight%3D%22bold%22%20fill%3D%22%23147c85%22%3EPIX%3C%2Ftext%3E%3Crect%20x%3D%22141%22%20y%3D%2265%22%20width%3D%2272%22%20height%3D%2272%22%20rx%3D%226%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M148%2072h19v19h-19zM187%2072h19v19h-19zM148%20111h19v19h-19zM176%2072v12m0%2012h30m-30%209v25m10-20h20v20%22%20fill%3D%22none%22%20stroke%3D%22%23147c85%22%20stroke-width%3D%225%22%2F%3E%3Ctext%20x%3D%22177%22%20y%3D%22158%22%20text-anchor%3D%22middle%22%20font-size%3D%2210%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23147c85%22%3EEXEMPLO%20ILUSTRATIVO%3C%2Ftext%3E%3C%2Fsvg%3E"},{"title":"Protótipos e peças funcionais","desc":"Da ideia à peça física, com avaliação de medidas, materiais e aplicação.","image":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20360%20220%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%3E%3Cstop%20stop-color%3D%22%23363451%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2312151d%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22360%22%20height%3D%22220%22%20fill%3D%22url(%23g)%22%2F%3E%3Cellipse%20cx%3D%22180%22%20cy%3D%22196%22%20rx%3D%22130%22%20ry%3D%2212%22%20fill%3D%22%23000%22%20opacity%3D%22.35%22%2F%3E%3Cg%20transform%3D%22translate(100%20108)%22%3E%3Cpath%20d%3D%22M-58-20h17l7-17-12-12%2015-15%2013%2012%2017-7v-17h21v17l17%207%2012-12%2015%2015-12%2012%207%2017h17v21H59l-7%2017%2012%2012-15%2015-12-12-17%207v17H-1V40l-17-7-13%2012-15-15%2012-12-7-17h-17z%22%20fill%3D%22%236576d8%22%20stroke%3D%22%23a5b4fc%22%20stroke-width%3D%223%22%2F%3E%3Ccircle%20r%3D%2223%22%20fill%3D%22%2318203b%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M210%2060h37v100h57v28h-94z%22%20fill%3D%22%23eea443%22%20stroke%3D%22%23ffd28a%22%20stroke-width%3D%223%22%2F%3E%3Ccircle%20cx%3D%22229%22%20cy%3D%2285%22%20r%3D%228%22%20fill%3D%22%23493721%22%2F%3E%3Ccircle%20cx%3D%22229%22%20cy%3D%22130%22%20r%3D%228%22%20fill%3D%22%23493721%22%2F%3E%3Ccircle%20cx%3D%22280%22%20cy%3D%22174%22%20r%3D%228%22%20fill%3D%22%23493721%22%2F%3E%3C%2Fsvg%3E"},{"title":"Objetos decorativos","desc":"Formas criativas e detalhes únicos para transformar ambientes.","image":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20360%20220%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%3E%3Cstop%20stop-color%3D%22%23483050%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2312151d%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22360%22%20height%3D%22220%22%20fill%3D%22url(%23g)%22%2F%3E%3Cellipse%20cx%3D%22180%22%20cy%3D%22196%22%20rx%3D%22130%22%20ry%3D%2212%22%20fill%3D%22%23000%22%20opacity%3D%22.35%22%2F%3E%3Cpath%20d%3D%22M103%2043Q140%2058%20177%2043L169%2084Q218%20144%20176%20190H104Q62%20144%20111%2084Z%22%20fill%3D%22%23b66be7%22%2F%3E%3Cellipse%20cx%3D%22140%22%20cy%3D%2243%22%20rx%3D%2237%22%20ry%3D%2210%22%20fill%3D%22%23e0a8ff%22%2F%3E%3Cellipse%20cx%3D%22140%22%20cy%3D%2243%22%20rx%3D%2225%22%20ry%3D%225%22%20fill%3D%22%2351216e%22%2F%3E%3Cpath%20d%3D%22M112%2056Q174%2095%2096%20129M108%2072Q184%20114%2096%20148M107%2091Q188%20130%20108%20169M110%20111Q180%20151%20127%20186%22%20fill%3D%22none%22%20stroke%3D%22%23e0a8ff%22%20stroke-width%3D%225%22%20opacity%3D%22.7%22%2F%3E%3Cpath%20d%3D%22M218%2084Q246%2096%20274%2084L265%20111Q300%20155%20270%20190H222Q192%20155%20227%20111Z%22%20fill%3D%22%2342c9b8%22%2F%3E%3Cellipse%20cx%3D%22246%22%20cy%3D%2284%22%20rx%3D%2228%22%20ry%3D%228%22%20fill%3D%22%239af4e7%22%2F%3E%3Cellipse%20cx%3D%22246%22%20cy%3D%2284%22%20rx%3D%2219%22%20ry%3D%224%22%20fill%3D%22%2314665d%22%2F%3E%3Cpath%20d%3D%22M226%20100l48%2056m-53-38%2047%2058m-49-37%2035%2049%22%20stroke%3D%22%239af4e7%22%20stroke-width%3D%224%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E"}].map(item => <article key={item.title}><div className="print-image"><img src={item.image} alt={"Ilustração de "+item.title} loading="lazy"/><span>Ilustração</span></div><div className="print-card-body"><h3>{item.title}</h3><p>{item.desc}</p><a className="sector-link" href={`https://wa.me/5544998705407?text=${encodeURIComponent("Olá! Gostaria de um orçamento 3D: " + item.title)}`} target="_blank" rel="noreferrer">Solicitar orçamento ↗</a></div></article>)}</div><div className="print-cta"><div><strong>Tem uma ideia diferente?</strong><p>Envie uma referência ou arquivo para avaliarmos seu projeto.</p></div><a className="button button-primary" href="https://wa.me/5544998705407" target="_blank" rel="noreferrer">Conversar sobre meu projeto ↗</a></div>
      </section>
      <section className="security-section" id="seguranca"><p className="eyebrow"><span/> Segurança e Tecnologia</p><h2>Seu mundo, mais conectado.</h2><div className="security-grid digital-grid toolbox-only"><article><CategoryIcon index={2}/><h3>FURION Toolbox</h3><p>41 ferramentas online para QR Code, PDF, imagens, links, cálculos e muito mais.</p><a className="button button-primary" href="./toolbox/" target="_blank" rel="noopener noreferrer">Acessar ferramentas ↗</a><small>Acesso gratuito, sem cadastro.</small></article></div><div className="security-secondary"><span>Também oferecemos câmeras IP Wi-Fi e dispositivos inteligentes.</span><a className="sector-link" href="https://wa.me/5544998705407" target="_blank" rel="noreferrer">Consultar soluções ↗</a></div></section><section className="portfolio" id="projetos">
        <div className="portfolio-heading"><div><p className="eyebrow"><span /> Portfólio</p><h2>Projetos em destaque.</h2><p>Conheça nossas soluções em imagens ilustrativas.</p></div><div className="portfolio-filter"><label htmlFor="portfolio-category">Filtrar por categoria</label><select id="portfolio-category" value={filter} onChange={e=>setFilter(e.target.value)}>{["Todos","Comunicação Visual","Impressão 3D","Tecnologia e Informática","Segurança e Tecnologia"].map(tag=><option key={tag}>{tag}</option>)}</select></div></div>
        <div className="project-grid">
          {projects.filter(p=>filter==="Todos"||({"Impressão 3D":"Impressão 3D","Informática":"Tecnologia e Informática","Câmeras IP":"Segurança e Tecnologia"}[p.tag]||"Comunicação Visual")===filter).map((project, index) => (
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
              
            </article>
          ))}
        </div>
      </section>

      <section className="process" id="como-funciona">
        <div className="section-heading">
          <p className="eyebrow"><span /> Simples e direto</p>
          <h2>Do orçamento à entrega.</h2><p className="process-intro">Três etapas para transformar sua ideia em realidade.</p>
        </div>
        <div className="process-grid">
          <article>
            <span className="step-number">01</span>
            <h3>Conte sua ideia</h3>
            <p>Chame no WhatsApp, envie referências e explique o que precisa.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <h3>Receba a solução</h3>
            <p>Avaliamos o projeto, os materiais e apresentamos seu orçamento.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <h3>Veja acontecer</h3>
            <p>Produzimos com cuidado e combinamos a instalação ou entrega.</p>
          </article>
        </div><div className="process-action"><a className="button button-primary" href="https://wa.me/5544998705407?text=Ol%C3%A1%21%20Gostaria%20de%20um%20or%C3%A7amento." target="_blank" rel="noreferrer">Começar meu projeto ↗</a></div>
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
            src="./assets/furion-logo.svg"
            alt="Furion"
          />
        </a>
        <div className="footer-links"><p>Do digital ao real.</p><a href="#servicos">Serviços</a><a href="https://www.instagram.com/furion.all/" target="_blank" rel="noreferrer">Instagram</a></div>
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
