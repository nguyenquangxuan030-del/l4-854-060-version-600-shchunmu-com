(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }

    var input = page.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".search-card"));
    var buttons = Array.prototype.slice.call(page.querySelectorAll(".filter-button"));
    var empty = page.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var currentCategory = "all";

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ")
        );

        var category = card.getAttribute("data-category") || "";
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = currentCategory === "all" || category === currentCategory;
        var showCard = matchQuery && matchCategory;

        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentCategory = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });

    apply();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var dataNode = document.getElementById("player-data");
    if (!video || !dataNode) {
      return;
    }

    var overlay = document.querySelector(".player-overlay");
    var source = "";
    try {
      source = JSON.parse(dataNode.textContent).url || "";
    } catch (error) {
      source = "";
    }

    var attached = false;

    function attachSource() {
      if (attached || !source) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }

      attachSource().then(function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
