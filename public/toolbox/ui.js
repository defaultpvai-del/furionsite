const paths = {
  star: '<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.7l6.4-.9z"/>',
  text: '<path d="M4 5h16M12 5v14m-4 0h8M4 8V5m16 3V5"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  calculator: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8m-8 5h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2"/>',
  colors: '<circle cx="9" cy="9" r="5"/><circle cx="15" cy="9" r="5"/><circle cx="12" cy="15" r="5"/>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  rotate: '<path d="M3 11a9 9 0 1 1 3 7m-3-7V5m0 6h6"/>',
  compress: '<path d="M3 3l6 6m-6 0h6V3m12 18-6-6m6 0h-6v6M21 3l-6 6m6 0h-6V3M3 21l6-6m-6 0h6v6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  qr: '<rect x="3" y="3" width="6" height="6" rx=".7"/><rect x="15" y="3" width="6" height="6" rx=".7"/><rect x="3" y="15" width="6" height="6" rx=".7"/><path d="M13 13h4v4h4m-8 4v-4m8-4v1m-4 7h1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8m-8 4h6"/>',
  edit: '<path d="M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10m-4 13 1-4 7-7a2.1 2.1 0 0 1 3 3l-7 7zM17 8l3 3"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  link: '<path d="M10 13a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2m2 6a4 4 0 0 0-6 0l-4 4a4 4 0 0 0 6 6l2-2"/>',
  whatsapp: '<path d="M4.4 17.6 3 21l3.9-1.1A9 9 0 1 0 4.4 17.6Z"/><path d="M8 8.1c.1 3.8 3.1 6.9 7.1 7.7.7.1 1.4-.5 1.6-1.4l-2.6-1.3-1 1c-1.6-.6-2.8-1.8-3.4-3.4l.8-.9-1-2.5c-.8 0-1.5.2-1.5.8Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.6 6.6h.01"/>',
  shield: '<path d="M12 22s7-3 7-9V5l-7-3-7 3v8c0 6 7 9 7 9zM9 12l2 2 4-4"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
  moon: '<path d="M20.9 13.3A9 9 0 0 1 10.7 3.1a9 9 0 1 0 10.2 10.2z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/>',
  down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
  up: '<path d="M12 20V5m-6 6 6-6 6 6"/>',
  right: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  merge: '<rect x="5" y="7" width="14" height="14" rx="2"/><path d="M8 4h8m-4 7v6m-3-3h6"/>',
  split: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="m3 21 18-18"/>',
  organize: '<rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="13" width="7" height="7" rx="1"/><path d="M15 4h3a2 2 0 0 1 2 2v3m-4-2 4 3 3-3M9 20H6a2 2 0 0 1-2-2v-3m-3 2 3-3 4 3"/>',
  convert: '<path d="M3 7h17m-4-4 4 4-4 4m5 6H4m4-4-4 4 4 4"/>',
  resize: '<path d="M3 9V3h6m12 12v6h-6M3 3l7 7m4 4 7 7"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  ruler: '<path d="M3 15 15 3l6 6L9 21zM8 10l2 2m1-5 2 2m1-5 2 2"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  download: '<path d="M12 4v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 5V4H4v12h1"/>',
  external: '<path d="M13 4h7v7m0-7-9 9m9 0v7H4V4h7"/>',
};
export const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
export const $ = (selector, root = document) => root.querySelector(selector);
export const field = (label, input, hint = '') => '<label class="field"><span>' + label + '</span>' + input + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
export const actions = (label) => '<div class="actions"><button type="submit" class="primary">' + label + '</button></div><p class="status" role="status"></p><div class="result" hidden></div>';
export const form = (root, html) => {
  root.innerHTML = '<form class="tool-form">' + html + '</form>';
  return root.firstElementChild;
};
export const options = (choices) => Object.entries(choices).map(([key, label]) => '<option value="' + key + '">' + label + '</option>').join('');
export const fail = (message) => { throw new Error(message); };

export function status(root, message = '', error = false) {
  const element = $('.status', root);
  element.textContent = message;
  element.classList.toggle('error', error);
}

export function processForm(root, handler) {
  let busy = false;
  root.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const button = $('button[type=submit]', root);
    const result = $('.result', root);
    button.disabled = true;
    result.hidden = true;
    result.replaceChildren();
    status(root);
    const inputs = [...root.elements].filter((element) => !element.disabled);
    const data = new FormData(root);
    for (const input of inputs) input.disabled = true;
    root.setAttribute('aria-busy', 'true');
    try {
      await handler(data, result);
      result.hidden = !result.childElementCount && !result.textContent;
    } catch (error) {
      status(root, error.message || 'Não foi possível concluir a operação.', true);
    } finally {
      busy = false;
      for (const input of inputs) input.disabled = false;
      root.removeAttribute('aria-busy');
      button.disabled = false;
    }
  });
}

