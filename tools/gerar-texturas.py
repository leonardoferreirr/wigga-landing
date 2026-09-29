#!/usr/bin/env python3
"""
Recorta as amostras da Colors 2026 do PDF que a WIGGA manda e gera os arquivos
que a seção Acabamentos usa.

Para cada acabamento saem três arquivos em assets/img/tex/:

    <nome>-v.webp     amostra em pé, para montante e mainel
    <nome>-h.webp     a mesma girada, para as travessas deitadas
    <nome>-dot.webp   quadrado de 64px, para a bolinha do seletor

O grão precisa acompanhar o comprimento da peça, que é como o foil é aplicado no
perfil. Por isso duas versões e não uma: com uma só, a travessa de cima sairia
com a madeira correndo atravessada e o caixilho denunciaria que é desenho.

Uso:

    python3 tools/gerar-texturas.py "~/Downloads/Cores esquadrias.pdf"

Depois de rodar, o script imprime a cor média de cada amostra. Esse valor vai
para o data-color do botão em index.html: ele é o fundo enquanto a imagem
carrega e é o que o JS lê para decidir se a legenda sai clara ou escura.

ATENÇÃO à ordem. O PDF não traz o nome dentro de cada página, a lista vem
separada no WhatsApp, e em 29/09/2026 ela veio com sete nomes para oito
amostras. A ordem abaixo foi conferida amostra a amostra e confirmada com o
Lucas. Se vier um PDF novo, confira de novo antes de publicar, porque errar o
nome de um acabamento é pior do que não ter a amostra.
"""
import io
import sys
from pathlib import Path

import fitz
from PIL import Image

RAIZ = Path(__file__).parent.parent
SAIDA = RAIZ / 'assets/img/tex'

# página do PDF -> nome do acabamento
ORDEM = [
    (1, 'jetblack'),    # preto liso
    (2, 'blackwood'),   # preto amadeirado
    (3, 'grafite'),     # cinza escuro liso
    (4, 'golden-oak'),  # madeira dourada
    (5, 'turner-oak'),  # madeira clara
    (6, 'bronze'),      # metálico oliva escuro
    (7, 'pirita'),      # metálico cinza quente
    (8, 'platina'),     # metálico cinza claro
]

# Quanto da amostra entra no recorte. Menos de 100% para a textura aparecer numa
# escala em que o grão continua fino na tela, em vez de virar listra grossa.
FATIA = .42


def media(im: Image.Image) -> str:
    r, g, b = im.resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    return f'#{r:02X}{g:02X}{b:02X}'


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    pdf = fitz.open(Path(sys.argv[1]).expanduser())
    if pdf.page_count != len(ORDEM):
        print(f'O PDF tem {pdf.page_count} páginas e a ordem prevê {len(ORDEM)}.')
        print('Confira a lista de nomes antes de seguir: ORDEM está desatualizada.')
        return 1

    SAIDA.mkdir(parents=True, exist_ok=True)
    for pagina, nome in ORDEM:
        imgs = pdf[pagina - 1].get_images(full=True)
        if len(imgs) != 1:
            print(f'Página {pagina}: esperava uma imagem, achei {len(imgs)}.')
            return 1
        bruto = pdf.extract_image(imgs[0][0])
        im = Image.open(io.BytesIO(bruto['image'])).convert('RGB')
        w, h = im.size

        faixa = int(w * FATIA)
        v = im.crop(((w - faixa) // 2, 0, (w + faixa) // 2, h)).resize((300, 680), Image.LANCZOS)
        v.save(SAIDA / f'{nome}-v.webp', 'WEBP', quality=80, method=6)

        gira = im.rotate(90, expand=True)
        gw, gh = gira.size
        faixa = int(gh * FATIA)
        hz = gira.crop((0, (gh - faixa) // 2, gw, (gh + faixa) // 2)).resize((680, 300), Image.LANCZOS)
        hz.save(SAIDA / f'{nome}-h.webp', 'WEBP', quality=80, method=6)

        lado = min(w, h)
        d = im.crop(((w - lado) // 2, (h - lado) // 2, (w + lado) // 2, (h + lado) // 2))
        d.resize((64, 64), Image.LANCZOS).save(SAIDA / f'{nome}-dot.webp', 'WEBP', quality=82, method=6)

        print(f'{nome:12} página {pagina}  data-color {media(im)}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
