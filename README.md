# WIGGA, landing de captação

Landing page de orçamento para a WIGGA Esquadrias de PVC (São Leopoldo, RS), feita
para receber tráfego pago do Google. Site estático, sem framework e sem
dependência externa: todo o CSS vai embutido na página e o JavaScript é um
arquivo só.

Visual: só o hero é escuro, o resto da página é branco com texto preto e apoio em
cinza. Títulos em Poppins Light, corpo em Inter Tight.

Lighthouse no celular, com throttle real (`--throttling-method=devtools`):
**100 / 100 / 100 / 100**, e o mesmo no desktop. LCP 0,9 s, CLS 0,02, TBT 0 ms.

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
assets/fonts/     Poppins Light e Inter Tight, self-hosted, 60 KB no total
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

**O CTA principal é o WhatsApp.** O menu, o hero e cada seção fecham com um botão
verde "Falar com um especialista", todos com a mesma largura. Não sobrou botão
vermelho na página: o único acento em carmim agora é a marca e os detalhes. O formulário também termina no WhatsApp: ao enviar, a pessoa
passa por `/obrigado`, que dispara a conversão e abre a conversa já com o resumo
do que ela preencheu. O formulário existe para qualificar antes da conversa, não
para substituí-la.

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
conversão. O redirecionamento para o WhatsApp espera o retorno do GTM, com piso
de 0,9s e teto de 2,6s, para a conversão sair antes de a página mudar. A conta de
Ads e o container da WIGGA precisam ser ligados pelo Lucas.

### 3. Os 15 dados que só a WIGGA tem

Estão marcados no HTML como `<!-- [A PREENCHER] ... -->`, nos pontos exatos onde
entram. São o que a Bazze publica e a WIGGA ainda não:

A revisão de copy de 23/09 fechou a maioria deles do jeito oposto ao previsto:
em vez de publicar o dado, tirou a afirmação que dependia dele. O que continua
aberto, agora do lado da WIGGA e não do texto:

| Onde | O que falta |
|---|---|
| Acabamentos | nomes, amostras e disponibilidade das cores da Colors 2026 |
| Soluções | nomenclatura comercial das oito tipologias |
| Arquitetos | link dos modelos SketchUp: se está atual e se baixa no celular |
| Obras | legenda de cada obra: tipo de projeto, cidade e solução aplicada |
| FAQ | pergunta de garantia, com prazo, componentes e condições reais, para poder voltar |
| FAQ | conferir com o comercial as respostas de cobertura, reforma e instalação |
| Aplicações | foto de hotelaria e de projeto comercial, ou o card sai |
| Desempenho | laudo por linha e configuração, se algum número de vento ou acústica voltar |

### 4. Fotos

O acervo veio do site atual da WIGGA. Dez fotos prestam para uma página premium,
o resto é foto antiga de obra.

**Hotelaria e projetos comerciais estão sem foto.** Os dois cards têm o mesmo
tamanho dos outros e mostram a marca d'água da janela no lugar da imagem, que é
a forma de não apresentar ambientação como obra executada. Assim que a WIGGA
mandar uma obra de cada, é só trocar o bloco `app__img--vazio` por um `img` igual
ao dos cards de cima.

O que mais falta e faria diferença: fábrica em operação, equipe instalando e
detalhe do perfil em corte.

## A revisão de copy de 23/09

A WIGGA mandou o documento `WIGGA_Orientacoes_Completas_Landing_Page.docx`, com o
texto final de cada seção e as instruções de implementação. **A página inteira foi
reescrita palavra por palavra a partir dele**, nas 14 seções, mais título e meta
description. Dá para conferir: cada `[Texto para publicar]` do documento aparece
igual na página.

O que mudou de fundo, além das palavras:

| Mudança | Por quê, segundo o documento |
|---|---|
| Os quatro números da faixa viraram três credenciais | 180 km/h precisa de laudo por linha, configuração, dimensão, vidro e condições do ensaio. "11 tipologias" não batia com a lista e "2 linhas" só volta se pronta entrega for oferta prioritária nos mercados da campanha |
| A tabela PVC x alumínio x madeira saiu, no lugar entrou "Por que especificar esquadrias de PVC?" | os comparativos exigiam equivalência de sistemas e dados que a página não apresenta |
| Aplicações foi de sete cards para quatro | litoral, serra, hospitais e escolas só entram se forem prioridade comercial real e houver obra verificável |
| O FAQ foi de oito perguntas para seis | saíram a de preço contra alumínio ("a conta se inverte rápido", sem simulação) e a de garantia, que precisa de prazo e condições reais antes de voltar |
| Todo CTA passou do WhatsApp para o formulário | o documento define um CTA persistente, "Apresentar meu projeto", que rola até o formulário final. O WhatsApp continua sendo o fim do caminho: o formulário termina nele pelo `obrigado.html`, e o botão flutuante segue na tela |
| O formulário ganhou "Tipo de projeto" e perdeu obrigatoriedade em e-mail e quantidade | são os campos obrigatórios e opcionais que o documento lista. O `obrigado.html` acompanhou, na mesma ordem |

**Frases que o documento mandou retirar e não podem voltar sem prova:** "o barulho
para na moldura", "o ar-condicionado desliga sozinho", "resiste a ventos de até
180 km/h", "não descasca", "não pede repintura", "o vão que o pedreiro deixou",
"a conta se inverte rápido" e a garantia de que a compatibilização "não volta
para trás".

**Uma decisão que é do Leonardo, não do documento:** a chamada superior
("Esquadrias de PVC sob medida", acima do H1) é um eyebrow, que ele normalmente
tira das landings. Ficou porque o documento pede, e sai com uma linha.

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
  hero escuro e escuro sobre fundo claro, sem precisar de dois arquivos. Os paths
  vêm de `assets/img/wigga-logo.svg`: se precisar mexer, copie de lá, não redesenhe.
- **O ícone da aba é só o quadrado**, com fundo transparente e miolo branco.

## Contato que está na página

Rua Georg Hoefel, 360, São Leopoldo, RS, CEP 93145-600.
(51) 3581-2444, telefone e WhatsApp. wigga@wigga.com.br e crc@wigga.com.br.
CNPJ 07.562.528/0001-01.
