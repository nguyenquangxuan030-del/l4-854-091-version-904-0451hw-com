(function () {
  var header = document.querySelector('[data-header]');

  function refreshHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var targetId = input.getAttribute('data-target');
    var list = targetId ? document.getElementById(targetId) : input.closest('section');
    var panel = input.closest('.search-panel');
    var currentFilter = 'all';
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]')) : [];

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var category = card.getAttribute('data-category') || '';
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchFilter = currentFilter === 'all' || currentFilter === category;
        card.classList.toggle('is-hidden', !(matchText && matchFilter));
      });
    }

    input.addEventListener('input', applyFilter);

    if (panel) {
      panel.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          currentFilter = button.getAttribute('data-filter') || 'all';
          panel.querySelectorAll('[data-filter]').forEach(function (other) {
            other.classList.toggle('active', other === button);
          });
          applyFilter();
        });
      });
    }
  });
})();
