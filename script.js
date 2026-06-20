// ANOLTECH GLOBAL — shared site behavior

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  // Footer year
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  initWaveform();
  initContactForm();
});

// Submit the contact form to Formspree via fetch, so the person
// gets an inline confirmation instead of leaving the site.
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        form.reset();
        status.textContent = "Message sent — we'll get back to you shortly.";
        status.style.color = '#4ADE80';
        button.textContent = 'Sent';
      } else {
        status.textContent = "Something went wrong. Please try again or email us directly.";
        status.style.color = '#FF8A4C';
        button.disabled = false;
        button.textContent = 'Send message';
      }
    } catch (err) {
      status.textContent = "Connection issue — please try again.";
      status.style.color = '#FF8A4C';
      button.disabled = false;
      button.textContent = 'Send message';
    }
  });
}

// Signature element: animated signal trace.
// Reads as an oscilloscope (repair diagnostics) and an audio waveform
// (livestream / podcast) at the same time — the visual bridge between
// ANOLTECH's two crafts.
function initWaveform() {
  const canvas = document.getElementById('waveform');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let t = 0;
  const colorSignal = '#4FC3F7';
  const colorCopper = '#FF8A4C';
  const colorGrid = 'rgba(140,160,170,0.08)';

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    const midY = h / 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // signal trace (blue) — broadcast
    drawTrace(w, h, midY, t, colorSignal, 0.9, 14, 0.55);
    // diagnostic trace (copper) — repair, slightly offset phase
    drawTrace(w, h, midY, t * 1.18 + 2, colorCopper, 0.65, 22, 0.4);

    if (!prefersReducedMotion) {
      t += 0.045;
      requestAnimationFrame(draw);
    }
  }

  function drawTrace(w, h, midY, time, color, ampScale, freq, glow) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6 * glow;
    const amp = (h / 2 - 14) * ampScale * 0.6;
    for (let x = 0; x <= w; x += 4) {
      const px = x / w;
      const y = midY
        + Math.sin(px * freq + time) * amp * (0.4 + 0.6 * Math.sin(px * 3.1 + time * 0.6) ** 2)
        * Math.sin(px * Math.PI);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); });
}
