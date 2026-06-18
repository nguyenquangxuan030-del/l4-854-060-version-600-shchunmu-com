(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var next = hero.querySelector(".hero-next");
        var prev = hero.querySelector(".hero-prev");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
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
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var gridSearch = document.querySelector("[data-grid-search]");
    var gridSelect = document.querySelector("[data-grid-select]");
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var activeChip = "all";

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = gridSearch ? gridSearch.value.trim().toLowerCase() : "";
        var selectValue = gridSelect ? gridSelect.value : "all";

        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region")
            ].join(" ").toLowerCase();
            var genre = card.getAttribute("data-genre") || "";
            var region = card.getAttribute("data-region") || "";
            var keywordMatch = !keyword || text.indexOf(keyword) >= 0;
            var selectMatch = selectValue === "all" || genre.indexOf(selectValue) >= 0 || region.indexOf(selectValue) >= 0;
            var chipMatch = activeChip === "all" || genre.indexOf(activeChip) >= 0 || region.indexOf(activeChip) >= 0;

            card.style.display = keywordMatch && selectMatch && chipMatch ? "" : "none";
        });
    }

    if (gridSearch) {
        gridSearch.addEventListener("input", filterCards);
    }

    if (gridSelect) {
        gridSelect.addEventListener("change", filterCards);
    }

    chipButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeChip = button.getAttribute("data-filter-chip") || "all";

            chipButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });

            filterCards();
        });
    });

    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var startButton = document.querySelector("[data-player-start]");

    if (video && typeof PLAYER_SOURCE !== "undefined") {
        var streamUrl = PLAYER_SOURCE;
        var hls = null;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        function startVideo() {
            if (cover) {
                cover.classList.add("is-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (startButton) {
            startButton.addEventListener("click", startVideo);
        }

        if (cover) {
            cover.addEventListener("click", startVideo);
        }

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    }

    var searchRoot = document.querySelector("[data-search-root]");

    if (searchRoot && typeof MOVIE_INDEX !== "undefined") {
        var input = searchRoot.querySelector("[data-search-input]");
        var select = searchRoot.querySelector("[data-search-select]");
        var results = searchRoot.querySelector("[data-search-results]");
        var title = searchRoot.querySelector("[data-search-title]");
        var searchButton = searchRoot.querySelector("[data-search-button]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        if (input) {
            input.value = initial;
        }

        function renderSearch() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var filter = select ? select.value : "all";
            var matched = MOVIE_INDEX.filter(function (item) {
                var haystack = [item.title, item.oneLine, item.tags, item.genre, item.region, item.year].join(" ").toLowerCase();
                var queryMatch = !query || haystack.indexOf(query) >= 0;
                var filterMatch = filter === "all" || item.genre.indexOf(filter) >= 0 || item.region.indexOf(filter) >= 0 || item.type.indexOf(filter) >= 0;
                return queryMatch && filterMatch;
            }).slice(0, 96);

            if (title) {
                title.textContent = query ? "搜索结果" : "精选影片";
            }

            if (results) {
                results.innerHTML = matched.map(function (item) {
                    return [
                        '<article class="movie-card grid">',
                        '    <a class="poster-link" href="movies/' + item.slug + '" aria-label="观看' + escapeHtml(item.title) + '">',
                        '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                        '        <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
                        '        <span class="poster-score">★ ' + escapeHtml(item.rating) + '</span>',
                        '    </a>',
                        '    <div class="card-body">',
                        '        <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                        '        <h3><a href="movies/' + item.slug + '">' + escapeHtml(item.title) + '</a></h3>',
                        '        <p>' + escapeHtml(item.oneLine) + '</p>',
                        '        <div class="tag-row"><a href="category/' + item.categorySlug + '.html">' + escapeHtml(item.categoryName) + '</a><span>' + escapeHtml(item.genre) + '</span></div>',
                        '    </div>',
                        '</article>'
                    ].join("");
                }).join("");
            }
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        if (input) {
            input.addEventListener("input", renderSearch);
        }

        if (select) {
            select.addEventListener("change", renderSearch);
        }

        if (searchButton) {
            searchButton.addEventListener("click", renderSearch);
        }

        renderSearch();
    }
})();
