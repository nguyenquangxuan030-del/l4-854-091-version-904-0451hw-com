(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var src = options.src;
    var ready = false;
    var hls = null;

    if (!video || !overlay || !src) {
      return;
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      video.setAttribute('controls', 'controls');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          capLevelToPlayerSize: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = src;
      playVideo();
    }

    function start() {
      overlay.classList.add('is-hidden');
      prepare();
      playVideo();
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
