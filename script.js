/* ==========================================
   VirguezMC - JavaScript
   Interactions, Particles, Animations
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Particle System (floating squares like Minecraft particles) ---
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedY = -(Math.random() * 0.3 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;

        // Minecraft-ish colors
        const colors = [
          '74, 222, 128',  // green
          '34, 211, 238',  // cyan
          '251, 191, 36',  // gold
          '167, 139, 250', // purple
          '255, 255, 255', // white
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.opacity -= this.fadeSpeed;

        if (this.opacity <= 0 || this.y < -10) {
          this.reset();
          this.y = canvas.height + 10;
          this.opacity = Math.random() * 0.5 + 0.1;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        // Square particles (Minecraft style)
        ctx.fillRect(
          Math.floor(this.x),
          Math.floor(this.y),
          this.size,
          this.size
        );
      }
    }

    // Create particles
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animFrame = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animateParticles();
      }
    });
  }


  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }


  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }


  // --- Copy IP ---
  const copyIpBtn = document.getElementById('copy-ip');
  const ipCopied = document.getElementById('ip-copied');
  if (copyIpBtn && ipCopied) {
    copyIpBtn.addEventListener('click', async () => {
      const ip = copyIpBtn.dataset.ip;
      try {
        await navigator.clipboard.writeText(ip);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = ip;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      ipCopied.classList.add('show');
      setTimeout(() => {
        ipCopied.classList.remove('show');
      }, 1500);
    });
  }


  // --- Stat counter animation ---
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  function countUp(el, target) {
    const duration = 1800;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  function checkStats() {
    if (statsCounted) return;
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    const rect = statsBar.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      statsCounted = true;
      statNumbers.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        countUp(el, target);
      });
    }
  }


  // --- Scroll reveal (cards) ---
  function revealOnScroll() {
    const elements = document.querySelectorAll('.rank-card, .feature-card, .staff-card, .rule-card');
    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      }
    });
  }

  // Initial checks
  checkStats();
  revealOnScroll();

  window.addEventListener('scroll', () => {
    checkStats();
    revealOnScroll();
  }, { passive: true });


  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAnswer = other.querySelector('.faq-answer');
          const otherQuestion = other.querySelector('.faq-question');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
          if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  // --- Rank card hover glow effect ---
  const rankCards = document.querySelectorAll('.rank-card');
  rankCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- Minecraft Server Status API Integration ---
  const serverIp = 'va104.holy.gg:19524';
  const serverStatusDot = document.getElementById('server-status-dot');
  const serverStatusText = document.getElementById('server-status-text');

  async function checkServerStatus() {
    if (!serverStatusText) return;
    try {
      // Use mcsrvstat.us API for direct, clean JSON responses
      const response = await fetch(`https://api.mcsrvstat.us/2/${serverIp}`);
      if (!response.ok) throw new Error('API response error');
      const data = await response.json();
      
      if (data.online) {
        if (serverStatusDot) {
          serverStatusDot.style.background = '#4ade80';
          serverStatusDot.style.boxShadow = '0 0 10px #4ade80';
        }
        serverStatusText.textContent = `🟢 Online | ${data.players.online}/${data.players.max} jugadores`;
      } else {
        if (serverStatusDot) {
          serverStatusDot.style.background = '#f87171';
          serverStatusDot.style.boxShadow = '0 0 10px #f87171';
        }
        serverStatusText.textContent = '🔴 Servidor Apagado / Offline';
      }
    } catch (error) {
      if (serverStatusDot) {
        serverStatusDot.style.background = '#fbbf24';
        serverStatusDot.style.boxShadow = '0 0 10px #fbbf24';
      }
      serverStatusText.textContent = '🟡 Estado Desconocido';
    }
  }

  // Check on load and update every 30 seconds (Aternos may take time to react)
  checkServerStatus();
  setInterval(checkServerStatus, 30000);

});
