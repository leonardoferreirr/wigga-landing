# WIGGA, landing de captação

Landing page de orçamento para a WIGGA Esquadrias de PVC (São Leopoldo, RS), feita
para receber tráfego pago do Google. Site estático, sem framework e sem
dependência externa: todo o CSS vai embutido na página e o JavaScript é um
arquivo só.

Visual: só o hero é escuro, o resto da página é branco com texto preto e apoio em
cinza. Títulos em Poppins Light, corpo em Inter Tight.

Lighthouse no celular, com throttle real (`--throttling-method=devtools`):
**100 / 100 / 100 / 100**. LCP 0,9 s, CLS 0,03, TBT 0 ms.

## Como mexer

```bash
npx serve -l 8833 .
```

O CSS fica em `assets/css/site.css`. Depois de editar, rode:

```bash
python3 build.py
```

Isso embute o CSS nas páginas, entre os marcadores `<!--CSS-->` e `<!--/CSS-->`.
Uma folha externa bloquearia a primeira pintura, e numa landing de Google Ads
isso custa nota de performance, que custa dinheiro no leilão. Antes de publicar,
`python3 build.py --check` avisa se o embutido está velho.

Estrutura:

```
index.html        a landing
obrigado.html     página de conversão, monta a mensagem do WhatsApp
assets/css/       fonte do CSS (embutido no build)
assets/js/        comportamento: janela do hero, formulário, revelações
assets/img/       fotos em WebP, várias larguras
assets/fonts/     Archivo e Inter Tight, self-hosted, 80 KB no total
_src/             originais das fotos e a copy em markdown (fora do deploy)
```

## O que a página faz

**O hero é uma janela.** A foto de fundo é a mesma em duas camadas: uma como a
cena chega pelo vidro, outra como ela é sem nada na frente. A folha corre no
arrasto (funciona também no clique, no toque e pelo teclado) e revela a diferença,
com o medidor de ruído subindo quando a janela abre. É a demonstração do produto
antes de qualquer texto sobre ele.

**A tese da copy:** a esquadria é o único item da obra que ninguém troca depois.
Isso sustenta o título, o comparativo (o quinto critério é custo por ano, não
preço de compra) e o fechamento. Os concorrentes todos disputam "conforto térmico
e acústico", então a página não entra por aí.

**A seção de arquitetos** existe porque nenhum concorrente fala com o
especificador. A WIGGA publica os modelos em SketchUp, e isso não aparecia em
lugar nenhum.

**O CTA principal é o WhatsApp.** Cada seção fecha com um botão verde "Falar com
um especialista". O formulário continua na página, como caminho para quem prefere
escrever, e a nav aponta para ele.

## Antes de publicar

### 1. Onde o pedido vai ser gravado

Em `assets/js/site.js`, a constante `REGISTRO` está vazia. Enquanto estiver
assim, o pedido só existe como a mensagem que a pessoa manda no WhatsApp: os
dados do formulário, o UTM e o GCLID não ficam registrados em lugar nenhum.

Preencha com a chave do Web3Forms ou com a URL de um Apps Script ligado a uma
planilha. É uma linha.

### 2. Conversão do Google Ads

São dois eventos, os dois no `dataLayer`:

- `clique_whatsapp`, disparado por qualquer botão verde da página, com o nome da
  seção de onde saiu o clique. É o que mede o CTA principal.
- `orcamento_enviado`, na página de obrigado, para quem preencheu o formulário.

`obrigado.html` tem o lugar marcado para o snippet do GTM e só carrega o container
quando existe pedido de verdade na sessão, para visita direta à URL não registrar
conversão. A conta de Ads e o container da WIGGA precisam ser ligados pelo Lucas.

### 3. Os 15 dados que só a WIGGA tem

Estão marcados no HTML como `<!-- [A PREENCHER] ... -->`, nos pontos exatos onde
entram. São o que a Bazze publica e a WIGGA ainda não:

| Onde | O que falta |
|---|---|
| Desempenho | Rw dos sistemas, em decibéis |
| Desempenho | opções de fecho multiponto e de vidro por linha |
| Colors 2026 | garantia da laminação contra desbotamento |
| Arquitetos | se o download do SketchUp é livre ou pede cadastro, quais tipologias tem, e o link direto |
| Arquitetos | canal direto para construtora e obra de grande volume |
| Processo e FAQ | quem faz a medição e em que fase da obra |
| Processo e FAQ | prazo médio de produção e de entrega, por linha |
| Processo e FAQ | instalação: equipe própria ou credenciada, e se entra no orçamento |
| FAQ | garantia do perfil, da laminação, das ferragens e do vidro, e o que cada uma cobre |
| FAQ | quantidade mínima por pedido, se houver |
| FAQ | como funciona a troca em imóvel pronto |
| Formulário | prazo de retorno prometido |

Enquanto esses campos estiverem vazios, a página empata com o concorrente no meio
do funil. Uma ligação de vinte minutos com a WIGGA resolve a lista inteira.

### 4. Fotos

O acervo veio do site atual da WIGGA. Dez fotos prestam para uma página premium,
o resto é foto antiga de obra.

**Hotéis, hospitais e escolas estão sem foto.** Os três cards têm o mesmo tamanho
dos outros e mostram a marca d'água da janela no lugar da imagem. Assim que a
WIGGA mandar uma obra de cada, é só trocar o bloco `app__img--vazio` por um `img`
igual ao dos cards de cima.

O que mais falta e faria diferença: fábrica em operação, equipe instalando,
detalhe do perfil em corte, e obras de litoral e de serra identificadas como tais
(hoje essas duas seções usam foto de ambientação, sem afirmar o local).

## Decisões que já foram tomadas, não são esquecimento

- **Sem 3D no hero.** A âncora interativa é a janela em CSS. Um WebGL pesado
  entregaria menos e custaria o LCP, que aqui vale dinheiro no leilão do Ads.
- **Sem GSAP, sem Lenis.** Tudo em JavaScript puro com IntersectionObserver. Menos
  peso, menos classe de bug de scroll.
- **Nada de número inventado.** Não há dado de desempenho que a WIGGA não tenha
  publicado. Onde faltaria número, o texto funciona sem ele e o marcador registra
  o que pedir.
- **A frase "nenhum concorrente faz isso" saiu** da seção de arquitetos. Afirmação
  de superioridade que não dá para provar, e que envelhece mal.
- **Litoral e serra sem foto legendada como tal**, porque não dá para confirmar
  onde cada obra do acervo fica.
- **O logo é um SVG só, com o texto em `currentColor`.** Ele sai branco sobre o
  hero escuro e escuro sobre fundo claro, sem precisar de dois arquivos.

## Contato que está na página

Rua Georg Hoefel, 360, São Leopoldo, RS, CEP 93145-600.
(51) 3581-2444, telefone e WhatsApp. wigga@wigga.com.br e crc@wigga.com.br.
CNPJ 07.562.528/0001-01.
