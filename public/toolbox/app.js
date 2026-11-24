import { $, icon, field, form, options } from './ui.js';
import { heroQR, openLink, openQR } from './links.js';
import { openPdfEditor, openPdfImage, openPdfPages } from './pdf.js';
import { openImage } from './images.js';
import { extraTools } from './catalog-extra.js';

const categories = {
  all: ['Visão geral', 'grid'],
  favorites: ['Favoritas', 'star'],
  qr: ['QR Code', 'qr'],
  pdf: ['PDF', 'file'],
  images: ['Imagens', 'image'],
  links: ['Links e redes', 'link'],
  print: ['Impressão e medidas', 'ruler'],
  text: ['Texto', 'text'],
  daily: ['Calculadoras', 'calculator'],
  data: ['Dados e código', 'code'],
};

const tools = [
  { id: 'qr', category: 'qr', icon: 'qr', color: 'orange', name: 'Gerar QR Code', description: 'Transforme links, textos, Wi-Fi e contatos em QR Code.', terms: 'qrcode código png svg impressão' },
  { id: 'edit', category: 'pdf', icon: 'edit', color: 'orange', name: 'Editar PDF', description: 'Adicione texto ou assinatura digitada sobre as páginas.', terms: 'escrever anotação assinar texto formulário' },
  { id: 'whatsapp', category: 'links', icon: 'whatsapp', color: 'green', name: 'Link de WhatsApp', description: 'Crie um link direto com uma mensagem pronta.', terms: 'zap telefone contato wa.me' },
  { id: 'merge', category: 'pdf', icon: 'merge', color: 'orange', name: 'Juntar PDFs', description: 'Combine vários arquivos PDF na ordem que quiser.', terms: 'unir mesclar combinar' },
  { id: 'instagram', category: 'links', icon: 'instagram', color: 'purple', name: 'Link de Instagram', description: 'Transforme um @ em link direto para o perfil.', terms: 'insta redes sociais perfil' },
  { id: 'split', category: 'pdf', icon: 'split', color: 'orange', name: 'Extrair páginas do PDF', description: 'Baixe páginas selecionadas em um novo arquivo.', terms: 'dividir separar cortar' },
  { id: 'organize', category: 'pdf', icon: 'organize', color: 'orange', name: 'Organizar PDF', description: 'Mude a ordem, gire ou remova páginas do PDF.', terms: 'excluir reordenar deletar girar rotação' },
  { id: 'pdf-image', category: 'pdf', icon: 'image', color: 'blue', name: 'PDF para PNG', description: 'Salve uma página do seu PDF como imagem.', terms: 'converter transformar imagem' },
  { id: 'images-pdf', category: 'images', icon: 'file', color: 'blue', name: 'Imagens para PDF', description: 'Combine fotos e capturas de tela em um PDF.', terms: 'foto jpg webp png converter' },
  { id: 'convert', category: 'images', icon: 'convert', color: 'blue', name: 'Converter imagem', description: 'Troque o formato entre PNG, JPG e WebP.', terms: 'jpeg qualidade comprimir' },
  { id: 'resize', category: 'images', icon: 'resize', color: 'blue', name: 'Redimensionar imagem', description: 'Ajuste a largura e a altura em pixels.', terms: 'tamanho foto resolução' },
  { id: 'measure', category: 'print', icon: 'ruler', color: 'purple', name: 'Converter medidas', description: 'Converta metros, centímetros, milímetros e polegadas.', terms: 'tamanho cm mm m in polegada unidade' },
];

const featured = ['qr', 'edit', 'whatsapp', 'pix', 'pdf-compress', 'print'];
const catalog = [...tools, ...extraTools];
const ordered = [...featured.map((id) => catalog.find((tool) => tool.id === id)), ...catalog.filter((tool) => !featured.includes(tool.id))];

function openMeasure(container) {
  const units = { cm: 'Centímetro (cm)', m: 'Metro (m)', mm: 'Milímetro (mm)', in: 'Polegada (in)' };
  const factors = { cm: .01, m: 1, mm: .001, in: .0254 };
  const root = form(container, field('Medida', '<input name="value" inputmode="decimal" placeholder="Ex.: 150,5" value="150">') + '<div class="fields two">' +
    field('De', '<select name="from">' + options(units) + '</select>') +
    field('Para', '<select name="to">' + options(units) + '</select>') + '</div><output class="measure-result" aria-live="polite"></output>');
  $('select[name=to]', root).value = 'm';
  root.addEventListener('submit', (event) => event.preventDefault());
  function update() {
    const data = new FormData(root);
    const raw = data.get('value').trim();
    const decimal = raw.includes(',') ? raw.replaceAll('.', '').replace(',', '.') : raw;
    const value = Number(decimal);
    const result = value * factors[data.get('from')] / factors[data.get('to')];
    const output = $('output', root);
    output.textContent = !raw ? 'Digite uma medida.' : !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(decimal) || !Number.isFinite(result)
      ? 'Digite um número válido.' : new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 12 }).format(result) + ' ' + data.get('to');
  }
  root.addEventListener('input', update);
  update();
}

const dialog = $('#tool-dialog');
const implementations = {
  qr: openQR, edit: openPdfEditor, split: openPdfPages, organize: openPdfPages, merge: openPdfPages, 'pdf-image': openPdfImage,
  whatsapp: openLink, instagram: openLink, 'images-pdf': openImage, convert: openImage, resize: openImage, measure: openMeasure,
};

