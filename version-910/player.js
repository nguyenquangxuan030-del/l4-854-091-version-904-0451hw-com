function bindMoviePlayer(src) {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var started = false;
    var hls = null;

    function begin() {
        if (!video) {
            return;
        }

        if (!started) {
            started = true;
            video.setAttribute('controls', 'controls');

            if (button) {
                button.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    if (button) {
        button.addEventListener('click', begin);
    }

    shell.addEventListener('click', function (event) {
        if (!started && event.target !== video) {
            begin();
        }
    });

    if (video) {
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('error', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }
}
