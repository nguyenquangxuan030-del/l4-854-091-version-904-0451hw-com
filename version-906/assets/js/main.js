(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-mobile-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (header) {
      var updateHeader = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    setupHero();
    setupHomeSearch();
    setupFilters();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        start();
      });
    });

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    }

    start();
  }

  function setupHomeSearch() {
    var input = document.getElementById("home-search");
    var results = document.getElementById("home-search-results");
    if (!input || !results || typeof MOVIE_INDEX === "undefined") {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }

      var matches = MOVIE_INDEX.filter(function (item) {
        return item.keywords.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 8);

      if (!matches.length) {
        results.innerHTML = '<div class="search-result-item"><div></div><div><strong>暂未找到匹配影片</strong><span>请尝试更换关键词</span></div></div>';
      } else {
        results.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
            '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span></div>' +
            '</a>';
        }).join("");
      }
      results.classList.add("is-open");
    });

    document.addEventListener("click", function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.classList.remove("is-open");
      }
    });
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    grids.forEach(function (grid) {
      var panel = grid.parentElement.querySelector(".filter-panel") || document.querySelector(".filter-panel");
      if (!panel) {
        return;
      }
      var input = panel.querySelector("[data-filter-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));

      if (yearSelect && yearSelect.options.length <= 1) {
        fillSelect(yearSelect, cards, "year");
      }
      if (regionSelect && regionSelect.options.length <= 1) {
        fillSelect(regionSelect, cards, "region");
      }

      var apply = function () {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
          var matchQuery = !query || keywords.indexOf(query) !== -1;
          var matchYear = !year || card.getAttribute("data-year") === year;
          var matchRegion = !region || card.getAttribute("data-region") === region;
          card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchRegion));
        });
      };

      [input, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function fillSelect(select, cards, field) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + field);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    }).slice(0, 40).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }
})();
