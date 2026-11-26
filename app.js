(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('js');
  // localStorage puede fallar (modo privado, permisos): nunca debe romper la página.
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  // Idioma: el español vive en el HTML y el inglés en data-en.
  const nodes = $$('[data-en]').map((el) => ({ el, es: el.innerHTML, en: el.dataset.en }));
  const setLang = (lang) => {
    nodes.forEach((n) => { n.el.textContent = ''; n.el.innerHTML = n[lang]; });
    root.lang = lang;
    $('#lang').textContent = lang === 'es' ? 'EN' : 'ES';
    store.set('lang', lang);
  };
  setLang(store.get('lang') === 'en' ? 'en' : 'es');
  $('#lang').onclick = () => setLang(root.lang === 'es' ? 'en' : 'es');

  const saved = store.get('theme');
  root.dataset.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  $('#theme').onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  };

  const nav = $('#nav'), menu = $('#menu');
  const toggle = (open) => { nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); };
  menu.onclick = () => toggle(!nav.classList.contains('open'));
  nav.onclick = (e) => { if (e.target.closest('a')) toggle(false); };

  // Pestañas de experiencia, navegables con flechas.
  const tabs = $$('[role=tab]'), panels = $$('.panel');
  const select = (i) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => p.classList.toggle('active', i === j));
  };
  tabs.forEach((t, i) => {
    t.onclick = () => select(i);
    t.onkeydown = (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = (i + step + tabs.length) % tabs.length;
      select(next); tabs[next].focus();
    };
  });
  select(0);

  const reveal = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('seen'); reveal.unobserve(e.target); }
  }), { threshold: 0.05 });
  $$('.reveal').forEach((el) => reveal.observe(el));

  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) $$('#nav a').forEach((a) => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const words = ['Backend Java Developer', 'Spring Boot · Microservices', 'APIs REST · Spring Batch'];
    let w = 0, c = words[0].length, dir = -1;
    const tick = () => {
      c += dir;
      $('#typed').textContent = words[w].slice(0, c);
      let wait = dir > 0 ? 70 : 35;
      if (c === words[w].length) { dir = -1; wait = 2200; }
      else if (c === 0) { dir = 1; w = (w + 1) % words.length; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2200);
  }
})();
