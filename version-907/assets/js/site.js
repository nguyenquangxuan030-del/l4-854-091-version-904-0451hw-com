(function () {
  function toggleMenu() {
    var button = document.querySelector('.menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.closest('main') || document;
      var input = panel.querySelector('[data-search-input]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var regionSelect = panel.querySelector('[data-region-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');

      function fillSelect(select, values) {
        if (!select) {
          return;
        }
        values.sort().reverse().forEach(function (value) {
          if (!value) {
            return;
          }
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      var years = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      })));
      var regions = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-region') || '';
      })));
      fillSelect(yearSelect, years);
      fillSelect(regionSelect, regions);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-title') || '').toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || card.getAttribute('data-year') === year;
          var matchRegion = !region || card.getAttribute('data-region') === region;
          var show = matchQuery && matchYear && matchRegion;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    setupHero();
    setupFilter();
  });
})();
