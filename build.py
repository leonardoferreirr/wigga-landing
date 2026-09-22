#!/usr/bin/env python3
"""
Injeta o CSS de assets/css/site.css dentro das páginas, entre os marcadores
<!--CSS--> e <!--/CSS-->.

Por que: uma folha de estilo externa bloqueia a primeira pintura. Numa landing
de Google Ads isso custa nota de performance, e nota de performance custa
dinheiro no leilão. Com o CSS embutido a página pinta na primeira resposta.

A fonte da verdade continua sendo assets/css/site.css. Depois de mexer nele,
rode:

    python3 build.py

Rodar sem argumento reescreve as páginas. Com --check, só avisa se o embutido
está desatualizado (útil antes de publicar).
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
CSS = RAIZ / 'assets/css/site.css'
PAGINAS = ['index.html', 'obrigado.html']
ABRE, FECHA = '<!--CSS-->', '<!--/CSS-->'


def enxuga(css: str) -> str:
    """Tira comentários e indentação. Conservador de propósito: não mexe em
    valores, para não quebrar url(data:...) nem calc().

    Também reescreve os caminhos: dentro de assets/css/ a fonte é ../fonts/,
    mas embutido na página da raiz o caminho passa a ser assets/fonts/."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = css.replace("url('../fonts/", "url('assets/fonts/").replace('url("../fonts/', 'url("assets/fonts/')
    css = css.replace("url('../img/", "url('assets/img/").replace('url("../img/', 'url("assets/img/')
    linhas = [l.strip() for l in css.split('\n')]
    return '\n'.join(l for l in linhas if l)


def main() -> int:
    conferir = '--check' in sys.argv
    css = enxuga(CSS.read_text(encoding='utf-8'))
    bloco = f'{ABRE}<style>{css}</style>{FECHA}'
    desatualizadas = []

    for nome in PAGINAS:
        p = RAIZ / nome
        html = p.read_text(encoding='utf-8')
        if ABRE not in html:
            print(f'{nome}: falta o marcador {ABRE}')
            return 1
        novo = re.sub(re.escape(ABRE) + r'.*?' + re.escape(FECHA), bloco, html, flags=re.S)
        if novo == html:
            print(f'{nome}: já estava em dia')
            continue
        if conferir:
            desatualizadas.append(nome)
            continue
        p.write_text(novo, encoding='utf-8')
        print(f'{nome}: CSS embutido ({len(css) / 1024:.1f} KB)')

    if desatualizadas:
        print('desatualizado: ' + ', '.join(desatualizadas) + '. Rode python3 build.py')
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
