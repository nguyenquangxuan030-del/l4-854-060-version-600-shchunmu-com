(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeText(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initSearchPage() {
        var holder = document.getElementById('searchResults');
        if (!holder || !window.searchIndex) {
            return;
        }
        var queryInput = document.getElementById('searchPageInput');
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim();
        if (queryInput) {
            queryInput.value = keyword;
        }
        var lowered = keyword.toLowerCase();
        var results = window.searchIndex.filter(function (item) {
            var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
            return !lowered || text.indexOf(lowered) !== -1;
        }).slice(0, 80);

        if (!results.length) {
            holder.innerHTML = '<div class="search-empty">没有找到匹配内容。</div>';
            return;
        }

        holder.innerHTML = results.map(function (item) {
            return [
                '<a class="movie-card" href="' + escapeText(item.url) + '">',
                '    <div class="poster-wrap">',
                '        <img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '">',
                '        <span class="play-badge">▶</span>',
                '    </div>',
                '    <div class="card-body">',
                '        <h2 class="card-title clamp-1">' + escapeText(item.title) + '</h2>',
                '        <p class="card-meta">' + escapeText(item.region) + ' · ' + escapeText(item.year) + ' · ' + escapeText(item.type) + '</p>',
                '        <p class="card-copy clamp-2">' + escapeText(item.oneLine) + '</p>',
                '    </div>',
                '</a>'
            ].join('');
        }).join('');
    }

    function initPlayer() {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('[data-player-overlay]');
        var status = document.querySelector('[data-player-status]');
        var watchButton = document.querySelector('[data-watch-button]');
        var url = window.streamUrl;
        var hlsInstance = null;

        if (!video || !url) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message || '';
            }
        }

        function attachSource() {
            if (video.dataset.ready === 'true') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus('播放暂不可用，请稍后再试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                setStatus('播放暂不可用，请稍后再试');
            }
            video.dataset.ready = 'true';
        }

        function startPlayer() {
            attachSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('点击视频画面继续播放');
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayer);
        }
        if (watchButton) {
            watchButton.addEventListener('click', startPlayer);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initSearchPage();
        initPlayer();
    });
}());
