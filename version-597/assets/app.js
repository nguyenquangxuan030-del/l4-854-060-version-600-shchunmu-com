(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.children);
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
        card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function initSearch() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var input = document.querySelector("[data-site-search-input]");
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    if (input) {
      input.value = keyword;
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.href + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-badge">▶</span>',
        '    <span class="score-badge">' + movie.score + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(String(movie.year)) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join("\n");
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

    function render(value) {
      var q = value.trim().toLowerCase();
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, String(movie.year)].join(" ").toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 80);
      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">暂无匹配影片</div>';
        return;
      }
      results.innerHTML = matches.map(card).join("\n");
    }

    render(keyword);

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  function initPlayer() {
    var shell = document.querySelector("[data-play-url]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var layer = shell.querySelector(".player-layer");
    var url = shell.getAttribute("data-play-url");
    var hls = null;

    function start() {
      if (!video || !url) {
        return;
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", url);
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!video.getAttribute("src")) {
        video.setAttribute("src", url);
      }
      video.play().catch(function () {});
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
})();
