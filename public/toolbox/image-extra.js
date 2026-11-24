import { $, actions, canvasBlob, downloadButton, fail, field, filePicker, formatNumber, form, options, processForm, status, stem, summaryResult } from './ui.js';
import { decode, imageAccept, rasterize } from './images.js';

const picker = '<div class="picker"></div>';
const png = 'image/png';
const formats = { jpg: 'image/jpeg', webp: 'image/webp' };
const kb = (bytes) => formatNumber(bytes / 1024, 1) + ' KB';
const imageFormat = '<div class="fields two">' +
  field('Formato de saída', '<select name="format">' + options({ png: 'PNG', webp: 'WebP', jpg: 'JPG' }) + '</select>') +
  field('Qualidade JPG / WebP (%)', '<input name="quality" type="number" min="10" max="100" value="88" required>') + '</div>';

function openPicker(root, onChange) {
  return filePicker($('.picker', root), { accept: imageAccept, onChange: async (files, error) => {
    $('.result', root).hidden = true;
    status(root, error || '', Boolean(error));
    if (onChange) await onChange(files);
  } });
}

async function imageOutput(root, result, canvas, ext, quality, name) {
  const requested = formats[ext] || png;
  const blob = await canvasBlob(canvas, requested, quality);
  if (blob.type !== requested) fail('Seu navegador não exporta no formato selecionado.');
  const preview = result.appendChild(document.createElement('canvas'));
  const factor = Math.min(1, 460 / Math.max(canvas.width, canvas.height));
  preview.width = Math.max(1, Math.round(canvas.width * factor));
  preview.height = Math.max(1, Math.round(canvas.height * factor));
  preview.className = 'image-output-preview';
  preview.setAttribute('role', 'img');
  preview.setAttribute('aria-label', 'Prévia da imagem final');
  preview.getContext('2d').drawImage(canvas, 0, 0, preview.width, preview.height);
  downloadButton(result, blob, name + '.' + ext, requested, 'Baixar ' + ext.toUpperCase());
  status(root, canvas.width + ' × ' + canvas.height + ' px · ' + kb(blob.size) + '.');
}

export function openImageCompress(container) {
  const root = form(container, picker + '<div class="fields two">' + field('Formato de saída', '<select name="format">' +
    options({ webp: 'WebP (mantém transparência)', jpg: 'JPG (fundo branco)' }) + '</select>') +
    field('Tamanho desejado em KB', '<input name="target" type="number" min="10" max="50000" value="250" required>') + '</div>' +
    '<p class="hint">A compactação tenta atingir o tamanho desejado ajustando a qualidade e, se necessário, reduzindo as dimensões.</p>' + actions('Comprimir imagem'));
  const getFiles = openPicker(root);
  processForm(root, async (data, result) => {
    const [file] = getFiles();
    if (!file) fail('Selecione uma imagem.');
    const target = Number(data.get('target')) * 1024;
    const ext = data.get('format');
    const mime = formats[ext];
    status(root, 'Compactando imagem…');
    const image = await decode(file);
    let scale = Math.min(1, 8192 / Math.max(image.naturalWidth, image.naturalHeight), Math.sqrt(30e6 / (image.naturalWidth * image.naturalHeight)));
    let best;
    for (let attempt = 0; attempt < 7; attempt++) {
      const width = Math.max(1, Math.floor(image.naturalWidth * scale));
      const height = Math.max(1, Math.floor(image.naturalHeight * scale));
      const canvas = rasterize(image, width, height, ext === 'jpg');
      let low = .22;
      let high = .94;
      for (let step = 0; step < 7; step++) {
        const quality = step === 0 ? high : step === 1 ? low : (low + high) / 2;
        const blob = await canvasBlob(canvas, mime, quality);
        if (blob.type !== mime) fail('Seu navegador não exporta no formato selecionado.');
        if (!best || (blob.size <= target ? best.blob.size > target || blob.size > best.blob.size : best.blob.size > target && blob.size < best.blob.size)) {
          best = { blob, width, height };
        }
        if (blob.size <= target && step === 0) break;
        if (blob.size <= target) low = quality;
        else high = quality;
        if (step === 1 && blob.size > target) break;
      }
      if (best.blob.size <= target) break;
      scale *= .74;
    }
    const useOriginal = file.size <= best.blob.size;
    const bytes = useOriginal ? file : best.blob;
    const dimensions = useOriginal ? [image.naturalWidth, image.naturalHeight] : [best.width, best.height];
    summaryResult(result, [['Original', kb(file.size)], ['Resultado', kb(bytes.size)], ['Dimensões', dimensions.join(' × ') + ' px']]);
    downloadButton(result, bytes, useOriginal ? file.name : stem(file.name) + '-compactada.' + ext, useOriginal ? file.type : mime, useOriginal ? 'Baixar original' : 'Baixar imagem');
    status(root, useOriginal ? 'O arquivo original é menor.' : bytes.size <= target ? 'Imagem compactada.' : 'Foi possível reduzir a imagem, mas o resultado ficou acima do tamanho desejado.');
  });
}

const number = (name, value = '') => '<input type="number" name="' + name + '" value="' + value + '" min="' + (['left','top'].includes(name) ? 0 : 1) + '" required>';

