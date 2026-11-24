import { openPix } from './pix.js';
import { openExtraLink } from './links.js';
import { openPdfBatch, openPdfCompress, openPdfDecoration, openPdfText, openPdfVisual } from './pdf-extra.js';
import { openImageCompress, openImageEdit } from './image-extra.js';
import { openColors, openDates, openMaterial, openPercent, openPrint, openRatio } from './calculators.js';
import { openCSV, openEncoding, openHash, openJSON, openPassword, openTextTransform, openUUID, openWordCount } from './text-tools.js';

const rows = [
  ['pix', 'qr', 'qr', 'green', 'QR Code Pix', 'Gere um Pix estático com valor opcional e Pix Copia e Cola.', 'pagamento placa balcão chave pix cobrar brcode', openPix],
  ['pdf-compress', 'pdf', 'compress', 'orange', 'Comprimir PDF', 'Reduza o tamanho do PDF e compare com o original.', 'diminuir tamanho compactar kb mb reduzir documento', openPdfCompress],
  ['print', 'print', 'ruler', 'purple', 'Tamanho para impressão', 'Converta cm em pixels pelo DPI e confira a resolução da sua arte.', 'impressão ppi megapixels a4 a3 dpi resolução etiqueta adesivo sangria cm px gráfica', openPrint],
  ['material', 'print', 'calculator', 'purple', 'Calcular material', 'Some áreas de peças em cm ou m e estime sobra e custo por m².', 'orçamento calculadora área metragem resíduo rolo envelopamento vinil', openMaterial],
  ['pdf-visual', 'pdf', 'organize', 'orange', 'Organizar PDF visualmente', 'Arraste miniaturas para ordenar, girar e remover páginas.', 'visual miniaturas reordenar excluir deletar mover mouse', openPdfVisual],
  ['image-compress', 'images', 'compress', 'blue', 'Comprimir imagem', 'Reduza a qualidade ou as dimensões para atingir um tamanho em KB.', 'compactar jpg jpeg webp diminuir peso upload', openImageCompress],
  ['crop', 'images', 'crop', 'blue', 'Recortar imagem', 'Selecione a área em pixels e confira na prévia.', 'cortar foto enquadrar recorte crop', openImageEdit],
  ['colors', 'print', 'colors', 'purple', 'Converter cores', 'Consulte HEX, RGB, HSL, CMYK aproximado e contraste.', 'cores impressão paleta picker rgb cmyk hexadecimal', openColors],
  ['page-numbers', 'pdf', 'file', 'orange', 'Numerar páginas do PDF', 'Coloque numeração no topo ou no rodapé de páginas selecionadas.', 'número paginação contagem cabeçalho rodapé', openPdfDecoration],
  ['pdf-stamp', 'pdf', 'text', 'orange', 'Marca d’água em PDF', 'Aplique texto com opacidade ajustável nas páginas.', "rascunho carimbo watermark marca d'água", openPdfDecoration],
  ['pdf-text', 'pdf', 'text', 'orange', 'Extrair texto do PDF', 'Copie ou baixe o texto selecionável de um documento.', 'texto exportar txt copiar selecionável', openPdfText],
  ['pdf-batch', 'pdf', 'image', 'blue', 'PDF para imagens em lote', 'Exporte várias páginas em JPG ou PNG dentro de um ZIP.', 'zip conversão converter lote todas páginas foto jpeg', openPdfBatch],
  ['image-rotate', 'images', 'rotate', 'blue', 'Girar e espelhar imagem', 'Altere a orientação ou inverta a foto na horizontal ou vertical.', 'rotacionar rotação inverter flip imagem deitada', openImageEdit],
  ['image-stamp', 'images', 'text', 'blue', 'Marca d’água em imagem', 'Carimbe uma foto com texto, posição e opacidade ajustáveis.', 'marca d agua imagem foto watermark adicionar texto', openImageEdit],
  ['utm', 'links', 'link', 'green', 'Link com UTM', 'Identifique origem, mídia e campanha em links de divulgação.', 'url google analytics marketing rastreamento utm campanha', openExtraLink],
  ['map', 'links', 'link', 'green', 'Link de localização', 'Crie um link do Google Maps a partir de endereço ou coordenadas.', 'mapa gps pin google maps rota endereço', openExtraLink],
  ['email', 'links', 'mail', 'green', 'Link de e-mail', 'Monte um link com destinatário, assunto e mensagem.', 'email mailto correio eletrônico', openExtraLink],
  ['telegram', 'links', 'link', 'green', 'Link de Telegram', 'Crie um link para um usuário, grupo ou canal público.', 'chat canal grupo t.me telegram', openExtraLink],
  ['word-count', 'text', 'text', 'purple', 'Contar palavras', 'Conte palavras, caracteres e linhas enquanto digita.', 'contador caracteres texto tempo leitura quantidade', openWordCount],
  ['text-edit', 'text', 'edit', 'purple', 'Transformar texto', 'Mude maiúsculas e minúsculas, limpe espaços e gere slugs.', 'acentos uppercase lowercase duplicado ordenar lista ordem alfabética texto', openTextTransform],
  ['percent', 'daily', 'calculator', 'purple', 'Calcular porcentagem', 'Faça cálculos de desconto, acréscimo e variação percentual.', 'porcento percent desconto promoção valor por cento', openPercent],
  ['ratio', 'daily', 'calculator', 'purple', 'Regra de três', 'Calcule proporções diretas ou inversas.', 'proporção escalas razão proporcional regra de 3', openRatio],
  ['dates', 'daily', 'calendar', 'purple', 'Contar dias entre datas', 'Conte dias corridos, semanas e dias de segunda a sexta.', 'dias úteis datas intervalo prazo calendário diferença', openDates],
  ['json', 'data', 'code', 'blue', 'Formatar JSON', 'Valide, deixe legível ou minifique o código JSON.', 'beautify formatter validar código developer js javascript', openJSON],
  ['csv', 'data', 'convert', 'blue', 'Converter CSV e JSON', 'Transforme tabelas de texto em JSON e exporte JSON como CSV.', 'planilha separador tabular coluna tab dados', openCSV],
  ['encoding', 'data', 'code', 'blue', 'Base64 e URL', 'Codifique e decodifique textos em Base64 ou componentes de URL.', 'encoder decoder utf8 urlencode URL percent encoding', openEncoding],
  ['password', 'data', 'lock', 'blue', 'Gerar senha', 'Crie senhas aleatórias com tamanho e caracteres ajustáveis.', 'gerador senha password aleatória forte segurança token', openPassword],
  ['uuid', 'data', 'code', 'blue', 'Gerar UUID', 'Crie identificadores aleatórios UUID v4 em lote.', 'uuid v4 guid identificador aleatório', openUUID],
  ['hash', 'data', 'lock', 'blue', 'Calcular hash SHA', 'Calcule SHA-256, SHA-384 ou SHA-512 de texto ou arquivo.', 'checksum soma verificação hash sha256 sha512 digest assinatura', openHash],
];

export const extraTools = rows.map(([id, category, icon, color, name, description, terms, open]) => ({ id, category, icon, color, name, description, terms, open }));
