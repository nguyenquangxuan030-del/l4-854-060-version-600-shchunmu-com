(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileMenu.hasAttribute("hidden") === false;
      if (isOpen) {
        mobileMenu.setAttribute("hidden", "");
        menuButton.setAttribute("aria-expanded", "false");
      } else {
        mobileMenu.removeAttribute("hidden");
        menuButton.setAttribute("aria-expanded", "true");
      }
    });
  }

  document.querySelectorAll("form[role='search']").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    var start = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    start();
  }

  document.querySelectorAll(".local-filter").forEach(function (input) {
    var section = input.closest("section");
    var scope = section ? section.querySelector(".filter-scope") : null;
    var empty = section ? section.querySelector(".empty-state") : null;
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || card.textContent.toLowerCase();
        var match = !query || text.indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  });

  var searchResults = document.getElementById("searchResults");
  if (searchResults && Array.isArray(window.SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById("searchPageInput");
    var hint = document.getElementById("searchHint");
    var empty = document.getElementById("searchEmpty");
    var query = (params.get("q") || "").trim();

    if (input) {
      input.value = query;
    }

    var renderCard = function (item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\" data-search=\"" + escapeHtml(item.search) + "\">",
        "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">",
        "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
        "<span class=\"poster-badge\">" + escapeHtml(item.category) + "</span>",
        "<span class=\"poster-year\">" + escapeHtml(item.year) + "</span>",
        "</a>",
        "<div class=\"movie-card-body\">",
        "<a class=\"movie-title\" href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a>",
        "<p>" + escapeHtml(item.oneLine) + "</p>",
        "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
        "<div class=\"tag-row\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    };

    var runSearch = function (value) {
      var normalized = value.trim().toLowerCase();
      if (!normalized) {
        searchResults.innerHTML = "";
        if (hint) {
          hint.textContent = "输入关键词后显示匹配影片。";
        }
        if (empty) {
          empty.hidden = true;
        }
        return;
      }
      var terms = normalized.split(/\s+/).filter(Boolean);
      var matches = window.SEARCH_INDEX.filter(function (item) {
        return terms.every(function (term) {
          return item.search.indexOf(term) !== -1;
        });
      }).slice(0, 160);
      searchResults.innerHTML = matches.map(renderCard).join("");
      if (hint) {
        hint.textContent = "关键词：“" + value + "”";
      }
      if (empty) {
        empty.hidden = matches.length > 0;
      }
    };

    runSearch(query);

    if (input) {
      input.addEventListener("input", function () {
        runSearch(input.value);
      });
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }
})();
