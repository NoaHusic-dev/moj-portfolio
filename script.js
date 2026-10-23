// Postupno prikazivanje elemenata pri skrolanju
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('js');

    document.addEventListener('DOMContentLoaded', function () {
        var items = document.querySelectorAll(
            '.card, .project-card, .timeline-item, .kontakt-sadrzaj > form'
        );

        // Kašnjenje po elementu unutar istog roditelja (jedan za drugim)
        var counters = new Map();
        items.forEach(function (el) {
            var n = counters.get(el.parentElement) || 0;
            el.style.setProperty('--d', Math.min(n, 4) * 0.12 + 's');
            counters.set(el.parentElement, n + 1);
            el.classList.add('reveal');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                el.classList.add('vidljivo');
                observer.unobserve(el);
                // Nakon animacije makni pomoćne klase da hover radi normalno
                setTimeout(function () {
                    el.classList.remove('reveal', 'vidljivo');
                    el.style.removeProperty('--d');
                }, 1200);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        items.forEach(function (el) { observer.observe(el); });
    });
})();