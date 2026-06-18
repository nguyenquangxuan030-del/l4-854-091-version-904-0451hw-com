(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
            body.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showHero(index);
            startHero();
        });
    });

    showHero(0);
    startHero();

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var searchInput = document.querySelector('[data-search-input]');
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-search-filter]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));
        var empty = document.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applySearch() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var activeFilters = filters.map(function (filter) {
                return {
                    key: filter.getAttribute('data-search-filter'),
                    value: normalize(filter.value)
                };
            });
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));

                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesFilters = activeFilters.every(function (item) {
                    if (!item.value) {
                        return true;
                    }
                    return normalize(card.getAttribute('data-' + item.key)) === item.value;
                });
                var show = matchesKeyword && matchesFilters;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applySearch);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', applySearch);
        });
        applySearch();
    }

    var localSearchInput = document.querySelector('[data-local-search]');
    if (localSearchInput) {
        var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-local-card]'));
        localSearchInput.addEventListener('input', function () {
            var keyword = localSearchInput.value.trim().toLowerCase();
            localCards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    }
})();
