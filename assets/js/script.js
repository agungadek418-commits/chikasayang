/* =========================================================
   Birthday Website — interaksi utama
   Semua konten dibaca dari window.birthdayConfig (config.js)
   ========================================================= */
(function () {
    'use strict';

    const cfg = window.birthdayConfig;
    if (!cfg) { console.error('config.js belum termuat.'); return; }

    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const store = {
        get(k, d) { try { const v = localStorage.getItem('bday:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem('bday:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
    };

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const parseDate = (str) => { const [y, m, d] = String(str).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
    const daysTogether = () => Math.max(0, Math.floor((Date.now() - parseDate(cfg.relationshipDate).getTime()) / 86400000));

    // Ganti {name} {nickname} {from} {days} di teks config
    const tpl = (str) => String(str == null ? '' : str)
        .replace(/\{name\}/g, cfg.girlfriendName)
        .replace(/\{nickname\}/g, cfg.nickname)
        .replace(/\{from\}/g, cfg.fromName)
        .replace(/\{days\}/g, daysTogether());

    // Pecah teks multi-baris (template literal) menjadi paragraf; baris kosong = pemisah.
    const paragraphs = (text) => String(text || '')
        .split(/\n\s*\n/)
        .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean).join(' '))
        .filter(Boolean);
    const lines = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).join(' ');

    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = tpl(value); };

    const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'><rect width='800' height='1000' fill='#2a1c1a'/><g fill='none' stroke='#d58b91' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' opacity='.7'><path d='M400 600C290 520 250 460 250 400c0-45 35-80 78-80 34 0 56 20 72 50 16-30 38-50 72-50 43 0 78 35 78 80 0 60-40 120-150 200z'/></g><text x='400' y='720' text-anchor='middle' font-family='sans-serif' font-size='34' fill='#b9aaa3'>add your photo</text></svg>"
    );
    const safeImg = (img) => { img.addEventListener('error', () => { img.onerror = null; img.src = PLACEHOLDER_IMG; }, { once: true }); };

    /* ---------- Toast ---------- */
    let toastTimer;
    window.showToast = function (msg) {
        const t = $('#toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
    };

    /* ---------- Floating hearts / effects ---------- */
    const fx = $('#fx');
    const heartSVG = '<svg viewBox="0 0 100 92" aria-hidden="true"><use href="#heart"/></svg>';
    const sparkleSVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#sparkle"/></svg>';
    const HEART_COLORS = ['#A51E27', '#D58B91', '#780D12', '#c9505a', '#F3E8DF'];
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function makeHeart(cls, size, color) {
        const h = document.createElement('span');
        h.className = 'fx-heart ' + cls;
        h.style.width = h.style.height = size + 'px';
        h.style.color = color || pick(HEART_COLORS);
        h.innerHTML = heartSVG;
        h.addEventListener('animationend', () => h.remove(), { once: true });
        fx.appendChild(h);
        return h;
    }

    function ambientHeart() {
        if (document.hidden || reduceMotion || fx.childElementCount > 14) return;
        const h = makeHeart('rise', rand(12, 26));
        h.style.left = rand(2, 96) + 'vw';
        h.style.bottom = '-30px';
        h.style.setProperty('--dur', rand(8, 14) + 's');
        h.style.setProperty('--dx', rand(-60, 60) + 'px');
        h.style.setProperty('--rot', rand(-30, 30) + 'deg');
        h.style.setProperty('--op', rand(.35, .7));
    }

    function burstHearts(x, y, n) {
        if (reduceMotion) n = Math.min(n, 6);
        for (let i = 0; i < n; i++) {
            const h = makeHeart('burst', rand(14, 30));
            const ang = Math.random() * Math.PI * 2, dist = rand(60, 190);
            h.style.left = x + 'px';
            h.style.top = y + 'px';
            h.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            h.style.setProperty('--dy', Math.sin(ang) * dist - 40 + 'px');
            h.style.setProperty('--rot', rand(-60, 60) + 'deg');
            h.style.setProperty('--dur', rand(1, 1.8) + 's');
        }
    }

    function rainHearts(n) {
        for (let i = 0; i < n; i++) {
            setTimeout(() => {
                const h = makeHeart('fall', rand(14, 32));
                h.style.left = rand(0, 98) + 'vw';
                h.style.top = '0';
                h.style.setProperty('--dur', rand(3.2, 5.5) + 's');
                h.style.setProperty('--dx', rand(-80, 80) + 'px');
                h.style.setProperty('--rot', rand(-60, 60) + 'deg');
            }, i * 90);
        }
    }

    const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

    /* ---------- Static text from config ---------- */
    function applyConfig() {
        document.title = tpl(cfg.siteTitle || 'Happy Birthday') + ', ' + cfg.nickname;
        setText('navBrand', 'For ' + cfg.nickname);
        setText('heroEyebrow', cfg.heroEyebrow);
        setText('heroName', cfg.girlfriendName);

        // Judul hero: bagian setelah koma dibuat italic
        const title = tpl(cfg.heroTitle);
        const h1 = $('#heroTitle');
        const idx = title.indexOf(',');
        h1.innerHTML = idx > -1
            ? esc(title.slice(0, idx + 1)) + '<br><em class="font-display italic text-blush font-medium">' + esc(title.slice(idx + 1).trim()) + '</em>'
            : esc(title);
        setText('heroMessage', lines(cfg.heroMessage));

        setText('memoriesTitle', cfg.memoriesTitle);
        setText('memoriesCaption', cfg.memoriesCaption);

        setText('songsL1', cfg.songsTitleLine1);
        setText('songsL2', cfg.songsTitleLine2);
        setText('songsSub', cfg.songsSubheading);
        setText('sgTagA', cfg.vinylTagA || 'side A');
        setText('sgTagB', cfg.vinylTagB || 'for {nickname}');
        setText('sgHintIdle', cfg.vinylHintIdle || 'tap the record to play');
        setText('sgHintLive', cfg.vinylHintPlaying || 'now spinning');
        const mqTrack = document.getElementById('sgMarqueeTrack');
        if (mqTrack) {
            const unit = tpl(cfg.vinylMarquee || 'made with love ♥ for {nickname} ♥ ');
            const chunk = unit.repeat(4);
            mqTrack.innerHTML = '<span></span><span></span>';
            mqTrack.children[0].textContent = chunk;
            mqTrack.children[1].textContent = chunk;
        }

        setText('reasonsTitle', cfg.reasonsTitle);
        setText('reasonsSub', cfg.reasonsSubheading);

        setText('letterTitle', cfg.letterTitle);
        setText('galleryTitle', cfg.galleryTitle);
        setText('gallerySub', cfg.gallerySubheading);
        setText('btnSecret', cfg.secretButtonText);
        setText('finalEyebrow', cfg.finalEyebrow);
        setText('finalLine', cfg.finalLine);
        setText('footFrom', cfg.fromName);
        setText('footName', cfg.girlfriendName);
    }

    /* ---------- Hero collage (5 foto pertama) ---------- */
    function buildCollage() {
        const box = $('#collage');
        const photos = (cfg.heroPhotos && cfg.heroPhotos.length ? cfg.heroPhotos : (cfg.photos || [])).slice(0, 5);
        const heroItems = photos.map(src => ({ src, caption: '' }));
        photos.forEach((src, i) => {
            const fig = document.createElement('figure');
            fig.className = 'polaroid c' + (i + 1);
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Our photo ' + (i + 1);
            img.decoding = 'async';
            if (i > 1) img.loading = 'lazy';
            safeImg(img);
            fig.appendChild(img);
            fig.addEventListener('click', () => openLightbox(i, heroItems));
            box.insertBefore(fig, box.firstChild);
        });
    }

    /* ---------- Reasons ---------- */
    function buildReasons() {
        const grid = $('#reasonsGrid');
        (cfg.reasons || []).slice(0, 6).forEach((r, i) => {
            const card = document.createElement('article');
            card.className = 'reason reveal';
            card.style.setProperty('--d', (i % 3) * 0.12 + 's');
            card.innerHTML =
                '<span class="num">0' + (i + 1) + '</span>' +
                '<div class="reason-ico"><svg viewBox="0 0 24 24"><use href="#i-' + i + '"/></svg></div>' +
                '<h3>' + esc(tpl(r.title)) + '</h3><p>' + esc(tpl(r.text)) + '</p>';
            grid.appendChild(card);
        });
    }

    /* ---------- Love letter ---------- */
    function buildLetter() {
        setText('letterGreeting', cfg.letterGreeting || 'Dear {nickname},');
        const d = parseDate(cfg.birthdayDate);
        $('#letterDate').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const body = $('#letterBody');
        paragraphs(tpl(cfg.loveLetter)).forEach((p) => {
            const el = document.createElement('p');
            el.textContent = p;
            body.appendChild(el);
        });
        setText('signLine', cfg.signatureLine);
        setText('signName', cfg.fromName);
    }

    /* ---------- Gallery + Lightbox ---------- */
    const LB = { items: [], gallery: [], i: 0, lastFocus: null };
    const ratios = ['tall', 'sq', 'wide', 'tall', 'wide', 'sq', 'tall'];

    function buildGallery() {
        const grid = $('#galleryGrid');
        LB.gallery = (cfg.photos || []).map((src, i) => ({ src, caption: (cfg.photoCaptions && cfg.photoCaptions[i]) || '' }));
        LB.items = LB.gallery;
        LB.gallery.forEach((it, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'frame reveal ' + ratios[(i * 3 + 1) % ratios.length];
            btn.setAttribute('aria-label', 'Open photo ' + (i + 1));
            btn.style.setProperty('--d', (i % 4) * 0.08 + 's');
            const ph = document.createElement('div'); ph.className = 'ph';
            const img = document.createElement('img');
            img.src = it.src; img.alt = it.caption || 'Photo ' + (i + 1); img.loading = 'lazy'; img.decoding = 'async';
            safeImg(img);
            ph.appendChild(img);
            const cap = document.createElement('div'); cap.className = 'cap'; cap.textContent = it.caption;
            btn.append(ph, cap);
            btn.addEventListener('click', () => openLightbox(i));
            grid.appendChild(btn);
        });
    }

    const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');

    function showPhoto() {
        const it = LB.items[LB.i];
        if (!it) return;
        lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = PLACEHOLDER_IMG; };
        lbImg.src = it.src;
        lbImg.alt = it.caption || 'Photo ' + (LB.i + 1);
        lbCap.textContent = it.caption;
        lbCount.textContent = (LB.i + 1) + ' / ' + LB.items.length;
    }
    function openLightbox(i, items) {
        LB.items = items || LB.gallery;
        if (!LB.items.length) return;
        LB.i = i; LB.lastFocus = document.activeElement;
        showPhoto();
        lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        $('#lbClose').focus();
    }
    function closeLightbox() {
        lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (LB.lastFocus && LB.lastFocus.focus) LB.lastFocus.focus();
    }
    const stepPhoto = (d) => { LB.i = (LB.i + d + LB.items.length) % LB.items.length; showPhoto(); };

    function bindLightbox() {
        $('#lbClose').addEventListener('click', closeLightbox);
        $('#lbPrev').addEventListener('click', () => stepPhoto(-1));
        $('#lbNext').addEventListener('click', () => stepPhoto(1));
        lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLightbox(); });
        let sx = null;
        lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', (e) => {
            if (sx === null) return;
            const dx = e.changedTouches[0].clientX - sx; sx = null;
            if (Math.abs(dx) > 50) stepPhoto(dx < 0 ? 1 : -1);
        }, { passive: true });
    }

    /* ---------- Video player (dipakai di Memories & Video section) ---------- */
    const players = [];
    const PLAY = '<svg viewBox="0 0 24 24"><use href="#i-play"/></svg>';
    const PAUSE = '<svg viewBox="0 0 24 24"><use href="#i-pause"/></svg>';
    const VOL = '<svg viewBox="0 0 24 24"><use href="#i-vol"/></svg>';
    const MUTE = '<svg viewBox="0 0 24 24"><use href="#i-mute"/></svg>';
    const FULL = '<svg viewBox="0 0 24 24"><use href="#i-full"/></svg>';
    const fmt = (t) => (isFinite(t) ? Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') : '0:00');

    function buildPlayer(host, opts) {
        host.innerHTML =
            '<div class="vp">' +
            '<video playsinline preload="metadata"></video>' +
            (opts.poster ? '<img class="vp-poster" alt="" decoding="async">' : '') +
            '<div class="vp-vintage"></div><div class="vp-grain"></div>' +
            (opts.overlay ? '<p class="vp-overlay-text"></p>' : '') +
            '<button type="button" class="vp-big" aria-label="Play video">' + PLAY + '</button>' +
            '<p class="vp-msg" hidden></p>' +
            '<div class="vp-bar">' +
            '<button type="button" class="vp-pp" aria-label="Play or pause">' + PLAY + '</button>' +
            '<div class="vp-prog" role="slider" tabindex="0" aria-label="Seek video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
            '<span class="vp-time">0:00 / 0:00</span>' +
            '<button type="button" class="vp-mute" aria-label="Mute">' + VOL + '</button>' +
            '<button type="button" class="vp-fs" aria-label="Fullscreen">' + FULL + '</button>' +
            '</div></div>';

        const root = $('.vp', host), v = $('video', root), pp = $('.vp-pp', root), big = $('.vp-big', root);
        const prog = $('.vp-prog', root), fill = $('i', prog), time = $('.vp-time', root);
        const mute = $('.vp-mute', root), fs = $('.vp-fs', root), msg = $('.vp-msg', root);

        if (opts.poster) { const p = $('.vp-poster', root); p.src = opts.poster; safeImg(p); }
        if (opts.overlay) $('.vp-overlay-text', root).textContent = opts.overlay;

        v.src = opts.src;
        let hideTimer;

        const toggle = () => { v.paused ? v.play().catch(() => {}) : v.pause(); };
        const showBar = () => { root.classList.add('show-bar'); clearTimeout(hideTimer); hideTimer = setTimeout(() => root.classList.remove('show-bar'), 2500); };

        big.addEventListener('click', toggle);
        pp.addEventListener('click', toggle);
        v.addEventListener('click', () => { toggle(); showBar(); });
        v.addEventListener('play', () => {
            root.classList.add('playing', 'started');
            pp.innerHTML = PAUSE;
            players.forEach((o) => { if (o !== v) o.pause(); });
            if (window.MusicPlayer && window.MusicPlayer.isPlaying()) window.MusicPlayer.pause();
        });
        v.addEventListener('pause', () => { root.classList.remove('playing'); pp.innerHTML = PLAY; });
        v.addEventListener('ended', () => { root.classList.remove('playing'); pp.innerHTML = PLAY; });
        v.addEventListener('loadedmetadata', () => { time.textContent = '0:00 / ' + fmt(v.duration); });
        v.addEventListener('timeupdate', () => {
            const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
            fill.style.width = pct + '%';
            prog.setAttribute('aria-valuenow', String(Math.round(pct)));
            time.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration);
        });
        v.addEventListener('error', () => {
            msg.hidden = false;
            msg.textContent = 'Add your video at ' + opts.src;
            big.style.opacity = '.55';
        });

        let drag = false;
        const seek = (e) => {
            const r = prog.getBoundingClientRect();
            if (v.duration) v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
        };
        prog.addEventListener('pointerdown', (e) => { drag = true; try { prog.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } seek(e); });
        prog.addEventListener('pointermove', (e) => { if (drag) seek(e); });
        prog.addEventListener('pointerup', () => { drag = false; });
        prog.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
            if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
        });

        mute.addEventListener('click', () => { v.muted = !v.muted; mute.innerHTML = v.muted ? MUTE : VOL; });
        fs.addEventListener('click', () => {
            const el = root;
            if (document.fullscreenElement) { document.exitFullscreen(); return; }
            if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
            else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
        });
        root.addEventListener('touchstart', showBar, { passive: true });

        players.push(v);
        return v;
    }

    function buildVideos() {
        buildPlayer($('#memoriesPlayer'), {
            src: cfg.video,
            poster: cfg.memoriesPhoto,
            overlay: tpl(cfg.memoriesOverlay)
        });
    }

    /* ---------- Film strips (foto scroll otomatis, dari config.photos) ---------- */
    function buildFilmStrips() {
        const photos = (cfg.photos || []).slice(0, 8);
        if (!photos.length) return;
        $$('.film-strip').forEach((strip, idx) => {
            const track = $('.fs-track', strip);
            const set = idx % 2 ? photos.slice().reverse() : photos;
            // Digandakan 2x agar loop animasi (-50%) mulus
            [...set, ...set].forEach((src) => {
                const img = document.createElement('img');
                img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
                safeImg(img);
                track.appendChild(img);
            });
        });
    }

    /* ---------- Countdown + days together ---------- */
    function nextBirthday() {
        let t = parseDate(cfg.birthdayDate);
        const now = new Date();
        const dayAfter = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        while (dayAfter(t) <= now) t = new Date(t.getFullYear() + 1, t.getMonth(), t.getDate());
        return t;
    }
    function tickCountdown() {
        const box = $('#countdown'), label = $('#cdLabel');
        const target = nextBirthday(), now = new Date();
        const diff = target - now;
        if (diff <= 0) {
            box.classList.add('is-today');
            label.textContent = 'today is your day, ' + cfg.nickname + ' ♥';
        } else {
            box.classList.remove('is-today');
            label.textContent = 'your birthday is in';
            const s = Math.floor(diff / 1000);
            $('#cdDays').textContent = Math.floor(s / 86400);
            $('#cdHours').textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
            $('#cdMins').textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
            $('#cdSecs').textContent = String(s % 60).padStart(2, '0');
        }
        $('#daysTogether').textContent = daysTogether().toLocaleString('en-US');
    }

    /* ---------- Love button + random messages ---------- */
    function bindLove() {
        const counter = $('#loveCount');
        let count = Number(store.get('loveCount', 0)) || 0;
        counter.textContent = count;
        $('#btnLove').addEventListener('click', (e) => {
            count += 1; store.set('loveCount', count);
            counter.textContent = count;
            const [x, y] = centerOf(e.currentTarget);
            burstHearts(x, y, 16);
            const msgs = cfg.randomMessages && cfg.randomMessages.length ? cfg.randomMessages : ['I love you.'];
            window.showToast(tpl(pick(msgs)));
        });
        $('#btnOpen').addEventListener('click', (e) => {
            const [x, y] = centerOf(e.currentTarget);
            burstHearts(x, y, 14);
            $('#memories').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Modal helpers ---------- */
    let lastFocusModal = null;
    function openModal(m) {
        lastFocusModal = document.activeElement;
        m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        const x = $('.modal-x', m); if (x) x.focus({ preventScroll: true });
    }
    function closeModal(m) {
        m.classList.remove('open', 'step-flap', 'step-letter', 'step-paper', 'step-paper-in');
        m.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusModal && lastFocusModal.focus) lastFocusModal.focus({ preventScroll: true });
        m._timers && m._timers.forEach(clearTimeout); m._timers = [];
        if (m._interval) { clearInterval(m._interval); m._interval = null; }
    }

    /* ---------- Secret message ---------- */
    function bindSecret() {
        const m = $('#secretModal');
        setText('secretTitle', cfg.secretTitle);
        const txt = $('#secretText');
        paragraphs(tpl(cfg.secretMessage)).forEach((p) => { const el = document.createElement('p'); el.textContent = p; txt.appendChild(el); });
        setText('secretSign', '— ' + cfg.fromName);

        $('#btnSecret').addEventListener('click', () => {
            m._timers = [];
            m.classList.remove('step-flap', 'step-letter', 'step-paper', 'step-paper-in');
            openModal(m);
            const at = (ms, fn) => m._timers.push(setTimeout(fn, ms));
            at(700, () => m.classList.add('step-flap'));
            at(1700, () => m.classList.add('step-letter'));
            at(2900, () => { m.classList.add('step-paper'); at(60, () => m.classList.add('step-paper-in')); });
            at(3200, () => { burstHearts(innerWidth / 2, innerHeight / 2, 22); rainHearts(18); });
            m._interval = setInterval(() => { if (m.classList.contains('step-paper-in')) rainHearts(5); }, 2600);
        });
        $$('[data-close]', m).forEach((b) => b.addEventListener('click', () => closeModal(m)));
    }

    /* ---------- Final surprise ---------- */
    function bindFinal() {
        const m = $('#finalModal');
        setText('finalModalTitle', cfg.finalModalTitle);
        const msgBox = $('#finalMessage');
        paragraphs(tpl(cfg.finalMessage)).forEach((p) => { const el = document.createElement('p'); el.className = 'mb-3'; el.textContent = p; msgBox.appendChild(el); });

        const sp = $('#sparkles');
        for (let i = 0; i < 16; i++) {
            const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            s.setAttribute('viewBox', '0 0 100 100');
            s.innerHTML = '<use href="#sparkle"/>';
            const size = rand(10, 24);
            s.style.cssText = 'left:' + rand(2, 94) + '%;top:' + rand(2, 94) + '%;width:' + size + 'px;height:' + size + 'px;--t:' + rand(1.4, 3) + 's;--dl:' + rand(0, 2) + 's';
            sp.appendChild(s);
        }

        $('#finalHeart').addEventListener('click', (e) => {
            m._timers = [];
            openModal(m);
            const [x, y] = centerOf(e.currentTarget);
            burstHearts(x, y, 28);
            rainHearts(26);
            m._interval = setInterval(() => rainHearts(6), 2200);
        });
        $$('[data-close]', m).forEach((b) => b.addEventListener('click', () => closeModal(m)));
    }

    /* ---------- Navigation ---------- */
    function bindNav() {
        const nav = $('#nav'), toggle = $('#navToggle'), drawer = $('#navDrawer');
        const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            drawer.hidden = !open;
            nav.classList.toggle('menu-open', open);
            document.body.classList.toggle('menu-open', open);
            document.body.style.overflow = open ? 'hidden' : '';
            if (open) { nav.classList.add('scrolled'); drawer.scrollTop = 0; } else onScroll();
        };
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
        window.addEventListener('resize', () => { if (window.innerWidth >= 1180 && toggle.getAttribute('aria-expanded') === 'true') setOpen(false); });
        toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
        $$('a[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            const target = id && id.startsWith('#') ? $(id) : null;
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); history.replaceState(null, '', id); }
            setOpen(false);
        }));

        // active link highlight
        const links = $$('.nav-links a');
        if ('IntersectionObserver' in window) {
            const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
            const io = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (en.isIntersecting) { links.forEach((l) => l.classList.remove('active')); const l = map.get(en.target.id); if (l) l.classList.add('active'); }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
        }
    }

    /* ---------- Scroll reveal ---------- */
    function bindReveal() {
        const els = $$('.reveal');
        if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach((e) => e.classList.add('in')); return; }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        els.forEach((e) => io.observe(e));
    }

    /* ---------- Custom heart cursor (desktop only) ---------- */
    function bindCursor() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const c = document.createElement('div');
        c.className = 'heart-cursor';
        c.innerHTML = '<svg viewBox="0 0 100 92"><use href="#heart"/></svg>';
        c.style.opacity = '0';
        document.body.appendChild(c);
        document.documentElement.classList.add('has-cursor');

        let x = -100, y = -100, tx = -100, ty = -100, lastTrail = 0, raf = null;
        const loop = () => {
            x += (tx - x) * 0.35; y += (ty - y) * 0.35;
            c.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
            raf = requestAnimationFrame(loop);
        };
        window.addEventListener('mousemove', (e) => {
            tx = e.clientX; ty = e.clientY; c.style.opacity = '1';
            if (!raf) { x = tx; y = ty; loop(); }
            const now = performance.now();
            if (!reduceMotion && now - lastTrail > 140 && fx.childElementCount < 16) {
                lastTrail = now;
                const h = makeHeart('burst', rand(6, 11), '#D58B91');
                h.style.left = tx + 'px'; h.style.top = ty + 'px';
                h.style.setProperty('--dx', rand(-18, 18) + 'px'); h.style.setProperty('--dy', rand(8, 30) + 'px');
                h.style.setProperty('--dur', '.9s');
            }
            c.classList.toggle('is-link', !!e.target.closest('a, button, [role="slider"], .polaroid, .frame, .vinyl-wrap, .sc-canvas'));
        }, { passive: true });
        window.addEventListener('mousedown', () => c.classList.add('is-down'));
        window.addEventListener('mouseup', () => c.classList.remove('is-down'));
        document.addEventListener('mouseleave', () => { c.style.opacity = '0'; });
    }

    /* ---------- Global keys ---------- */
    function bindKeys() {
        document.addEventListener('keydown', (e) => {
            if (lb.classList.contains('open')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') stepPhoto(1);
                if (e.key === 'ArrowLeft') stepPhoto(-1);
                return;
            }
            if (e.key === 'Escape') $$('.modal.open').forEach(closeModal);
        });
    }

    /* ---------- Surat: amplop diketuk -> dibuka -> surat ditulis pelan-pelan ---------- */
    function bindLetterReveal() {
        const wrap = $('#letterWrap'), btn = $('#ltEnvBtn'), paper = $('#letterPaper');
        if (!wrap || !btn || !paper) return;
        setText('ltTo', 'to: {nickname}');
        if (reduceMotion) { wrap.classList.add('step-paper', 'step-gone', 'step-done'); return; }

        wrap.classList.add('lt-anim');
        const date = $('#letterDate'), greet = $('#letterGreeting'), sign = $('.letter-sign', paper);
        const paras = $$('#letterBody p');
        [date, greet, ...paras, sign].forEach((el) => el.classList.add('lt-r'));
        const fullGreeting = greet.textContent;
        let started = false;

        const typeText = (el, text, speed, done) => {
            el.textContent = '';
            el.classList.add('typing');
            let i = 0;
            const t = setInterval(() => {
                i += 1;
                el.textContent = text.slice(0, i);
                if (i >= text.length) { clearInterval(t); el.classList.remove('typing'); if (done) done(); }
            }, speed);
        };
        const finish = () => {
            sign.classList.add('in');
            setTimeout(() => {
                wrap.classList.add('step-done');
                const [x, y] = centerOf(paper);
                burstHearts(x, y, 22);
                rainHearts(12);
            }, 900);
        };
        const writeParas = (i) => {
            if (i >= paras.length) { setTimeout(finish, 500); return; }
            const p = paras[i];
            p.classList.add('in');
            const r = p.getBoundingClientRect();
            if (r.top > 60 && r.bottom < innerHeight) burstHearts(r.left + 30, r.top + r.height / 2, 3);
            setTimeout(() => writeParas(i + 1), 800 + Math.min(p.textContent.length, 170) * 9);
        };
        const open = () => {
            if (started) return;
            started = true;
            wrap.classList.add('is-opening');
            const [bx, by] = centerOf(btn);
            burstHearts(bx, by, 12);
            const at = (ms, fn) => setTimeout(fn, ms);
            at(150, () => wrap.classList.add('step-flap'));
            at(1050, () => wrap.classList.add('step-letter'));
            at(1950, () => wrap.classList.add('step-gone'));
            at(2050, () => wrap.classList.add('step-paper'));
            at(2300, () => { date.classList.add('in'); const [x, y] = centerOf(paper); burstHearts(x, Math.min(y, innerHeight * 0.6), 16); });
            at(2800, () => paper.scrollIntoView({ behavior: 'smooth', block: 'start' }));
            at(3100, () => { greet.classList.add('in'); typeText(greet, fullGreeting, 75, () => setTimeout(() => writeParas(0), 500)); });
        };
        btn.addEventListener('click', open);
    }

    /* ---------- Reset progres (buka halaman dengan ?reset di URL) ---------- */
    function resetProgress() {
        if (!/[?&]reset\b/.test(location.search)) return;
        try { localStorage.removeItem('bday:coupons'); localStorage.removeItem('bday:openWhen'); localStorage.removeItem('bday:scratch'); } catch (e) { /* ignore */ }
    }

    /* ---------- Open When... letters ---------- */
    function buildOpenWhen() {
        const grid = $('#owGrid'), m = $('#owModal');
        if (!grid || !m) return;
        setText('owTitle', cfg.openWhenTitle);
        setText('owSub', cfg.openWhenSubheading);

        let opened = store.get('openWhen', {});
        if (!opened || typeof opened !== 'object') opened = {};
        const paperTitle = $('#owPaperTitle'), paperText = $('#owPaperText'), paperSign = $('#owPaperSign');
        paperSign.textContent = '— ' + cfg.fromName;

        const openLetter = (l, btn) => {
            paperTitle.textContent = tpl(l.title);
            paperText.innerHTML = '';
            paragraphs(tpl(l.text)).forEach((p) => { const el = document.createElement('p'); el.textContent = p; paperText.appendChild(el); });
            m._timers = [];
            m.classList.remove('step-flap', 'step-letter', 'step-paper', 'step-paper-in');
            openModal(m);
            const body = $('.modal-body', m); if (body) body.scrollTop = 0;
            const at = (ms, fn) => m._timers.push(setTimeout(fn, ms));
            at(600, () => m.classList.add('step-flap'));
            at(1500, () => m.classList.add('step-letter'));
            at(2500, () => { m.classList.add('step-paper'); at(60, () => m.classList.add('step-paper-in')); });
            at(2800, () => burstHearts(innerWidth / 2, innerHeight / 2, 16));
            opened[l.label] = true;
            store.set('openWhen', opened);
            btn.classList.add('opened');
        };

        (cfg.openWhenLetters || []).forEach((l, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ow-card reveal' + (opened[l.label] ? ' opened' : '');
            b.style.setProperty('--d', (i % 3) * 0.1 + 's');
            b.setAttribute('aria-label', tpl(l.label));
            b.innerHTML =
                '<span class="ow-env"><span class="ow-flap"></span>' +
                '<span class="ow-seal"><svg viewBox="0 0 100 92" aria-hidden="true"><use href="#heart"/></svg></span>' +
                '<span class="ow-done" aria-hidden="true">read ♥</span></span>' +
                '<span class="ow-label">' + esc(tpl(l.label)) + '</span>';
            b.addEventListener('click', () => openLetter(l, b));
            grid.appendChild(b);
        });
        $$('[data-close]', m).forEach((b) => b.addEventListener('click', () => closeModal(m)));
    }

    /* ---------- Love Coupons ---------- */
    const COUPON_ICONS = ['heart', 'sparkle', 'strawberry', 'cherry', 'cassette', 'camera', 'bear', 'lily', 'webheart', 'flower5'];
    function buildCoupons() {
        const grid = $('#couponsGrid');
        if (!grid) return;
        setText('couponsTitle', cfg.couponsTitle);
        setText('couponsSub', cfg.couponsSubheading);
        setText('couponsNote', cfg.couponsNote);

        let claimed = store.get('coupons', {});
        if (!claimed || typeof claimed !== 'object') claimed = {};

        (cfg.coupons || []).forEach((c, i) => {
            const key = String(c.title);
            const icon = COUPON_ICONS.indexOf(c.icon) > -1 ? c.icon : 'heart';
            const el = document.createElement('article');
            el.className = 'coupon reveal';
            el.style.setProperty('--d', (i % 2) * 0.1 + 's');
            el.innerHTML =
                '<div class="cp-ico"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#' + icon + '"/></svg></div>' +
                '<div class="cp-body"><p class="cp-no">No. ' + String(i + 1).padStart(2, '0') + '</p>' +
                '<h3>' + esc(tpl(c.title)) + '</h3><p class="cp-text">' + esc(tpl(c.text)) + '</p>' +
                '<div class="cp-act"><button type="button" class="cp-btn"></button><span class="cp-date"></span></div></div>' +
                '<span class="cp-stamp" aria-hidden="true">' + esc(tpl(cfg.couponStamp || 'Claimed')) + '</span>';

            const btn = $('.cp-btn', el), dateEl = $('.cp-date', el);
            const paint = () => {
                const d = claimed[key];
                el.classList.toggle('claimed', !!d);
                btn.disabled = !!d;
                btn.textContent = d ? 'Claimed ♥' : 'Claim';
                dateEl.textContent = d ? 'on ' + d : '';
            };
            paint();
            btn.addEventListener('click', () => {
                if (claimed[key]) return;
                claimed[key] = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
                store.set('coupons', claimed);
                paint();
                const [x, y] = centerOf(btn);
                burstHearts(x, y, 18);
                window.showToast(tpl(cfg.couponClaimMessage || 'Claimed! Screenshot this and send it to {from}.'));
            });
            grid.appendChild(el);
        });
    }

    /* ---------- Scratch Cards (Kartu Gosok) ---------- */
    const FOIL_HEART = 'M50 90C18 66 4 48 4 30 4 16 15 4 29 4c9 0 17 5 21 13C54 9 62 4 71 4c14 0 25 12 25 26 0 18-14 36-46 60z';

    function buildScratch() {
        const grid = $('#scratchGrid');
        if (!grid) return;
        setText('scratchTitle', cfg.scratchTitle);
        setText('scratchSub', cfg.scratchSubheading);
        setText('scratchNote', cfg.scratchHint);

        const cards = cfg.scratchCards || [];
        const total = cards.length;
        const threshold = Math.min(90, Math.max(20, Number(cfg.scratchRevealAt) || 55)) / 100;
        const progressEl = $('#scratchProgress');
        let done = store.get('scratch', {});
        if (!done || typeof done !== 'object') done = {};

        const updateProgress = (celebrate) => {
            const n = cards.reduce((s, _, k) => s + (done[k] ? 1 : 0), 0);
            progressEl.textContent = total ? String(cfg.scratchProgress || '{n} of {total} revealed').replace('{n}', n).replace('{total}', total) : '';
            if (celebrate && total && n === total) {
                setTimeout(() => { rainHearts(24); window.showToast(tpl(cfg.scratchAllDone || 'You found them all ♥')); }, 700);
            }
        };

        cards.forEach((c, i) => {
            const el = document.createElement('article');
            el.className = 'sc-card reveal';
            el.style.setProperty('--d', (i % 3) * 0.12 + 's');
            el.innerHTML =
                '<div class="sc-photo"><img alt="" decoding="async">' +
                '<canvas class="sc-canvas" tabindex="0" role="img" aria-label="Scratch card ' + (i + 1) + '. Scratch with your finger, or press Enter to reveal."></canvas></div>' +
                '<div class="sc-cap"><span class="sc-no">No. ' + String(i + 1).padStart(2, '0') + '</span>' +
                '<p class="sc-before">' + esc(tpl(c.label || 'Scratch me')) + '</p>' +
                '<p class="sc-after">' + esc(tpl(c.caption || '')) + '</p></div>';
            grid.appendChild(el);

            const photo = $('.sc-photo', el), cv = $('.sc-canvas', el), img = $('img', el);
            img.src = c.photo; img.alt = c.caption || 'Surprise photo ' + (i + 1); safeImg(img);
            const ctx = cv.getContext('2d', { willReadFrequently: true });
            let w = 0, h = 0, brush = 34, revealed = false, drawing = false, last = null, checkTimer = null, fxAt = 0;

            const reveal = (instant) => {
                if (revealed) return;
                revealed = true;
                if (instant || reduceMotion) el.classList.add('instant');
                el.classList.add('revealed');
                cv.tabIndex = -1; cv.setAttribute('aria-hidden', 'true');
                done[i] = true; store.set('scratch', done);
                if (!instant) { const [x, y] = centerOf(photo); burstHearts(x, y, 22); }
                updateProgress(!instant);
            };

            const paintFoil = () => {
                w = photo.offsetWidth; h = photo.offsetHeight;
                if (!w || !h) return;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                brush = Math.max(30, w * 0.12);

                // dasar foil rose-gold
                const g = ctx.createLinearGradient(0, 0, w, h);
                g.addColorStop(0, '#a85a63'); g.addColorStop(.25, '#e8c3bf'); g.addColorStop(.5, '#b8707a');
                g.addColorStop(.75, '#f0d2cc'); g.addColorStop(1, '#96464f');
                ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

                // pola hati kecil
                const heart = new Path2D(FOIL_HEART), hs = Math.max(16, w * 0.075), gap = hs * 1.9;
                for (let y = 0, row = 0; y < h + gap; y += gap * 0.8, row++) {
                    for (let x = (row % 2) * gap / 2; x < w + gap; x += gap) {
                        ctx.save();
                        ctx.translate(x, y); ctx.scale(hs / 100, hs / 100);
                        ctx.fillStyle = row % 2 ? 'rgba(255,255,255,.22)' : 'rgba(101,11,16,.16)';
                        ctx.fill(heart);
                        ctx.restore();
                    }
                }
                // butiran halus
                for (let n = 0, max = (w * h) / 90; n < max; n++) {
                    ctx.fillStyle = Math.random() > .5 ? 'rgba(255,255,255,.22)' : 'rgba(60,10,14,.16)';
                    ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
                }
                // kilau diagonal
                const sh = ctx.createLinearGradient(0, h, w, 0);
                sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.45, 'rgba(255,255,255,0)');
                sh.addColorStop(.5, 'rgba(255,255,255,.38)'); sh.addColorStop(.55, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);

                // bingkai putus-putus + teks
                ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
                ctx.strokeRect(10, 10, w - 20, h - 20); ctx.setLineDash([]);
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(80,10,16,.55)'; ctx.shadowBlur = 8;
                ctx.fillStyle = '#fff';
                ctx.font = '700 ' + Math.round(w * 0.15) + 'px Caveat, cursive';
                ctx.fillText(tpl(cfg.scratchFoilText || 'scratch me'), w / 2, h / 2);
                ctx.save();
                ctx.translate(w / 2 - w * 0.045, h / 2 - w * 0.2); ctx.scale(w * 0.09 / 100, w * 0.09 / 100);
                ctx.fill(heart);
                ctx.restore();
                ctx.shadowBlur = 0;
            };

            // seberapa banyak foil sudah terhapus (sampling per 8px)
            const coverage = () => {
                const W = cv.width, H = cv.height;
                const d = ctx.getImageData(0, 0, W, H).data;
                let clear = 0, n = 0;
                for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { n++; if (d[(y * W + x) * 4 + 3] < 40) clear++; }
                return n ? clear / n : 0;
            };
            const scheduleCheck = () => {
                if (checkTimer || revealed) return;
                checkTimer = setTimeout(() => { checkTimer = null; if (!revealed && coverage() >= threshold) reveal(false); }, 180);
            };

            const pos = (e) => {
                const r = cv.getBoundingClientRect();
                return [(e.clientX - r.left) * (w / r.width), (e.clientY - r.top) * (h / r.height)];
            };
            const erase = (a, b) => {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = brush;
                ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
                ctx.beginPath(); ctx.arc(b[0], b[1], brush / 2, 0, Math.PI * 2); ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            };
            const sparkle = (e) => {
                const now = performance.now();
                if (reduceMotion || now - fxAt < 130 || fx.childElementCount > 14) return;
                fxAt = now;
                const s = makeHeart('burst', rand(7, 12), '#F3E8DF');
                s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
                s.style.setProperty('--dx', rand(-26, 26) + 'px'); s.style.setProperty('--dy', rand(-30, 10) + 'px');
                s.style.setProperty('--dur', '.8s');
            };

            cv.addEventListener('pointerdown', (e) => {
                if (revealed || !w) return;
                drawing = true;
                try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
                last = pos(e); erase(last, last); scheduleCheck();
                e.preventDefault();
            });
            cv.addEventListener('pointermove', (e) => {
                if (!drawing || revealed) return;
                const p = pos(e); erase(last, p); last = p;
                sparkle(e); scheduleCheck();
            });
            const stop = () => { drawing = false; last = null; scheduleCheck(); };
            cv.addEventListener('pointerup', stop);
            cv.addEventListener('pointercancel', stop);
            cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(false); } });

            if (done[i]) { reveal(true); return; }

            // gambar foil setelah font Caveat siap; gambar ulang bila lebar berubah (selama belum mulai digosok)
            const start = () => {
                paintFoil();
                if ('ResizeObserver' in window) {
                    let lastW = photo.offsetWidth;
                    new ResizeObserver(() => {
                        const nw = photo.offsetWidth;
                        if (revealed || drawing || !nw || nw === lastW) return;
                        lastW = nw; paintFoil();
                    }).observe(photo);
                }
            };
            (document.fonts && document.fonts.load ? document.fonts.load('700 32px Caveat').catch(() => {}) : Promise.resolve()).then(start);
        });
        updateProgress(false);
    }

    /* ---------- Boot ---------- */
    function init() {
        applyConfig();
        buildCollage();
        buildReasons();
        buildLetter();
        bindLetterReveal();
        buildGallery();
        buildVideos();
        resetProgress();
        buildOpenWhen();
        buildCoupons();
        buildScratch();
        buildFilmStrips();
        bindLightbox();
        bindLove();
        bindSecret();
        bindFinal();
        bindNav();
        bindKeys();
        tickCountdown();
        setInterval(tickCountdown, 1000);
        setInterval(ambientHeart, 1500);
        bindReveal();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();