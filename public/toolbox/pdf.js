import { $, actions, canvasBlob, downloadButton, fail, field, filePicker, form, options, processForm, status, stem } from './ui.js';

const pdfMime = 'application/pdf';
const assetURL = (file) => new URL('./vendor/' + file, import.meta.url).href;
let pdfLib;
let pdfRender;

export function getLibrary() {
  pdfLib ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = assetURL('pdf-lib.min.js');
    script.onload = () => window.PDFLib ? resolve(window.PDFLib) : reject(new Error('Não foi possível carregar as ferramentas de PDF.'));
    script.onerror = () => reject(new Error('Não foi possível carregar as ferramentas de PDF.'));
    document.head.append(script);
  }).catch((error) => { pdfLib = undefined; throw error; });
  return pdfLib;
}

export async function openDocument(file) {
  const { PDFDocument } = await getLibrary();
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch {
    fail('Não foi possível abrir “' + file.name + '”. Confira se o PDF está íntegro e sem senha.');
  }
}

async function openPreview(file) {
  pdfRender ??= import('./vendor/pdf.min.mjs').catch((error) => { pdfRender = undefined; throw error; });
  const pdf = await pdfRender;
  pdf.GlobalWorkerOptions.workerSrc = assetURL('pdf.worker.min.mjs');
  return pdf.getDocument({
    data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false,
    cMapUrl: assetURL('cmaps/'), cMapPacked: true, standardFontDataUrl: assetURL('standard_fonts/'),
    wasmUrl: assetURL('wasm/'), iccUrl: assetURL('iccs/'),
  });
}

export function pageNumbers(value, count) {
  const input = value.trim();
  if (!input) return Array.from({ length: count }, (_, at) => at);
  const pages = [];
  for (const part of input.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*[-–]\s*(\d+))?$/);
    if (!match) fail('Use números e intervalos separados por vírgula, como 1, 3-5.');
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (Math.min(start, end) < 1 || Math.max(start, end) > count) fail('Este PDF tem ' + count + ' página(s). Confira a numeração.');
    if (pages.length + Math.abs(start - end) + 1 > 5000) fail('Selecione até 5.000 páginas por operação.');
    const step = start <= end ? 1 : -1;
    for (let page = start; page !== end + step; page += step) pages.push(page - 1);
  }
  return pages;
}

export function pdfPicker(root, multiple = false) {
  return filePicker($('.picker', root), { accept: '.pdf', multiple, onChange: (_, error) => {
    status(root, error || '', Boolean(error));
    $('.result', root).hidden = true;
  } });
}

export function openPdfPages(container, key) {
  const picker = '<div class="picker"></div>';
  const range = field('Páginas', '<input name="pages" placeholder="' + (key === 'organize' ? '3, 1, 2' : '1, 3-5') + '">',
    key === 'organize' ? 'Digite a ordem desejada. Páginas omitidas serão removidas.' : 'Informe as páginas ou deixe em branco para incluir todas.');
  const rotation = field('Girar as páginas selecionadas', '<select name="rotation">' +
    options({ 0: 'Manter orientação', 90: '90° à direita', 180: '180°', 270: '90° à esquerda' }) + '</select>');
  const buttons = { merge: 'Juntar PDFs', split: 'Extrair páginas', organize: 'Salvar PDF organizado' };
  const root = form(container, picker + (key === 'merge' ? '<p class="hint">Use as setas para ajustar a ordem dos PDFs.</p>'
    : range + (key === 'organize' ? rotation : '')) + actions(buttons[key]));
  const files = pdfPicker(root, key === 'merge');

  processForm(root, async (data, result) => {
    const chosen = files();
    if (chosen.length < (key === 'merge' ? 2 : 1)) fail(key === 'merge' ? 'Selecione pelo menos dois PDFs.' : 'Selecione um PDF.');
    status(root, 'Processando no navegador…');
    const { PDFDocument, degrees } = await getLibrary();
    const output = await PDFDocument.create();
    for (const file of chosen) {
      const source = await openDocument(file);
      const indices = key === 'merge' ? source.getPageIndices() : pageNumbers(data.get('pages'), source.getPageCount());
      if (!indices.length) fail('O arquivo selecionado está sem páginas.');
      const pages = await output.copyPages(source, indices);
      const rotationAngle = Number(data.get('rotation') || 0);
      for (const page of pages) {
        if (rotationAngle) page.setRotation(degrees((page.getRotation().angle + rotationAngle) % 360));
        output.addPage(page);
      }
    }
    const suffix = key === 'split' ? '-paginas' : '-organizado';
    downloadButton(result, await output.save(), key === 'merge' ? 'pdfs-unidos.pdf' : stem(chosen[0].name) + suffix + '.pdf', pdfMime, 'Baixar PDF');
    status(root, 'PDF pronto · ' + output.getPageCount() + ' página(s).');
  });
}

