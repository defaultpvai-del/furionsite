import { $, actions, canvasBlob, downloadButton, fail, field, filePicker, formatNumber, form, icon, options, processForm, status, stem, summaryResult, textResult } from './ui.js';
import { getLibrary, loadPreview, openDocument, pageNumbers, pdfPicker, renderPage } from './pdf.js';

const pdfMime = 'application/pdf';
const picker = '<div class="picker"></div>';
const range = field('Páginas opcionais', '<input name="pages" placeholder="Ex.: 1, 3-5">', 'Em branco, usa todas as páginas.');
const fileSize = (size) => size < 1024 ** 2 ? formatNumber(size / 1024, 1) + ' KB' : formatNumber(size / 1024 ** 2, 2) + ' MB';

function getFile(files) {
  const [file] = files();
  if (!file) fail('Selecione um PDF.');
  return file;
}

export function openPdfCompress(container) {
  const root = form(container, picker + field('Tipo de compactação', '<select name="mode">' +
    options({ preserve: 'Preservar texto e qualidade', balanced: 'Equilibrado para PDFs escaneados', strong: 'Redução forte para PDFs escaneados' }) +
    '</select>') + '<p class="hint" id="compression-hint"></p>' + actions('Comprimir PDF'));
  const getFiles = pdfPicker(root);
  const modes = {
    preserve: 'Reorganiza a estrutura do PDF e mantém o texto selecionável. A redução depende do arquivo e salvar uma cópia pode invalidar assinaturas digitais.',
    balanced: 'Transforma as páginas em imagens. Texto selecionável, formulários, links e assinaturas digitais se perdem.',
    strong: 'Transforma as páginas em imagens menores, com menos definição. Texto selecionável, formulários, links e assinaturas digitais se perdem.',
  };
  const select = $('select', root);
  const update = () => { $('#compression-hint', root).textContent = modes[select.value]; };
  select.onchange = update;
  update();
  processForm(root, async (data, result) => {
    const file = getFile(getFiles);
    status(root, 'Analisando o PDF…');
    const mode = data.get('mode');
    let bytes;
    if (mode === 'preserve') {
      const doc = await openDocument(file);
      bytes = await doc.save({ useObjectStreams: true, updateFieldAppearances: false });
    } else {
      const { PDFDocument } = await getLibrary();
      const input = await loadPreview(file);
      try {
        const output = await PDFDocument.create();
        const canvas = document.createElement('canvas');
        const [pixels, quality] = mode === 'strong' ? [1050, .58] : [1580, .77];
        if (input.numPages > 300) fail('Os modos para digitalizações aceitam até 300 páginas por arquivo. Você pode usar Extrair páginas para dividir o PDF.');
        for (let number = 1; number <= input.numPages; number++) {
          status(root, 'Compactando página ' + number + ' de ' + input.numPages + '…');
          const viewport = await renderPage(input, number, canvas, pixels, 2.8);
          const image = await canvasBlob(canvas, 'image/jpeg', quality);
          const embedded = await output.embedJpg(await image.arrayBuffer());
          const width = viewport.width / viewport.scale;
          const height = viewport.height / viewport.scale;
          output.addPage([width, height]).drawImage(embedded, { x: 0, y: 0, width, height });
          (await input.getPage(number)).cleanup();
        }
        bytes = await output.save();
      } finally {
        await input.destroy();
      }
    }
    const smaller = bytes.byteLength < file.size;
    const size = smaller ? bytes.byteLength : file.size;
    summaryResult(result, [['Original', fileSize(file.size)], ['Resultado', fileSize(size)], ['Redução', formatNumber(100 * (1 - size / file.size), 1) + '%']]);
    downloadButton(result, smaller ? bytes : file, smaller ? stem(file.name) + '-compactado.pdf' : file.name, pdfMime, smaller ? 'Baixar PDF compactado' : 'Baixar PDF original');
    status(root, smaller ? 'PDF compactado.' : 'Este modo não reduziu o tamanho. O arquivo original está disponível para baixar.');
  });
}

function visibleCoordinates(page, x, y) {
  const { x: left, y: bottom, width, height } = page.getCropBox();
  switch (page.getRotation().angle % 360) {
    case 90: return [left + width - y, bottom + x];
    case 180: return [left + width - x, bottom + height - y];
    case 270: return [left + y, bottom + height - x];
    default: return [left + x, bottom + y];
  }
}

