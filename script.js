document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('[data-target]');
  const badgeCards = document.querySelectorAll('.badge-card');
  const badgeDetails = document.querySelectorAll('.badge-detail');

  if ('IntersectionObserver' in window && counters.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.dataset.target, 10);
          let value = 0;
          const step = Math.max(1, Math.floor(target / 60));

          const update = () => {
            value += step;
            if (value >= target) {
              element.textContent = target;
            } else {
              element.textContent = value;
              requestAnimationFrame(update);
            }
          };

          update();
          obs.unobserve(element);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(counter => observer.observe(counter));
  }

  badgeCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.dataset.badge;
      badgeCards.forEach(item => item.classList.toggle('active', item === card));
      badgeDetails.forEach(detail => detail.classList.toggle('active', detail.dataset.badgeDetail === targetId));
    });
  });
});
