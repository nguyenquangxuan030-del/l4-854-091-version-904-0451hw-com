(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var widgets = Array.prototype.slice.call(document.querySelectorAll(".player-widget"));
    widgets.forEach(function (widget) {
      var video = widget.querySelector("video");
      var cover = widget.querySelector(".player-cover");
      var mediaUrl = widget.getAttribute("data-video");
      if (!video || !cover || !mediaUrl) {
        return;
      }

      var start = function () {
        prepareVideo(video, mediaUrl, function () {
          video.play().catch(function () {});
        });
        cover.classList.add("is-hidden");
      };

      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!video.getAttribute("src") && !video.dataset.hlsReady) {
          start();
        }
      });
    });
  });

  function prepareVideo(video, mediaUrl, onReady) {
    if (video.dataset.hlsReady === "true") {
      onReady();
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
      video.dataset.hlsReady = "true";
      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        backBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.hlsReady = "true";
        onReady();
      });
    }
  }
})();
