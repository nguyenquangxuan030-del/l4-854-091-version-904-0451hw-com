(function () {
  function init(root) {
    var video = root.querySelector('video');
    var stream = video ? video.getAttribute('data-stream') : '';
    var playButtons = root.querySelectorAll('[data-player-action="play"]');
    var muteButton = root.querySelector('[data-player-action="mute"]');
    var fullscreenButton = root.querySelector('[data-player-action="fullscreen"]');
    var hlsInstance = null;

    function ready() {
      root.classList.remove('is-loading');
    }

    function error() {
      root.classList.add('has-error');
      root.classList.remove('is-loading');
    }

    function setPlaying(isPlaying) {
      root.classList.toggle('playing', isPlaying);
      playButtons.forEach(function (button) {
        button.textContent = isPlaying ? '暂停' : '▶';
      });
    }

    function togglePlay() {
      if (!video) {
        return;
      }
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            root.classList.remove('playing');
          });
        }
      } else {
        video.pause();
      }
    }

    if (!video || !stream) {
      error();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, ready);
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          error();
        }
      });
      window.setTimeout(ready, 900);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', ready, { once: true });
      window.setTimeout(ready, 900);
    } else {
      error();
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', togglePlay);
    });

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      setPlaying(true);
    });
    video.addEventListener('pause', function () {
      setPlaying(false);
    });
    video.addEventListener('canplay', ready);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '静音' : '声音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (root.requestFullscreen) {
          root.requestFullscreen();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(init);
})();
