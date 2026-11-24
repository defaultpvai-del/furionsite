import { $, actions, downloadButton, fail, field, form, icon, options, processForm, status, canvasBlob } from './ui.js';

const urlInput = '<input name="url" placeholder="https://exemplo.com" inputmode="url" required>';
const textInput = '<textarea name="text" placeholder="Digite o conteúdo do QR Code" required></textarea>';
const phoneInput = '<input name="phone" type="tel" placeholder="(41) 99999-9999" required>';
const codeInput = '<input name="country" inputmode="numeric" value="55" placeholder="55" required>';
const messageInput = '<textarea name="message" placeholder="Olá! Gostaria de um orçamento."></textarea>';
const userInput = '<input name="user" placeholder="@furion.all" autocapitalize="off" required>';
const wifiInputs = '<input name="ssid" required placeholder="Nome da sua rede">';
const phoneFields = '<div class="fields two">' + field('Código do país', codeInput) + field('DDD e telefone', phoneInput) + '</div>';

function whatsapp(data) {
  const entered = data.get('phone').trim();
  const country = data.get('country').replace(/\D/g, '');
  const local = entered.replace(/\D/g, '');
  const full = entered.startsWith('+') ? local : country + local;
  if (!/^[1-9]\d{7,14}$/.test(full) || (!entered.startsWith('+') && !/^[1-9]\d{0,2}$/.test(country))) {
    fail('Confira o código do país, o DDD e o número de telefone.');
  }
  if (!entered.startsWith('+') && country === '55' && !/^\d{10,11}$/.test(local)) {
    fail('Para o Brasil, digite o DDD e o telefone. O código 55 já está no campo ao lado.');
  }
  const message = data.get('message').trim();
  return 'https://wa.me/' + full + (message ? '?text=' + encodeURIComponent(message) : '');
}

function instagram(data) {
  const handle = data.get('user').trim().replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, '')
    .replace(/^@/, '').split(/[/?#]/, 1)[0].toLowerCase();
  if (!/^[a-z0-9_][a-z0-9._]{0,29}$/.test(handle) || handle.endsWith('.') || handle.includes('..')) {
    fail('Use um nome de usuário válido, como @furion.all.');
  }
  return 'https://www.instagram.com/' + handle + '/';
}

const linkFields = {
  whatsapp: phoneFields + field('Mensagem pronta (opcional)', messageInput),
  instagram: field('Nome de usuário', userInput, 'Pode colar o link do perfil ou digitar o @.'),
};

export function renderLink(root, result, url) {
  result.innerHTML = '<div class="url-result"><input aria-label="Link gerado" readonly type="url"><button type="button" class="secondary">' +
    icon('copy') + 'Copiar</button></div><div class="actions"><a class="secondary" target="_blank" rel="noopener noreferrer">' +
    icon('external') + 'Abrir link</a></div>';
  const input = $('input', result);
  input.value = url;
  $('a', result).href = url;
  $('button', result).onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      status(root, 'Link copiado.');
    } catch {
      input.focus();
      input.select();
      status(root, document.execCommand('copy') ? 'Link copiado.' : 'Selecione o link e copie manualmente.');
    }
  };
}

export function openLink(container, key) {
  const root = form(container, linkFields[key] + actions('Gerar link'));
  processForm(root, (data, result) => renderLink(root, result, key === 'whatsapp' ? whatsapp(data) : instagram(data)));
}

export function validateURL(value) {
  const trimmed = value.trim();
  if (!trimmed) fail('Preencha o endereço do site.');
  let url;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed);
  } catch { fail('Digite um endereço de site válido.'); }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) {
    fail('Digite um endereço de site válido.');
  }
  return url.href;
}

