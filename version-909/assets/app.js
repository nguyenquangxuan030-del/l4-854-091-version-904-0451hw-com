(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
        inputs.forEach(function (input) {
            var root = input.closest('main') || document;
            var items = Array.prototype.slice.call(root.querySelectorAll('[data-search-item]'));
            if (!items.length) {
                return;
            }
            function apply() {
                var query = normalize(input.value);
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute('data-search-text') || item.textContent);
                    item.classList.toggle('is-hidden', query.length > 0 && haystack.indexOf(query) === -1);
                });
            }
            input.addEventListener('input', apply);
            apply();
        });
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = document.querySelector('[data-query-input]');
        if (input && query) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function initSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-route]'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (stage) {
            var video = stage.querySelector('video');
            var button = stage.querySelector('[data-play]');
            var status = stage.querySelector('[data-player-status]');
            var source = stage.getAttribute('data-source');
            var attached = false;
            var hls = null;
            if (!video || !source) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                setStatus('正在加载播放源');
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已就绪');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络波动，正在重新加载');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体加载中，正在恢复');
                            hls.recoverMediaError();
                        } else {
                            setStatus('当前浏览器无法播放该视频');
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setStatus('播放源已就绪');
                } else {
                    video.src = source;
                    setStatus('播放源已绑定');
                }
            }

            function play() {
                attach();
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        stage.classList.add('is-playing');
                        setStatus('正在播放');
                    }).catch(function () {
                        stage.classList.remove('is-playing');
                        setStatus('请再次点击播放');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            stage.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
            video.addEventListener('play', function () {
                stage.classList.add('is-playing');
                setStatus('正在播放');
            });
            video.addEventListener('pause', function () {
                stage.classList.remove('is-playing');
                setStatus('已暂停');
            });
            video.addEventListener('ended', function () {
                stage.classList.remove('is-playing');
                setStatus('播放结束');
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initSearchForms();
        initFilters();
        initQuerySearch();
        initPlayers();
    });
})();