export function download(data, name, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function downloadButton(container, data, name, type, label = 'Baixar arquivo') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary';
  button.innerHTML = icon('download') + label;
  button.addEventListener('click', () => download(data, name, type));
  container.append(button);
}

export function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem.')), type, quality,
  ));
}

export const stem = (name) => name.replace(/\.[^.]+$/, '') || 'arquivo';

export function filePicker(container, { accept, multiple = false, onChange = () => {} }) {
  const isPDF = accept === '.pdf';
  let files = [];
  container.innerHTML = '<label class="file-drop">' + icon('upload') + '<strong>' +
    (multiple ? 'Selecionar arquivos' : 'Selecionar arquivo') + '</strong><span class="hint">ou arraste ' +
    (isPDF ? (multiple ? 'seus PDFs' : 'seu PDF') : (multiple ? 'suas imagens' : 'sua imagem')) +
    ' até aqui</span><input type="file" accept="' + accept + '"' + (multiple ? ' multiple' : '') +
    '></label><ul class="file-list" aria-label="Arquivos selecionados"></ul>';
  const input = $('input', container);
  const drop = $('.file-drop', container);
  const list = $('ul', container);

  function render() {
    list.replaceChildren();
    for (const [index, file] of files.entries()) {
      const row = list.appendChild(document.createElement('li'));
      row.appendChild(document.createElement('span')).textContent = file.name;
      const commands = multiple
        ? [['up', 'Mover para cima', index === 0], ['down', 'Mover para baixo', index === files.length - 1], ['x', 'Remover', false]]
        : [['x', 'Remover', false]];
      for (const [image, label, disabled] of commands) {
        const button = row.appendChild(document.createElement('button'));
        button.type = 'button';
        button.className = 'icon-button';
        button.setAttribute('aria-label', label + ' ' + file.name);
        button.disabled = disabled;
        button.innerHTML = icon(image);
        button.onclick = () => {
          if (image === 'x') {
            files.splice(index, 1);
          } else {
            const next = image === 'up' ? index - 1 : index + 1;
            [files[index], files[next]] = [files[next], files[index]];
          }
          render();
          onChange([...files]);
        };
      }
    }
  }

  function choose(picked) {
    const names = isPDF ? /\.pdf$/i : /\.(png|jpe?g|webp|gif|bmp|avif|ico)$/i;
    const accepted = [...picked].filter((file) => names.test(file.name) || (isPDF && file.type === 'application/pdf'));
    if (!accepted.length) return onChange([...files], isPDF ? 'Selecione um arquivo PDF.' : 'Selecione uma imagem JPG, PNG, WebP, GIF, BMP, AVIF ou ICO.');
    files = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    render();
    onChange([...files], accepted.length < picked.length ? 'Alguns arquivos tinham um formato incompatível.' : '');
  }

  input.addEventListener('change', () => {
    if (input.files.length) choose(input.files);
    input.value = '';
  });
  drop.addEventListener('dragover', (event) => {
    event.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    drop.classList.remove('is-over');
    if (input.disabled) return;
    if (event.dataTransfer.files.length) choose(event.dataTransfer.files);
  });
  return () => [...files];
}

export function textResult(root, result, value, { label = 'Resultado', filename } = {}) {
  const input = document.createElement('textarea');
  input.className = 'text-output';
  input.setAttribute('aria-label', label);
  input.rows = Math.min(12, Math.max(3, value.split('\n').length + 1));
  input.readOnly = true;
  input.value = value;
  result.append(input);
  const buttons = result.appendChild(document.createElement('div'));
  buttons.className = 'actions';
  const button = buttons.appendChild(document.createElement('button'));
  button.type = 'button';
  button.className = 'secondary';
  button.innerHTML = icon('copy') + 'Copiar';
  button.onclick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      status(root, 'Resultado copiado.');
    } catch {
      input.focus();
      input.select();
      status(root, document.execCommand('copy') ? 'Resultado copiado.' : 'Texto selecionado para copiar.');
    }
  };
  if (filename) downloadButton(buttons, value, filename, 'text/plain;charset=utf-8');
}

export function decimal(value, caption, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback } = {}) {
  const input = String(value ?? '').trim();
  if (!input && fallback !== undefined) return fallback;
  const normalized = input.includes(',') ? input.replace(/^([+-]?\d{1,3})(\.\d{3})+(?=,)/, (integer) => integer.replaceAll('.', '')).replace(',', '.') : input;
  const number = Number(normalized);
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized) || !Number.isFinite(number) || number < min || number > max) {
    fail('Confira o valor de ' + caption + '.');
  }
  return number;
}

export const formatNumber = (value, places = 4) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: places }).format(value);
export const formatMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function summaryResult(result, entries) {
  const list = result.appendChild(document.createElement('dl'));
  list.className = 'result-summary';
  for (const [label, value] of entries) {
    const block = list.appendChild(document.createElement('div'));
    block.appendChild(document.createElement('dt')).textContent = label;
    block.appendChild(document.createElement('dd')).textContent = value;
  }
}