function qrContent(data) {
  switch (data.get('kind')) {
    case 'url': return validateURL(data.get('url'));
    case 'text': return data.get('text').trim();
    case 'whatsapp': return whatsapp(data);
    case 'instagram': return instagram(data);
    case 'email': return emailLink(data);
    case 'map': return mapLink(data);
    case 'contact': {
      const name = data.get('contact-name').trim();
      const phone = data.get('contact-phone').trim();
      const email = data.get('email').trim();
      if (!name || (!phone && !email)) fail('Informe o nome e pelo menos um telefone ou e-mail.');
      if (phone && !/^[+\d() .-]{8,25}$/.test(phone)) fail('Confira o telefone.');
      const encode = (text) => text.replace(/[\\,;]/g, '\\$&').replace(/\r?\n/g, '\\n');
      return ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + encode(name), 'N:' + encode(name) + ';;;;',
        ...(phone ? ['TEL:' + encode(phone)] : []), ...(email ? ['EMAIL:' + encode(email)] : []), 'END:VCARD'].join('\r\n');
    }
    case 'wifi': {
      const escapeWifi = (value) => value.replace(/[\\;,:"]/g, '\\$&');
      const ssid = data.get('ssid');
      const password = data.get('password');
      if (!ssid.trim()) fail('Informe o nome da sua rede.');
      return 'WIFI:T:' + (password ? 'WPA' : 'nopass') + ';S:' + escapeWifi(ssid) + ';P:' + escapeWifi(password) + ';;';
    }
  }
}

function qrMatrix(content) {
  const bytes = new TextEncoder().encode(content);
  if (!bytes.length || bytes.length > 2300) fail('Use um conteúdo entre 1 e 2.300 bytes.');
  const qr = new window.QRCodeModel(-1, 0); // ISO level M
  qr.addData(String.fromCharCode(...bytes));
  qr.make();
  return qr;
}

function luminance(hex) {
  const channels = (hex.match(/[\da-f]{2}/gi) || []).map((value) => parseInt(value, 16) / 255);
  const [r, g, b] = channels.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}

function drawQR(qr, canvas, foreground, background, size, margin = 4) {
  const count = qr.getModuleCount();
  const cell = Math.max(1, Math.floor(size / (count + 2 * margin)));
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const offset = Math.floor((size - count * cell) / 2);
  context.fillStyle = background;
  context.fillRect(0, 0, size, size);
  context.fillStyle = foreground;
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (qr.isDark(y, x)) context.fillRect(offset + x * cell, offset + y * cell, cell, cell);
    }
  }
}

function qrSVG(qr, foreground, background) {
  const count = qr.getModuleCount();
  const size = count + 8;
  let path = '';
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (qr.isDark(y, x)) path += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size +
    '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="' + background +
    '"/><path fill="' + foreground + '" d="' + path + '"/></svg>';
}

export function heroQR(canvas) {
  drawQR(qrMatrix('FURION TOOLBOX'), canvas, '#292925', '#f1ad5f', 132, 1);
}

export function openQR(container) {
  const inputs = {
    url: field('Endereço do site', urlInput), text: field('Texto', textInput), ...linkFields,
    email: emailFields,
    map: mapFields,
    contact: field('Nome do contato', '<input name="contact-name" required maxlength="90">') +
      field('Telefone', '<input name="contact-phone" type="tel" placeholder="+55 (41) 99999-9999">') +
      field('E-mail', '<input name="email" type="email">'),
    wifi: field('Nome da rede', wifiInputs) + field('Senha da rede', '<input type="password" name="password" placeholder="Deixe vazio para rede aberta">'),
  };
  const root = form(container, field('Conteúdo do QR Code', '<select name="kind">' +
    options({ url: 'Endereço de site', text: 'Texto livre', whatsapp: 'WhatsApp', instagram: 'Instagram', wifi: 'Wi-Fi', email: 'E-mail', map: 'Localização', contact: 'Contato (vCard)' }) +
    '</select>') + '<div class="fields" id="qr-fields"></div><div class="fields two">' + field('Cor do código', '<input name="foreground" type="color" value="#232522">') +
    field('Cor de fundo', '<input name="background" type="color" value="#ffffff">') + '</div>' + actions('Gerar QR Code'));
  const select = $('select', root);
  const change = () => { $('#qr-fields', root).innerHTML = inputs[select.value]; };
  select.addEventListener('change', change);
  change();

  processForm(root, async (data, result) => {
    const foreground = data.get('foreground');
    const background = data.get('background');
    if ((luminance(background) + .05) / (luminance(foreground) + .05) < 4.5) {
      fail('Escolha uma cor escura para o código e um fundo claro para facilitar a leitura.');
    }
    await renderQRResult(result, qrContent(data), { foreground, background });
  });
}

