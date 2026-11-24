import { $, actions, decimal, fail, field, filePicker, formatMoney, formatNumber, form, icon, options, processForm, status, summaryResult, textResult } from './ui.js';
import { decode, imageAccept } from './images.js';

const allUnits = { cm: 'cm', m: 'm', mm: 'mm', in: 'pol.' };
const inMeters = { cm: .01, m: 1, mm: .001, in: .0254 };
const presets = { a4: ['A4 · 21 × 29,7 cm', 21, 29.7], a3: ['A3 · 29,7 × 42 cm', 29.7, 42], a5: ['A5 · 14,8 × 21 cm', 14.8, 21], card: ['Cartão · 9 × 5 cm', 9, 5], photo: ['Foto · 10 × 15 cm', 10, 15] };
const fmt = (value, precision = 4) => formatNumber(value, precision);
const select = (name, choices) => '<select name="' + name + '">' + options(choices) + '</select>';
const input = (name, value = '', other = '') => '<input name="' + name + '" inputmode="decimal" value="' + value + '" ' + other + '>';

export function openPrint(container) {
  const root = form(container, field('Formato', select('preset', { custom: 'Medida personalizada', ...Object.fromEntries(Object.entries(presets).map(([key, item]) => [key, item[0]])) })) +
    '<div class="fields two">' + field('Largura', input('width', '21')) + field('Altura', input('height', '29,7')) +
    field('Unidade', select('unit', allUnits)) + field('Resolução de impressão (DPI)', input('dpi', '300')) + '</div>' +
    '<div class="field"><span>Analisar uma arte existente (opcional)</span><div class="picker"></div></div>' + actions('Calcular tamanho de impressão'));
  const files = filePicker($('.picker', root), { accept: imageAccept, onChange: (_, error) => {
    $('.result', root).hidden = true;
    status(root, error || '', Boolean(error));
  } });
  const preset = root.elements.namedItem('preset');
  preset.onchange = () => {
    const value = presets[preset.value];
    if (!value) return;
    root.elements.namedItem('unit').value = 'cm';
    root.elements.namedItem('width').value = fmt(value[1]);
    root.elements.namedItem('height').value = fmt(value[2]);
  };
  for (const name of ['unit', 'width', 'height']) root.elements.namedItem(name).addEventListener('input', () => { preset.value = 'custom'; });
  processForm(root, async (data, result) => {
    const width = decimal(data.get('width'), 'largura', { min: .001, max: 100000 }) * inMeters[data.get('unit')];
    const height = decimal(data.get('height'), 'altura', { min: .001, max: 100000 }) * inMeters[data.get('unit')];
    const dpi = decimal(data.get('dpi'), 'DPI', { min: 1, max: 9600 });
    const widthIn = width / .0254;
    const heightIn = height / .0254;
    const pixels = Math.max(1, Math.round(widthIn * dpi)) + ' × ' + Math.max(1, Math.round(heightIn * dpi)) + ' px';
    const values = [['Tamanho da arte', pixels], ['Tamanho físico', fmt(width * 100) + ' × ' + fmt(height * 100) + ' cm']];
    const [file] = files();
    if (file) {
      const image = await decode(file);
      const [w, h] = [image.naturalWidth, image.naturalHeight];
      const [horizontal, vertical] = [w / widthIn, h / heightIn];
      values.push(['Resolução da arte', w + ' × ' + h + ' px'],
        ['DPI no tamanho escolhido', fmt(horizontal, 1) + ' × ' + fmt(vertical, 1) + ' DPI'],
        ['Impressão no DPI escolhido', fmt(w * 2.54 / dpi, 2) + ' × ' + fmt(h * 2.54 / dpi, 2) + ' cm']);
      const differentRatio = Math.abs(horizontal / vertical - 1) > .01;
      status(root, differentRatio ? 'A imagem tem outra proporção. Para preencher o formato escolhido, será necessário recortar ou adicionar margens.' : 'As proporções são compatíveis.');
    }
    summaryResult(result, values);
  });
}

