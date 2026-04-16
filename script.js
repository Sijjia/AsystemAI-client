// Mobile Menu Toggle
const createMobileMenu = () => {
  const nav = document.querySelector('.nav');
  const navMenu = document.querySelector('.nav-menu');

  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  const actions = document.querySelector('.header-actions');
  if (actions) {
    actions.appendChild(hamburger);
  } else {
    nav.insertBefore(hamburger, navMenu);
  }

  // Toggle menu
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close menu on link click
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
};

// Smooth Scroll
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// Form Handling
const initContactForm = () => {
  const form = document.getElementById('contactForm');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerHTML;

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Отправка...</span>';

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Capture UTM and ref params
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref')) data.source = params.get('ref');
    if (params.get('utm_source')) data.utm_source = params.get('utm_source');
    if (params.get('utm_medium')) data.utm_medium = params.get('utm_medium');
    if (params.get('utm_campaign')) data.utm_campaign = params.get('utm_campaign');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Server error');

      // Show success message
      submitBtn.innerHTML = '<span>✓ Отправлено!</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

      // Reset form
      form.reset();

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 3000);

    } catch (error) {
      // Show error message
      submitBtn.innerHTML = '<span>Ошибка. Попробуйте снова</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
      }, 3000);

      console.error('Form error:', error);
    }
  });

  // Phone mask
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      if (value.startsWith('996')) {
        value = value.substring(3);
      }

      if (value.length > 0) {
        let formatted = '+996 ';
        if (value.length > 0) formatted += '(' + value.substring(0, 3);
        if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
        if (value.length >= 6) formatted += '-' + value.substring(6, 9);
        e.target.value = formatted;
      }
    });
  }
};

// Header Scroll Effect
const initHeaderScroll = () => {
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
};

// Intersection Observer for animations
const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    let indexOffset = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем эффект каскадного появления (stagger) для группы элементов
        entry.target.style.transitionDelay = `${indexOffset * 150}ms`;
        entry.target.classList.add('animate-in');
        
        // Сбрасываем задержку после завершения анимации, чтобы не мешать :hover эффектам
        setTimeout(() => {
            entry.target.style.transitionDelay = '0ms';
        }, indexOffset * 150 + 800);
        
        indexOffset++;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements (Updated selectors to include section titles and the new glowing wrappers)
  const animateElements = document.querySelectorAll(
    '.section-title, .card-glow-wrapper:not(.card-swap-item), #servicesCardSwap, .service-item, .case-flip-card, .team-member-card, .process-step, .contact-benefit'
  );

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    observer.observe(el);
  });
};

// Add animation class
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// CardSwap Implementation using GSAP
const initCardSwap = () => {
  const container = document.getElementById('servicesCardSwap');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.card-swap-item'));
  if (cards.length === 0) return;

  // Make sure GSAP is available
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded!');
    return;
  }

  // Config parameters mirroring a snappier React component state
  const cardDistance = 100; // Scaled up stagger for 900px width
  const verticalDistance = 110; // Scaled up stagger
  const skewAmount = 3; // Reduced skew for very wide cards
  const delay = 2500; // Decreased delay for a faster interval cycle
  
  // Power ease config (snappier, smoother than elastic)
  const config = {
    ease: 'power3.inOut',
    durDrop: 0.2, // Even faster swap
    durMove: 0.2,
    durReturn: 0.2,
    promoteOverlap: 0.45,
    returnDelay: 0.1
  };

  const makeSlot = (i) => ({
    x: i * cardDistance,
    y: -i * verticalDistance,
    z: -i * cardDistance * 1.5,
    zIndex: cards.length - i
  });

  const placeNow = (el, slot, skew) => {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true
    });
  };

  // Initial order
  let order = cards.map((_, i) => i);
  let tlCurrent = null;
  let intervalId = null;

  // Initial placement
  cards.forEach((card, i) => {
    placeNow(card, makeSlot(i), skewAmount);
  });

  const swap = () => {
    if (order.length < 2) return;

    const frontIdx = order[0];
    const rest = order.slice(1);
    const elFront = cards[frontIdx];

    const tl = gsap.timeline();
    tlCurrent = tl;

    // Drop front card
    tl.to(elFront, {
      y: '+=500',
      duration: config.durDrop,
      ease: config.ease
    });

    // Move rest cards forward
    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = cards[idx];
      const slot = makeSlot(i);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: config.durMove,
          ease: config.ease
        },
        `promote+=${i * 0.15}`
      );
    });

    // Return front card to the back
    const backSlot = makeSlot(cards.length - 1);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    
    tl.call(() => {
      gsap.set(elFront, { zIndex: backSlot.zIndex });
    }, undefined, 'return');
    
    tl.to(
      elFront,
      {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: config.durReturn,
        ease: config.ease
      },
      'return'
    );

    tl.call(() => {
      order = [...rest, frontIdx];
    });
  };

  // Optional: Make cards slowly rotate or something initially, but GSAP takes over so we rely on initial skew.

  intervalId = setInterval(swap, delay);

  // Pause on hover
  const pause = () => {
    if (tlCurrent) tlCurrent.pause();
    clearInterval(intervalId);
  };
  const resume = () => {
    if (tlCurrent) tlCurrent.play();
    clearInterval(intervalId); // Clear it just in case to prevent double intervals
    intervalId = setInterval(swap, delay);
  };

  container.addEventListener('mouseenter', pause);
  container.addEventListener('mouseleave', resume);
};

// Add sequential glow animation for Values section
const initSequentialGlow = () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const valueCards = document.querySelectorAll('#values .card-glow-wrapper');
  if (valueCards.length === 0) return;

  ScrollTrigger.create({
    trigger: '#values',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      valueCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('glow-auto-play');
          setTimeout(() => {
            card.classList.remove('glow-auto-play');
          }, 2000);
        }, i * 600); // 600ms delay between cards
      });
    }
  });
};

// Initialize all functions
document.addEventListener('DOMContentLoaded', () => {
  createMobileMenu();
  initSmoothScroll();
  initContactForm();
  initHeaderScroll();
  initScrollAnimations();
  initCardSwap();
  initSequentialGlow();

  console.log('Asystem website initialized');
});
