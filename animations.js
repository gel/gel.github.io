// Scroll-triggered animations
(function () {
  'use strict';

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return; // Exit early if user prefers reduced motion
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    // Filter for intersecting entries
    const intersectingEntries = entries.filter(entry => entry.isIntersecting);

    // Sort by vertical position (rows), then horizontal (columns) for left-to-right effect
    intersectingEntries.sort((a, b) => {
      const rectA = a.target.getBoundingClientRect();
      const rectB = b.target.getBoundingClientRect();

      // Group by row (within 20px tolerance)
      const topDiff = rectA.top - rectB.top;
      if (Math.abs(topDiff) > 20) {
        return topDiff;
      }
      return rectA.left - rectB.left;
    });

    intersectingEntries.forEach((entry, index) => {
      // Dynamic stagger based on the number of items appearing at once
      // Use transitionDelay because we are using CSS transitions, not keyframe animations
      entry.target.style.transitionDelay = `${index * 0.1}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Add fade-in to post previews and books without static delay
    const animatedItems = document.querySelectorAll('.post-preview, .reading-book');
    animatedItems.forEach((item) => {
      item.classList.add('fade-in');
      observer.observe(item);
    });

    // Add fade-in to headings
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
      if (!heading.closest('.post-preview')) {
        heading.classList.add('fade-in');
        heading.style.animationDelay = `${index * 0.05}s`;
        observer.observe(heading);
      }
    });

    // Removed parallax effect - it was causing scroll issues

    // Smooth reveal for code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      block.style.opacity = '0';
      block.style.transform = 'translateY(10px)';
      block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

      const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            codeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      codeObserver.observe(block);
    });

    // Mouse move parallax for profile icon (subtle)
    const profileIcon = document.querySelector('a.profile-icon');
    if (profileIcon) {
      profileIcon.addEventListener('mousemove', (e) => {
        const rect = profileIcon.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const moveX = (x - centerX) / 10;
        const moveY = (y - centerY) / 10;

        profileIcon.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      profileIcon.addEventListener('mouseleave', () => {
        profileIcon.style.transform = 'translate(0, 0)';
      });
    }

    // Typing effect for main title (optional, can be enabled)
    const mainTitle = document.querySelector('main h1');
    if (mainTitle && window.location.pathname === '/') {
      const text = mainTitle.textContent;
      mainTitle.textContent = '';
      mainTitle.style.opacity = '1';

      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          mainTitle.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
    }
  });

  // Add ripple effect to clickable elements
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .reading-book');
    if (!target) return;

    const ripple = document.createElement('span');
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  // Add ripple CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    }

    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
})();