export function openPdfDecoration(container, kind) {
  const numbers = kind === 'page-numbers';
  const configs = numbers ? '<div class="fields two">' +
    field('Primeiro número', '<input name="start" type="number" min="1" max="999999" value="1" required>') +
    field('Posição', '<select name="position">' + options({ center: 'Rodapé central', right: 'Rodapé direito', top: 'Topo central' }) + '</select>') + '</div>' :
    '<div class="fields two">' + field('Texto da marca', '<input name="stamp" maxlength="100" required placeholder="Ex.: RASCUNHO">') +
    field('Opacidade (%)', '<input name="opacity" type="number" min="5" max="100" value="25" required>') + '</div>';
  const root = form(container, picker + range + configs + actions(numbers ? 'Numerar páginas' : 'Aplicar marca d’água'));
  const files = pdfPicker(root);
  processForm(root, async (data, result) => {
    const file = getFile(files);
    status(root, 'Processando PDF…');
    const { StandardFonts, rgb, degrees } = await getLibrary();
    const pdf = await openDocument(file);
    const font = await pdf.embedFont(numbers ? StandardFonts.Helvetica : StandardFonts.HelveticaBold);
    const order = [...new Set(pageNumbers(data.get('pages'), pdf.getPageCount()))];
    const wanted = data.get('stamp')?.trim();
    if (!numbers && !wanted) fail('Digite o texto da marca.');
    if (!numbers) try { font.encodeText(wanted); } catch { fail('Use letras, números e acentos compatíveis com fontes comuns de PDF.'); }
    for (const [index, number] of order.entries()) {
      const page = pdf.getPage(number);
      const angle = page.getRotation().angle % 360;
      const { width, height } = page.getCropBox();
      const [viewWidth, viewHeight] = angle % 180 ? [height, width] : [width, height];
      const text = numbers ? String(Number(data.get('start')) + index) : wanted;
      const size = numbers ? Math.min(11, viewHeight / 10, viewWidth / 7) :
        Math.min(62, viewHeight / 7, viewWidth * .76 / font.widthOfTextAtSize(text, 1));
      const len = font.widthOfTextAtSize(text, size);
      const position = data.get('position');
      const margin = Math.min(25, viewWidth / 8, viewHeight / 9);
      const x = position === 'right' ? viewWidth - len - margin : (viewWidth - len) / 2;
      const y = !numbers ? (viewHeight - size) / 2 : position === 'top' ? viewHeight - margin - size : margin;
      const [px, py] = visibleCoordinates(page, x, y);
      page.drawText(text, {
        x: px, y: py, font, size, rotate: degrees(angle), color: numbers ? rgb(.18, .18, .18) : rgb(.3, .25, .21),
        opacity: numbers ? 1 : Number(data.get('opacity')) / 100,
      });
    }
    downloadButton(result, await pdf.save(), stem(file.name) + (numbers ? '-numerado.pdf' : '-marca-dagua.pdf'), pdfMime, 'Baixar PDF');
    status(root, order.length + ' página(s) atualizada(s).');
  });
}

export function openPdfText(container) {
  const root = form(container, picker + range + '<p class="hint">Extrai texto selecionável. Uma digitalização sem camada de texto precisa de OCR.</p>' + actions('Extrair texto'));
  const files = pdfPicker(root);
  processForm(root, async (data, result) => {
    const file = getFile(files);
    const pdf = await loadPreview(file);
    try {
      const order = pageNumbers(data.get('pages'), pdf.numPages);
      const blocks = [];
      for (const number of order) {
        status(root, 'Lendo página ' + (number + 1) + '…');
        const page = await pdf.getPage(number + 1);
        const content = await page.getTextContent();
        const lines = content.items.map((item) => typeof item.str === 'string' ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
        if (lines) blocks.push('Página ' + (number + 1) + '\n' + lines);
        page.cleanup();
      }
      if (!blocks.length) fail('As páginas selecionadas não têm texto extraível.');
      textResult(root, result, blocks.join('\n\n'), { filename: stem(file.name) + '-texto.txt' });
      status(root, 'Texto encontrado em ' + blocks.length + ' página(s).');
    } finally { await pdf.destroy(); }
  });
}

let zipLibrary;
function getZip() {
  zipLibrary ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('./vendor/jszip.min.js', import.meta.url).href;
    script.onload = () => window.JSZip ? resolve(window.JSZip) : reject(new Error('Não foi possível carregar o exportador ZIP.'));
    script.onerror = () => reject(new Error('Não foi possível carregar o exportador ZIP.'));
    document.head.append(script);
  }).catch((error) => { zipLibrary = undefined; throw error; });
  return zipLibrary;
}