function openTool(tool) {
  $('#tool-icon').className = 'tile-icon ' + tool.color;
  $('#tool-icon').innerHTML = icon(tool.icon);
  $('#tool-title').textContent = tool.name;
  $('#tool-description').textContent = tool.description;
  dialog.classList.toggle('wide', ['edit', 'pdf-visual', 'material'].includes(tool.id));
  dialog.showModal();
  (tool.open || implementations[tool.id])($('#tool-body'), tool.id);
  $('#close-tool').focus();
}

$('#close-tool').innerHTML = icon('x');
$('#close-tool').onclick = () => dialog.close();
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { $('#tool-body').replaceChildren(); });

const nav = $('#navigation');
const filters = $('#filters');
const search = $('#search');
let category = 'all';
const favorites = new Set();
try {
  const stored = JSON.parse(localStorage.getItem('furion-toolbox-favorites') || '[]');
  if (Array.isArray(stored)) for (const id of stored) favorites.add(id);
} catch {}

function setStar(button, tool) {
  const on = favorites.has(tool.id);
  const label = (on ? 'Remover dos favoritos: ' : 'Adicionar aos favoritos: ') + tool.name;
  button.setAttribute('aria-pressed', String(on));
  button.setAttribute('aria-label', label);
  button.title = label;
}

function addStar(tile, tool) {
  const button = tile.appendChild(document.createElement('button'));
  button.type = 'button';
  button.className = 'favorite-button';
  button.innerHTML = icon('star');
  setStar(button, tool);
  button.onclick = () => {
    if (favorites.has(tool.id)) favorites.delete(tool.id);
    else favorites.add(tool.id);
    try { localStorage.setItem('furion-toolbox-favorites', JSON.stringify([...favorites])); } catch {}
    if (category === 'favorites') {
      render();
      filters.querySelector('[data-category=favorites]').focus();
    } else setStar(button, tool);
  };
}

for (const [key, [label, image]] of Object.entries(categories)) {
  for (const [target, cssClass, caption] of [[nav, 'nav-item', icon(image) + label], [filters, 'filter', key === 'all' ? 'Todas' : label]]) {
    const button = target.appendChild(document.createElement('button'));
    button.type = 'button';
    button.dataset.category = key;
    button.className = cssClass;
    button.innerHTML = caption;
    button.addEventListener('click', () => {
      category = key;
      search.value = '';
      render();
      if (target === nav) {
        $(key === 'all' ? '#inicio' : '#ferramentas').scrollIntoView({ block: 'start' });
      }
    });
  }
}

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function render() {
  for (const button of nav.querySelectorAll('button')) button.setAttribute('aria-current', String(button.dataset.category === category));
  for (const button of filters.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  $('#breadcrumb-text').textContent = categories[category][0];
  $('#catalog-title').textContent = search.value.trim() ? 'Resultados da busca' : category === 'all' ? 'Todas as ferramentas' : categories[category][0];
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const showing = ordered.filter((tool) => (category === 'all' || category === tool.category || (category === 'favorites' && favorites.has(tool.id))) &&
    terms.every((word) => normalize(tool.name + ' ' + tool.description + ' ' + tool.terms).includes(word)));
  $('#tool-count').textContent = showing.length + (showing.length === 1 ? ' ferramenta' : ' ferramentas');
  $('#empty').hidden = showing.length > 0;
  $('#empty').textContent = category === 'favorites' ? 'Use a estrela dos cartões para salvar as ferramentas que você usa mais.' : 'Nenhuma ferramenta encontrada. Tente buscar por QR, PDF, imagem ou link.';
  const cards = $('#cards');
  cards.replaceChildren();
  for (const tool of showing) {
    const tile = cards.appendChild(document.createElement('div'));
    tile.className = 'tool-tile';
    const card = tile.appendChild(document.createElement('button'));
    card.type = 'button';
    card.className = 'tool-card';
    card.innerHTML = '<span class="card-top"><span class="tile-icon ' + tool.color + '">' + icon(tool.icon) +
      '</span></span><h3>' + tool.name + '</h3><p>' + tool.description + '</p>';
    card.onclick = () => openTool(tool);
    addStar(tile, tool);
  }
}

$('.brand').addEventListener('click', () => {
  category = 'all';
  search.value = '';
  render();
});
$('form[role=search]').addEventListener('submit', (event) => {
  event.preventDefault();
  $('#ferramentas').scrollIntoView({ block: 'start' });
});
search.addEventListener('input', () => { category = 'all'; render(); });
window.addEventListener('keydown', (event) => {
  const tag = document.activeElement.tagName;
  if (event.key === '/' && !dialog.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
    event.preventDefault();
    search.focus();
  }
});

const theme = $('#theme');
function showTheme(mode) {
  document.documentElement.dataset.theme = mode;
  theme.innerHTML = icon(mode === 'dark' ? 'sun' : 'moon');
  theme.setAttribute('aria-label', mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
}
let initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
try { initialTheme = localStorage.getItem('furion-toolbox-theme') || initialTheme; } catch {}
showTheme(initialTheme);
theme.onclick = () => {
  const mode = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  showTheme(mode);
  try { localStorage.setItem('furion-toolbox-theme', mode); } catch {}
};

for (const [id, name] of Object.entries({ 'privacy-icon': 'shield', 'home-icon': 'home', 'search-icon': 'search',
  'arrow-down': 'down', 'art-file-icon': 'file', 'art-link-icon': 'link' })) {
  $('#' + id).innerHTML = icon(name);
}
render();
heroQR($('#hero-qr'));
