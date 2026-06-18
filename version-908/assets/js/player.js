(function () {
  function activate(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var started = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      shell.classList.add('is-playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    function prepare() {
      var source = video.getAttribute('data-stream');

      if (!source) {
        return;
      }

      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = source;
            playVideo();
          }
        });
        return;
      }

      video.src = source;
      playVideo();
    }

    button.addEventListener('click', prepare);
    video.addEventListener('click', function () {
      if (video.paused) {
        prepare();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(activate);
})();
