// Players de voz dos personagens: um áudio por vez, play/pause, barra de posição com busca.
(function(){
  const players = Array.from(document.querySelectorAll('.voice-player'));
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  players.forEach(pl => {
    const audio = pl.querySelector('audio'), btn = pl.querySelector('.voice-btn');
    const seek = pl.querySelector('.voice-seek'), time = pl.querySelector('.voice-time');
    const text = pl.querySelector('.voice-text'), name = pl.dataset.name;
    let total = time.textContent.split('/')[1].trim();

    const paint = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) total = fmt(d);
      const pct = isFinite(d) && d > 0 ? (audio.currentTime / d) * 100 : 0;
      seek.value = pct; seek.style.setProperty('--p', pct + '%');
      time.textContent = fmt(audio.currentTime) + ' / ' + total;
    };
    const setState = playing => {
      pl.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing);
      btn.setAttribute('aria-label', (playing ? 'Pausar apresentação de ' : 'Ouvir ') + name + (playing ? '' : ' se apresentar'));
      text.textContent = playing ? 'PAUSAR APRESENTAÇÃO' : 'OUVIR ' + name.toUpperCase();
    };

    btn.addEventListener('click', () => {
      if (audio.paused) {
        players.forEach(o => { const a = o.querySelector('audio'); if (a !== audio) a.pause(); }); // só um por vez
        audio.play().catch(() => setState(false));
      } else audio.pause();
    });
    audio.addEventListener('play', () => setState(true));
    audio.addEventListener('pause', () => setState(false));
    audio.addEventListener('ended', () => { audio.currentTime = 0; setState(false); paint(); });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('loadedmetadata', paint);
    seek.addEventListener('input', () => {
      if (isFinite(audio.duration)) { audio.currentTime = (seek.value / 100) * audio.duration; paint(); }
    });
  });
})();
