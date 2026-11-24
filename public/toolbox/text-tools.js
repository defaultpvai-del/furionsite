import { $, actions, fail, field, formatNumber, form, options, processForm, status, summaryResult, textResult } from './ui.js';

const source = (name, placeholder = 'Cole ou digite aqui') => field(name, '<textarea name="text" class="text-input" placeholder="' + placeholder + '" required spellcheck="false"></textarea>');
const select = (name, choices) => '<select name="' + name + '">' + options(choices) + '</select>';

export function openWordCount(container) {
  const root = form(container, source('Texto para analisar') + '<div class="result"></div>');
  const words = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('pt-BR', { granularity: 'word' }) : null;
  const letters = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('pt-BR', { granularity: 'grapheme' }) : null;
  const countCharacters = (value) => letters ? [...letters.segment(value)].length : [...value].length;
  const area = $('textarea', root);
  const target = $('.result', root);
  target.setAttribute('aria-live', 'polite');
  area.addEventListener('input', update);
  root.addEventListener('submit', (event) => event.preventDefault());
  function update() {
    const input = area.value;
    const tokens = words ? [...words.segment(input)].filter((item) => item.isWordLike).length : (input.match(/[\p{L}\p{N}]+/gu) || []).length;
    target.replaceChildren();
    summaryResult(target, [
      ['Palavras', formatNumber(tokens, 0)], ['Caracteres', formatNumber(countCharacters(input), 0)],
      ['Sem espaços', formatNumber(countCharacters(input.replace(/\s/g, '')), 0)],
      ['Linhas', formatNumber(input ? input.split('\n').length : 0, 0)], ['Leitura a 200 palavras/min', tokens ? '≈ ' + Math.max(1, Math.ceil(tokens / 200)) + ' min' : '0 min'],
    ]);
  }
  update();
}

const stripAccents = (text) => text.normalize('NFD').replace(/\p{M}/gu, '');
const titleCase = (text) => text.toLocaleLowerCase('pt-BR').replace(/(^|[^\p{L}\p{N}_])(\p{L})/gu, (_, before, letter) => before + letter.toLocaleUpperCase('pt-BR'));

const transforms = {
  upper: (v) => v.toLocaleUpperCase('pt-BR'),
  lower: (v) => v.toLocaleLowerCase('pt-BR'),
  title: titleCase,
  trim: (v) => v.split(/\r?\n/).map((line) => line.trim().replace(/[^\S\r\n]+/gu, ' ')).filter(Boolean).join('\n'),
  accents: stripAccents,
  slug: (v) => stripAccents(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  unique: (v) => [...new Set(v.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))].join('\n'),
  sort: (v) => v.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })).join('\n'),
};

export function openTextTransform(container) {
  const root = form(container, field('Operação', select('operation', {
    upper: 'MAIÚSCULAS', lower: 'minúsculas', title: 'Iniciais Maiúsculas', trim: 'Limpar espaços e linhas vazias',
    accents: 'Remover acentos', slug: 'Gerar slug-para-url', unique: 'Remover linhas repetidas', sort: 'Ordenar linhas',
  })) + source('Texto original') + actions('Transformar texto'));
  processForm(root, (data, result) => textResult(root, result, transforms[data.get('operation')](data.get('text')), { filename: 'texto-furion.txt' }));
}

function readJSON(value) {
  try { return JSON.parse(value.replace(/^\uFEFF/, '')); }
  catch (error) {
    const position = error.message.match(/position (\d+)/)?.[1];
    fail('JSON inválido.' + (position ? ' Confira próximo ao caractere ' + position + '.' : ' Confira as aspas, vírgulas e chaves.'));
  }
}