export function openMaterial(container) {
  const root = form(container, '<div class="material-list"></div><div>' +
    '<button class="secondary" type="button" id="add-piece">+ Adicionar peça</button></div><div class="fields two">' +
    field('Margem de sobra (%)', input('waste', '10')) + field('Custo por m² (R$)', input('price', '', 'placeholder="Opcional"')) +
    '</div>' + actions('Calcular material'));
  const list = $('.material-list', root);
  let unique = 0;

  function refreshRows() {
    const pieces = [...list.children];
    for (const [index, piece] of pieces.entries()) {
      $('legend', piece).textContent = 'Peça ' + (index + 1);
      $('.delete-piece', piece).disabled = pieces.length <= 1;
    }
    $('#add-piece', root).disabled = pieces.length >= 50;
    $('.result', root).hidden = true;
  }

  function addPiece() {
    const id = ++unique;
    const piece = list.appendChild(document.createElement('fieldset'));
    piece.dataset.id = id;
    const name = (key) => key + '-' + id;
    piece.innerHTML = '<legend></legend><div class="piece-fields">' +
      field('Largura', input(name('width'), '', 'placeholder="Ex.: 60" required')) + field('Unidade da largura', select(name('unit-w'), allUnits)) +
      field('Altura', input(name('height'), '', 'placeholder="Ex.: 1,8" required')) + field('Unidade da altura', select(name('unit-h'), allUnits)) +
      field('Quantidade', '<input name="' + name('qty') + '" type="number" min="1" max="10000" value="1" required>') +
      '<button type="button" class="icon-button delete-piece" aria-label="Remover peça">' + icon('x') + '</button></div>';
    $('.delete-piece', piece).onclick = () => { piece.remove(); refreshRows(); };
    refreshRows();
  }
  $('#add-piece', root).onclick = addPiece;
  addPiece();
  processForm(root, (data, result) => {
    const total = [...list.children].reduce((area, node, index) => {
      const get = (key) => data.get(key + '-' + node.dataset.id);
      const width = decimal(get('width'), 'largura da peça ' + (index + 1), { min: .001, max: 100000 });
      const height = decimal(get('height'), 'altura da peça ' + (index + 1), { min: .001, max: 100000 });
      return area + width * inMeters[get('unit-w')] * height * inMeters[get('unit-h')] * Number(get('qty'));
    }, 0);
    const waste = decimal(data.get('waste'), 'margem', { max: 1000, fallback: 0 });
    const price = decimal(data.get('price'), 'custo por m²', { max: 10000000, fallback: null });
    const final = total * (1 + waste / 100);
    const values = [['Área das peças', fmt(total, 6) + ' m²'], ['Margem de sobra', fmt(final - total, 6) + ' m²'],
      ['Área com sobra', fmt(final, 6) + ' m²']];
    if (price !== null) values.push(['Custo estimado', formatMoney(final * price)]);
    summaryResult(result, values);
    status(root, 'Estimativa por área. Para comprar por metro linear, confira a largura do rolo e a disposição dos cortes.');
  });
}

export function openRatio(container) {
  const root = form(container, field('Tipo de regra de três', select('mode', { direct: 'Direta', inverse: 'Inversa' })) +
    '<div class="fields two">' + field('Valor A', input('a', '', 'placeholder="Ex.: 2"')) + field('Valor B', input('b', '', 'placeholder="Ex.: 50"')) +
    field('Valor C', input('c', '', 'placeholder="Ex.: 5"')) + '<p class="hint">Se A corresponde a B, C corresponde a quanto?</p></div>' + actions('Calcular proporção'));
  processForm(root, (data, result) => {
    const [a, b, c] = ['a','b','c'].map((key) => decimal(data.get(key), key.toUpperCase(), { min: -Number.MAX_SAFE_INTEGER }));
    const direct = data.get('mode') === 'direct';
    const divisor = direct ? a : c;
    if (!divisor) fail('O divisor precisa ser diferente de zero.');
    const value = direct ? b * (c / a) : b * (a / c);
    if (!Number.isFinite(value)) fail('O resultado excedeu o limite da calculadora.');
    summaryResult(result, [['Valor de X', fmt(value, 8)]]);
  });
}

export function openPercent(container) {
  const root = form(container, field('O que você quer calcular?', select('mode', {
    part: 'Quanto é X% de um valor?', discount: 'Aplicar desconto', add: 'Aplicar acréscimo', difference: 'Variação entre dois valores',
  })) + '<div class="fields two">' + field('Valor inicial', input('base', '', 'placeholder="Ex.: 150,00"')) +
    field('Percentual (%)', input('percent', '', 'placeholder="Ex.: 10"')) + '</div>' + actions('Calcular porcentagem'));
  const mode = root.elements.namedItem('mode');
  const second = root.elements.namedItem('percent');
  const caption = $('span', second.closest('label'));
  mode.onchange = () => {
    caption.textContent = mode.value === 'difference' ? 'Valor final' : 'Percentual (%)';
    second.placeholder = mode.value === 'difference' ? 'Ex.: 175,00' : 'Ex.: 10';
  };
  processForm(root, (data, result) => {
    const base = decimal(data.get('base'), 'valor inicial', { min: -Number.MAX_SAFE_INTEGER });
    const kind = data.get('mode');
    const secondValue = decimal(data.get('percent'), kind === 'difference' ? 'valor final' : 'percentual',
      { min: kind === 'difference' ? -Number.MAX_SAFE_INTEGER : 0, max: kind === 'discount' ? 100 : Number.MAX_SAFE_INTEGER });
    if (kind === 'difference') {
      if (!base) fail('O valor inicial precisa ser diferente de zero para calcular a variação percentual.');
      summaryResult(result, [['Variação', fmt(100 * (secondValue - base) / Math.abs(base)) + '%'], ['Diferença', fmt(secondValue - base)]]);
      return;
    }
    const part = base * secondValue / 100;
    if (kind === 'part') return summaryResult(result, [['Valor da porcentagem', fmt(part, 6)]]);
    summaryResult(result, [[kind === 'discount' ? 'Desconto' : 'Acréscimo', fmt(part, 6)], ['Valor final', fmt(base + (kind === 'discount' ? -part : part), 6)]]);
  });
}

