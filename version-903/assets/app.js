(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = $("[data-nav-toggle]");
        var nav = $("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHeroSlider() {
        var sliders = $all("[data-hero-slider]");
        sliders.forEach(function (slider) {
            var slides = $all(".hero-slide", slider);
            var dots = $all("[data-hero-dot]", slider);
            if (slides.length <= 1) {
                return;
            }

            var index = 0;
            var timer = null;

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function setupCollections() {
        $all("[data-collection-block]").forEach(function (block) {
            var search = $("[data-search-input]", block);
            var select = $("[data-year-select]", block);
            var chips = $all("[data-filter]", block);
            var cards = $all(".movie-card", block);
            var empty = $(".empty-state", block);
            var activeFilter = "all";

            function apply() {
                var query = normalize(search ? search.value : "");
                var year = select ? select.value : "all";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var filterMatch = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
                    var yearMatch = year === "all" || cardYear === year;
                    var queryMatch = !query || text.indexOf(query) !== -1;
                    var show = filterMatch && yearMatch && queryMatch;

                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            if (search) {
                search.addEventListener("input", apply);
            }

            if (select) {
                select.addEventListener("change", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayer(streamUrl) {
        var video = $(".movie-video");
        var cover = $(".player-cover");
        if (!video || !cover || !streamUrl) {
            return;
        }

        var attached = false;
        var hls = null;

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function attach() {
            if (!attached) {
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                } else {
                    video.src = streamUrl;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.addEventListener("loadedmetadata", playVideo, { once: true });
                    }
                    playVideo();
                }
            } else {
                playVideo();
            }

            cover.classList.add("is-hidden");
        }

        cover.addEventListener("click", attach);

        video.addEventListener("click", function () {
            if (!attached) {
                attach();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = setupPlayer;

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNav();
        setupHeroSlider();
        setupCollections();
    });
})();
