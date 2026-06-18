(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initHeader() {
        var header = document.querySelector('[data-header]');
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');

        function syncHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 20);
        }

        if (toggle && links) {
            toggle.addEventListener('click', function () {
                links.classList.toggle('is-open');
            });
        }

        window.addEventListener('scroll', syncHeader, { passive: true });
        syncHeader();
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = all('[data-hero-slide]', slider);
        var dots = all('[data-hero-dot]', slider);
        var thumbs = all('[data-hero-thumb]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        show(0);
        play();
    }

    function initSearchFilters() {
        var input = document.querySelector('[data-search-input]');
        var clear = document.querySelector('[data-clear-search]');
        var filterButtons = all('[data-filter]');
        var cards = all('[data-card-list] .movie-card, [data-card-list] .rank-card');
        var activeFilter = 'all';

        if (!cards.length) {
            return;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilter = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
                card.classList.toggle('is-hidden-card', !(matchesKeyword && matchesFilter));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (clear && input) {
            clear.addEventListener('click', function () {
                input.value = '';
                apply();
                input.focus();
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
    }

    window.initMoviePlayer = function (source) {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var hlsInstance = null;
        var hasStarted = false;

        function start() {
            if (!video || !source) {
                return;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            if (!hasStarted) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                hasStarted = true;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        player.addEventListener('click', function (event) {
            if (event.target === video && !hasStarted) {
                start();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHeroSlider();
        initSearchFilters();
    });
})();