export async function renderQRResult(result, content, { foreground = '#232522', background = '#ffffff', name = 'furion-qrcode' } = {}) {
  const qr = qrMatrix(content);
  const group = result.appendChild(document.createElement('div'));
  group.className = 'qr-result';
  group.innerHTML = '<canvas role="img" aria-label="QR Code gerado"></canvas><div class="actions"></div>';
  const canvas = $('canvas', group);
  drawQR(qr, canvas, foreground, background, 1024);
  const buttons = $('.actions', group);
  downloadButton(buttons, await canvasBlob(canvas, 'image/png'), name + '.png', 'image/png', 'Baixar PNG');
  downloadButton(buttons, qrSVG(qr, foreground, background), name + '.svg', 'image/svg+xml', 'Baixar SVG');
}

const emailFields = field('E-mail do destinatário', '<input name="email" type="email" placeholder="contato@exemplo.com" required>') +
  field('Assunto opcional', '<input name="subject" maxlength="200">') +
  field('Mensagem opcional', '<textarea name="body"></textarea>');
const mapFields = field('Endereço ou coordenadas', '<input name="address" placeholder="Ex.: Rua XV de Novembro, Curitiba" required>');

function emailLink(data) {
  const recipient = data.get('email').trim();
  const fields = new URLSearchParams();
  for (const key of ['subject', 'body']) if (data.get(key).trim()) fields.set(key, data.get(key));
  const query = fields.toString().replaceAll('+', '%20');
  return 'mailto:' + encodeURIComponent(recipient).replace(/%40/gi, '@') + (query ? '?' + query : '');
}

function mapLink(data) {
  const query = data.get('address').trim();
  if (!query) fail('Informe um endereço ou as coordenadas.');
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

function utmLink(data) {
  const url = new URL(validateURL(data.get('url')));
  for (const key of ['source', 'medium', 'campaign', 'content', 'term', 'id']) {
    const value = data.get(key).trim();
    if (!value && ['source', 'medium', 'campaign'].includes(key)) fail('Preencha origem, mídia e campanha.');
    if (value) url.searchParams.set('utm_' + key, value);
  }
  return url.href;
}

function telegramLink(data) {
  const user = data.get('user').trim().replace(/^(?:https?:\/\/)?t\.me\//i, '').replace(/^@/, '').replace(/\/$/, '');
  if (!/^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(user)) fail('Informe um usuário público do Telegram.');
  return 'https://t.me/' + user;
}

export function openExtraLink(container, key) {
  const utmInput = (name, placeholder, required = '') => '<input name="' + name + '" placeholder="' + placeholder + '" ' + required + '>';
  const fields = {
    email: emailFields, map: mapFields,
    telegram: field('Usuário público', '<input name="user" placeholder="@exemplo" required>'),
    utm: field('Endereço de destino', urlInput) + '<div class="fields two">' +
      field('Origem', utmInput('source', 'instagram', 'required')) + field('Mídia', utmInput('medium', 'social', 'required')) +
      field('Campanha', utmInput('campaign', 'promocao', 'required')) + field('Conteúdo opcional', utmInput('content', 'story')) +
      field('Termo opcional', utmInput('term', 'adesivos')) + field('ID opcional', utmInput('id', 'campanha-01')) + '</div>',
  };
  const make = { email: emailLink, map: mapLink, telegram: telegramLink, utm: utmLink };
  const root = form(container, fields[key] + actions('Gerar link'));
  processForm(root, (data, result) => renderLink(root, result, make[key](data)));
}