export function openImageEdit(container, kind) {
  const crop = kind === 'crop';
  const stamp = kind === 'image-stamp';
  const settings = crop ? '<div class="fields two">' + field('Margem esquerda (px)', number('left', '0')) +
      field('Margem superior (px)', number('top', '0')) + field('Largura do recorte (px)', number('width')) +
      field('Altura do recorte (px)', number('height')) + '</div><p class="hint" id="image-dimensions"></p><canvas id="crop-preview" class="image-output-preview" aria-label="Prévia da área do recorte" role="img" hidden></canvas>' :
    stamp ? field('Texto da marca', '<input name="stamp" maxlength="120" placeholder="Ex.: Furion" required>') +
      '<div class="fields two">' + field('Cor', '<input name="color" type="color" value="#ffffff">') +
      field('Opacidade (%)', '<input name="opacity" type="number" min="5" max="100" value="65" required>') + '</div>' +
      field('Posição', '<select name="position">' + options({ bottom: 'Canto inferior direito', center: 'Centro', top: 'Canto superior esquerdo' }) + '</select>') :
    field('Rotação', '<select name="angle">' + options({ 0: 'Sem rotação', 90: '90° à direita', 180: '180°', 270: '90° à esquerda' }) + '</select>') +
      '<div class="fields two"><label class="field check"><input type="checkbox" name="flip-x"> Espelhar na horizontal</label>' +
      '<label class="field check"><input type="checkbox" name="flip-y"> Espelhar na vertical</label></div>';
  const root = form(container, picker + settings + imageFormat + actions(crop ? 'Recortar imagem' : stamp ? 'Aplicar marca d’água' : 'Aplicar transformação'));
  let original;
  let loading = 0;
  const dimensions = $('#image-dimensions', root);
  const preview = $('#crop-preview', root);

  function showCrop() {
    if (!original || !crop) return;
    const ratio = Math.min(1, 380 / Math.max(original.naturalWidth, original.naturalHeight));
    preview.width = Math.max(1, Math.round(original.naturalWidth * ratio));
    preview.height = Math.max(1, Math.round(original.naturalHeight * ratio));
    const context = preview.getContext('2d');
    const data = new FormData(root);
    const [x, y, w, h] = ['left', 'top', 'width', 'height'].map((key) => Number(data.get(key)) * ratio);
    context.drawImage(original, 0, 0, preview.width, preview.height);
    context.strokeStyle = '#ffab3e';
    context.lineWidth = 3;
    context.strokeRect(x + 1, y + 1, Math.max(0, w - 2), Math.max(0, h - 2));
    preview.hidden = false;
  }

  const files = openPicker(root, async ([file]) => {
    if (!crop) return;
    const revision = ++loading;
    original = undefined;
    dimensions.textContent = '';
    preview.hidden = true;
    if (!file) return;
    try {
      const image = await decode(file);
      if (revision !== loading) return;
      original = image;
      for (const [key, value] of Object.entries({ left: 0, top: 0, width: image.naturalWidth, height: image.naturalHeight })) {
        root.elements.namedItem(key).value = value;
      }
      dimensions.textContent = 'Imagem original · ' + image.naturalWidth + ' × ' + image.naturalHeight + ' px.';
      showCrop();
    } catch (error) {
      if (revision === loading) status(root, error.message, true);
    }
  });
  if (crop) root.addEventListener('input', showCrop);
  const format = root.elements.namedItem('format');
  const updateQuality = () => { root.elements.namedItem('quality').closest('label').hidden = format.value === 'png'; };
  format.onchange = updateQuality;
  updateQuality();

  processForm(root, async (data, result) => {
    const [file] = files();
    if (!file) fail('Selecione uma imagem.');
    const ext = data.get('format');
    const image = original || await decode(file);
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const [left, top] = ['left', 'top'].map((key) => Number(data.get(key)));
    const angle = Number(data.get('angle') || 0);
    const swaps = angle % 180 !== 0;
    const width = crop ? Number(data.get('width')) : swaps ? sourceHeight : sourceWidth;
    const height = crop ? Number(data.get('height')) : swaps ? sourceWidth : sourceHeight;
    if (crop && (left + width > sourceWidth || top + height > sourceHeight)) fail('O recorte precisa ficar dentro da imagem original.');
    if (Math.max(width, height) > 8192 || width * height > 36e6) fail('A saída precisa ter até 8.192 px por lado e até 36 megapixels.');
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (ext === 'jpg') {
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);
    }
    if (crop) context.drawImage(image, left, top, width, height, 0, 0, width, height);
    else {
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(angle * Math.PI / 180);
      context.scale(data.has('flip-x') ? -1 : 1, data.has('flip-y') ? -1 : 1);
      context.drawImage(image, -sourceWidth / 2, -sourceHeight / 2);
      context.restore();
    }
    if (stamp) {
      const text = data.get('stamp').trim();
      if (!text) fail('Digite o texto da marca.');
      const pos = data.get('position');
      const padding = Math.max(3, Math.round(Math.min(width, height) * .035));
      const size = Math.max(1, Math.round(Math.min(width, height) * .085));
      context.font = '700 ' + size + 'px Arial, sans-serif';
      context.textAlign = pos === 'center' ? 'center' : pos === 'top' ? 'left' : 'right';
      context.textBaseline = pos === 'center' ? 'middle' : pos === 'top' ? 'top' : 'bottom';
      context.fillStyle = data.get('color');
      context.globalAlpha = Number(data.get('opacity')) / 100;
      context.fillText(text, pos === 'center' ? width / 2 : pos === 'top' ? padding : width - padding,
        pos === 'center' ? height / 2 : pos === 'top' ? padding : height - padding, Math.max(1, width - padding * 2));
    }
    await imageOutput(root, result, canvas, ext, Number(data.get('quality')) / 100, stem(file.name) + (crop ? '-recorte' : stamp ? '-marca' : '-orientada'));
  });
}