export async function renderPage(document, number, canvas, width, maxScale = 2) {
  const page = await document.getPage(number);
  const original = page.getViewport({ scale: 1 });
  const scale = Math.min(maxScale, width / Math.max(original.width, original.height));
  if (!Number.isFinite(scale) || scale <= 0) fail('Não foi possível renderizar esta página.');
  const viewport = page.getViewport({ scale });
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
  return viewport;
}

export async function loadPreview(file) {
  const task = await openPreview(file);
  try {
    return await task.promise;
  } catch {
    await task.destroy().catch(() => {});
    fail('Não foi possível visualizar este PDF. Confira se está íntegro e sem senha.');
  }
}

export function openPdfImage(container) {
  const root = form(container, '<div class="picker"></div>' + field('Número da página', '<input name="page" type="number" min="1" value="1" required>') + actions('Converter página em PNG'));
  const files = pdfPicker(root);
  processForm(root, async (data, result) => {
    const [file] = files();
    if (!file) fail('Selecione um PDF.');
    status(root, 'Renderizando a página…');
    const documentPDF = await loadPreview(file);
    try {
      const page = Number(data.get('page'));
      if (page > documentPDF.numPages) fail('Este PDF tem ' + documentPDF.numPages + ' página(s).');
      const canvas = document.createElement('canvas');
      await renderPage(documentPDF, page, canvas, 2200, 3);
      const blob = await canvasBlob(canvas, 'image/png');
      downloadButton(result, blob, stem(file.name) + '-pagina-' + page + '.png', 'image/png', 'Baixar PNG');
      status(root, 'Imagem pronta · ' + canvas.width + ' × ' + canvas.height + ' px.');
    } finally {
      await documentPDF.destroy();
    }
  });
}

