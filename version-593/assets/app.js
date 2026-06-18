(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(next, 5200);
      });
    });

    timer = window.setInterval(next, 5200);
  }

  function initTopSearch() {
    $all('.top-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = $('input[name="q"]', form);
        if (!input) return;
        var q = input.value.trim();
        if (!q) return;
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(q);
      });
    });
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var panel = $('[data-filter-panel]');
    var list = $('[data-movie-list]');
    if (!panel || !list) return;
    var keyword = $('[data-filter-keyword]', panel);
    var region = $('[data-filter-region]', panel);
    var year = $('[data-filter-year]', panel);
    var sort = $('[data-sort-movies]', panel);
    var cards = $all('[data-title]', list);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (keyword && q) keyword.value = q;

    function apply() {
      var key = keyword ? keyword.value.trim().toLowerCase() : '';
      var reg = region ? region.value : '';
      var yr = year ? year.value : '';
      cards.forEach(function (card) {
        var matchKey = !key || textOf(card).indexOf(key) >= 0;
        var matchRegion = !reg || card.getAttribute('data-region') === reg;
        var matchYear = !yr || card.getAttribute('data-year') === yr;
        card.classList.toggle('hidden-by-filter', !(matchKey && matchRegion && matchYear));
      });
    }

    function sortCards() {
      var value = sort ? sort.value : 'default';
      var sorted = cards.slice();
      if (value === 'hot') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
        });
      }
      if (value === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
        });
      }
      if (value === 'year') {
        sorted.sort(function (a, b) {
          return String(b.getAttribute('data-year') || '').localeCompare(String(a.getAttribute('data-year') || ''));
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [keyword, region, year].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
    if (sort) sort.addEventListener('change', sortCards);
    apply();
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('video', player);
      var button = $('.play-overlay', player);
      if (!video || !button) return;
      var source = video.getAttribute('data-src');
      var initialized = false;
      var hlsInstance = null;

      function attachSource() {
        if (initialized || !source) return;
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = source;
      }

      function play() {
        attachSource();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initTopSearch();
    initFilters();
    initPlayers();
  });
})();
