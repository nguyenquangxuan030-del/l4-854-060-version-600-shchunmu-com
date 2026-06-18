
(function () {
    function text(value) {
        return (value || '').toString().toLowerCase();
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.closest('main') || document;
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        function fillSelect(select, attr) {
            if (!select) {
                return;
            }
            var values = [];
            cards.forEach(function (card) {
                var value = card.getAttribute(attr) || '';
                if (value && values.indexOf(value) === -1) {
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                return b.localeCompare(a, 'zh-Hans-CN');
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        function apply() {
            var keywordValue = text(keyword ? keyword.value : '');
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = text([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var matched = true;
                if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        fillSelect(year, 'data-year');
        fillSelect(type, 'data-type');
        if (keyword && query) {
            keyword.value = query;
        }
        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (block) {
        var video = block.querySelector('video');
        var playButton = block.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-src') : '';
        var ready = false;
        var hls = null;

        function attach() {
            if (!video || !source || ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            block.classList.add('is-playing');
            if (video) {
                video.controls = true;
                var result = video.play();
                if (result && result.catch) {
                    result.catch(function () {});
                }
            }
        }

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }

        block.addEventListener('click', function (event) {
            if (event.target.closest('[data-play-button]')) {
                return;
            }
            if (!block.classList.contains('is-playing')) {
                start();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
