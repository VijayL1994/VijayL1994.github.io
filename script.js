/* ============================================================
   VIJAY · Photography — album-driven interactions
   1. Albums built from manifest (8 themed series)
   2. Per-album masonry (shortest-column, real balance, no CLS)
   3. Scroll fade-in + subtle parallax zoom (rAF, visible-only)
   4. Full-screen lightbox scoped per-album
   5. Native lazy-loading, first rows eager
   ============================================================ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------- config -------- */
  const HERO_FILE  = '001-photography.jpg';   // hero image, skip in gallery
  const EAGER      = 6;                        // above-the-fold eager images

  /* Albums — order = display order (per user 2026-08-09, re-classified
     against the 4 reference contact sheets on the user's Desktop).
     4 series, one column: 商业人像 → 产品拍摄 → 建筑空间 → 演出现场.
     Projects are anchored to the references:
       · 商业人像 = creative-works · particle-fever · xvessel(人像) ·
                    smeal · samunlisa(人像) · pantene
       · 产品拍摄 = xvessel(球鞋) · heyday · hardsponge · zeekr · bmw ·
                    roewe · honor · philips · pizza-hut · loccitane ·
                    husum · c-bechstein · time-garden-living · smuouque ·
                    samunlisa(瓶)
       · 建筑空间 = cartier(店铺) · adidas(店铺) · dooh · perfume-box
       · 演出现场 = cartier(活动) · variety-show · magazine · ifengcom ·
                    olay · xvessel(活动) · nova · work(活动) · geely-auto ·
                    stage-play · robot-dreams
     Add/replace files here, then run `node tools/build-manifest.mjs`. */
  const ALBUMS = [
    { id: 'portrait', name: 'Portrait',      zh: '商业人像',   files: [
      // creative-works (3) · particle-fever (3)
      '002-creative-works.jpg','003-creative-works.jpg','004-creative-works.jpg',
      '005-particle-fever.jpg','006-particle-fever.jpg','007-particle-fever.jpg',
      // xvessel — first portrait groups (8; 012 deleted)
      '008-xvessel.jpg','009-xvessel.jpg','010-xvessel.jpg','011-xvessel.jpg',
      '013-xvessel.jpg','014-xvessel.jpg','015-xvessel.jpg','016-xvessel.jpg',
      // smeal (3) · samunlisa person (1) · pantene (3)
      '037-smeal.jpg','038-smeal.jpg','039-smeal.jpg',
      '063-samunlisa.jpg',
      '088-pantene.jpg','089-pantene.jpg','090-pantene.jpg',
    ]},                                                                                // 21
    { id: 'product',  name: 'Product',       zh: '产品拍摄',   files: [
      // xvessel — sneakers (3) · heyday (3) · hardsponge (3)
      '017-xvessel.jpg','018-xvessel.jpg','019-xvessel.jpg',
      '020-heyday.jpg','021-heyday.jpg','022-heyday.jpg',
      '023-hardsponge.jpg','024-hardsponge.jpg','025-hardsponge.jpg',
      // cars: zeekr (2) · bmw (2) · roewe (2)
      '026-zeekr.jpg','027-zeekr.jpg',
      '028-bmw.jpg','029-bmw.jpg',
      '030-roewe.jpg','031-roewe.jpg',
      // honor (2) · philips (3)
      '032-honor.jpg','033-honor.jpg',
      '034-philips.jpg','035-philips.jpg','036-philips.jpg',
      // pizza-hut (6) · loccitane (3) · husum (3)
      '040-pizza-hut.jpg','041-pizza-hut.jpg','042-pizza-hut.jpg',
      '043-pizza-hut.jpg','044-pizza-hut.jpg','045-pizza-hut.jpg',
      '046-loccitane.jpg','047-loccitane.jpg','048-loccitane.jpg',
      '049-husum.jpg','050-husum.jpg','051-husum.jpg',
      // c-bechstein (3) · time-garden (3) · smuouque (3) · samunlisa bottles (2)
      '052-c-bechstein.jpg','053-c-bechstein.jpg','054-c-bechstein.jpg',
      '055-time-garden-living.jpg','056-time-garden-living.jpg','057-time-garden-living.jpg',
      '058-smuoque.jpg','059-smuoque.jpg','060-smuoque.jpg',
      '061-samunlisa.jpg','062-samunlisa.jpg',
    ]},                                                                                // 43
    { id: 'space',    name: 'Architecture',  zh: '建筑空间',   files: [
      // cartier store (4) · adidas store (2) · dooh (2) · perfume-box (2)
      '064-cartier.jpg','065-cartier.jpg','066-cartier.jpg','067-cartier.jpg',
      '068-adidas.jpg','069-adidas.jpg',
      '070-dooh.jpg','071-dooh.jpg',
      '072-perfume-box.jpg','073-perfume-box.jpg',
    ]},                                                                                // 10
    { id: 'stage',    name: 'Stage & Event', zh: '演出现场',   files: [
      // cartier event (2) · variety-show (9) · magazine (3)
      '074-cartier.jpg','075-cartier.jpg',
      '076-variety-show.jpg','077-variety-show.jpg','078-variety-show.jpg',
      '079-variety-show.jpg','080-variety-show.jpg','081-variety-show.jpg',
      '082-variety-show.jpg','083-variety-show.jpg','084-variety-show.jpg',
      '085-magazine.jpg','086-magazine.jpg','087-magazine.jpg',
      // ifengcom event (3) · olay (3)
      '091-ifengcom.jpg','092-ifengcom.jpg','093-ifengcom.jpg',
      '094-olay.jpg','095-olay.jpg','096-olay.jpg',
      '097-xvessel.jpg','098-xvessel.jpg','099-xvessel.jpg',
      '105-robot-dreams.jpg','106-robot-dreams.jpg',
      // nova (3) · work event (2)
      '100-nova.jpg','101-nova.jpg','102-nova.jpg',
      '103-xvessel.jpg','104-xvessel.jpg',
      '107-work.jpg','108-work.jpg',
      // geely-auto (2) · ifengcom stage (2) · stage-play (2)
      '109-geely-auto.jpg','110-geely-auto.jpg',
      '111-ifengcom.jpg','112-ifengcom.jpg',
      '113-stage-play.jpg','114-stage-play.jpg',
    ]},                                                                                // 38
  ];

  /* -------- footer year -------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* -------- nav condense -------- */
  const nav = $('#nav');
  const navScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  addEventListener('scroll', navScroll, { passive: true });
  navScroll();

  /* -------- state -------- */
  let ALBUM_DATA = [];   // [{config, items, nodes, masonry, sec}, ...] in display order
  let visible    = new Set();

  /* -------- boot -------- */
  /* Prefer inlined data (works under file:// and when the server is down);
     fall back to fetching the manifest if not inlined. */
  const source = window.__GALLERY__
    ? Promise.resolve(window.__GALLERY__)
    : fetch('images/_manifest.json').then(r => r.json());

  source
    .then(list => {
      const gallery = list.filter(x => x.file !== HERO_FILE);

      // bucket each manifest entry by album
      ALBUM_DATA = ALBUMS.map(cfg => ({ cfg, items: [], nodes: [] }));
      const idxOf = new Map(ALBUMS.map((a, i) => [a.id, i]));
      let gIdx = 0;
      for (const it of gallery) {
        const album = ALBUM_DATA.find(a => a.cfg.files.includes(it.file));
        if (!album) { console.warn('no album for', it.file, it.title); continue; }
        it.albumIdx   = idxOf.get(album.cfg.id);
        it.localIdx   = album.items.length;
        it.globalIdx  = gIdx++;
        album.items.push(it);
      }

      buildTOC();
      buildAlbums();
      layoutAll();
      observe();
      bindLightbox();

      const c = $('#count');
      if (c) c.textContent = String(gallery.length);
    })
    .catch(e => console.error('manifest load failed', e));

  /* ============ chapter index (TOC) ============ */
  function buildTOC() {
    const host = $('#toc');
    if (!host) return;
    host.innerHTML = ALBUMS.map((a, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<a href="#album-${a.id}"><b>${n}</b><span>${a.name}</span></a>`;
    }).join('');
  }

  /* ============ build album sections ============ */
  function buildAlbums() {
    const host = $('#albums');
    if (!host) return;
    let eagerLeft = EAGER;
    ALBUM_DATA.forEach((a, i) => {
      const cfg = a.cfg;
      const sec = document.createElement('section');
      sec.className = 'album';
      sec.id = `album-${cfg.id}`;

      const head = document.createElement('header');
      head.className = 'album-head';
      head.innerHTML =
        `<div class="album-num">${String(i + 1).padStart(2, '0')}</div>` +
        `<div class="album-titles">` +
          `<h3>` +
            `<span class="zh">${cfg.zh}</span>` +
            `<span class="en">${cfg.name}</span>` +
          `</h3>` +
          `<p class="album-meta-inline">` +
            `<span class="series">SERIES ${String(i + 1).padStart(2, '0')} / ${String(ALBUMS.length).padStart(2, '0')}</span>` +
            `<span class="dot">·</span>` +
            `<span class="frames">${a.items.length} FRAMES</span>` +
          `</p>` +
        `</div>`;

      const masonry = document.createElement('div');
      masonry.className = 'masonry';

      sec.append(head, masonry);
      host.appendChild(sec);
      a.sec      = sec;
      a.masonry  = masonry;

      // build figures
      a.nodes = a.items.map((it, j) => {
        const fig = document.createElement('figure');
        fig.className = 'm-item';
        fig.dataset.album = i;
        fig.dataset.idx   = j;

        const media = document.createElement('div');
        media.className = 'm-media';

        const img = document.createElement('img');
        img.setAttribute('src',       `images/${it.file}`);
        img.setAttribute('alt',       `${it.title} — Vijay`);
        img.setAttribute('width',     it.w);   // intrinsic ratio → zero CLS
        img.setAttribute('height',    it.h);
        img.setAttribute('decoding',  'async');
        if (eagerLeft > 0) {
          img.setAttribute('loading', 'eager');
          img.setAttribute('fetchpriority', 'high');
          eagerLeft--;
        } else {
          img.setAttribute('loading', 'lazy');
        }

        media.appendChild(img);
        fig.append(media);
        return fig;
      });
    });
  }

  /* ============ per-album masonry: shortest-column distribution ============ */
  function colCount() {
    const w = innerWidth;
    if (w >= 1700) return 4;
    if (w >= 1100) return 3;
    return 2;
  }

  let lastCols = 0;
  function layoutAll(force) {
    const n = colCount();
    if (!force && n === lastCols) return;
    lastCols = n;
    for (const a of ALBUM_DATA) layoutAlbum(a);
  }

  function layoutAlbum(a) {
    const host = a.masonry;
    if (!host) return;
    host.innerHTML = '';
    const n = Math.min(lastCols, a.items.length || 1);
    const cols = [], heights = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'm-col';
      cols.push(c);
      host.appendChild(c);
    }
    a.items.forEach((it, i) => {
      let k = 0;
      for (let j = 1; j < n; j++) if (heights[j] < heights[k]) k = j;
      cols[k].appendChild(a.nodes[i]);
      heights[k] += it.h / it.w;            // unit-width height
    });
  }

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => layoutAll(true), 180);
  }, { passive: true });

  /* ============ reveal + parallax ============ */
  function observe() {
    const all = ALBUM_DATA.flatMap(a => a.nodes);
    if (!('IntersectionObserver' in window)) {
      all.forEach(el => el.classList.add('in'));
      return;
    }
    const revealIO = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    all.forEach(el => revealIO.observe(el));

    if (reduced) return;

    const liveIO = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      requestTick();
    }, { rootMargin: '15% 0px' });
    all.forEach(el => liveIO.observe(el));

    addEventListener('scroll', requestTick, { passive: true });
    requestTick();
  }

  let ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(parallax);
  }

  function parallax() {
    ticking = false;
    const vh = innerHeight;

    // hero: slow drift
    const hero = $('.hero-img');
    if (hero) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0) hero.style.transform =
        `translate3d(0, ${clamp(-r.top / vh, -1, 1) * 34}px, 0)`;
    }

    // grid: subtle zoom only — never translates, so column packing holds
    if (innerWidth < 720) return;
    visible.forEach(el => {
      const media = el.firstElementChild;
      if (!media) return;
      const r = el.getBoundingClientRect();
      const k = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
      media.style.transform = `scale(${(1 + (1 - Math.abs(k)) * 0.035).toFixed(4)})`;
    });
  }

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  /* ============ lightbox (scoped per album) ============ */
  function bindLightbox() {
    const lb   = $('#lb');
    const img  = $('.lb-stage img');
    const cap  = $('.lb-cap');
    const idxE = $('.lb-idx');
    if (!lb) return;

    let curA = -1, curI = -1, lastFocus = null;

    const open = (a, i) => {
      const album = ALBUM_DATA[a];
      const it    = album && album.items[i];
      if (!it) return;
      curA = a; curI = i;
      img.src = `images/${it.file}`;
      img.alt = `${it.title} — Vijay`;
      cap.textContent = `${album.cfg.zh} · ${it.title}`;
      idxE.textContent = `${String(i + 1).padStart(2, '0')} / ${String(album.items.length).padStart(2, '0')}`;
      lb.classList.add('on');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.lb-close').focus();
      // warm neighbours
      [i + 1, i - 1].forEach(j => {
        const nb = album.items[(j + album.items.length) % album.items.length];
        if (nb) new Image().src = `images/${nb.file}`;
      });
    };
    const close = () => {
      lb.classList.remove('on');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    const step = (d) => {
      if (curA < 0) return;
      const album = ALBUM_DATA[curA];
      open(curA, (curI + d + album.items.length) % album.items.length);
    };

    ALBUM_DATA.forEach((a, ai) => {
      a.nodes.forEach((el, ii) => {
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        el.addEventListener('click', () => { lastFocus = el; open(ai, ii); });
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lastFocus = el; open(ai, ii); }
        });
      });
    });

    $('.lb-close').addEventListener('click', close);
    $('.lb-prev').addEventListener('click', () => step(-1));
    $('.lb-next').addEventListener('click', () => step(+1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });

    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowRight') step(+1);
      if (e.key === 'ArrowLeft')  step(-1);
    });

    let sx = 0, sy = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? +1 : -1);
      else if (dy > 80) close();
    }, { passive: true });
  }

  /* ============ anchor scroll with nav offset ============ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const t  = id && document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - 64, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

})();