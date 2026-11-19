/* =========================================================
   Vinyl Music Player — HTML Audio API
   Membaca playlist dari birthdayConfig.musicPlaylist
   ========================================================= */
(function () {
    'use strict';

    const cfg = window.birthdayConfig || {};
    const list = Array.isArray(cfg.musicPlaylist) ? cfg.musicPlaylist : [];
    const labelImg = (song) => cfg.vinylPhoto || (song && song.cover) || '';
    const setLabel = (el, url) => { if (el && url) el.style.backgroundImage = 'url("' + url.replace(/"/g, '%22') + '")'; };

    const NS = 'http://www.w3.org/2000/svg';
    const COVER_FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='#4a1317'/><g fill='none' stroke='#d58b91' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'><path d='M80 140V68l56-12v72'/></g><circle cx='66' cy='140' r='14' fill='#d58b91'/><circle cx='122' cy='128' r='14' fill='#d58b91'/></svg>"
    );

    const store = {
        get(k, d) { try { const v = localStorage.getItem('bday:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set(k, v) { try { localStorage.setItem('bday:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
    };

    const fmt = (t) => {
        if (!isFinite(t) || t < 0) return '--:--';
        const m = Math.floor(t / 60), s = Math.floor(t % 60);
        return m + ':' + String(s).padStart(2, '0');
    };
    const svgUse = (id, cls) => {
        const s = document.createElementNS(NS, 'svg');
        if (cls) s.setAttribute('class', cls);
        const u = document.createElementNS(NS, 'use');
        u.setAttribute('href', '#' + id);
        s.appendChild(u);
        return s;
    };
    const toast = (msg) => { if (typeof window.showToast === 'function') window.showToast(msg); };

    /* ---------- Putaran piringan halus (kecepatan naik/turun bertahap) ---------- */
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPIN_MAX = 72;           // derajat / detik (±5 detik per putaran)
    let spinEls = [], spinAngle = 0, spinSpeed = 0, spinTarget = 0, spinLast = 0, spinRaf = null;

    function spinFrame(t) {
        const dt = Math.min(0.05, (t - spinLast) / 1000);
        spinLast = t;
        spinSpeed += (spinTarget - spinSpeed) * (1 - Math.exp(-dt * 1.8));
        spinAngle = (spinAngle + spinSpeed * dt) % 360;
        const tf = 'rotate(' + spinAngle.toFixed(2) + 'deg)';
        for (let i = 0; i < spinEls.length; i++) spinEls[i].style.transform = tf;
        if (spinTarget === 0 && spinSpeed < 0.3) { spinRaf = null; return; }
        spinRaf = requestAnimationFrame(spinFrame);
    }
    function setSpin(on) {
        if (reduceMotion) return;
        spinTarget = on ? SPIN_MAX : 0;
        if (!spinRaf) { spinLast = performance.now(); spinRaf = requestAnimationFrame(spinFrame); }
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = Math.min(1, Math.max(0, Number(store.get('volume', 0.85))));

    let current = -1;        // index lagu aktif
    let playing = false;
    let pendingSeek = null;  // rasio 0..1 yang harus diterapkan setelah metadata siap
    let notesTimer = null;
    const cards = [];        // referensi elemen per lagu
    const info = list.map(() => ({ duration: NaN, error: false }));

    let $section, $wrap, $label, $now, $notes, $mini, $miniTitle, $miniIcon, $list;
    let $card, $cCover, $cTitle, $cArtist, $cCur, $cDur, $cFill, $cBar, $cPlay, $count;

    /* ---------- Render ---------- */
    function buildCard(song, i) {
        const li = document.createElement('li');
        li.className = 'track';
        li.dataset.index = i;

        const cover = document.createElement('img');
        cover.className = 'track-cover';
        cover.alt = 'Cover ' + (song.title || '');
        cover.loading = 'lazy';
        cover.src = song.cover || COVER_FALLBACK;
        cover.addEventListener('error', () => { cover.onerror = null; cover.src = COVER_FALLBACK; }, { once: true });

        const meta = document.createElement('div');
        meta.className = 'track-meta';

        const row = document.createElement('div');
        row.className = 'track-title-row';
        const title = document.createElement('span');
        title.className = 'track-title';
        title.textContent = song.title || 'Untitled';
        const eq = document.createElement('span');
        eq.className = 'eq';
        eq.setAttribute('aria-hidden', 'true');
        eq.innerHTML = '<i></i><i></i><i></i>';
        row.append(title, eq);

        const artist = document.createElement('div');
        artist.className = 'track-artist';
        artist.textContent = song.artist || '';

        const prog = document.createElement('div');
        prog.className = 'track-prog';
        const bar = document.createElement('div');
        bar.className = 't-bar';
        bar.tabIndex = 0;
        bar.setAttribute('role', 'slider');
        bar.setAttribute('aria-label', 'Seek ' + (song.title || 'song'));
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-valuenow', '0');
        const fill = document.createElement('span');
        fill.className = 't-fill';
        bar.appendChild(fill);
        const time = document.createElement('span');
        time.className = 't-time';
        const cur = document.createElement('span'); cur.className = 't-cur'; cur.textContent = '0:00';
        const dur = document.createElement('span'); dur.className = 't-dur'; dur.textContent = '--:--';
        time.append(cur, document.createTextNode(' / '), dur);
        prog.append(bar, time);

        meta.append(row, artist, prog);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 't-play';
        btn.setAttribute('aria-label', 'Play ' + (song.title || 'song'));
        btn.append(svgUse('i-play', 'i-play'), svgUse('i-pause', 'i-pause'));

        li.append(cover, meta, btn);

        btn.addEventListener('click', () => toggle(i));

        // Klik / drag pada progress bar
        let dragging = false;
        const ratioFrom = (e) => {
            const r = bar.getBoundingClientRect();
            return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        };
        bar.addEventListener('pointerdown', (e) => {
            dragging = true;
            try { bar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            seekTo(i, ratioFrom(e));
        });
        bar.addEventListener('pointermove', (e) => { if (dragging && i === current) seekTo(i, ratioFrom(e)); });
        const stop = () => { dragging = false; };
        bar.addEventListener('pointerup', stop);
        bar.addEventListener('pointercancel', stop);
        bar.addEventListener('keydown', (e) => {
            if (i !== current || !isFinite(audio.duration)) return;
            if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
            if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
        });

        cards[i] = { li, fill, cur, dur, bar, btn, title };
        return li;
    }

    function render() {
        $list.innerHTML = '';
        list.forEach((song, i) => $list.appendChild(buildCard(song, i)));
    }

    /* ---------- Metadata (durasi tiap lagu) ---------- */
    function preloadDurations() {
        list.forEach((song, i) => {
            if (!song.src) return;
            const a = new Audio();
            a.preload = 'metadata';
            a.addEventListener('loadedmetadata', () => {
                info[i].duration = a.duration;
                info[i].error = false;
                cards[i].dur.textContent = fmt(a.duration);
                cards[i].li.classList.remove('has-error');
                if (i === shownIndex()) refreshCard();
            }, { once: true });
            a.addEventListener('error', () => {
                info[i].error = true;
                cards[i].dur.textContent = '--:--';
                cards[i].li.classList.add('has-error');
            }, { once: true });
            a.src = song.src;
        });
    }

    /* ---------- Kartu player (kiri) ---------- */
    const pad2 = (n) => String(n).padStart(2, '0');
    const shownIndex = () => (current >= 0 ? current : 0);

    function refreshCard() {
        if (!$card) return;
        const i = shownIndex();
        const s = list[i];
        if (!s) return;
        const cover = s.cover || COVER_FALLBACK;
        if ($cCover.dataset.src !== cover) {
            $cCover.dataset.src = cover;
            $cCover.src = cover;
        }
        $cTitle.textContent = s.title || 'Untitled';
        $cArtist.textContent = s.artist || '';
        $cDur.textContent = fmt(info[i].duration);
        $count.textContent = pad2(i + 1) + ' / ' + pad2(list.length);
    }

    function resetMain() {
        if (!$card) return;
        $cFill.style.width = '0%';
        $cBar.setAttribute('aria-valuenow', '0');
        $cCur.textContent = '0:00';
    }

    /* ---------- State UI ---------- */
    function resetCard(i) {
        const c = cards[i];
        if (!c) return;
        c.li.classList.remove('active', 'playing');
        c.fill.style.width = '0%';
        c.bar.style.setProperty('--p', '0%');
        c.bar.setAttribute('aria-valuenow', '0');
        c.cur.textContent = '0:00';
        c.btn.setAttribute('aria-label', 'Play ' + (list[i].title || 'song'));
    }

    function updateNowPlaying() {
        const s = list[current];
        if (!s) return;
        $now.textContent = s.title + (s.artist ? ' — ' + s.artist : '');
        $miniTitle.textContent = s.title;
        setLabel($label, labelImg(s));
        refreshCard();
    }

    function setPlaying(state) {
        playing = state;
        $section.classList.toggle('is-playing', state);
        $wrap.classList.toggle('playing', state);
        $mini.classList.toggle('playing', state);
        if ($card) $card.classList.toggle('playing', state);
        setSpin(state);
        $miniIcon.setAttribute('href', state ? '#i-pause' : '#i-play');
        if (current >= 0 && cards[current]) {
            cards[current].li.classList.toggle('playing', state);
            cards[current].btn.setAttribute('aria-label', (state ? 'Pause ' : 'Play ') + list[current].title);
        }
        clearInterval(notesTimer);
        if (state) { spawnNote(); notesTimer = setInterval(spawnNote, 1100); }
        document.dispatchEvent(new CustomEvent('music:state', { detail: { playing: state, index: current } }));
    }

    function spawnNote() {
        if (document.hidden || !$notes || $notes.childElementCount > 6) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const n = svgUse('i-note', 'note');
        n.style.left = (8 + Math.random() * 78) + '%';
        n.style.top = (10 + Math.random() * 70) + '%';
        n.style.setProperty('--nx', (Math.random() * 60 - 30) + 'px');
        n.addEventListener('animationend', () => n.remove(), { once: true });
        $notes.appendChild(n);
    }

    function updateProgress() {
        if (current < 0) return;
        const c = cards[current];
        const d = audio.duration;
        const pct = isFinite(d) && d > 0 ? (audio.currentTime / d) * 100 : 0;
        c.fill.style.width = pct + '%';
        c.bar.style.setProperty('--p', pct + '%');
        c.bar.setAttribute('aria-valuenow', String(Math.round(pct)));
        c.cur.textContent = fmt(audio.currentTime);
        if ($card) {
            $cFill.style.width = pct + '%';
            $cBar.setAttribute('aria-valuenow', String(Math.round(pct)));
            $cCur.textContent = fmt(audio.currentTime);
        }
    }

    /* ---------- Controls ---------- */
    function select(i, opts) {
        opts = opts || {};
        if (i < 0 || i >= list.length) return;
        if (i !== current) {
            // Lagu sebelumnya otomatis berhenti
            if (current >= 0) {
                audio.pause();
                resetCard(current);
            }
            resetMain();
            current = i;
            info[i].error = false;
            audio.src = list[i].src;
            audio.load();
            store.set('lastTrack', i);
        }
        cards[i].li.classList.add('active');
        updateNowPlaying();
        if (opts.play) play();
    }

    function play() {
        if (current < 0) { select(0, { play: true }); return; }
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
            p.catch((err) => {
                if (err && err.name === 'AbortError') return;
                setPlaying(false);
                if (err && err.name === 'NotAllowedError') toast('Tap play once more to start the music');
                else onError();
            });
        }
    }

    function pause() { audio.pause(); }

    function toggle(i) {
        if (i === current) { playing ? pause() : play(); }
        else select(i, { play: true });
    }

    function next(step) {
        if (!list.length) return;
        const base = current < 0 ? 0 : current;
        const n = (base + step + list.length) % list.length;
        select(n, { play: true });
    }

    function seekTo(i, ratio) {
        if (i !== current) {
            pendingSeek = ratio;
            select(i, { play: true });
            return;
        }
        if (isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = ratio * audio.duration;
            updateProgress();
        } else {
            pendingSeek = ratio;
        }
    }

    function onError() {
        if (current < 0) return;
        info[current].error = true;
        cards[current].li.classList.add('has-error');
        cards[current].li.classList.remove('playing');
        setPlaying(false);
        toast('Add your MP3 file at ' + list[current].src);
    }

    /* ---------- Audio events ---------- */
    function bindAudio() {
        audio.addEventListener('play', () => setPlaying(true));
        audio.addEventListener('pause', () => setPlaying(false));
        audio.addEventListener('ended', () => next(1));
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            if (current < 0) return;
            info[current].duration = audio.duration;
            cards[current].dur.textContent = fmt(audio.duration);
            cards[current].li.classList.remove('has-error');
            refreshCard();
            if (pendingSeek !== null && isFinite(audio.duration)) {
                audio.currentTime = pendingSeek * audio.duration;
                pendingSeek = null;
                updateProgress();
            }
        });
        audio.addEventListener('error', onError);
    }

    /* ---------- Init ---------- */
    function init() {
        $section = document.getElementById('songs');
        $list = document.getElementById('playlist');
        $wrap = document.getElementById('vinylWrap');
        $label = document.getElementById('vinylLabel');
        $now = document.getElementById('nowTitle');
        $notes = document.getElementById('notes');
        $mini = document.getElementById('miniPlayer');
        $miniTitle = document.getElementById('miniTitle');
        $miniIcon = document.getElementById('miniIcon');
        $card = document.getElementById('playerCard');
        $cCover = document.getElementById('cardCover');
        $cTitle = document.getElementById('cardTitle');
        $cArtist = document.getElementById('cardArtist');
        $cCur = document.getElementById('cardCur');
        $cDur = document.getElementById('cardDur');
        $cFill = document.getElementById('cardFill');
        $cBar = document.getElementById('cardBar');
        $cPlay = document.getElementById('cardPlay');
        $count = document.getElementById('trackCount');
        if (!$list || !list.length) return;
        spinEls = [document.getElementById('vinylDisc'), document.querySelector('.mini-disc')].filter(Boolean);
        if (!$card || !$cCover || !$cBar || !$cPlay || !$count) $card = null;

        render();
        bindAudio();
        preloadDurations();

        // Tampilkan label vinyl dengan cover lagu pertama (tanpa memutar apa pun)
        setLabel($label, labelImg(list[0]));

        if ($card) {
            $cCover.addEventListener('error', () => {
                if ($cCover.src !== COVER_FALLBACK) $cCover.src = COVER_FALLBACK;
            });
            refreshCard();

            document.getElementById('cardPrev').addEventListener('click', () => next(-1));
            document.getElementById('cardNext').addEventListener('click', () => next(1));
            $cPlay.addEventListener('click', () => { current < 0 ? select(0, { play: true }) : (playing ? pause() : play()); });

            // Seek lewat progress bar kartu
            let cDrag = false;
            const cRatio = (e) => {
                const r = $cBar.getBoundingClientRect();
                return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
            };
            $cBar.addEventListener('pointerdown', (e) => {
                cDrag = true;
                try { $cBar.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
                seekTo(shownIndex(), cRatio(e));
            });
            $cBar.addEventListener('pointermove', (e) => { if (cDrag && current >= 0) seekTo(current, cRatio(e)); });
            const cStop = () => { cDrag = false; };
            $cBar.addEventListener('pointerup', cStop);
            $cBar.addEventListener('pointercancel', cStop);
            $cBar.addEventListener('keydown', (e) => {
                if (current < 0 || !isFinite(audio.duration)) return;
                if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
                if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
            });
        }

        document.getElementById('prevBtn').addEventListener('click', () => next(-1));
        document.getElementById('nextBtn').addEventListener('click', () => next(1));
        $mini.addEventListener('click', () => { current < 0 ? select(0, { play: true }) : (playing ? pause() : play()); });

        // Klik vinyl = play / pause
        $wrap.addEventListener('click', () => { current < 0 ? select(0, { play: true }) : (playing ? pause() : play()); });
        $wrap.style.cursor = 'pointer';

        // Spasi / media keys tidak dipakai agar tidak mengganggu scroll.
    }

    window.MusicPlayer = {
        play: () => play(),
        pause: () => pause(),
        toggle: () => (current < 0 ? select(0, { play: true }) : (playing ? pause() : play())),
        isPlaying: () => playing,
        element: audio
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();