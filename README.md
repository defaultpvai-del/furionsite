# Furion - site para Netlify

Versão React/Vite do site institucional da Furion, preparada para publicação gratuita no Netlify.

## Publicar pelo GitHub

1. Crie um repositório vazio no GitHub, por exemplo `Furion-Site`.
2. Envie todos os arquivos desta pasta para o repositório.
3. No Netlify, escolha **Add new project** e depois **Import an existing project**.
4. Conecte o GitHub e selecione o repositório.
5. O Netlify reconhecerá a configuração automaticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Depois da primeira publicação, abra **Project configuration > Domain management** e tente usar o nome `furion-all`.

## Rodar no computador

```bash
npm install
npm run dev
```

## Gerar a versão de produção

```bash
npm run build
```

O resultado será criado na pasta `dist`.
