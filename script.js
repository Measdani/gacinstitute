document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('[data-target]');
  const badgeCards = document.querySelectorAll('.badge-card');
  const badgeDetails = document.querySelectorAll('.badge-detail');
  const headline = document.querySelector('[data-particle-headline]');
  const particleCanvas = document.querySelector('[data-headline-particles]');

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

  if (headline && particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    const particles = [];
    let targets = [];
    let lastTime = performance.now();
    let animationFrame;

    const resizeCanvas = () => {
      const rect = particleCanvas.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      particleCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
      particleCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refreshTargets();
    };

    const refreshTargets = () => {
      const canvasRect = particleCanvas.getBoundingClientRect();
      targets = Array.from(headline.querySelectorAll('[data-fx]')).map((word) => {
        const rect = word.getBoundingClientRect();
        return {
          type: word.dataset.fx,
          left: rect.left - canvasRect.left,
          top: rect.top - canvasRect.top,
          right: rect.right - canvasRect.left,
          bottom: rect.bottom - canvasRect.top,
          width: rect.width,
          height: rect.height,
        };
      });
    };

    const addParticle = (particle) => {
      particles.push(particle);
    };

    const spawnForTarget = (target, dt) => {
      const rate = target.type === 'pipeline' ? 52 : target.type === 'missing' ? 18 : 12;
      const expected = rate * dt;
      const count = Math.floor(expected) + (Math.random() < expected % 1 ? 1 : 0);

      for (let i = 0; i < count; i += 1) {
        if (target.type === 'missing') {
          addParticle({
            type: 'missing',
            x: target.left + target.width * (0.58 + Math.random() * 0.42),
            y: target.top + target.height * (0.18 + Math.random() * 0.68),
            vx: 26 + Math.random() * 46,
            vy: -14 - Math.random() * 30,
            size: 1 + Math.random() * 2.2,
            life: 1.1 + Math.random() * 0.8,
            age: 0,
            alpha: 0.45 + Math.random() * 0.35,
            spin: Math.random() * Math.PI,
          });
        } else if (target.type === 'pipeline') {
          addParticle({
            type: 'pipeline',
            x: target.left - 8,
            y: target.top + target.height * (0.48 + Math.random() * 0.22),
            vx: 150 + Math.random() * 180,
            vy: (Math.random() - 0.5) * 10,
            size: 1.1 + Math.random() * 1.8,
            life: 0.7 + Math.random() * 0.45,
            age: 0,
            alpha: 0.58 + Math.random() * 0.4,
          });
        } else if (target.type === 'built') {
          addParticle({
            type: 'built',
            x: target.left + Math.random() * target.width,
            y: target.top - 18 - Math.random() * 26,
            vx: (Math.random() - 0.5) * 22,
            vy: 42 + Math.random() * 45,
            size: 2 + Math.random() * 2.5,
            life: 1.6,
            age: 0,
            alpha: 0.75,
            floor: target.bottom - 2,
          });
        }
      }
    };

    const step = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      targets.forEach((target) => spawnForTarget(target, dt));

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === 'built') {
          p.vy += 260 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y > p.floor) {
            p.y = p.floor;
            p.vx = 0;
            p.vy = 0;
          }
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.type === 'missing') {
            p.vy -= 8 * dt;
            p.spin += dt * 2;
          }
        }
      }

      if (particles.length > 600) particles.splice(0, particles.length - 600);

      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
      particles.forEach((p) => {
        const alpha = Math.max(0, (1 - p.age / p.life) * p.alpha);

        if (p.type === 'pipeline') {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          glow.addColorStop(0, `rgba(243, 210, 122, ${alpha})`);
          glow.addColorStop(1, 'rgba(243, 210, 122, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'built') {
          ctx.fillStyle = `rgba(217, 170, 58, ${alpha})`;
          ctx.fillRect(p.x, p.y, p.size * 1.7, p.size);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          ctx.fillStyle = `rgba(245, 246, 247, ${alpha})`;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      animationFrame = requestAnimationFrame(step);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(resizeCanvas);
    }
    animationFrame = requestAnimationFrame(step);

    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(animationFrame);
    });
  }
});
