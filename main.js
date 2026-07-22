document.addEventListener('DOMContentLoaded', () => {
  // 0. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('navbar-toggle');
  const navMenu = document.getElementById('navbar-menu');
  const navLinks = document.querySelectorAll('.navbar-link, .btn-nav-cta');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      });
    });
  }

  // 1. Accessibility & ARIA State Sync for Form Validation
  const form = document.getElementById('budget-form');
  
  if (form) {
    const syncAria = (el) => {
      el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
    };

    // Update on blur (when user finishes interacting) and input (when they correct it)
    form.addEventListener('blur', (e) => {
      if (e.target.matches('input[required], textarea[required], select[required]')) {
        syncAria(e.target);
      }
    }, true);

    form.addEventListener('input', (e) => {
      if (e.target.hasAttribute('aria-invalid')) {
        syncAria(e.target);
      }
    });

    // 2. Form Submission Handler with WhatsApp Redirect
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.checkValidity()) {
          isValid = false;
          input.setAttribute('aria-invalid', 'true');
          // Add fallback styling class if browser support is limited
          input.classList.add('user-invalid-fallback');
        } else {
          input.removeAttribute('aria-invalid');
          input.classList.remove('user-invalid-fallback');
        }
      });

      if (!isValid) {
        // Focus first invalid element
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Gather form values
      const name = document.getElementById('client-name').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      const material = document.getElementById('client-material').value;
      const details = document.getElementById('client-details').value.trim();

      // Formulate WhatsApp message text
      const waNumber = '5585999999999'; // Fortaleza-based contact number
      const intro = `Olá Elora Laser, gostaria de submeter um projeto para avaliação técnica:\n\n`;
      const body = `*Nome:* ${name}\n*E-mail:* ${email}\n*WhatsApp:* ${phone}\n*Material Principal:* ${material}\n*Detalhes do Projeto:* ${details}`;
      const fullText = encodeURIComponent(intro + body);
      
      const waUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${fullText}`;
      
      // Open WhatsApp in a new tab
      window.open(waUrl, '_blank');
    });
  }

  // 3. Testimonial Carousel Scroll Sync Indicator
  const wrapper = document.querySelector('.testimonials-wrapper');
  const dots = document.querySelectorAll('.carousel-dot');

  if (wrapper && dots.length > 0) {
    const updateActiveDot = () => {
      const scrollLeft = wrapper.scrollLeft;
      const width = wrapper.clientWidth;
      // Calculate active index based on scroll position
      const activeIndex = Math.round(scrollLeft / width);
      
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    // Scroll listener on wrapper
    wrapper.addEventListener('scroll', updateActiveDot);

    // Indicator Dot Clicks
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const width = wrapper.clientWidth;
        wrapper.scrollTo({
          left: idx * width,
          behavior: 'smooth'
        });
      });
    });
  }

  // 4. Scroll Reveal Intersection Observer
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window && scrollElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    scrollElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    scrollElements.forEach(el => el.classList.add('revealed'));
  }

  // 5. Accordion Exclusive Disclosure Fallback for details[name] in unsupported environments
  // Since Chrome 120+, <details name="..."> natively supports exclusive groups.
  // In unsupported browsers, we can add a simple fallback so only one details element is open at a time.
  const isDetailsNameSupported = 'name' in HTMLDetailsElement.prototype;
  if (!isDetailsNameSupported) {
    const faqGroup = document.querySelectorAll('details[name="faq"]');
    faqGroup.forEach((details) => {
      details.addEventListener('toggle', (e) => {
        if (details.open) {
          faqGroup.forEach((otherDetails) => {
            if (otherDetails !== details) {
              otherDetails.open = false;
            }
          });
        }
      });
    });
  }
  
  // 6. Portfolio Filter Logic
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active class on buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
          const category = item.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            // Show item
            item.style.display = 'block';
            setTimeout(() => {
              item.classList.remove('hidden');
            }, 10);
          } else {
            // Hide item
            item.classList.add('hidden');
            const onTransitionEnd = (e) => {
              if (e.propertyName === 'opacity' && item.classList.contains('hidden')) {
                item.style.display = 'none';
                item.removeEventListener('transitionend', onTransitionEnd);
              }
            };
            item.addEventListener('transitionend', onTransitionEnd);
          }
        });
      });
    });
  }

  // 7. CNC Laser Drawing Animation
  const svg = document.getElementById('laser-logo-svg');
  if (svg) {
    // Select all paths that we want to draw
    const basePaths = svg.querySelectorAll('#base-paths .laser-path');
    const glowPaths = svg.querySelectorAll('#glow-paths .laser-path');
    
    // Prepare paths by setting dasharray and dashoffset
    basePaths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    glowPaths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    // Particle Sparks System
    const createSparks = (x, y) => {
      const container = document.getElementById('sparks-container');
      if (!container) return;

      const sparkCount = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const size = 1.2 + Math.random() * 1.8;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 25 + Math.random() * 45;
        
        spark.setAttribute('cx', x);
        spark.setAttribute('cy', y);
        spark.setAttribute('r', size);
        
        const colors = ['#FFFFFF', '#FFE7C4', '#C8A382', '#FFAE5C'];
        spark.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
        spark.setAttribute('filter', 'drop-shadow(0 0 2px #C8A382)');
        
        container.appendChild(spark);
        
        gsap.to(spark, {
          cx: x + Math.cos(angle) * velocity,
          cy: y + Math.sin(angle) * velocity + (10 + Math.random() * 20),
          opacity: 0,
          scale: 0,
          duration: 0.3 + Math.random() * 0.4,
          ease: "power2.out",
          onComplete: () => {
            spark.remove();
          }
        });
      }
    };

    // Timeline for CNC movement
    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => {
        // Hide laser spot
        gsap.to('#laser-spot', { opacity: 0, duration: 0.3 });
      }
    });

    // Helper function to add a drawing step to the timeline
    const addDrawingStep = (id, duration = 0.4) => {
      const path = svg.querySelector(`#${id}`);
      const glowPath = svg.querySelector(`#${id}-glow`);
      if (!path) return;

      const length = path.getTotalLength();
      const startPt = path.getPointAtLength(0);

      // 1. Move laser spot to path start
      tl.to('#laser-spot', {
        x: startPt.x,
        y: startPt.y,
        opacity: 1,
        duration: 0.15,
        ease: "power2.out",
        onStart: () => {
          gsap.set('#laser-spot', { opacity: 1 });
        }
      });

      // 2. Draw path (animate strokeDashoffset to 0)
      tl.to([path, glowPath], {
        strokeDashoffset: 0,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: function() {
          const progress = this.progress();
          const currentLength = progress * length;
          const pt = path.getPointAtLength(currentLength);
          gsap.set('#laser-spot', { x: pt.x, y: pt.y });
          
          if (Math.random() < 0.6) {
            createSparks(pt.x, pt.y);
          }
        },
        onComplete: () => {
          // Cooldown glow path to simulated oxidation
          if (glowPath) {
            gsap.to(glowPath, { opacity: 0.1, duration: 0.8 });
          }
        }
      });
    };

    // Sequence execution:
    // 1. Laser beam enters
    addDrawingStep('laser-beam', 0.5);

    // 2. Starburst (emblem center)
    addDrawingStep('star-v', 0.25);
    addDrawingStep('star-h', 0.25);
    addDrawingStep('star-d1', 0.25);
    addDrawingStep('star-d2', 0.25);
    
    // 3. Central circle arcs (letter O)
    addDrawingStep('circle-l', 0.35);
    addDrawingStep('circle-r', 0.35);

    // 4. Letter E
    addDrawingStep('e-top', 0.3);
    addDrawingStep('e-mid', 0.25);
    addDrawingStep('e-bot', 0.3);

    // 5. Letter L
    addDrawingStep('l-vert', 0.35);
    addDrawingStep('l-bot', 0.25);

    // 6. Letter R
    addDrawingStep('r-vert', 0.35);
    addDrawingStep('r-loop', 0.4);
    addDrawingStep('r-leg', 0.3);

    // 7. Letter A
    addDrawingStep('a-left', 0.35);
    addDrawingStep('a-right', 0.35);
    
    // Fade in inner A gold triangle
    tl.to('#a-tri', {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      onStart: () => {
        // Move spot to center of triangle for a tiny flare
        gsap.set('#laser-spot', { x: 650, y: 228 });
        createSparks(650, 228);
      }
    });

    // 8. Bottom Details (Horizontal Lines)
    addDrawingStep('line-l', 0.3);
    addDrawingStep('line-r', 0.3);

    // 9. Final text LASER reveal
    tl.to('.laser-text-gold', {
      opacity: 1,
      duration: 0.8,
      onStart: () => {
        document.querySelector('.laser-text-gold').classList.add('revealed');
        // Final flare
        createSparks(400, 318);
      }
    });
  }
});