export function openDates(container) {
  const root = form(container, '<div class="fields two">' +
    field('Data inicial', '<input name="start" type="date" min="1900-01-01" max="9999-12-31" required>') +
    field('Data final', '<input name="end" type="date" min="1900-01-01" max="9999-12-31" required>') +
    '</div><label class="field check"><input name="inclusive" type="checkbox">Incluir a data final na contagem</label>' + actions('Calcular intervalo'));
  processForm(root, (data, result) => {
    const first = Date.parse(data.get('start'));
    const last = Date.parse(data.get('end'));
    if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) fail('Escolha uma data final igual ou posterior à inicial.');
    const day = 86400000;
    const gap = (last - first) / day + Number(data.has('inclusive'));
    const start = new Date(first).getUTCDay();
    let business = Math.floor(gap / 7) * 5;
    for (let i = 0; i < gap % 7; i++) if ((start + i) % 7 >= 1 && (start + i) % 7 <= 5) business++;
    summaryResult(result, [['Dias corridos', fmt(gap, 0)], ['Dias de segunda a sexta', fmt(business, 0)], ['Semanas completas', fmt(Math.floor(gap / 7), 0)]]);
    status(root, 'A contagem de segunda a sexta desconsidera feriados.');
  });
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;
  const l = (max + min) / 2;
  const s = span === 0 ? 0 : span / (1 - Math.abs(2 * l - 1));
  const hue = span === 0 ? 0 : max === r ? (g - b) / span : max === g ? 2 + (b - r) / span : 4 + (r - g) / span;
  return [Math.round((hue * 60 + 360) % 360) % 360, Math.round(s * 100), Math.round(l * 100)];
}

function hexValue(input) {
  let value = input.trim().replace(/^#/, '');
  if (/^[a-f\d]{3}$/i.test(value)) value = [...value].map((part) => part + part).join('');
  if (!/^[a-f\d]{6}$/i.test(value)) fail('Use HEX com 3 ou 6 dígitos, como #F2A348.');
  return '#' + value.toUpperCase();
}
const asRGB = (hex) => hex.slice(1).match(/../g).map((part) => parseInt(part, 16));
const luminance = (rgb) => rgb.map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  .reduce((result, channel, index) => result + channel * [.2126, .7152, .0722][index], 0);

export function openColors(container) {
  const root = form(container, '<div class="fields two">' + field('Cor principal (HEX)', '<input name="hex" value="#F2A348" maxlength="7" required>') +
    field('Escolher cor principal', '<input type="color" name="pick" value="#f2a348">') +
    '</div>' + field('Cor de fundo para comparar contraste', '<input type="color" name="background" value="#232522">') + actions('Converter cores'));
  root.elements.namedItem('pick').oninput = () => { root.elements.namedItem('hex').value = root.elements.namedItem('pick').value.toUpperCase(); };
  processForm(root, (data, result) => {
    const hex = hexValue(data.get('hex'));
    root.elements.namedItem('pick').value = hex.toLowerCase();
    const rgb = asRGB(hex);
    const [r, g, b] = rgb.map((value) => value / 255);
    const [h, s, l] = rgbToHsl(r, g, b);
    const k = 1 - Math.max(r, g, b);
    const cmyk = [...[r,g,b].map((value) => k === 1 ? 0 : (1 - value - k) / (1 - k)), k].map((value) => Math.round(value * 100) + '%');
    const [a, bg] = [luminance(rgb), luminance(asRGB(data.get('background')))];
    const contrast = (Math.max(a,bg) + .05) / (Math.min(a,bg) + .05);
    const swatch = result.appendChild(document.createElement('div'));
    swatch.className = 'color-swatch';
    swatch.textContent = 'Aa · ' + hex;
    swatch.style.color = hex;
    swatch.style.backgroundColor = data.get('background');
    summaryResult(result, [['HEX', hex], ['RGB', rgb.join(', ')], ['HSL', h + '°, ' + s + '%, ' + l + '%'], ['CMYK aproximado', cmyk.join(', ')], ['Contraste', fmt(contrast, 2) + ':1']]);
    textResult(root, result, hex + '\nRGB ' + rgb.join(', ') + '\nHSL ' + [h + '°', s + '%', l + '%'].join(', ') + '\nCMYK aprox. ' + cmyk.join(', '), { label: 'Valores das cores' });
    status(root, 'O CMYK é uma estimativa. A impressão depende do perfil de cor.');
  });
}
