# Deploy do froglabs.site na Hostinger

1. No hPanel, abra **Sites → froglabs.site → Gerenciador de Arquivos** e entre na `public_html` do domínio raiz.
   - Se houver um `default.php` ou `index.php` padrão da Hostinger, apague. O `index.php` tem prioridade sobre o `index.html`.
   - **Não mexa nas pastas dos subdomínios** (garimpo, portifolio, etc.), caso elas estejam dentro da `public_html`.
2. Clique em **Upload**, envie o `froglabs-landing.zip`, clique com o botão direito nele → **Extrair** → destino `.` (a própria `public_html`).
   Os arquivos `index.html`, `.htaccess` e `assets/` precisam ficar direto na `public_html`, não dentro de uma subpasta.
3. Apague o `.zip` e abra https://froglabs.site. Se aparecer a versão antiga, limpe o cache em **Avançado → Cache** (LiteSpeed) ou force a atualização com Ctrl+F5.
4. SSL: em **Segurança → SSL**, confirme que o domínio raiz tem certificado. Para forçar HTTPS, ative **Forçar HTTPS** no próprio hPanel.

Atenção: se já existir um `.htaccess` na `public_html` com regras de subdomínio ou de redirecionamento, junte as regras em vez de sobrescrever.

Para editar: os textos ficam no `index.html`, as cores e as animações no `assets/style.css`, a interação no `assets/app.js` e o som (sintetizado, sem arquivos de áudio) no `assets/audio.js`.