export function openJSON(container) {
  const root = form(container, field('Modo', select('mode', { format: 'Formatar com indentação', minify: 'Minificar', validation: 'Validar' })) +
    source('Código JSON', '{"exemplo":true}') + actions('Processar JSON'));
  processForm(root, (data, result) => {
    const value = readJSON(data.get('text'));
    const mode = data.get('mode');
    status(root, 'JSON válido.');
    if (mode !== 'validation') textResult(root, result, JSON.stringify(value, null, mode === 'format' ? 2 : 0), { filename: 'furion.json' });
  });
}

export function parseCsv(value, separator) {
  const input = value.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let closed = false;
  const pushField = () => { row.push(field); field = ''; closed = false; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };
  for (let pos = 0; pos < input.length; pos++) {
    const char = input[pos];
    if (quoted) {
      if (char === '"' && input[pos + 1] === '"') { field += '"'; pos++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === separator) pushField();
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[pos + 1] === '\n') pos++;
      pushRow();
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (closed || char === '"') fail('Aspas inválidas no registro ' + (rows.length + 1) + '.');
    else field += char;
  }
  if (quoted) fail('Aspas abertas sem fechamento no último registro.');
  if (row.length || field || closed) pushRow();
  return rows;
}

function csvToJSON(input, separator) {
  const [header, ...rows] = parseCsv(input, separator);
  if (!header || header.some((cell) => !cell.trim()) || new Set(header).size !== header.length) fail('A primeira linha precisa conter nomes de colunas únicos, sem células vazias.');
  return rows.map((row, index) => {
    if (row.length !== header.length) fail('O registro ' + (index + 2) + ' tem uma quantidade diferente de colunas.');
    return Object.fromEntries(header.map((key, i) => [key, row[i]]));
  });
}

function jsonToCSV(input, separator, protect) {
  const rows = readJSON(input);
  if (!Array.isArray(rows) || !rows.length || rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
    fail('Use uma lista de objetos JSON, como [{"nome":"Ana","cidade":"Curitiba"}].');
  }
  const columns = [...new Set(rows.flatMap(Object.keys))];
  if (!columns.length) fail('Inclua campos em pelo menos um objeto.');
  function escaped(value) {
    let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (protect && typeof value === 'string' && /^[\s\p{Cc}]*[=+\-@]/u.test(text)) text = "'" + text;
    return /["\r\n]/.test(text) || text.includes(separator) ? '"' + text.replaceAll('"', '""') + '"' : text;
  }
  return [columns.map(escaped).join(separator), ...rows.map((row) => columns.map((key) => escaped(Object.hasOwn(row, key) ? row[key] : '')).join(separator))].join('\r\n');
}

export function openCSV(container) {
  const root = form(container, '<div class="fields two">' +
    field('Conversão', select('direction', { csv: 'CSV para JSON', json: 'JSON para CSV' })) +
    field('Separador do CSV', select('separator', { semicolon: 'Ponto e vírgula', comma: 'Vírgula', tab: 'Tabulação' })) + '</div>' +
    '<label class="field check" hidden><input type="checkbox" name="protect" checked>Tratar fórmulas como texto ao abrir em planilhas</label>' +
    source('Dados de entrada') + actions('Converter dados'));
  const direction = root.elements.namedItem('direction');
  direction.onchange = () => { root.elements.namedItem('protect').closest('label').hidden = direction.value === 'csv'; };
  processForm(root, (data, result) => {
    const sep = { semicolon: ';', comma: ',', tab: '\t' }[data.get('separator')];
    const csv = data.get('direction') === 'csv';
    const output = csv ? JSON.stringify(csvToJSON(data.get('text'), sep), null, 2) : jsonToCSV(data.get('text'), sep, data.has('protect'));
    textResult(root, result, output, { filename: 'furion.' + (csv ? 'json' : 'csv') });
  });
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}

function fromBase64(value) {
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (char) => char.charCodeAt(0)));
}

