import { $, actions, fail, field, form, options, processForm, textResult } from './ui.js';
import { renderQRResult } from './links.js';

function tag(id, value) {
  if (value.length > 99) fail('Os dados excedem o tamanho permitido no QR Code Pix.');
  return id + String(value.length).padStart(2, '0') + value;
}

function crc16(value) {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(value)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function normalizeMerchant(input, label, max) {
  const text = input.trim().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
  if (!text || text.length > max) fail('Informe ' + label + ' com até ' + max + ' caracteres.');
  return text;
}

function documentKey(type, value) {
  const document = value.replace(/[.\-/\s]/g, '').toUpperCase();
  const pattern = type === 'cpf' ? /^\d{11}$/ : /^[A-Z0-9]{12}\d{2}$/;
  if (!pattern.test(document) || /^(\d)\1+$/.test(document)) return '';
  const digits = Array.from(document, (character) => character.charCodeAt(0) - 48);
  const check = (base, weights) => {
    const remainder = base.reduce((sum, digit, index) => sum + digit * weights[index], 0) % 11;
    return remainder <= 1 ? 0 : 11 - remainder;
  };
  const first = type === 'cpf' ? [10,9,8,7,6,5,4,3,2] : [5,4,3,2,9,8,7,6,5,4,3,2];
  const second = type === 'cpf' ? [11,10,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
  return check(digits.slice(0, -2), first) === digits.at(-2) && check(digits.slice(0, -1), second) === digits.at(-1) ? document : '';
}

function normalizeKey(type, value) {
  const key = value.trim();
  let normalized = '';
  if (['cpf', 'cnpj'].includes(type)) normalized = documentKey(type, key);
  if (type === 'email' && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(key) && key.length <= 77) normalized = key.toLowerCase();
  if (type === 'phone') {
    const digits = key.replace(/[\s().-]/g, '');
    const withCountry = /^\d{10,11}$/.test(digits) ? '+55' + digits : digits;
    if (/^\+[1-9]\d{7,14}$/.test(withCountry)) normalized = withCountry;
  }
  if (type === 'random' && /^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(key)) normalized = key.toLowerCase();
  if (!normalized) fail('Confira a chave Pix e o tipo selecionado.');
  return normalized;
}

function pixAmount(input) {
  let text = input.trim();
  if (!text) return '';
  if (text.includes(',')) {
    if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(text)) text = text.replaceAll('.', '');
    text = text.replace(',', '.');
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) fail('Digite um valor em reais com até duas casas decimais, como 25,50.');
  const [amount, cents = ''] = text.split('.');
  const formatted = amount.replace(/^0+(?=\d)/, '') + '.' + cents.padEnd(2, '0');
  if (formatted.length > 13 || formatted === '0.00') fail('Informe um valor positivo dentro do limite do BR Code.');
  return formatted;
}

export function pixPayload({ type, key, name, city, amount = '', txid = '' }) {
  const account = tag('00', 'br.gov.bcb.pix') + tag('01', normalizeKey(type, key));
  const reference = txid.trim() || '***';
  if (reference !== '***' && !/^[A-Za-z0-9]{1,25}$/.test(reference)) fail('Use somente letras e números no identificador, até 25 caracteres.');
  const value = pixAmount(amount);
  const payload = tag('00', '01') + tag('26', account) + tag('52', '0000') + tag('53', '986') +
    (value ? tag('54', value) : '') + tag('58', 'BR') + tag('59', normalizeMerchant(name, 'o nome', 25)) +
    tag('60', normalizeMerchant(city, 'a cidade', 15)) + tag('62', tag('05', reference)) + '6304';
  return payload + crc16(payload);
}

export function openPix(container) {
  const root = form(container, '<div class="fields two">' +
    field('Tipo de chave', '<select name="type">' + options({ random: 'Chave aleatória', email: 'E-mail', phone: 'Celular', cpf: 'CPF', cnpj: 'CNPJ' }) + '</select>') +
    field('Chave Pix', '<input name="key" required autocomplete="off" spellcheck="false">') + '</div><div class="fields two">' +
    field('Nome do recebedor', '<input name="name" required maxlength="25" autocomplete="off">') +
    field('Cidade', '<input name="city" required maxlength="15" autocomplete="off">') + '</div><div class="fields two">' +
    field('Valor em reais', '<input name="amount" inputmode="decimal" placeholder="Valor livre">') +
    field('Identificador opcional', '<input name="txid" maxlength="25" placeholder="Ex.: PEDIDO123">') + '</div>' +
    '<p class="hint">Use uma chave já cadastrada no seu banco. Antes de imprimir ou compartilhar, escaneie o código no app do banco e confira o recebedor e o valor.</p>' +
    actions('Gerar QR Code Pix'));
  processForm(root, async (data, result) => {
    const payload = pixPayload(Object.fromEntries(data));
    await renderQRResult(result, payload, { name: 'furion-pix' });
    textResult(root, result, payload, { label: 'Pix Copia e Cola' });
    $('.result textarea', root).setAttribute('spellcheck', 'false');
  });
}
