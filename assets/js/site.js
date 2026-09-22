/* ==========================================================================
   WIGGA — comportamento da página. Vanilla, sem dependência externa.
   Regra de ouro: nada nasce invisível. Se um bloco falhar, o resto segue.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- nav */
  (function nav() {
    var el = document.querySelector('.nav');
    if (!el) return;
    var on = false;
    var check = function () {
      var should = window.scrollY > 40;
      if (should !== on) { on = should; el.classList.toggle('is-stuck', on); }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
  })();

  /* ------------------------------------------------------- reveal on view */
  (function reveal() {
    var items = document.querySelectorAll('.rv');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
    // failsafe: se algo ficar preso invisível, libera depois de 4s
    setTimeout(function () {
      document.querySelectorAll('.rv:not(.is-in)').forEach(function (i) {
        var r = i.getBoundingClientRect();
        if (r.top < window.innerHeight) i.classList.add('is-in');
      });
    }, 4000);
  })();

  /* ---------------------------------------------------- hero: a janela */
  (function heroSash() {
    var stage = document.querySelector('.hero__stage');
    var grip = document.querySelector('.hero__grip');
    if (!stage || !grip) return;

    var hint = document.querySelector('.hero__hint');
    var stateOut = document.querySelector('[data-state-out]');
    var stateIn = document.querySelector('[data-state-in]');
    var value = 0;          // 0 fechado, 1 aberto
    var target = 0;
    var dragging = false;
    var raf = null;
    var touched = false;

    var sash = stage.querySelector('.hero__sash');
    function travel() {
      // a folha percorre a própria largura
      var w = sash ? sash.getBoundingClientRect().width : stage.getBoundingClientRect().width * 0.5;
      return Math.max(120, w);
    }
    function paint() {
      stage.style.setProperty('--sash', value.toFixed(4));
      var open = value > 0.5;
      stage.classList.toggle('is-open', open);
      if (stateOut) stateOut.classList.toggle('is-on', open);
      if (stateIn) stateIn.classList.toggle('is-on', !open);
      grip.setAttribute('aria-valuenow', Math.round(value * 100));
    }
    function loop() {
      var d = target - value;
      if (Math.abs(d) < 0.001) { value = target; paint(); raf = null; return; }
      value += d * 0.16;
      paint();
      raf = requestAnimationFrame(loop);
    }
    function go(v) {
      target = Math.min(1, Math.max(0, v));
      if (reduced) { value = target; paint(); return; }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function firstTouch() {
      if (touched) return;
      touched = true;
      grip.classList.remove('is-pulsing');
      if (hint) hint.classList.add('is-done');
    }

    var startX = 0, startVal = 0, arrastou = false;
    grip.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; startVal = value; arrastou = false;
      grip.setPointerCapture(e.pointerId);
      firstTouch();
      e.preventDefault();
    });
    grip.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = startX - e.clientX;            // arrastar para a esquerda abre
      if (Math.abs(dx) > 6) arrastou = true;
      go(startVal + dx / travel());
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      try { grip.releasePointerCapture(e.pointerId); } catch (err) {}
      go(target > 0.42 ? 1 : 0);              // encaixa aberto ou fechado
    }
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);

    // o clique fecha/abre, mas só quando foi clique mesmo: o click que vem
    // logo depois de um arrasto desfazia o encaixe.
    grip.addEventListener('click', function () {
      firstTouch();
      if (arrastou) { arrastou = false; return; }
      go(target > 0.5 ? 0 : 1);
    });
    grip.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowUp') { firstTouch(); go(target + 0.25); e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'ArrowDown') { firstTouch(); go(target - 0.25); e.preventDefault(); }
      if (k === ' ' || k === 'Enter') { firstTouch(); go(target > 0.5 ? 0 : 1); e.preventDefault(); }
    });

    paint();
    // convite discreto: abre um pouco e volta, uma vez só
    if (!reduced) {
      grip.classList.add('is-pulsing');
      setTimeout(function () {
        if (touched) return;
        go(0.16);
        setTimeout(function () { if (!touched) go(0); }, 1100);
      }, 1500);
    }
  })();

  /* --------------------------------------------------------- count-up */
  (function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      if (isNaN(to) || reduced) { el.textContent = prefix + to + suffix; return; }
      var t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(to * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------- marquee */
  (function marquee() {
    document.querySelectorAll('.marquee').forEach(function (m) {
      var track = m.querySelector('.marquee__track');
      if (!track) return;
      var original = Array.prototype.slice.call(track.children);
      if (!original.length) return;
      // duplica até a metade da faixa ser mais larga que o container, em nº par de cópias
      var guard = 0;
      while (track.scrollWidth < m.offsetWidth * 2 && guard < 12) {
        original.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
        guard++;
      }
      // segunda metade: o clone que fecha o laço
      var half = Array.prototype.slice.call(track.children);
      half.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
      track.setAttribute('aria-hidden', 'false');
    });
  })();

  /* ------------------------------------------------- Colors 2026 sampler */
  (function sampler() {
    var box = document.querySelector('.sampler');
    if (!box) return;
    var frame = box.querySelector('.sampler__frame');
    var legend = box.querySelector('.sampler__legend');
    var swatches = document.querySelectorAll('.swatch');
    var bicolor = document.querySelector('.switch');
    var current = null;

    function apply() {
      if (!current) return;
      var c = current.getAttribute('data-color');
      var name = current.getAttribute('data-name');
      frame.style.setProperty('--sw', c);
      var isBi = bicolor && bicolor.getAttribute('aria-pressed') === 'true';
      frame.style.setProperty('--sw-in', isBi ? '#F2F0EC' : c);
      if (legend) legend.textContent = isBi ? name + ' por fora, branco por dentro' : name;
    }
    swatches.forEach(function (s) {
      s.addEventListener('click', function () {
        swatches.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        s.setAttribute('aria-pressed', 'true');
        current = s;
        apply();
      });
      if (s.getAttribute('aria-pressed') === 'true') current = s;
    });
    if (bicolor) {
      bicolor.addEventListener('click', function () {
        var on = bicolor.getAttribute('aria-pressed') === 'true';
        bicolor.setAttribute('aria-pressed', on ? 'false' : 'true');
        apply();
      });
    }
    apply();
  })();

  /* --------------------------------------------------------- processo */
  (function steps() {
    var line = document.querySelector('.steps__line i');
    var list = document.querySelector('.steps__list');
    var items = document.querySelectorAll('.step');
    if (!line || !list || !items.length) return;
    var tick = function () {
      var r = list.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.72 - r.top) / r.height;
      line.style.setProperty('--p', (Math.min(1, Math.max(0, p)) * 100).toFixed(1) + '%');
      items.forEach(function (s) {
        var sr = s.getBoundingClientRect();
        s.classList.toggle('is-on', sr.top < vh * 0.72);
      });
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  })();

  /* -------------------------------------------------------------- FAQ */
  (function faq() {
    document.querySelectorAll('.faq__item').forEach(function (item) {
      var btn = item.querySelector('.faq__q');
      var panel = item.querySelector('.faq__a');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        document.querySelectorAll('.faq__item.is-open').forEach(function (o) {
          if (o === item) return;
          o.classList.remove('is-open');
          o.querySelector('.faq__a').style.height = '0px';
          o.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        });
        item.classList.toggle('is-open', !open);
        btn.setAttribute('aria-expanded', String(!open));
        panel.style.height = open ? '0px' : panel.scrollHeight + 'px';
      });
    });
    window.addEventListener('resize', function () {
      var open = document.querySelector('.faq__item.is-open .faq__a');
      if (open) open.style.height = open.scrollHeight + 'px';
    });
  })();

  /* ------------------------------------------------ âncoras com suavidade */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------- atribuição de campanha */
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  (function attribution() {
    try {
      var q = new URLSearchParams(location.search);
      var found = {};
      ATTR_KEYS.forEach(function (k) { if (q.get(k)) found[k] = q.get(k); });
      if (Object.keys(found).length) {
        found._ts = Date.now();
        localStorage.setItem('wg_attr', JSON.stringify(found));
      }
    } catch (e) {}
  })();
  function readAttribution() {
    try {
      var raw = localStorage.getItem('wg_attr');
      if (!raw) return {};
      var o = JSON.parse(raw);
      if (o._ts && Date.now() - o._ts > 90 * 864e5) return {};   // 90 dias
      delete o._ts;
      return o;
    } catch (e) { return {}; }
  }

  /* --------------------------------------------------------- formulário */
  (function form() {
    var f = document.querySelector('#form-orcamento');
    if (!f) return;

    var fone = f.querySelector('[name="whatsapp"]');
    if (fone) {
      fone.addEventListener('input', function () {
        var d = fone.value.replace(/\D+/g, '').slice(0, 11);
        var out = d;
        if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
        if (d.length > 7) {
          var cut = d.length > 10 ? 7 : 6;
          out = '(' + d.slice(0, 2) + ') ' + d.slice(2, cut) + '-' + d.slice(cut);
        }
        fone.value = out;
      });
    }

    function bad(field, on) {
      var wrap = field.closest('.field');
      if (wrap) wrap.classList.toggle('is-bad', on);
      return !on;
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.hp').value) return;              // isca de robô

      var ok = true;
      var nome = f.querySelector('[name="nome"]');
      var mail = f.querySelector('[name="email"]');
      ok = bad(nome, nome.value.trim().length < 3) && ok;
      ok = bad(fone, fone.value.replace(/\D+/g, '').length < 10) && ok;
      ok = bad(mail, !/^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(mail.value.trim())) && ok;
      ['cidade', 'perfil', 'fase', 'quantidade'].forEach(function (n) {
        var el = f.querySelector('[name="' + n + '"]');
        if (el) ok = bad(el, !el.value) && ok;
      });
      if (!ok) {
        var first = f.querySelector('.field.is-bad input, .field.is-bad select');
        if (first) first.focus();
        return;
      }

      var data = {};
      new FormData(f).forEach(function (v, k) { if (k !== 'website') data[k] = v; });
      var attr = readAttribution();
      Object.keys(attr).forEach(function (k) { data[k] = attr[k]; });

      var btn = f.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

      try { sessionStorage.setItem('wg_pedido', JSON.stringify(data)); } catch (err) {}

      // REGISTRO: destino de gravação do pedido. Preencher com a chave do
      // Web3Forms (ou a URL do Apps Script) que o cliente definir.
      var REGISTRO = '';

      var done = function () { location.href = '/obrigado'; };

      if (REGISTRO) {
        var payload = Object.assign({}, data, { subject: 'Novo orçamento pelo site', from_name: 'Site WIGGA' });
        if (/^https?:/.test(REGISTRO)) payload = data;
        else payload.access_key = REGISTRO;
        fetch(/^https?:/.test(REGISTRO) ? REGISTRO : 'https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        }).then(done).catch(done);
        setTimeout(done, 4000);
      } else {
        done();
      }
    });
  })();
})();