export function openPdfBatch(container) {
  const root = form(container, picker + range + field('Formato das imagens', '<select name="format">' +
    options({ png: 'PNG', jpg: 'JPG' }) + '</select>') + actions('Gerar ZIP com imagens'));
  const files = pdfPicker(root);
  processForm(root, async (data, result) => {
    const file = getFile(files);
    status(root, 'Preparando páginas…');
    const Zip = await getZip();
    const pdf = await loadPreview(file);
    try {
      const order = pageNumbers(data.get('pages'), pdf.numPages);
      if (order.length > 100) fail('Selecione até 100 páginas por ZIP.');
      const zip = new Zip();
      const extension = data.get('format');
      const canvas = document.createElement('canvas');
      for (const [index, number] of order.entries()) {
        status(root, 'Convertendo ' + (index + 1) + ' de ' + order.length + '…');
        await renderPage(pdf, number + 1, canvas, 1800, 2.5);
        const blob = await canvasBlob(canvas, extension === 'png' ? 'image/png' : 'image/jpeg', .87);
        const name = String(index + 1).padStart(3, '0') + '-pagina-' + (number + 1) + '.' + extension;
        zip.file(name, blob);
        (await pdf.getPage(number + 1)).cleanup();
      }
      status(root, 'Montando ZIP…');
      const blob = await zip.generateAsync({ type: 'blob' });
      downloadButton(result, blob, stem(file.name) + '-imagens.zip', 'application/zip', 'Baixar ZIP');
      status(root, order.length + ' imagem(ns) no ZIP.');
    } finally { await pdf.destroy(); }
  });
}