export function openEncoding(container) {
  const root = form(container, '<div class="fields two">' + field('Formato', select('format', { base64: 'Base64 (texto UTF-8)', url: 'Componente de URL' })) +
    field('Operação', select('operation', { encode: 'Codificar', decode: 'Decodificar' })) + '</div>' + source('Entrada') + actions('Processar texto'));
  processForm(root, (data, result) => {
    const encode = data.get('operation') === 'encode';
    const base = data.get('format') === 'base64';
    const convert = base ? encode ? toBase64 : fromBase64 : encode ? encodeURIComponent : decodeURIComponent;
    let output;
    try { output = convert(data.get('text')); } catch { fail(base ? 'Informe Base64 válido que represente texto UTF-8.' : 'Confira as sequências codificadas com %.'); }
    textResult(root, result, output, { filename: 'furion-codificacao.txt' });
  });
}

function sampleIndex(size) {
  const byte = new Uint8Array(1);
  const limit = 256 - 256 % size;
  do { crypto.getRandomValues(byte); } while (byte[0] >= limit);
  return byte[0] % size;
}

export function openPassword(container) {
  const alpha = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', numbers: '0123456789', symbols: '!@#$%&*+-_=?.:;~' };
  const labels = { lower: 'Letras minúsculas', upper: 'Letras maiúsculas', numbers: 'Números', symbols: 'Símbolos' };
  const root = form(container, field('Comprimento', '<input name="length" type="number" min="8" max="128" value="20" required>') +
    '<div class="fields two">' + Object.entries(labels).map(([key, label]) => '<label class="field check"><input type="checkbox" name="' + key + '" checked>' + label + '</label>').join('') +
    '</div>' + actions('Gerar senha'));
  processForm(root, (data, result) => {
    const sets = Object.keys(alpha).filter((key) => data.has(key)).map((key) => alpha[key]);
    if (!sets.length) fail('Escolha pelo menos um tipo de caractere.');
    const alphabet = sets.join('');
    const count = Number(data.get('length'));
    let password;
    do { password = Array.from({ length: count }, () => alphabet[sampleIndex(alphabet.length)]).join(''); }
    while (sets.some((set) => ![...password].some((char) => set.includes(char))));
    textResult(root, result, password, { label: 'Senha gerada' });
    $('textarea[readonly]', result).spellcheck = false;
  });
}

export function openUUID(container) {
  const root = form(container, field('Quantidade', '<input name="count" type="number" min="1" max="100" value="1" required>') + actions('Gerar UUID v4'));
  processForm(root, (data, result) => {
    const entries = Array.from({ length: Number(data.get('count')) }, () => crypto.randomUUID()).join('\n');
    textResult(root, result, entries, { filename: 'uuids-furion.txt' });
  });
}

export function openHash(container) {
  const root = form(container, '<div class="fields two">' + field('Fonte', select('mode', { text: 'Texto', file: 'Arquivo local' })) +
    field('Algoritmo', select('algorithm', { 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' })) + '</div>' +
    '<div id="hash-text">' + field('Texto', '<textarea name="text" placeholder="Cole ou digite aqui"></textarea>') +
    '</div><div id="hash-file" hidden>' + field('Escolher arquivo', '<input type="file" name="file">') + '</div>' + actions('Calcular hash'));
  const mode = root.elements.namedItem('mode');
  mode.onchange = () => {
    $('#hash-text', root).hidden = mode.value !== 'text';
    $('#hash-file', root).hidden = mode.value !== 'file';
  };
  processForm(root, async (data, result) => {
    const fileMode = data.get('mode') === 'file';
    const file = data.get('file');
    if (fileMode && !file.name) fail('Selecione um arquivo.');
    if (fileMode && file.size > 150 * 1024 ** 2) fail('Selecione um arquivo de até 150 MB.');
    status(root, 'Calculando…');
    const bytes = fileMode ? await file.arrayBuffer() : new TextEncoder().encode(data.get('text'));
    const hash = await crypto.subtle.digest(data.get('algorithm'), bytes);
    const hex = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
    status(root, 'Hash calculado.');
    textResult(root, result, hex, { label: 'Hash calculado' });
  });
}