export function openPdfEditor(container) {
  const root = form(container, '<div class="picker"></div><div class="editor-grid" hidden>' +
    '<div class="editor-preview"><div class="actions">' +
    '<button type="button" class="secondary" id="prev-page" aria-label="Página anterior">←</button><span class="hint" id="page-counter"></span>' +
    '<button type="button" class="secondary" id="next-page" aria-label="Próxima página">→</button></div>' +
    '<div class="stage" tabindex="0" role="button" aria-label="Posicionar texto na página. Aperte Enter para colocar no centro."><canvas></canvas><div class="mark-layer"></div></div></div>' +
    '<div class="editor-controls">' + field('Tipo', '<select id="mark-style">' + options({ text: 'Texto', sign: 'Assinatura digitada' }) + '</select>') +
    field('Texto ou nome', '<input id="mark-text" maxlength="150" placeholder="Digite aqui">') +
    '<div class="fields two">' + field('Tamanho', '<input id="mark-size" type="number" min="6" max="144" value="20">') +
    field('Cor', '<input id="mark-color" type="color" value="#232522">') + '</div>' +
    '<p class="hint">Clique na página para posicionar o texto.</p><button type="button" class="secondary" id="undo-mark">Desfazer última adição</button></div></div>' +
    actions('Preparar PDF editado'));

  const grid = $('.editor-grid', root);
  const stage = $('.stage', root);
  const layer = $('.mark-layer', root);
  const prev = $('#prev-page', root);
  const next = $('#next-page', root);
  const undo = $('#undo-mark', root);
  const marks = [];
  let file;
  let pdf;
  let viewport;
  let revision = 0;
  let pageNumber = 1;

  function showMarks() {
    layer.replaceChildren();
    undo.disabled = !marks.length;
    for (const mark of marks.filter((item) => item.page === pageNumber)) {
      const element = layer.appendChild(document.createElement('span'));
      element.className = 'mark';
      element.textContent = mark.text;
      element.style.left = mark.x * 100 + '%';
      element.style.top = mark.y * 100 + '%';
      element.style.fontSize = mark.size * viewport.scale * stage.clientWidth / viewport.width + 'px';
      element.style.fontStyle = mark.font === 'sign' ? 'italic' : 'normal';
      element.style.color = mark.color;
    }
  }

  const observer = new ResizeObserver(() => { if (viewport) showMarks(); });
  observer.observe(stage);
  const dialog = container.closest('dialog');
  dialog.addEventListener('close', () => {
    revision++;
    observer.disconnect();
    if (pdf) void pdf.destroy().catch(() => {});
  }, { once: true });

  async function showPage(number) {
    const operation = ++revision;
    viewport = undefined;
    prev.disabled = next.disabled = true;
    const canvas = document.createElement('canvas');
    try {
      const visible = await renderPage(pdf, number, canvas, 760, 1.6);
      if (operation !== revision) return;
      $('canvas', stage).replaceWith(canvas);
      pageNumber = number;
      viewport = visible;
      $('#page-counter', root).textContent = number + ' de ' + pdf.numPages;
      prev.disabled = number <= 1;
      next.disabled = number >= pdf.numPages;
      showMarks();
      status(root);
    } catch {
      if (operation === revision) {
        status(root, 'Esta página não pôde ser renderizada.', true);
        const current = pdf && pageNumber;
        prev.disabled = current <= 1;
        next.disabled = current >= pdf.numPages;
      }
    }
  }

  filePicker($('.picker', root), { accept: '.pdf', onChange: async ([chosen], error) => {
    if (error && chosen === file) return status(root, error, true);
    const operation = ++revision;
    const previous = pdf;
    pdf = viewport = undefined;
    file = chosen;
    pageNumber = 1;
    marks.length = 0;
    grid.hidden = true;
    $('.result', root).hidden = true;
    if (previous) void previous.destroy().catch(() => {});
    status(root, error || (chosen ? 'Carregando prévia…' : ''), Boolean(error));
    if (!chosen) return;
    try {
      const loaded = await loadPreview(chosen);
      if (operation !== revision) return void loaded.destroy().catch(() => {});
      if (!loaded.numPages) {
        void loaded.destroy().catch(() => {});
        fail('O PDF está sem páginas.');
      }
      pdf = loaded;
      grid.hidden = false;
      await showPage(1);
    } catch (reason) {
      if (operation === revision) status(root, reason.message, true);
    }
  } });

  prev.onclick = () => showPage(pageNumber - 1);
  next.onclick = () => showPage(pageNumber + 1);
  undo.onclick = () => {
    marks.pop();
    if (viewport) showMarks();
    $('.result', root).hidden = true;
  };

  function addMark(x, y) {
    if (!viewport) return;
    const text = $('#mark-text', root).value.trim();
    const size = Number($('#mark-size', root).value);
    if (!text || size < 6 || size > 144) return status(root, 'Digite o texto e escolha um tamanho de 6 a 144.', true);
    const [px, py] = viewport.convertToPdfPoint(x * viewport.width, y * viewport.height);
    marks.push({ page: pageNumber, x, y, px, py, text, size, angle: viewport.rotation, color: $('#mark-color', root).value, font: $('#mark-style', root).value });
    showMarks();
    $('.result', root).hidden = true;
    status(root, 'Adicionado à página ' + pageNumber + '.');
  }

  stage.onclick = (event) => {
    const rect = stage.getBoundingClientRect();
    addMark((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };
  stage.onkeydown = (event) => {
    if (['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      addMark(.5, .5);
    }
  };

  processForm(root, async (_, result) => {
    if (!pdf || !file) fail('Selecione um PDF e aguarde a prévia.');
    if (!marks.length) fail('Adicione texto ou assinatura em pelo menos uma página.');
    const chosen = file;
    const additions = [...marks];
    const { StandardFonts, rgb, degrees } = await getLibrary();
    const output = await openDocument(chosen);
    const fonts = {
      text: await output.embedFont(StandardFonts.Helvetica),
      sign: await output.embedFont(StandardFonts.HelveticaOblique),
    };
    for (const mark of additions) {
      const font = fonts[mark.font];
      try { font.encodeText(mark.text); }
      catch { fail('O texto contém caracteres incompatíveis com a fonte do PDF. Remova emojis ou símbolos especiais.'); }
      const color = rgb(...mark.color.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255));
      output.getPage(mark.page - 1).drawText(mark.text, { x: mark.px, y: mark.py, size: mark.size, font, color, rotate: degrees(mark.angle) });
    }
    downloadButton(result, await output.save(), stem(chosen.name) + '-editado.pdf', pdfMime, 'Baixar PDF editado');
    status(root, 'PDF editado pronto.');
  });
}

export async function createImagePDF(images, sizeType) {
  const { PDFDocument } = await getLibrary();
  const pdf = await PDFDocument.create();
  for (const image of images) {
    const png = await pdf.embedPng(await image.arrayBuffer());
    let size = png.scale(Math.min(.75, 14400 / Math.max(png.width, png.height)));
    let width = size.width;
    let height = size.height;
    if (sizeType === 'a4') {
      [width, height] = png.width > png.height ? [841.89, 595.28] : [595.28, 841.89];
      size = png.scaleToFit(width - 48, height - 48);
    }
    const page = pdf.addPage([width, height]);
    page.drawImage(png, { ...size, x: (width - size.width) / 2, y: (height - size.height) / 2 });
  }
  return pdf.save();
}
