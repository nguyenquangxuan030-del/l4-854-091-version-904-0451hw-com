(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                stop();
                show(active - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                stop();
                show(active + 1);
                play();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                stop();
                show(position);
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().replace(/\s+/g, '');
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute('data-filter-panel');
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            if (!target) {
                return;
            }
            var input = panel.querySelector('[data-filter-input]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var empty = target.querySelector('[data-filter-empty]');
            var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));

            function run() {
                var keyword = normalize(input ? input.value : '');
                var selectedType = type ? type.value : '';
                var selectedYear = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-text'));
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okType = !selectedType || card.getAttribute('data-type') === selectedType;
                    var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                    var show = okKeyword && okType && okYear;
                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', run);
            }
            if (type) {
                type.addEventListener('change', run);
            }
            if (year) {
                year.addEventListener('change', run);
            }
            run();
        });
    }

    function setupSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
        }
    }

    window.initMoviePlayer = function (stream) {
        var video = document.getElementById('movie-video');
        var trigger = document.getElementById('movie-play');
        if (!video || !trigger || !stream) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }
            attached = true;
        }

        function start() {
            attach();
            trigger.classList.add('is-hidden');
            var play = video.play();
            if (play && typeof play.catch === 'function') {
                play.catch(function () {
                    trigger.classList.remove('is-hidden');
                });
            }
        }

        trigger.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            trigger.classList.remove('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchQuery();
    });
}());
