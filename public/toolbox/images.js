import { $, actions, canvasBlob, downloadButton, fail, field, filePicker, form, options, processForm, status, stem } from './ui.js';
import { createImagePDF } from './pdf.js';

const formats = { png: 'PNG', jpg: 'JPG', webp: 'WebP' };
const mime = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
export const imageAccept = '.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif,.ico';
const maxSide = 8192;
const maxPixels = 36e6;

export async function decode(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch { fail('Não foi possível abrir “' + file.name + '” neste navegador.'); }
  finally { URL.revokeObjectURL(url); }
}

export function rasterize(image, width, height, opaque = false) {
  if (Math.min(width, height) < 1 || Math.max(width, height) > maxSide || width * height > maxPixels) {
    fail('Use dimensões de até 8.192 px por lado e até 36 megapixels.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (opaque) {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function openImage(container, key) {
  const dimensions = key === 'resize' ? '<div class="fields two">' +
    field('Largura em pixels', '<input type="number" name="width" min="1" max="8192" required>') +
    field('Altura em pixels', '<input type="number" name="height" min="1" max="8192" required>') +
    '</div><label class="field check"><input name="ratio" type="checkbox" checked>Manter proporção</label>' : '';
  const size = field('Tamanho da página', '<select name="size">' + options({ a4: 'A4', original: 'Proporção da foto' }) + '</select>');
  const format = field('Formato de saída', '<select name="format">' + options(formats) + '</select>');
  const quality = field('Qualidade JPG / WebP', '<input type="range" name="quality" min="10" max="100" value="85">');
  const isPDF = key === 'images-pdf';
  const root = form(container, '<div class="picker"></div>' + dimensions + (isPDF ? size : format + quality) +
    actions(isPDF ? 'Converter imagens em PDF' : key === 'resize' ? 'Redimensionar imagem' : 'Converter imagem'));
  const widthInput = $('input[name=width]', root);
  const heightInput = $('input[name=height]', root);
  const ratio = $('input[name=ratio]', root);
  let original;
  let revision = 0;

  const files = filePicker($('.picker', root), { accept: imageAccept, multiple: isPDF, onChange: async ([file], error) => {
    const operation = ++revision;
    $('.result', root).hidden = true;
    status(root, error || '', Boolean(error));
    if (!widthInput) return;
    original = undefined;
    widthInput.value = heightInput.value = '';
    if (!file) return;
    try {
      const loaded = await decode(file);
      if (operation !== revision) return;
      original = loaded;
      widthInput.value = original.naturalWidth;
      heightInput.value = original.naturalHeight;
    } catch (reason) { if (operation === revision) status(root, reason.message, true); }
  } });

  if (widthInput) {
    const sync = (changed, other, factor) => {
      if (original && ratio.checked && changed.valueAsNumber > 0) other.value = Math.max(1, Math.round(changed.valueAsNumber * factor));
    };
    widthInput.oninput = () => sync(widthInput, heightInput, (original?.naturalHeight || 1) / (original?.naturalWidth || 1));
    heightInput.oninput = () => sync(heightInput, widthInput, (original?.naturalWidth || 1) / (original?.naturalHeight || 1));
    ratio.onchange = widthInput.oninput;
  }

  const formatSelect = $('select[name=format]', root);
  if (formatSelect) {
    const qualityInput = $('input[name=quality]', root);
    const updateQuality = () => { qualityInput.closest('label').hidden = formatSelect.value === 'png'; };
    formatSelect.onchange = updateQuality;
    updateQuality();
  }

  processForm(root, async (data, result) => {
    const list = files();
    if (!list.length) fail(isPDF ? 'Selecione pelo menos uma imagem.' : 'Selecione uma imagem.');
    status(root, 'Processando no navegador…');
    const [file] = list;
    if (isPDF) {
      const rendered = [];
      for (const input of list) {
        const image = await decode(input);
        const scale = Math.min(1, 3000 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = rasterize(image, Math.max(1, Math.round(image.naturalWidth * scale)), Math.max(1, Math.round(image.naturalHeight * scale)), true);
        rendered.push(await canvasBlob(canvas, 'image/png'));
      }
      const output = await createImagePDF(rendered, data.get('size'));
      downloadButton(result, output, 'imagens.pdf', 'application/pdf', 'Baixar PDF');
      status(root, 'PDF pronto · ' + list.length + ' página(s).');
      return;
    }

    const image = await decode(file);
    const width = widthInput ? Number(data.get('width')) : image.naturalWidth;
    const height = heightInput ? Number(data.get('height')) : image.naturalHeight;
    const ext = data.get('format');
    const canvas = rasterize(image, width, height, ext === 'jpg');
    const blob = await canvasBlob(canvas, mime[ext], Number(data.get('quality')) / 100);
    if (blob.type !== mime[ext]) fail('Este navegador não oferece exportação em ' + formats[ext] + '.');
    const name = stem(file.name) + (key === 'resize' ? '-' + width + 'x' + height : '-convertido') + '.' + ext;
    downloadButton(result, blob, name, mime[ext], 'Baixar ' + formats[ext]);
    const kilobytes = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(blob.size / 1024);
    status(root, 'Imagem pronta · ' + width + ' × ' + height + ' px · ' + kilobytes + ' KB.');
  });
}
