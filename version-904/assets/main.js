(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('[data-global-search]');
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        setHero(current - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setHero(current + 1);
        restartHero();
      });
    }
    restartHero();
  }

  var filterInput = document.querySelector('.movie-filter-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var state = {};

  function setQueryFromUrl() {
    if (!filterInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
    }
  }

  function applyFilters() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var visible = !query || text.indexOf(query) !== -1;
      Object.keys(state).forEach(function (key) {
        var value = state[key];
        if (value && value !== 'all' && card.getAttribute('data-' + key) !== value) {
          visible = false;
        }
      });
      card.classList.toggle('is-hidden', !visible);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var type = chip.getAttribute('data-filter-type');
      var value = chip.getAttribute('data-filter-value');
      if (!type) {
        return;
      }
      state[type] = value;
      chips.forEach(function (other) {
        if (other.getAttribute('data-filter-type') === type) {
          other.classList.remove('active');
        }
      });
      chip.classList.add('active');
      applyFilters();
    });
  });

  if (filterInput) {
    setQueryFromUrl();
    filterInput.addEventListener('input', applyFilters);
    applyFilters();
  }
})();
