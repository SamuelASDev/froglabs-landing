# 🐸🔥 FrogLabs

Landing page do domínio raiz **[froglabs.site](https://froglabs.site)**, a "organização" pessoal onde ficam os projetos do Samuel Abreu Sales.

Ela não é um portfólio: é uma página curta, com cara de jogo souls-like, que conta quem eu sou, do que gosto e para onde levam meus projetos.

## O que tem na página

- **Tela de título** com "Pressione qualquer tecla".
- **Fogueira como menu**: descanse e escolha para onde ir.
- **Ficha do viajante**: minha stack virou atributos (Vigor = PHP & Laravel, Fé = IA…).
- **Áreas descobertas**: cada projeto é uma área do mapa.
  - [Garimpo](https://garimpo.froglabs.site): agregador de vagas de TI com editor de currículo ATS e IA
  - [Anime Tracker](https://animetracker.froglabs.site): planejamento e acompanhamento de animes
  - [LoL Dashboard](https://loldashboard.froglabs.site/dashboard): várias contas de League of Legends e ranqueadas Solo/Duo
  - [Vértice](https://portifolio.froglabs.site): plataforma de portfólios profissionais
- **Mensagens no chão** para avaliar.
- **Easter eggs**: abra o baú suspeito… e avalie todas as mensagens.
- **Som ambiente** sintetizado no navegador (Web Audio), sem nenhum arquivo de música.
- **PT / EN**, responsiva e leve.

## Stack

HTML, CSS e JavaScript puros: sem framework e sem build. O site roda em hospedagem compartilhada (Hostinger/LiteSpeed) só extraindo os arquivos na `public_html`.

```
index.html
assets/
  style.css    estilos base e animações
  themes.css   idioma, fundo e retrato
  app.js       título, brasas, partículas, easter eggs
  themes.js    textos em inglês
  audio.js     trilha e efeitos sintetizados
  img/         artes (geradas com IA)
.htaccess      cache e compressão
```

## Rodar localmente

```bash
python -m http.server 8765
```

Depois abra http://localhost:8765.

## Deploy

Veja o [DEPLOY.md](DEPLOY.md).

## Créditos

- Feito por fã, com visual original. Sem afiliação com a FromSoftware.
- As artes da catedral e do cavaleiro foram geradas com o Google Gemini.
- O vídeo da fogueira usado em produção não está neste repositório. Sem ele, a página mostra a fogueira desenhada em SVG.

## Links

- Portfólio: https://portifolio.froglabs.site/samuel-abreu-sales
- GitHub: https://github.com/SamuelASDev
