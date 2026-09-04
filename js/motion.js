(function () {
  const nav = document.getElementById('nav');
  if (nav) {
    let scrolled = false;
    window.addEventListener(
      'scroll',
      () => {
        const shouldScroll = window.scrollY > 60;
        if (shouldScroll !== scrolled) {
          scrolled = shouldScroll;
          nav.classList.toggle('nav-scrolled', scrolled);
        }
      },
      { passive: true }
    );
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('main .tile, #contact').forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    document.querySelectorAll('.chip-list').forEach((list) => {
      gsap.from(list.querySelectorAll('.chip'), {
        opacity: 0,
        y: 8,
        duration: 0.3,
        stagger: 0.03,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: list,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });

    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
      gsap.from(projectGrid.querySelectorAll('.project-card'), {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: projectGrid,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1.2,
        ease: 'power1.out',
        onUpdate: () => {
          el.textContent = Math.round(counter.val) + suffix;
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  });

  gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
    document.querySelectorAll('.stat-number').forEach((el) => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
  });
})();