export function openPdfVisual(container) {
  const root = form(container, picker + '<div id="visual-controls" hidden><p class="hint">Arraste os cartões para mudar a ordem. Use as setas nos cartões para mover entre grupos.</p>' +
    '<div class="thumb-toolbar actions"><button type="button" class="secondary" id="thumb-prev">← Anteriores</button><span id="thumb-group" class="hint"></span>' +
    '<button type="button" class="secondary" id="thumb-next">Próximas →</button><button type="button" class="secondary" id="thumb-reset">Restaurar ordem</button></div>' +
    '<ol class="thumb-grid" aria-label="Ordem das páginas"></ol></div>' + actions('Preparar PDF organizado'));
  const controls = $('#visual-controls', root);
  const list = $('ol', controls);
  const previous = $('#thumb-prev', root);
  const next = $('#thumb-next', root);
  const groupSize = 12;
  let source;
  let doc;
  let pages = [];
  let group = 0;
  let fileRevision = 0;
  let displayRevision = 0;
  let dragged;
  const cache = new Map();

  container.closest('dialog').addEventListener('close', () => {
    fileRevision++;
    displayRevision++;
    if (doc) void doc.destroy().catch(() => {});
  }, { once: true });

  function reset() {
    pages = Array.from({ length: doc.numPages }, (_, i) => ({ page: i + 1, rotation: 0 }));
    group = 0;
    refresh();
  }

  function changed() {
    $('.result', root).hidden = true;
    refresh();
  }

  function move(from, to) {
    if (from === to || from < 0 || to < 0 || to >= pages.length) return;
    pages.splice(to, 0, pages.splice(from, 1)[0]);
    group = Math.floor(to / groupSize);
    changed();
  }

  function quickButton(row, image, caption, disabled, click) {
    const button = row.appendChild(document.createElement('button'));
    button.type = 'button';
    button.className = 'icon-button';
    button.innerHTML = icon(image);
    button.setAttribute('aria-label', caption);
    button.title = caption;
    button.disabled = disabled;
    button.onclick = click;
  }

  function refresh() {
    const revision = ++displayRevision;
    const documentPDF = doc;
    const generation = fileRevision;
    const start = group * groupSize;
    const selected = pages.slice(start, start + groupSize);
    previous.disabled = group === 0;
    next.disabled = start + groupSize >= pages.length;
    $('#thumb-group', root).textContent = pages.length ? (start + 1) + '–' + (start + selected.length) + ' de ' + pages.length : 'Nenhuma página';
    list.replaceChildren();
    const images = [];
    for (const [offset, entry] of selected.entries()) {
      const index = start + offset;
      const tile = list.appendChild(document.createElement('li'));
      tile.draggable = true;
      const frame = tile.appendChild(document.createElement('div'));
      frame.className = 'thumb-frame';
      const shot = frame.appendChild(document.createElement('img'));
      shot.alt = 'Miniatura da página ' + entry.page;
      shot.draggable = false;
      shot.style.transform = 'rotate(' + entry.rotation + 'deg)';
      images.push([entry, shot]);
      tile.appendChild(document.createElement('strong')).textContent = 'Página ' + entry.page;
      const row = tile.appendChild(document.createElement('div'));
      row.className = 'actions thumb-actions';
      quickButton(row, 'up', 'Antecipar página ' + entry.page, index === 0, () => move(index, index - 1));
      quickButton(row, 'down', 'Avançar página ' + entry.page, index === pages.length - 1, () => move(index, index + 1));
      quickButton(row, 'rotate', 'Girar página ' + entry.page, false, () => { entry.rotation = (entry.rotation + 90) % 360; changed(); });
      quickButton(row, 'x', 'Remover página ' + entry.page, false, () => {
        pages.splice(index, 1);
        group = Math.max(0, Math.min(group, Math.ceil(pages.length / groupSize) - 1));
        changed();
      });
      tile.ondragstart = (event) => {
        if (root.getAttribute('aria-busy')) return event.preventDefault();
        dragged = entry;
        event.dataTransfer.setData('text/plain', String(entry.page));
        event.dataTransfer.effectAllowed = 'move';
      };
      tile.ondragover = (event) => {
        if (dragged) { event.preventDefault(); tile.classList.add('drag-target'); }
      };
      tile.ondragleave = () => tile.classList.remove('drag-target');
      tile.ondragend = () => { dragged = undefined; };
      tile.ondrop = (event) => {
        event.preventDefault();
        tile.classList.remove('drag-target');
        if (dragged) move(pages.indexOf(dragged), index);
        dragged = undefined;
      };
    }
    async function showThumbnails() {
      for (const [entry, image] of images) {
        if (revision !== displayRevision) return;
        try {
          let preview = cache.get(entry.page);
          if (!preview) {
            const canvas = document.createElement('canvas');
            await renderPage(documentPDF, entry.page, canvas, 156, 1);
            preview = canvas.toDataURL('image/jpeg', .7);
            if (generation === fileRevision && cache.size < 240) cache.set(entry.page, preview);
          }
          if (revision === displayRevision) image.src = preview;
        } catch {
          if (revision === displayRevision) image.replaceWith(Object.assign(document.createElement('span'), { textContent: 'Sem miniatura' }));
        }
      }
    }
    void showThumbnails();
  }

  previous.onclick = () => { group--; refresh(); };
  next.onclick = () => { group++; refresh(); };
  $('#thumb-reset', root).onclick = () => { $('.result', root).hidden = true; reset(); };

  filePicker($('.picker', root), { accept: '.pdf', onChange: async ([file], error) => {
    if (error && file === source) return status(root, error, true);
    const current = ++fileRevision;
    displayRevision++;
    const old = doc;
    if (old) void old.destroy().catch(() => {});
    doc = undefined;
    source = file;
    cache.clear();
    controls.hidden = true;
    $('.result', root).hidden = true;
    status(root, error || (file ? 'Abrindo PDF…' : ''), Boolean(error));
    if (!file) return;
    try {
      const loaded = await loadPreview(file);
      if (current !== fileRevision) return void loaded.destroy().catch(() => {});
      doc = loaded;
      controls.hidden = false;
      reset();
      status(root);
    } catch (reason) {
      if (current === fileRevision) status(root, reason.message, true);
    }
  } });

  processForm(root, async (_, result) => {
    if (!doc) fail('Selecione um PDF e aguarde a prévia.');
    if (!pages.length) fail('Mantenha pelo menos uma página no PDF.');
    status(root, 'Preparando PDF…');
    const { PDFDocument, degrees } = await getLibrary();
    const original = await openDocument(source);
    const output = await PDFDocument.create();
    const copied = await output.copyPages(original, pages.map((entry) => entry.page - 1));
    for (const [index, page] of copied.entries()) {
      if (pages[index].rotation) page.setRotation(degrees((page.getRotation().angle + pages[index].rotation) % 360));
      output.addPage(page);
    }
    downloadButton(result, await output.save(), stem(source.name) + '-organizado.pdf', pdfMime, 'Baixar PDF organizado');
    status(root, 'PDF pronto · ' + copied.length + ' página(s).');
  });
}
