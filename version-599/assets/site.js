(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var mobileToggle = qs('[data-mobile-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('.hero-dot', hero);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(nextSlide, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var prevButton = qs('[data-hero-prev]', hero);
        var nextButton = qs('[data-hero-next]', hero);

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                nextSlide();
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showSlide(0);
        startHero();
    }

    var filterInput = qs('[data-filter-input]');
    var filterCategory = qs('[data-filter-category]');
    var filterYear = qs('[data-filter-year]');
    var cards = qsa('.movie-card[data-search]');
    var emptyState = qs('[data-empty-state]');

    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    if (filterInput) {
        var queryValue = getParam('q');
        if (queryValue) {
            filterInput.value = queryValue;
        }
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var category = filterCategory ? filterCategory.value : '';
        var year = filterYear ? filterYear.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var cardCategory = card.getAttribute('data-category') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = (!keyword || text.indexOf(keyword) !== -1) && (!category || cardCategory === category) && (!year || cardYear === year);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    [filterInput, filterCategory, filterYear].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    applyFilter();
})();
